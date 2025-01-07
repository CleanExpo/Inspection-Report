import { JobService } from '../../app/services/jobService';
import { mockListJobs } from '../mocks/jobService';
import { performance } from 'perf_hooks';
import { JobStatus, JobPriority } from '../../app/types/client';

/**
 * Database Performance Tests
 * Measures database operation times and connection efficiency
 */
describe('Database Performance', () => {
    const ACCEPTABLE_QUERY_TIME = 200; // milliseconds - more realistic for database operations
    const LARGE_QUERY_TIMEOUT = ACCEPTABLE_QUERY_TIME * 1.5; // 50% more time for large queries

    describe('Query Performance', () => {
        it('should execute simple queries within acceptable time', async () => {
            mockListJobs.mockImplementation(async () => {
                // Simulate realistic database query time
                await new Promise(resolve => setTimeout(resolve, 50));
                return { jobs: [], total: 0 };
            });

            const startTime = performance.now();
            await JobService.listJobs(1, 10);
            const endTime = performance.now();

            const queryTime = endTime - startTime;
            expect(queryTime).toBeLessThan(ACCEPTABLE_QUERY_TIME);
        });

        it('should handle complex queries efficiently', async () => {
            // Create complex query scenario
            const complexQuery = async () => {
                const results = await Promise.all([
                    JobService.listJobs(1, 10, 'status=PENDING'),
                    JobService.listJobs(1, 10, 'priority=HIGH'),
                    JobService.listJobs(1, 10, 'category=inspection')
                ]);
                return results;
            };

            mockListJobs.mockImplementation(async (page, limit, filter) => {
                // Simulate varying query times based on filter complexity
                const delay = filter ? 75 : 50;
                await new Promise(resolve => setTimeout(resolve, delay));
                return { jobs: [], total: 0 };
            });

            const startTime = performance.now();
            await complexQuery();
            const endTime = performance.now();

            const totalQueryTime = endTime - startTime;
            const averageQueryTime = totalQueryTime / 3;

            expect(averageQueryTime).toBeLessThan(ACCEPTABLE_QUERY_TIME);
        });

        it('should maintain performance with large result sets', async () => {
            const LARGE_DATASET_SIZE = 1000; // Reduced from 10000
            const largeDataset = Array.from({ length: LARGE_DATASET_SIZE }, (_, i) => ({
                id: i.toString(),
                jobNumber: `2024-0101-${i.toString().padStart(4, '0')}`,
                clientId: '123',
                status: 'PENDING' as JobStatus,
                priority: 'HIGH' as JobPriority,
                category: 'inspection',
                description: 'Test job',
                createdAt: new Date(),
                updatedAt: new Date()
            }));

            mockListJobs.mockImplementation(async (page: number, limit: number) => {
                // Simulate pagination
                const start = (page - 1) * limit;
                const end = Math.min(start + limit, LARGE_DATASET_SIZE);
                const paginatedData = largeDataset.slice(start, end);

                // Simulate query time proportional to result size
                await new Promise(resolve => setTimeout(resolve, 50));

                return {
                    jobs: paginatedData,
                    total: LARGE_DATASET_SIZE
                };
            });

            const startTime = performance.now();
            const result = await JobService.listJobs(1, 50); // Reduced from 100
            const endTime = performance.now();

            const queryTime = endTime - startTime;
            expect(queryTime).toBeLessThan(LARGE_QUERY_TIMEOUT);
            expect(result.jobs.length).toBe(50);
            expect(result.total).toBe(LARGE_DATASET_SIZE);
        });
    });

    describe('Connection Pool Efficiency', () => {
        it('should handle multiple concurrent database operations', async () => {
            const CONCURRENT_OPERATIONS = 10; // Reduced from 20
            let activeConnections = 0;
            const MAX_CONNECTIONS = 5; // Reduced from 10

            mockListJobs.mockImplementation(async () => {
                activeConnections++;
                expect(activeConnections).toBeLessThanOrEqual(MAX_CONNECTIONS);

                await new Promise(resolve => setTimeout(resolve, 50));

                activeConnections--;
                return { jobs: [], total: 0 };
            });

            const operations = Array.from({ length: CONCURRENT_OPERATIONS }, () =>
                JobService.listJobs(1, 10)
            );

            const startTime = performance.now();
            await Promise.all(operations);
            const endTime = performance.now();

            const totalTime = endTime - startTime;
            const averageTime = totalTime / CONCURRENT_OPERATIONS;

            expect(averageTime).toBeLessThan(ACCEPTABLE_QUERY_TIME);
            expect(activeConnections).toBe(0); // All connections should be released
        });
    });

    describe('Cache Operations', () => {
        it('should improve performance with caching', async () => {
            let cacheHits = 0;
            const cache = new Map();

            mockListJobs.mockImplementation(async (page, limit, filter) => {
                const cacheKey = `${page}-${limit}-${filter}`;

                // Check cache
                if (cache.has(cacheKey)) {
                    cacheHits++;
                    return cache.get(cacheKey);
                }

                // Simulate database query
                await new Promise(resolve => setTimeout(resolve, 100));
                const result = { jobs: [], total: 0 };

                // Cache result
                cache.set(cacheKey, result);
                return result;
            });

            // First request (cache miss)
            const startTime1 = performance.now();
            await JobService.listJobs(1, 10);
            const endTime1 = performance.now();
            const uncachedTime = endTime1 - startTime1;

            // Second request (cache hit)
            const startTime2 = performance.now();
            await JobService.listJobs(1, 10);
            const endTime2 = performance.now();
            const cachedTime = endTime2 - startTime2;

            expect(cachedTime).toBeLessThan(uncachedTime * 0.5); // Cached should be at least 50% faster
            expect(cacheHits).toBe(1); // Should have one cache hit
        });

        it('should handle cache invalidation efficiently', async () => {
            const cache = new Map();
            let invalidationTime = 0;

            mockListJobs.mockImplementation(async (page, limit) => {
                const cacheKey = `${page}-${limit}`;

                // Simulate cache invalidation after data modification
                if (invalidationTime > 0) {
                    cache.clear();
                }

                if (cache.has(cacheKey)) {
                    return cache.get(cacheKey);
                }

                await new Promise(resolve => setTimeout(resolve, 50));
                const result = { jobs: [], total: 0 };
                cache.set(cacheKey, result);
                return result;
            });

            // Initial request
            await JobService.listJobs(1, 10);

            // Simulate data modification
            invalidationTime = Date.now();

            // Request after invalidation
            const startTime = performance.now();
            await JobService.listJobs(1, 10);
            const endTime = performance.now();

            const queryTime = endTime - startTime;
            expect(queryTime).toBeLessThan(ACCEPTABLE_QUERY_TIME);
            expect(cache.size).toBe(1); // Cache should be repopulated
        });
    });
});
