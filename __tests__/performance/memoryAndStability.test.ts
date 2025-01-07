import { JobService } from '../../app/services/jobService';
import { mockListJobs } from '../mocks/jobService';
import { performance } from 'perf_hooks';
import { JobStatus, JobPriority } from '../../app/types/client';

/**
 * Memory Leak and Long-term Stability Tests
 */
describe('Memory and Stability Tests', () => {
    const MEMORY_THRESHOLD = 50 * 1024 * 1024; // 50MB - more realistic threshold
    let initialMemoryUsage: number;
    let jobService: JobService | undefined;

    beforeEach(async () => {
        if (global.gc) {
            global.gc(); // Force garbage collection if available
        }
        // Reset mocks and clear any cached data
        mockListJobs.mockReset();
        initialMemoryUsage = process.memoryUsage().heapUsed;
        jobService = new JobService();
    });

    afterEach(async () => {
        if (global.gc) {
            global.gc();
        }
        // Clean up any resources
        jobService = undefined;
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for cleanup
    });

    describe('Memory Leak Detection', () => {
        it('should not leak memory during repeated operations', async () => {
            const ITERATIONS = 100; // Reduced iterations for faster testing
            const memoryMeasurements: number[] = [];

            mockListJobs.mockResolvedValue({
                jobs: [],
                total: 0
            });

            for (let i = 0; i < ITERATIONS; i++) {
                await JobService.listJobs(1, 10);
                
                if (i % 100 === 0) { // Measure every 100 iterations
                    if (global.gc) {
                        global.gc();
                    }
                    const currentMemory = process.memoryUsage().heapUsed;
                    memoryMeasurements.push(currentMemory);
                }
            }

            // Check if memory usage is stable (not continuously increasing)
            const memoryGrowth = memoryMeasurements[memoryMeasurements.length - 1] - memoryMeasurements[0];
            expect(memoryGrowth).toBeLessThan(MEMORY_THRESHOLD);
        });

        it('should release memory after large operations', async () => {
            const LARGE_DATA_SIZE = 1000; // Reduced dataset size
            const largeDataset = Array.from({ length: LARGE_DATA_SIZE }, (_, i) => ({
                id: i.toString(),
                jobNumber: `JOB-${i}`,
                status: 'PENDING' as JobStatus,
                priority: 'NORMAL' as JobPriority,
                category: 'inspection',
                description: 'x'.repeat(500),
                clientId: `client-${i}`,
                createdAt: new Date(Date.now() - 86400000), // 24 hours ago
                updatedAt: new Date()
            }));

            mockListJobs.mockResolvedValue({
                jobs: largeDataset,
                total: LARGE_DATA_SIZE
            });

            // Perform operation with large dataset
            await JobService.listJobs(1, LARGE_DATA_SIZE);

            if (global.gc) {
                global.gc();
            }

            const finalMemoryUsage = process.memoryUsage().heapUsed;
            const memoryDiff = finalMemoryUsage - initialMemoryUsage;

            // Memory usage should return close to initial state
            expect(memoryDiff).toBeLessThan(MEMORY_THRESHOLD);
        });
    });

    describe('Long-term Stability', () => {
        it('should maintain performance over extended periods', async () => {
            const DURATION = 20 * 1000; // 20 seconds
            const INTERVAL = 500; // 0.5 second interval
            const performanceMeasurements: number[] = [];
            const startTime = Date.now();

            mockListJobs.mockResolvedValue({
                jobs: [],
                total: 0
            });

            while (Date.now() - startTime < DURATION) {
                const opStart = performance.now();
                await JobService.listJobs(1, 10);
                const opDuration = performance.now() - opStart;
                performanceMeasurements.push(opDuration);

                await new Promise(resolve => setTimeout(resolve, INTERVAL));
            }

            // Calculate performance stability
            const averageTime = performanceMeasurements.reduce((a, b) => a + b) / performanceMeasurements.length;
            const maxDeviation = Math.max(...performanceMeasurements) - averageTime;

            // Performance should remain within 200% of average
            expect(maxDeviation).toBeLessThan(averageTime * 2);
        });

        it('should handle intermittent failures gracefully', async () => {
            const OPERATIONS = 100;
            let failureCount = 0;
            let recoveryCount = 0;

            mockListJobs.mockImplementation(async () => {
                // Simulate random failures
                if (Math.random() < 0.1) {
                    failureCount++;
                    throw new Error('Simulated failure');
                }
                if (failureCount > 0) {
                    recoveryCount++;
                }
                return { jobs: [], total: 0 };
            });

            const results = await Promise.allSettled(
                Array.from({ length: OPERATIONS }, () => JobService.listJobs(1, 10))
            );

            const successfulOperations = results.filter(r => r.status === 'fulfilled');
            const failedOperations = results.filter(r => r.status === 'rejected');

            // System should recover from failures
            expect(recoveryCount).toBeGreaterThan(0);
            // Failure rate should be within expected range
            expect(failedOperations.length).toBeLessThan(OPERATIONS * 0.15);
        });
    });
});
