import { performanceOptimizationService, PerformanceOptimizationError } from '../../app/services/performanceOptimizationService';
import {
  LoadingPriority,
  OptimizationStrategy,
  CacheLevel,
  BatchOperation
} from '../../app/types/performance';

describe('Performance Optimization Service', () => {
  describe('loadChunk', () => {
    it('should load chunk with specified priority', async () => {
      const url = 'https://example.com/data.json';
      const priority = LoadingPriority.HIGH;

      const chunk = await performanceOptimizationService.loadChunk(url, priority);

      expect(chunk.id).toBeDefined();
      expect(chunk.url).toBe(url);
      expect(chunk.priority).toBe(priority);
      expect(chunk.status).toBe('PENDING');
    });

    it('should track chunk loading progress', async () => {
      const chunk = await performanceOptimizationService.loadChunk(
        'https://example.com/data.json',
        LoadingPriority.MEDIUM
      );

      expect(chunk.loaded).toBe(0);
      expect(chunk.attempts).toBe(0);
      expect(chunk.startTime).toBeDefined();
    });
  });

  describe('optimizeCoordinates', () => {
    it('should update coordinate optimization settings', () => {
      const config = {
        gridSize: 200,
        spatialIndex: true,
        useWorkers: true,
        workerCount: 8
      };

      performanceOptimizationService.optimizeCoordinates(config);

      const snapshot = performanceOptimizationService.takeSnapshot();
      expect(snapshot.profile.coordinates?.gridSize).toBe(200);
      expect(snapshot.profile.coordinates?.workerCount).toBe(8);
    });
  });

  describe('cacheOperation', () => {
    it('should perform cache operations', async () => {
      const key = 'test-key';
      const data = { value: 'test-data' };

      // Set cache entry
      await performanceOptimizationService.cacheOperation(
        'SET',
        key,
        data,
        CacheLevel.MEMORY
      );

      // Get cache entry
      const retrieved = await performanceOptimizationService.cacheOperation(
        'GET',
        key,
        undefined,
        CacheLevel.MEMORY
      );

      expect(retrieved).toEqual(data);

      // Delete cache entry
      await performanceOptimizationService.cacheOperation(
        'DELETE',
        key,
        undefined,
        CacheLevel.MEMORY
      );

      const afterDelete = await performanceOptimizationService.cacheOperation(
        'GET',
        key,
        undefined,
        CacheLevel.MEMORY
      );

      expect(afterDelete).toBeNull();
    });

    it('should handle invalid cache level', async () => {
      await expect(performanceOptimizationService.cacheOperation(
        'GET',
        'test-key',
        undefined,
        'INVALID_LEVEL' as CacheLevel
      )).rejects.toThrow(PerformanceOptimizationError);
    });
  });

  describe('addToBatch', () => {
    it('should add operations to batch queue', async () => {
      const operations: BatchOperation[] = [
        {
          id: 'op-1',
          type: 'TEST',
          data: { value: 'test' },
          priority: 1,
          timestamp: Date.now(),
          retries: 0
        }
      ];

      await performanceOptimizationService.addToBatch(operations);

      const snapshot = performanceOptimizationService.takeSnapshot();
      expect(snapshot.metrics.batch.queueLength).toBeGreaterThan(0);
    });

    it('should process batch when threshold reached', async () => {
      const operations: BatchOperation[] = Array.from({ length: 101 }, (_, i) => ({
        id: `op-${i}`,
        type: 'TEST',
        data: { value: 'test' },
        priority: 1,
        timestamp: Date.now(),
        retries: 0
      }));

      await performanceOptimizationService.addToBatch(operations);

      const snapshot = performanceOptimizationService.takeSnapshot();
      expect(snapshot.metrics.batch.processingRate).toBeGreaterThan(0);
    });
  });

  describe('takeSnapshot', () => {
    it('should capture current performance state', () => {
      const snapshot = performanceOptimizationService.takeSnapshot();

      expect(snapshot.id).toBeDefined();
      expect(snapshot.timestamp).toBeDefined();
      expect(snapshot.profile.strategy).toBe(OptimizationStrategy.BALANCED);
      expect(snapshot.metrics).toBeDefined();
      expect(snapshot.issues).toBeDefined();
      expect(snapshot.recommendations).toBeDefined();
    });

    it('should include all metric categories', () => {
      const snapshot = performanceOptimizationService.takeSnapshot();

      expect(snapshot.metrics.memory).toBeDefined();
      expect(snapshot.metrics.loading).toBeDefined();
      expect(snapshot.metrics.cache).toBeDefined();
      expect(snapshot.metrics.batch).toBeDefined();
      expect(snapshot.metrics.coordinates).toBeDefined();
    });

    it('should track cache statistics', () => {
      const snapshot = performanceOptimizationService.takeSnapshot();

      expect(snapshot.metrics.cache.size).toBeDefined();
      expect(snapshot.metrics.cache.hits).toBeDefined();
      expect(snapshot.metrics.cache.misses).toBeDefined();
      expect(snapshot.metrics.cache.evictions).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle chunk loading errors', async () => {
      await expect(performanceOptimizationService.loadChunk(
        'invalid-url',
        LoadingPriority.HIGH
      )).resolves.toHaveProperty('status', 'PENDING');
    });

    it('should handle invalid cache operations', async () => {
      await expect(performanceOptimizationService.cacheOperation(
        'INVALID' as any,
        'test-key'
      )).rejects.toThrow(PerformanceOptimizationError);
    });

    it('should handle batch processing errors', async () => {
      const invalidOperation: BatchOperation = {
        id: 'invalid-op',
        type: 'INVALID',
        data: null,
        priority: -1,
        timestamp: Date.now(),
        retries: 0
      };

      await expect(performanceOptimizationService.addToBatch([invalidOperation]))
        .resolves.not.toThrow();

      const snapshot = performanceOptimizationService.takeSnapshot();
      expect(snapshot.metrics.batch.successRate).toBeLessThan(1);
    });
  });

  describe('cleanup', () => {
    it('should dispose resources properly', () => {
      performanceOptimizationService.dispose();

      const snapshot = performanceOptimizationService.takeSnapshot();
      expect(snapshot.metrics.coordinates.workerUtilization).toBe(0);
    });
  });
});
