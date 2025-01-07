import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import { JobService, JobServiceError, JobCreateData, JobUpdateData } from '../../app/services/jobService';
import type { JobStatus, JobPriority } from '../../app/types/client';
import { PrismaClient } from '@prisma/client';

// Define enum values for testing
const JobStatusValues = {
    PENDING: 'PENDING',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED'
} as const;

const JobPriorityValues = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH'
} as const;

// Mock types for Prisma
type PrismaJob = {
    jobNumber: string;
    clientId: string;
    status: JobStatus;
    priority: JobPriority;
    category: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
};

type MockPrismaClient = {
    job: {
        create: jest.MockedFunction<(args: { data: any }) => Promise<PrismaJob>>;
        findUnique: jest.MockedFunction<(args: { where: any }) => Promise<PrismaJob | null>>;
        findMany: jest.MockedFunction<(args: { where?: any; skip?: number; take?: number; orderBy?: any }) => Promise<PrismaJob[]>>;
        update: jest.MockedFunction<(args: { where: any; data: any }) => Promise<PrismaJob>>;
        delete: jest.MockedFunction<(args: { where: any }) => Promise<PrismaJob>>;
        count: jest.MockedFunction<(args: { where?: any }) => Promise<number>>;
    };
};

// Create mock instance
const mockPrisma: MockPrismaClient = {
    job: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn()
    }
};

// Mock the prisma module
jest.mock('../../app/lib/prisma', () => ({
    prisma: mockPrisma
}));

// Import after mocking
import { prisma } from '../../app/lib/prisma';

// Type assertion for mocked prisma
const mockedPrisma = prisma as unknown as MockPrismaClient;

