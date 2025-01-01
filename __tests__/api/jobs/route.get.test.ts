import { GET } from '../../../app/api/jobs/route';
import { JobService } from '../../../app/services/jobService';
import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import type { Job } from '../../../app/types/client';

// Mock types
type ListJobsResponse = {
    jobs: Partial<Job>[];
    total: number;
};

// Mock JobService
const mockListJobs = jest.fn() as jest.MockedFunction<
    (page: number, limit: number, clientId?: string) => Promise<ListJobsResponse>
>;

jest.mock('../../../app/services/jobService', () => ({
    JobService: {
        listJobs: mockListJobs
    }
}));

describe('Jobs API - GET Endpoint', () => {
    const mockJobs: Partial<Job>[] = [
        {
            jobNumber: '2024-0101-001',
            clientId: '123',
            status: 'PENDING',
            priority: 'HIGH',
            category: 'WATER_DAMAGE',
            description: 'Test job 1',
            createdAt: new Date('2024-01-01T00:00:00Z')
        },
        {
            jobNumber: '2024-0101-002',
            clientId: '456',
            status: 'IN_PROGRESS',
            priority: 'MEDIUM',
            category: 'WATER_DAMAGE',
            description: 'Test job 2',
            createdAt: new Date('2024-01-01T01:00:00Z')
        }
    ];

    const mockRequest = (params: Record<string, string>) => {
        const url = new URL('http://localhost/api/jobs');
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
        return new Request(url);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/jobs', () => {
        it('should list jobs with default pagination', async () => {
            // Mock job service response
            mockListJobs.mockResolvedValue({
                jobs: mockJobs,
                total: 2
            });

            const response = await GET(mockRequest({}));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.jobs).toHaveLength(2);
            expect(data.total).toBe(2);
            expect(data.page).toBe(1);
            expect(data.limit).toBe(10);

            // Verify jobs are formatted correctly
            expect(data.jobs[0]).toEqual({
                jobNumber: mockJobs[0].jobNumber,
                clientId: mockJobs[0].clientId,
                status: mockJobs[0].status,
                priority: mockJobs[0].priority,
                category: mockJobs[0].category,
                description: mockJobs[0].description,
                createdAt: mockJobs[0].createdAt?.toISOString()
            });

            // Verify JobService was called with default parameters
            expect(mockListJobs).toHaveBeenCalledWith(1, 10, undefined);
        });

        it('should handle custom pagination parameters', async () => {
            // Mock job service response
            mockListJobs.mockResolvedValue({
                jobs: mockJobs.slice(0, 1),
                total: 2
            });

            const response = await GET(mockRequest({ page: '2', limit: '1' }));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.jobs).toHaveLength(1);
            expect(data.total).toBe(2);
            expect(data.page).toBe(2);
            expect(data.limit).toBe(1);

            // Verify JobService was called with correct parameters
            expect(mockListJobs).toHaveBeenCalledWith(2, 1, undefined);
        });

        it('should filter by client ID', async () => {
            // Mock job service response
            mockListJobs.mockResolvedValue({
                jobs: mockJobs.filter(job => job.clientId === '123'),
                total: 1
            });

            const response = await GET(mockRequest({ clientId: '123' }));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.jobs).toHaveLength(1);
            expect(data.jobs[0].clientId).toBe('123');

            // Verify JobService was called with client ID filter
            expect(mockListJobs).toHaveBeenCalledWith(1, 10, '123');
        });

        it('should reject invalid pagination parameters', async () => {
            const response = await GET(mockRequest({ page: '0', limit: '-1' }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'pagination',
                    message: expect.stringContaining('positive numbers')
                })
            );
        });

        it('should handle service errors', async () => {
            // Mock service error
            mockListJobs.mockRejectedValue(new Error('DB Error'));

            const response = await GET(mockRequest({}));
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
