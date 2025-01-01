import { PUT } from '../../../app/api/jobs/route';
import { JobService } from '../../../app/services/jobService';
import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import type { JobStatus, JobPriority } from '../../../app/types/client';

// Mock types
type MockExists = jest.MockedFunction<(jobNumber: string) => Promise<boolean>>;
type MockUpdateJob = jest.MockedFunction<typeof JobService.updateJob>;

// Mock JobService
const mockExists = jest.fn() as MockExists;
const mockUpdateJob = jest.fn() as MockUpdateJob;

jest.mock('../../../app/services/jobService', () => ({
    JobService: {
        exists: mockExists,
        updateJob: mockUpdateJob
    }
}));

describe('Jobs API - PUT Endpoint', () => {
    const mockJobNumber = '2024-0101-001';
    const mockRequest = (jobNumber: string, body: any) => {
        const url = new URL(`http://localhost/api/jobs/${jobNumber}`);
        return new Request(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('PUT /api/jobs/:jobNumber', () => {
        it('should update a job with valid data', async () => {
            // Mock job service
            mockExists.mockResolvedValue(true);
            mockUpdateJob.mockResolvedValue({
                jobNumber: mockJobNumber,
                status: 'IN_PROGRESS',
                priority: 'HIGH',
                category: 'WATER_DAMAGE',
                description: 'Updated job'
            } as any);

            const response = await PUT(mockRequest(mockJobNumber, {
                status: 'IN_PROGRESS' as JobStatus,
                priority: 'HIGH' as JobPriority,
                category: 'WATER_DAMAGE',
                description: 'Updated job'
            }));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.jobNumber).toBe(mockJobNumber);

            // Verify service was called with correct parameters
            expect(JobService.exists).toHaveBeenCalledWith(mockJobNumber);
            expect(mockUpdateJob).toHaveBeenCalledWith(mockJobNumber, {
                status: 'IN_PROGRESS',
                priority: 'HIGH',
                category: 'WATER_DAMAGE',
                description: 'Updated job'
            });
        });

        it('should reject request with missing job number', async () => {
            const response = await PUT(mockRequest('', {}));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'jobNumber',
                    message: expect.stringContaining('required')
                })
            );
        });

        it('should reject invalid job number', async () => {
            // Mock job does not exist
            mockExists.mockResolvedValue(false);

            const response = await PUT(mockRequest('invalid-job', {
                status: 'IN_PROGRESS' as JobStatus
            }));
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'jobNumber',
                    message: expect.stringContaining('not found')
                })
            );
        });

        it('should handle validation errors', async () => {
            // Mock job exists but update fails
            mockExists.mockResolvedValue(true);
            mockUpdateJob.mockRejectedValue(new Error('Invalid status'));

            const response = await PUT(mockRequest(mockJobNumber, {
                status: 'INVALID_STATUS' as JobStatus
            }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'general',
                    message: expect.any(String)
                })
            );
        });

        it('should handle service errors', async () => {
            // Mock service error
            mockExists.mockRejectedValue(new Error('DB Error'));

            const response = await PUT(mockRequest(mockJobNumber, {
                status: 'IN_PROGRESS' as JobStatus
            }));
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
