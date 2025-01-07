import { PUT } from '../../../app/api/jobs/route';
import { JobService, type Job } from '../../../app/services/jobService';
import type { JobStatus, JobPriority } from '../../../app/types/client';
import { jest, expect, describe, it, beforeEach } from '@jest/globals';

// Mock JobService
const mockExists = jest.fn() as jest.MockedFunction<typeof JobService.exists>;
const mockUpdateJob = jest.fn() as jest.MockedFunction<typeof JobService.updateJob>;

jest.mock('../../../app/services/jobService', () => ({
    JobService: {
        exists: mockExists,
        updateJob: mockUpdateJob
    }
}));

/**
 * Tests for the Jobs API PUT endpoint
 * API-1 Segment: Job Management Base
 * Covers:
 * - Job updates
 * - Validation
 * - Error handling
 * - Response formatting
 */
describe('Jobs API - PUT Endpoint', () => {
    const mockJobNumber = '2024-0101-001';
    const mockRequest = (body: any) => new Request(
        `http://localhost/api/jobs/${mockJobNumber}`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }
    );

    const mockJobData: Job = {
        id: '1',
        jobNumber: mockJobNumber,
        clientId: '123',
        status: 'PENDING' as JobStatus,
        priority: 'HIGH' as JobPriority,
        category: 'WATER_DAMAGE',
        description: 'Test job',
        createdAt: new Date(),
        updatedAt: new Date()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('PUT /api/jobs/:jobNumber', () => {
        it('should update a job with valid data', async () => {
            // Mock job exists
            mockExists.mockResolvedValue(true);
            
            // Mock successful update
            mockUpdateJob.mockResolvedValue({
                ...mockJobData,
                status: 'IN_PROGRESS',
                description: 'Updated description'
            });

            const response = await PUT(mockRequest({
                status: 'IN_PROGRESS',
                description: 'Updated description'
            }));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.jobNumber).toBe(mockJobNumber);
            expect(mockUpdateJob).toHaveBeenCalledWith(
                mockJobNumber,
                expect.objectContaining({
                    status: 'IN_PROGRESS',
                    description: 'Updated description'
                })
            );
        });

        it('should reject request for non-existent job', async () => {
            // Mock job does not exist
            mockExists.mockResolvedValue(false);

            const response = await PUT(mockRequest({
                status: 'IN_PROGRESS'
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
            expect(mockUpdateJob).not.toHaveBeenCalled();
        });

        it('should reject invalid job status', async () => {
            // Mock job exists
            mockExists.mockResolvedValue(true);

            const response = await PUT(mockRequest({
                status: 'INVALID_STATUS'
            }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'general',
                    message: expect.stringContaining('Validation failed')
                })
            );
            expect(mockUpdateJob).not.toHaveBeenCalled();
        });

        it('should handle service errors', async () => {
            // Mock job exists
            mockExists.mockResolvedValue(true);
            
            // Mock service error
            mockUpdateJob.mockRejectedValue(new Error('Database error'));

            const response = await PUT(mockRequest({
                status: 'IN_PROGRESS'
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

        it('should handle missing job number in URL', async () => {
            const response = await PUT(new Request(
                'http://localhost/api/jobs/',
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'IN_PROGRESS' })
                }
            ));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'jobNumber',
                    message: expect.stringContaining('required')
                })
            );
            expect(mockExists).not.toHaveBeenCalled();
            expect(mockUpdateJob).not.toHaveBeenCalled();
        });
    });
});
