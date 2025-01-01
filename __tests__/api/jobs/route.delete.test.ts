import { DELETE } from '../../../app/api/jobs/route';
import { JobService } from '../../../app/services/jobService';
import { jest, expect, describe, it, beforeEach } from '@jest/globals';

// Mock types
type MockExists = jest.MockedFunction<(jobNumber: string) => Promise<boolean>>;
type MockDeleteJob = jest.MockedFunction<(jobNumber: string) => Promise<void>>;

// Mock JobService
const mockExists = jest.fn() as MockExists;
const mockDeleteJob = jest.fn() as MockDeleteJob;

jest.mock('../../../app/services/jobService', () => ({
    JobService: {
        exists: mockExists,
        deleteJob: mockDeleteJob
    }
}));

describe('Jobs API - DELETE Endpoint', () => {
    const mockJobNumber = '2024-0101-001';
    const mockRequest = (jobNumber: string) => {
        const url = new URL(`http://localhost/api/jobs/${jobNumber}`);
        return new Request(url, {
            method: 'DELETE'
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('DELETE /api/jobs/:jobNumber', () => {
        it('should delete a job with valid job number', async () => {
            // Mock job service
            mockExists.mockResolvedValue(true);
            mockDeleteJob.mockResolvedValue();

            const response = await DELETE(mockRequest(mockJobNumber));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.jobNumber).toBe(mockJobNumber);

            // Verify service was called with correct parameters
            expect(JobService.exists).toHaveBeenCalledWith(mockJobNumber);
            expect(mockDeleteJob).toHaveBeenCalledWith(mockJobNumber);
        });

        it('should reject request with missing job number', async () => {
            const response = await DELETE(mockRequest(''));
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

            const response = await DELETE(mockRequest('invalid-job'));
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

        it('should handle service errors', async () => {
            // Mock service error
            mockExists.mockRejectedValue(new Error('DB Error'));

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

        it('should handle deletion errors', async () => {
            // Mock job exists but deletion fails
            mockExists.mockResolvedValue(true);
            mockDeleteJob.mockRejectedValue(new Error('Failed to delete'));

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
