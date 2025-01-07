import { POST, GET, PUT, DELETE } from '../../../app/api/jobs/route';
import { ClientService } from '../../../app/services/clientService';
import { JobService } from '../../../app/services/jobService';
import type { JobPriority as JobPriorityType, JobStatus as JobStatusType } from '../../../app/types/client';
import { jest, expect, describe, it, beforeEach } from '@jest/globals';

// Enums and constants for testing
enum JobStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED'
}

enum JobPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH'
}

const JobCategory = {
    WATER_DAMAGE: 'WATER_DAMAGE'
} as const;

// Ensure enums match the types
const _typeCheck: JobStatusType = JobStatus.PENDING;
const _typeCheck2: JobPriorityType = JobPriority.HIGH;

// Mock ClientService
const mockExists = jest.fn() as jest.MockedFunction<(clientId: string) => Promise<boolean>>;
jest.mock('../../../app/services/clientService', () => ({
    ClientService: {
        exists: mockExists,
        createClient: jest.fn(),
        getClient: jest.fn(),
        listClients: jest.fn(),
        updateClient: jest.fn(),
        deleteClient: jest.fn()
    }
}));

// Mock JobService
const mockJobExists = jest.fn() as jest.MockedFunction<(jobNumber: string) => Promise<boolean>>;
const mockListJobs = jest.fn() as jest.MockedFunction<
    (page?: number, limit?: number, clientId?: string) => Promise<{ jobs: any[]; total: number }>
>;
const mockUpdateJob = jest.fn() as jest.MockedFunction<
    (jobNumber: string, data: any) => Promise<{ jobNumber: string }>
>;
const mockDeleteJob = jest.fn() as jest.MockedFunction<(jobNumber: string) => Promise<void>>;

jest.mock('../../../app/services/jobService', () => ({
    JobService: {
        exists: mockJobExists,
        createJob: jest.fn(),
        listJobs: mockListJobs,
        updateJob: mockUpdateJob,
        deleteJob: mockDeleteJob,
        JobServiceError: jest.fn()
    }
}));

/**
 * Tests for the Jobs API endpoints
 * API-1 Segment: Job Management Base
 * Covers:
 * - Basic validation
 * - Error handling
 * - Response formatting
 */
