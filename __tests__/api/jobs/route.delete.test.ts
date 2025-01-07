import { DELETE } from '../../../app/api/jobs/route';
import { JobService } from '../../../app/services/jobService';
import { jest, expect, describe, it, beforeEach } from '@jest/globals';

// Mock JobService
const mockExists = jest.fn() as jest.MockedFunction<typeof JobService.exists>;
const mockDeleteJob = jest.fn() as jest.MockedFunction<typeof JobService.deleteJob>;

jest.mock('../../../app/services/jobService', () => ({
    JobService: {
        exists: mockExists,
        deleteJob: mockDeleteJob
    }
}));

/**
 * Tests for the Jobs API DELETE endpoint
 * API-1 Segment: Job Management Base
 * Covers:
 * - Job deletion
 * - Validation
 * - Error handling
 * - Response formatting
 */
describe('Jobs API - DELETE Endpoint', () => {
    const mockJobNumber = '2024-0101-001';
    const mockRequest = () => new Request(
        `http://localhost/api/jobs/${mockJobNumber}`,
        { method: 'DELETE' }
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('DELETE /api/jobs/:jobNumber', () => {
        it('should delete an existing job', async () => {
            // Mock job exists
            mockExists.mockResolvedValue(true);
            
            // Mock successful deletion
            mockDeleteJob.mockResolvedValue();

            const response = await DELETE(mockRequest());
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.jobNumber).toBe(mockJobNumber);
            expect(mockDeleteJob).toHaveBeenCalledWith(mockJobNumber);
        });

        it('should reject request for non-existent job', async () => {
            // Mock job does not exist
            mockExists.mockResolvedValue(false);

            const response = await DELETE(mockRequest());
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'jobNumber',
                    message: expect.stringContaining('not found')
                })
            );
            expect(mockDeleteJob).not.toHaveBeenCalled();
        });

        it('should handle service errors', async () => {
            // Mock job exists
            mockExists.mockResolvedValue(true);
            
            // Mock service error
            mockDeleteJob.mockRejectedValue(new Error('Database error'));

            const response = await DELETE(mockRequest());
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
            const response = await DELETE(new Request(
                'http://localhost/api/jobs/',
                { method: 'DELETE' }
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
            expect(mockDeleteJob).not.toHaveBeenCalled();
        });

        it('should handle job deletion conflicts', async () => {
            // Mock job exists
            mockExists.mockResolvedValue(true);
            
            // Mock deletion conflict
            mockDeleteJob.mockRejectedValue(new Error('Job has active dependencies'));

            const response = await DELETE(mockRequest());
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'general',
                    message: expect.stringContaining('dependencies')
                })
            );
        });
    });
});
