import { PerformanceOptimizer } from '../performanceOptimizer';

describe('PerformanceOptimizer', () => {
  let optimizer: PerformanceOptimizer;
  
  beforeEach(() => {
    optimizer = new PerformanceOptimizer();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getOrCalculate', () => {
    it('should cache calculation results', async () => {
      const calculator = jest.fn().mockResolvedValue('test-result');
      
      // First call should calculate
      const result1 = await optimizer.getOrCalculate('test-key', calculator);
      expect(result1).toBe('test-result');
      expect(calculator).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await optimizer.getOrCalculate('test-key', calculator);
      expect(result2).toBe('test-result');
      expect(calculator).toHaveBeenCalledTimes(1); // Still 1, used cache
    });

    it('should recalculate after cache expiration', async () => {
      const calculator = jest.fn().mockResolvedValue('test-result');
      
      // First calculation
      await optimizer.getOrCalculate('test-key', calculator);
      
      // Advance time past TTL
      jest.advanceTimersByTime(6 * 60 * 1000); // 6 minutes
      
      // Should recalculate
      await optimizer.getOrCalculate('test-key', calculator);
      expect(calculator).toHaveBeenCalledTimes(2);
    });

    it('should handle calculation errors', async () => {
      const calculator = jest.fn().mockRejectedValue(new Error('Test error'));
      
      await expect(
        optimizer.getOrCalculate('test-key', calculator)
      ).rejects.toThrow('Test error');
    });

    it('should maintain cache size limit', async () => {
      // Create more entries than the cache limit
      for (let i = 0; i < 105; i++) {
        await optimizer.getOrCalculate(
          `key-${i}`,
          async () => `result-${i}`
        );
      }

      // The oldest entries should have been removed
      const firstResult = await optimizer.getOrCalculate(
        'key-0',
        async () => 'new-result'
      );
      expect(firstResult).toBe('new-result'); // Should recalculate, not use cache
    });
  });

  describe('clearExpiredCache', () => {
    it('should remove expired entries', async () => {
      // Add some entries
      await optimizer.getOrCalculate('key1', async () => 'result1');
      
      // Advance time for some entries
      jest.advanceTimersByTime(3 * 60 * 1000); // 3 minutes
      await optimizer.getOrCalculate('key2', async () => 'result2');
      
      // Advance more time
      jest.advanceTimersByTime(3 * 60 * 1000); // Another 3 minutes
      
      // Clear expired entries
      optimizer.clearExpiredCache();
      
      // key1 should be recalculated, key2 should still be cached
      const calculator = jest.fn().mockResolvedValue('new-result');
      await optimizer.getOrCalculate('key1', calculator);
      expect(calculator).toHaveBeenCalled();
      
      await optimizer.getOrCalculate('key2', calculator);
      expect(calculator).toHaveBeenCalledTimes(1); // Still cached
    });
  });
});