describe('Jobs API', () => {
    const mockClientId = '123';
    const mockJobNumber = '2024-0101-001';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/jobs', () => {
        const mockRequest = (body: any) => new Request('http://localhost/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        it('should create a job with valid data', async () => {
            mockExists.mockResolvedValue(true);

            const response = await POST(mockRequest({
                clientId: mockClientId,
                category: JobCategory.WATER_DAMAGE,
                status: JobStatus.PENDING,
                priority: JobPriority.HIGH,
                description: 'Test job'
            }));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.jobNumber).toMatch(/^\d{4}-\d{4}-\d{3}$/);
        });

        it('should reject request with missing required fields', async () => {
            const response = await POST(mockRequest({
                clientId: mockClientId
                // missing category
            }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'category',
                    message: expect.any(String)
                })
            );
        });

        it('should reject invalid client ID', async () => {
            mockExists.mockResolvedValue(false);

            const response = await POST(mockRequest({
                clientId: 'invalid-id',
                category: JobCategory.WATER_DAMAGE
            }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'clientId',
                    message: expect.any(String)
                })
            );
        });

        it('should reject invalid job category', async () => {
            mockExists.mockResolvedValue(true);

            const response = await POST(mockRequest({
                clientId: mockClientId,
                category: 'INVALID_CATEGORY'
            }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'general',
                    message: expect.stringContaining('Invalid job category')
                })
            );
        });

        it('should handle client service errors', async () => {
            mockExists.mockRejectedValue(new Error('DB Error'));

            const response = await POST(mockRequest({
                clientId: mockClientId,
                category: JobCategory.WATER_DAMAGE
            }));
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'clientId',
                    message: expect.any(String)
                })
            );
        });

        it('should accept custom sequence number', async () => {
            mockExists.mockResolvedValue(true);

            const sequence = 42;
            const response = await POST(mockRequest({
                clientId: mockClientId,
                category: JobCategory.WATER_DAMAGE,
                sequence
            }));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.jobNumber).toMatch(/-042$/);
        });
    });

    describe('GET /api/jobs', () => {
        const mockRequest = (params = '') => 
            new Request(`http://localhost/api/jobs${params}`);

        it('should list jobs with default pagination', async () => {
            const mockJobs = [
                { jobNumber: '2024-0101-001', status: JobStatus.PENDING },
                { jobNumber: '2024-0101-002', status: JobStatus.IN_PROGRESS }
            ];
            mockListJobs.mockResolvedValue({ jobs: mockJobs, total: 2 });

            const response = await GET(mockRequest());
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.jobs).toHaveLength(2);
            expect(data.total).toBe(2);
            expect(data.page).toBe(1);
            expect(data.limit).toBe(10);
        });

        it('should handle pagination parameters', async () => {
            mockListJobs.mockResolvedValue({ jobs: [], total: 0 });

            const response = await GET(mockRequest('?page=2&limit=20'));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.page).toBe(2);
            expect(data.limit).toBe(20);
        });

        it('should filter by client ID', async () => {
            mockListJobs.mockResolvedValue({ jobs: [], total: 0 });

            const response = await GET(mockRequest(`?clientId=${mockClientId}`));
            await response.json();

            expect(mockListJobs).toHaveBeenCalledWith(
                expect.any(Number),
                expect.any(Number),
                mockClientId
            );
        });

        it('should reject invalid pagination parameters', async () => {
            const response = await GET(mockRequest('?page=0&limit=0'));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'pagination',
                    message: expect.any(String)
                })
            );
        });
    });

    describe('PUT /api/jobs/:jobNumber', () => {
        const mockRequest = (jobNumber: string, body: any) => 
            new Request(`http://localhost/api/jobs/${jobNumber}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

        it('should update job with valid data', async () => {
            mockJobExists.mockResolvedValue(true);
            mockUpdateJob.mockResolvedValue({ jobNumber: mockJobNumber });

            const response = await PUT(mockRequest(mockJobNumber, {
                status: JobStatus.IN_PROGRESS,
                priority: JobPriority.HIGH
            }));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.jobNumber).toBe(mockJobNumber);
        });

        it('should reject update for non-existent job', async () => {
            mockJobExists.mockResolvedValue(false);

            const response = await PUT(mockRequest(mockJobNumber, {
                status: JobStatus.IN_PROGRESS
            }));
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'jobNumber',
                    message: expect.any(String)
                })
            );
        });

        it('should reject invalid status update', async () => {
            mockJobExists.mockResolvedValue(true);

            const response = await PUT(mockRequest(mockJobNumber, {
                status: 'INVALID_STATUS'
            }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'general',
                    message: expect.stringContaining('Invalid job status')
                })
            );
        });
    });

    describe('DELETE /api/jobs/:jobNumber', () => {
        const mockRequest = (jobNumber: string) => 
            new Request(`http://localhost/api/jobs/${jobNumber}`, {
                method: 'DELETE'
            });

        it('should delete existing job', async () => {
            mockJobExists.mockResolvedValue(true);
            mockDeleteJob.mockResolvedValue(undefined);

            const response = await DELETE(mockRequest(mockJobNumber));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.jobNumber).toBe(mockJobNumber);
        });

        it('should reject deletion of non-existent job', async () => {
            mockJobExists.mockResolvedValue(false);

            const response = await DELETE(mockRequest(mockJobNumber));
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'jobNumber',
                    message: expect.any(String)
                })
            );
        });

        it('should handle deletion errors', async () => {
            mockJobExists.mockResolvedValue(true);
            mockDeleteJob.mockRejectedValue(new Error('Deletion failed'));

            const response = await DELETE(mockRequest(mockJobNumber));
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'general',
                    message: expect.any(String)
                })
            );
        });
    });
});
