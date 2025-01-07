import { GET } from '../../../app/api/jobs/route';
import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import { createRequest, createMockJob, assertSuccessResponse, assertErrorResponse, createJobServiceMocks } from '../../utils/testUtils';

const { listJobs } = createJobServiceMocks();

/**
 * Tests for the Jobs API GET endpoint
 * API-1 Segment: Job Management Base
 * Covers:
 * - Pagination
 * - Client filtering
 * - Error handling
 * - Response formatting
 */
describe('Jobs API - GET Endpoint', () => {
    const mockJobData = createMockJob();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/jobs', () => {
        it('should list jobs with default pagination', async () => {
            // Mock service response
            listJobs.mockResolvedValue({
                jobs: [mockJobData],
                total: 1
            });

            const response = await GET(createRequest.get('/api/jobs'));
            const data = await assertSuccessResponse(response);
            expect(data.jobs).toHaveLength(1);
            expect(data.page).toBe(1);
            expect(data.limit).toBe(10);
            expect(listJobs).toHaveBeenCalledWith(1, 10, undefined);
        });

        it('should handle custom pagination parameters', async () => {
            // Mock service response
            listJobs.mockResolvedValue({
                jobs: [mockJobData],
                total: 1
            });

            const response = await GET(createRequest.get('/api/jobs', {
                page: '2',
                limit: '20'
            }));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.page).toBe(2);
            expect(data.limit).toBe(20);
            expect(listJobs).toHaveBeenCalledWith(2, 20, undefined);
        });

        it('should filter by client ID', async () => {
            // Mock service response
            listJobs.mockResolvedValue({
                jobs: [mockJobData],
                total: 1
            });

            const clientId = '123';
            const response = await GET(createRequest.get('/api/jobs', {
                clientId
            }));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(listJobs).toHaveBeenCalledWith(1, 10, clientId);
        });

        it('should reject invalid pagination parameters', async () => {
            const response = await GET(createRequest.get('/api/jobs', {
                page: '-1',
                limit: '0'
            }));
            await assertErrorResponse(response, 400, {
                field: 'pagination',
                messageIncludes: 'positive numbers'
            });
        });

        it('should handle service errors', async () => {
            // Mock service error
            listJobs.mockRejectedValue(new Error('Database error'));

            const response = await GET(createRequest.get('/api/jobs'));
            await assertErrorResponse(response, 500, {
                field: 'general',
                messageIncludes: 'Failed to process request'
            });
        });

        it('should format job data correctly', async () => {
            // Mock service response
            listJobs.mockResolvedValue({
                jobs: [mockJobData],
                total: 1
            });

            const response = await GET(createRequest.get('/api/jobs'));
            const data = await assertSuccessResponse(response);
            expect(data.jobs[0]).toEqual(expect.objectContaining({
                jobNumber: mockJobData.jobNumber,
                clientId: mockJobData.clientId,
                status: mockJobData.status,
                priority: mockJobData.priority,
                category: mockJobData.category,
                description: mockJobData.description,
                createdAt: mockJobData.createdAt.toISOString()
            }));
        });
    });
});
