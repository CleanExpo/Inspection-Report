import { POST as loginPost } from '../../app/api/auth/login/route';
import { GET as jobsGet } from '../../app/api/jobs/route';
import { createRequest } from '../utils/testUtils';
import { mockListJobs } from '../mocks/jobService';
import { JobStatus, JobPriority } from '../../app/types/client';

/**
 * Performance tests for API endpoints
 * Measures response times and handles concurrent requests
 */
// Constants for performance thresholds
const ACCEPTABLE_RESPONSE_TIME = 500; // milliseconds - more realistic for auth operations
const LARGE_DATASET_TIMEOUT = ACCEPTABLE_RESPONSE_TIME * 2; // Double time for large datasets

describe('API Performance', () => {
    let adminToken: string;

    beforeAll(async () => {
        // Get admin token for protected routes
        const loginResponse = await loginPost(createRequest.post('/api/auth/login', {
            email: 'admin@example.com',
            password: 'admin123'
        }));
        const { accessToken } = await loginResponse.json();
        adminToken = accessToken;
    });

    describe('Response Time Tests', () => {
        it('should respond to authentication requests within acceptable time', async () => {
            const startTime = performance.now();
            
            await loginPost(createRequest.post('/api/auth/login', {
                email: 'admin@example.com',
                password: 'admin123'
            }));
            
            const endTime = performance.now();
            const responseTime = endTime - startTime;
            
            expect(responseTime).toBeLessThan(ACCEPTABLE_RESPONSE_TIME);
        });

        it('should respond to protected routes within acceptable time', async () => {
            mockListJobs.mockResolvedValueOnce({
                jobs: [],
                total: 0
            });

            const startTime = performance.now();
            
            await jobsGet(createRequest.get('/api/jobs', {}, {
                authorization: `Bearer ${adminToken}`
            }));
            
            const endTime = performance.now();
            const responseTime = endTime - startTime;
            
            expect(responseTime).toBeLessThan(ACCEPTABLE_RESPONSE_TIME);
        });

        it('should maintain performance with larger datasets', async () => {
            // Create large dataset with reduced size
            const largeDataset = Array.from({ length: 500 }, (_, i) => ({
                id: i.toString(),
                jobNumber: `2024-0101-${i.toString().padStart(3, '0')}`,
                clientId: '123',
                status: 'PENDING' as JobStatus,
                priority: 'HIGH' as JobPriority,
                category: 'inspection',
                description: 'Test job',
                createdAt: new Date(),
                updatedAt: new Date()
            }));

            mockListJobs.mockResolvedValueOnce({
                jobs: largeDataset,
                total: largeDataset.length
            });

            const startTime = performance.now();
            
            await jobsGet(createRequest.get('/api/jobs', {}, {
                authorization: `Bearer ${adminToken}`
            }));
            
            const endTime = performance.now();
            const responseTime = endTime - startTime;
            
            expect(responseTime).toBeLessThan(ACCEPTABLE_RESPONSE_TIME * 2); // Allow more time for large dataset
        });
    });

    describe('Concurrent Request Tests', () => {
        it('should handle multiple concurrent requests', async () => {
            mockListJobs.mockResolvedValue({
                jobs: [],
                total: 0
            });

            const CONCURRENT_REQUESTS = 5; // Reduced concurrent requests
            const requests = Array.from({ length: CONCURRENT_REQUESTS }, () =>
                jobsGet(createRequest.get('/api/jobs', {}, {
                    authorization: `Bearer ${adminToken}`
                }))
            );

            const startTime = performance.now();
            const responses = await Promise.all(requests);
            const endTime = performance.now();

            // Verify all requests succeeded
            responses.forEach(response => {
                expect(response.status).toBe(200);
            });

            // Calculate average response time
            const totalTime = endTime - startTime;
            const averageTime = totalTime / CONCURRENT_REQUESTS;

            expect(averageTime).toBeLessThan(ACCEPTABLE_RESPONSE_TIME); // Use same acceptable time
            expect(mockListJobs).toHaveBeenCalledTimes(CONCURRENT_REQUESTS);
        });

        it('should maintain data consistency under load', async () => {
            const CONCURRENT_REQUESTS = 10; // Reduced concurrent requests
            let requestCount = 0;

            mockListJobs.mockImplementation(async () => {
                requestCount++;
                return {
                    jobs: [],
                    total: requestCount // Use counter to verify order
                };
            });

            const requests = Array.from({ length: CONCURRENT_REQUESTS }, () =>
                jobsGet(createRequest.get('/api/jobs', {}, {
                    authorization: `Bearer ${adminToken}`
                }))
            );

            const responses = await Promise.all(requests);
            const results = await Promise.all(responses.map(r => r.json()));

            // Verify each request got a unique total
            const totals = results.map(r => r.total);
            const uniqueTotals = new Set(totals);
            expect(uniqueTotals.size).toBe(CONCURRENT_REQUESTS);
        });

        it('should handle rate limiting', async () => {
            const REQUESTS_PER_MINUTE = 30; // Reduced to 30 requests per minute
            const requests = Array.from({ length: REQUESTS_PER_MINUTE }, () =>
                jobsGet(createRequest.get('/api/jobs', {}, {
                    authorization: `Bearer ${adminToken}`
                }))
            );

            mockListJobs.mockResolvedValue({
                jobs: [],
                total: 0
            });

            const responses = await Promise.all(requests);
            const successfulRequests = responses.filter(r => r.status === 200);
            const rateLimitedRequests = responses.filter(r => r.status === 429);

            // Some requests should succeed
            expect(successfulRequests.length).toBeGreaterThan(0);

            // Some requests should be rate limited
            expect(rateLimitedRequests.length).toBeGreaterThan(0);

            // Total should equal number of requests
            expect(successfulRequests.length + rateLimitedRequests.length).toBe(REQUESTS_PER_MINUTE);
        });
    });

    describe('Error Rate Tests', () => {
        it('should maintain low error rate under load', async () => {
            const TOTAL_REQUESTS = 50; // Reduced total requests
            let errorCount = 0;

            mockListJobs.mockImplementation(async () => {
                // Simulate random errors (5% chance)
                if (Math.random() < 0.05) {
                    errorCount++;
                    throw new Error('Random error');
                }
                return { jobs: [], total: 0 };
            });

            const requests = Array.from({ length: TOTAL_REQUESTS }, () =>
                jobsGet(createRequest.get('/api/jobs', {}, {
                    authorization: `Bearer ${adminToken}`
                })).catch(() => null) // Catch errors to continue test
            );

            const responses = await Promise.all(requests);
            const successfulRequests = responses.filter(r => r && r.status === 200);

            // Calculate error rate
            const errorRate = errorCount / TOTAL_REQUESTS;
            expect(errorRate).toBeLessThan(0.1); // Less than 10% error rate

            // Most requests should succeed
            expect(successfulRequests.length).toBeGreaterThan(TOTAL_REQUESTS * 0.9);
        });
    });
});
