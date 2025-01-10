import { prisma } from '../lib/prisma';
import { JobStatus, JobPriority } from '../types/client';
import { Prisma, Job as PrismaJob } from '@prisma/client';

export class JobServiceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'JobServiceError';
    }
}

// Type guard for Prisma errors
function isPrismaError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
    return (
        error instanceof Error &&
        error.constructor.name === 'PrismaClientKnownRequestError' &&
        'code' in error &&
        typeof (error as any).code === 'string'
    );
}

// Match the API request structure with enum types
export interface JobCreateData {
    jobNumber: string;
    clientId: string;
    status?: JobStatus;
    priority?: JobPriority;
    category: string;
    description?: string;
}

export interface JobUpdateData {
    status?: JobStatus;
    priority?: JobPriority;
    category?: string;
    description?: string;
}

export type Job = PrismaJob;

/**
 * Job Service
 * Handles database operations for job management
 */
export class JobService {
    /**
     * Creates a new job
     * @param data Job creation data
     * @returns Created job data
     * @throws {JobServiceError} If creation fails
     */
    static async createJob(data: JobCreateData): Promise<Job> {
        try {
            const { clientId, ...jobFields } = data;
            
            // Use type assertion to handle Prisma types
            const createInput = {
                ...jobFields,
                client: {
                    connect: {
                        id: clientId
                    }
                }
            } satisfies Prisma.JobCreateInput;

            const newJob = await prisma.job.create({
                data: createInput
            });

            return newJob;
        } catch (error: unknown) {
            if (isPrismaError(error)) {
                if (error.code === 'P2002') {
                    throw new JobServiceError('Job number already exists');
                }
                if (error.code === 'P2003') {
                    throw new JobServiceError('Invalid client ID');
                }
            }
            console.error('Database error:', error instanceof Error ? error.message : String(error));
            throw new JobServiceError('Failed to create job');
        }
    }

    /**
     * Retrieves a job by job number
     * @param jobNumber Job number
     * @returns Job data
     * @throws {JobServiceError} If job not found
     */
    static async getJob(jobNumber: string): Promise<Job> {
        try {
            const foundJob = await prisma.job.findUnique({
                where: { jobNumber }
            });

            if (!foundJob) {
                throw new JobServiceError('Job not found');
            }

            return foundJob;
        } catch (error: unknown) {
            if (error instanceof JobServiceError) {
                throw error;
            }
            console.error('Database error:', error instanceof Error ? error.message : String(error));
            throw new JobServiceError('Failed to retrieve job');
        }
    }

    /**
     * Lists jobs with pagination
     * @param page Page number (1-based)
     * @param limit Items per page
     * @param clientId Optional client ID to filter by
     * @returns Paginated list of jobs
     */
    static async listJobs(page: number = 1, limit: number = 10, clientId?: string): Promise<{ jobs: Job[]; total: number }> {
        try {
            const skip = (page - 1) * limit;
            
            // Use type assertion for where clause
            const where = clientId ? {
                client: {
                    id: clientId
                }
            } satisfies Prisma.JobWhereInput : {};

            const [jobs, total] = await Promise.all([
                prisma.job.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.job.count({ where })
            ]);

            return { jobs, total };
        } catch (error: unknown) {
            console.error('Database error:', error instanceof Error ? error.message : String(error));
            throw new JobServiceError('Failed to list jobs');
        }
    }

    /**
     * Updates a job's status
     * @param jobNumber Job number
     * @param status New status
     * @returns Updated job data
     * @throws {JobServiceError} If job not found or update fails
     */
    static async updateStatus(jobNumber: string, status: JobStatus): Promise<Job> {
        try {
            const updatedJob = await prisma.job.update({
                where: { jobNumber },
                data: { status }
            });

            return updatedJob;
        } catch (error: unknown) {
            if (isPrismaError(error)) {
                if (error.code === 'P2025') {
                    throw new JobServiceError('Job not found');
                }
            }
            console.error('Database error:', error instanceof Error ? error.message : String(error));
            throw new JobServiceError('Failed to update job status');
        }
    }

    /**
     * Updates a job
     * @param jobNumber Job number
     * @param data Update data
     * @returns Updated job data
     * @throws {JobServiceError} If job not found or update fails
     */
    static async updateJob(jobNumber: string, data: JobUpdateData): Promise<Job> {
        try {
            const updatedJob = await prisma.job.update({
                where: { jobNumber },
                data
            });

            return updatedJob;
        } catch (error: unknown) {
            if (isPrismaError(error)) {
                if (error.code === 'P2025') {
                    throw new JobServiceError('Job not found');
                }
            }
            console.error('Database error:', error instanceof Error ? error.message : String(error));
            throw new JobServiceError('Failed to update job');
        }
    }

    /**
     * Deletes a job
     * @param jobNumber Job number
     * @throws {JobServiceError} If job not found or deletion fails
     */
    static async deleteJob(jobNumber: string): Promise<void> {
        try {
            await prisma.job.delete({
                where: { jobNumber }
            });
        } catch (error: unknown) {
            if (isPrismaError(error)) {
                if (error.code === 'P2025') {
                    throw new JobServiceError('Job not found');
                }
            }
            console.error('Database error:', error instanceof Error ? error.message : String(error));
            throw new JobServiceError('Failed to delete job');
        }
    }

    /**
     * Checks if a job exists
     * @param jobNumber Job number
     * @returns True if job exists
     */
    static async exists(jobNumber: string): Promise<boolean> {
        try {
            const count = await prisma.job.count({
                where: { jobNumber }
            });
            return count > 0;
        } catch (error: unknown) {
            console.error('Database error:', error instanceof Error ? error.message : String(error));
            throw new JobServiceError('Failed to check job existence');
        }
    }
}