describe('JobService', () => {
    const mockJob = {
        jobNumber: '2024-0101-001',
        clientId: 'client123',
        status: JobStatusValues.PENDING as JobStatus,
        priority: JobPriorityValues.MEDIUM as JobPriority,
        category: 'WATER_DAMAGE',
        description: 'Test job',
        createdAt: new Date(),
        updatedAt: new Date()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createJob', () => {
        const createData: JobCreateData = {
            jobNumber: mockJob.jobNumber,
            clientId: mockJob.clientId,
            status: mockJob.status as JobStatus,
            priority: mockJob.priority as JobPriority,
            category: mockJob.category,
            description: mockJob.description
        };

        it('should create a job successfully', async () => {
            mockedPrisma.job.create.mockResolvedValue(mockJob);

            const result = await JobService.createJob(createData);

            expect(mockedPrisma.job.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    jobNumber: createData.jobNumber,
                    client: {
                        connect: {
                            id: createData.clientId
                        }
                    }
                })
            });
            expect(result).toEqual(mockJob);
        });

        it('should handle duplicate job number error', async () => {
            const prismaError = new Error('Unique constraint failed');
            (prismaError as any).code = 'P2002';
            mockedPrisma.job.create.mockRejectedValue(prismaError);

            await expect(JobService.createJob(createData))
                .rejects
                .toThrow(JobServiceError);
            await expect(JobService.createJob(createData))
                .rejects
                .toThrow('Job number already exists');
        });

        it('should handle invalid client ID error', async () => {
            const prismaError = new Error('Foreign key constraint failed');
            (prismaError as any).code = 'P2003';
            mockedPrisma.job.create.mockRejectedValue(prismaError);

            await expect(JobService.createJob(createData))
                .rejects
                .toThrow(JobServiceError);
            await expect(JobService.createJob(createData))
                .rejects
                .toThrow('Invalid client ID');
        });
    });

    describe('getJob', () => {
        it('should retrieve a job by number', async () => {
            mockedPrisma.job.findUnique.mockResolvedValue(mockJob);

            const result = await JobService.getJob(mockJob.jobNumber);

            expect(mockedPrisma.job.findUnique).toHaveBeenCalledWith({
                where: { jobNumber: mockJob.jobNumber }
            });
            expect(result).toEqual(mockJob);
        });

        it('should throw error when job not found', async () => {
            mockedPrisma.job.findUnique.mockResolvedValue(null);

            await expect(JobService.getJob(mockJob.jobNumber))
                .rejects
                .toThrow(JobServiceError);
            await expect(JobService.getJob(mockJob.jobNumber))
                .rejects
                .toThrow('Job not found');
        });
    });

    describe('listJobs', () => {
        it('should list jobs with pagination', async () => {
            const mockJobs = [mockJob];
            const mockTotal = 1;
            mockedPrisma.job.findMany.mockResolvedValue(mockJobs);
            mockedPrisma.job.count.mockResolvedValue(mockTotal);

            const result = await JobService.listJobs(1, 10);

            expect(mockedPrisma.job.findMany).toHaveBeenCalledWith({
                where: {},
                skip: 0,
                take: 10,
                orderBy: { createdAt: 'desc' }
            });
            expect(result).toEqual({ jobs: mockJobs, total: mockTotal });
        });

        it('should filter by client ID when provided', async () => {
            const clientId = 'client123';
            mockedPrisma.job.findMany.mockResolvedValue([mockJob]);
            mockedPrisma.job.count.mockResolvedValue(1);

            await JobService.listJobs(1, 10, clientId);

            expect(mockedPrisma.job.findMany).toHaveBeenCalledWith({
                where: {
                    client: {
                        id: clientId
                    }
                },
                skip: 0,
                take: 10,
                orderBy: { createdAt: 'desc' }
            });
        });
    });

    describe('updateJob', () => {
        const updateData: JobUpdateData = {
            status: JobStatusValues.IN_PROGRESS as JobStatus,
            priority: JobPriorityValues.HIGH as JobPriority,
            description: 'Updated description'
        };

        it('should update job successfully', async () => {
            mockedPrisma.job.update.mockResolvedValue({
                ...mockJob,
                ...updateData
            });

            const result = await JobService.updateJob(mockJob.jobNumber, updateData);

            expect(mockedPrisma.job.update).toHaveBeenCalledWith({
                where: { jobNumber: mockJob.jobNumber },
                data: updateData
            });
            expect(result).toEqual({
                ...mockJob,
                ...updateData
            });
        });

        it('should handle non-existent job update', async () => {
            const prismaError = new Error('Record not found');
            (prismaError as any).code = 'P2025';
            mockedPrisma.job.update.mockRejectedValue(prismaError);

            await expect(JobService.updateJob(mockJob.jobNumber, updateData))
                .rejects
                .toThrow(JobServiceError);
            await expect(JobService.updateJob(mockJob.jobNumber, updateData))
                .rejects
                .toThrow('Job not found');
        });
    });

    describe('deleteJob', () => {
        it('should delete job successfully', async () => {
            mockedPrisma.job.delete.mockResolvedValue(mockJob);

            await JobService.deleteJob(mockJob.jobNumber);

            expect(mockedPrisma.job.delete).toHaveBeenCalledWith({
                where: { jobNumber: mockJob.jobNumber }
            });
        });

        it('should handle non-existent job deletion', async () => {
            const prismaError = new Error('Record not found');
            (prismaError as any).code = 'P2025';
            mockedPrisma.job.delete.mockRejectedValue(prismaError);

            await expect(JobService.deleteJob(mockJob.jobNumber))
                .rejects
                .toThrow(JobServiceError);
            await expect(JobService.deleteJob(mockJob.jobNumber))
                .rejects
                .toThrow('Job not found');
        });
    });

    describe('exists', () => {
        it('should return true when job exists', async () => {
            mockedPrisma.job.count.mockResolvedValue(1);

            const result = await JobService.exists(mockJob.jobNumber);

            expect(mockedPrisma.job.count).toHaveBeenCalledWith({
                where: { jobNumber: mockJob.jobNumber }
            });
            expect(result).toBe(true);
        });

        it('should return false when job does not exist', async () => {
            mockedPrisma.job.count.mockResolvedValue(0);

            const result = await JobService.exists(mockJob.jobNumber);

            expect(result).toBe(false);
        });

        it('should handle database errors', async () => {
            mockedPrisma.job.count.mockRejectedValue(new Error('DB Error'));

            await expect(JobService.exists(mockJob.jobNumber))
                .rejects
                .toThrow(JobServiceError);
            await expect(JobService.exists(mockJob.jobNumber))
                .rejects
                .toThrow('Failed to check job existence');
        });
    });
});
