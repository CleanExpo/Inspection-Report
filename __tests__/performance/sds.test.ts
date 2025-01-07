import { sdsService } from '../../services/sdsService';
import { THRESHOLDS, measurePerformance, runLoadTest } from './setup';

describe('SDS Service Performance Tests', () => {
  const testMaterials = [
    'Acetone',
    'Isopropyl Alcohol',
    'Hydrogen Peroxide',
    'Sodium Hypochlorite',
    'Ethanol'
  ];

  describe('SDS Retrieval Performance', () => {
    it('should fetch SDS data within threshold', async () => {
      const { duration, passedThreshold } = await measurePerformance(
        'sds_fetch',
        () => sdsService.getSDSByName(testMaterials[0]),
        THRESHOLDS.DATABASE.READ
      );

      expect(passedThreshold).toBe(true);
      expect(duration).toBeLessThanOrEqual(THRESHOLDS.DATABASE.READ);
    });

    it('should handle batch SDS retrieval efficiently', async () => {
      const { duration, passedThreshold } = await measurePerformance(
        'sds_batch_fetch',
        () => sdsService.batchGetSDS(testMaterials),
        THRESHOLDS.DATABASE.READ * 2 // Allow double time for batch
      );

      expect(passedThreshold).toBe(true);
      expect(duration).toBeLessThanOrEqual(THRESHOLDS.DATABASE.READ * 2);
    });
  });

  describe('SDS Cache Performance', () => {
    beforeAll(async () => {
      // Prime the cache
      await Promise.all(
        testMaterials.map(name => sdsService.getSDSByName(name))
      );
    });

    it('should have fast cache hits', async () => {
      const { duration, passedThreshold } = await measurePerformance(
        'sds_cache_hit',
        () => sdsService.getSDSByName(testMaterials[0]),
        THRESHOLDS.CACHE.HIT
      );

      expect(passedThreshold).toBe(true);
      expect(duration).toBeLessThanOrEqual(THRESHOLDS.CACHE.HIT);
    });

    it('should handle cache misses efficiently', async () => {
      const { duration, passedThreshold } = await measurePerformance(
        'sds_cache_miss',
        () => sdsService.getSDSByName('non-existent-material'),
        THRESHOLDS.CACHE.MISS
      );

      expect(passedThreshold).toBe(true);
      expect(duration).toBeLessThanOrEqual(THRESHOLDS.CACHE.MISS);
    });
  });

  describe('Load Testing', () => {
    it('should handle concurrent SDS requests', async () => {
      const results = await runLoadTest(
        () => sdsService.getSDSByName(testMaterials[0]),
        10, // concurrency
        50 // total iterations
      );

      expect(results.successRate).toBeGreaterThanOrEqual(99);
      expect(results.averageResponseTime).toBeLessThanOrEqual(THRESHOLDS.CACHE.HIT * 1.5);
    });

    it('should handle concurrent batch requests', async () => {
      const results = await runLoadTest(
        () => sdsService.batchGetSDS(testMaterials),
        5, // concurrency
        20 // total iterations
      );

      expect(results.successRate).toBeGreaterThanOrEqual(99);
      expect(results.averageResponseTime).toBeLessThanOrEqual(THRESHOLDS.DATABASE.READ * 3);
    });
  });

  describe('Memory Usage', () => {
    it('should maintain stable memory usage during batch operations', async () => {
      const initialMemory = process.memoryUsage();
      
      // Perform multiple batch operations
      await Promise.all(
        Array(5).fill(null).map(() => sdsService.batchGetSDS(testMaterials))
      );

      const finalMemory = process.memoryUsage();
      const heapGrowth = (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024;

      // Heap shouldn't grow more than 50MB
      expect(heapGrowth).toBeLessThanOrEqual(50);
    });

    it('should clean up cache without memory leaks', async () => {
      const initialMemory = process.memoryUsage();
      
      // Fill cache
      await Promise.all(
        testMaterials.map(name => sdsService.getSDSByName(name))
      );
      
      // Clear cache
      await sdsService.clearCache();

      const finalMemory = process.memoryUsage();
      const heapDiff = (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024;

      // Heap difference should be minimal after cleanup
      expect(Math.abs(heapDiff)).toBeLessThanOrEqual(1);
    });
  });
});
