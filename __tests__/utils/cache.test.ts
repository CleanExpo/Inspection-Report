import {
  readingCache,
  createBatchProcessor,
  getDailyReadingsKey,
  cacheDailyReadings,
  getCachedDailyReadings,
  getCacheStats,
} from 'utils/cache';
import { MoistureReading, DailyReadings } from 'types/moisture';

describe('Cache Utils', () => {
  // Mock data
  const mockReading: MoistureReading = {
    id: 'reading-1',
    position: { x: 100, y: 100 },
    value: 15,
    materialType: 'drywall',
    timestamp: new Date().toISOString(),
  };

  const mockDailyReadings: DailyReadings = {
    date: '2024-01-01',
    readings: [mockReading],
  };

  beforeEach(() => {
    // Clear cache and localStorage before each test
    readingCache.clear();
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('ReadingCache', () => {
    it('stores and retrieves readings', () => {
      readingCache.set(mockReading.id, mockReading);
      const retrieved = readingCache.get(mockReading.id);
      expect(retrieved).toEqual(mockReading);
    });

    it('handles expired items', () => {
      readingCache.set(mockReading.id, mockReading);
      
      // Advance time by 31 minutes (beyond default expiration)
      jest.advanceTimersByTime(31 * 60 * 1000);
      
      const retrieved = readingCache.get(mockReading.id);
      expect(retrieved).toBeNull();
    });

    it('respects max size', () => {
      // Create readings up to max size + 1
      for (let i = 0; i < 1001; i++) {
        const reading: MoistureReading = {
          ...mockReading,
          id: `reading-${i}`,
        };
        readingCache.set(reading.id, reading);
      }

      expect(readingCache.size).toBe(1000);
    });

    it('handles batch operations', () => {
      const readings = Array.from({ length: 5 }, (_, i) => ({
        ...mockReading,
        id: `reading-${i}`,
      }));

      readingCache.setMany(readings);
      const retrieved = readingCache.getMany(readings.map(r => r.id));
      expect(retrieved).toHaveLength(5);
      expect(retrieved).toEqual(readings);
    });
  });

  describe('BatchProcessor', () => {
    it('processes items in batches', async () => {
      const processCallback = jest.fn().mockResolvedValue(undefined);
      const batchProcessor = createBatchProcessor(processCallback, {
        batchSize: 2,
        processingDelay: 100,
      });

      const readings = Array.from({ length: 5 }, (_, i) => ({
        ...mockReading,
        id: `reading-${i}`,
      }));

      batchProcessor.addMany(readings);

      // Fast-forward timers
      jest.runAllTimers();
      await Promise.resolve(); // Flush promises

      expect(processCallback).toHaveBeenCalledTimes(3); // 2 + 2 + 1 items
      expect(processCallback.mock.calls[0][0]).toHaveLength(2);
      expect(processCallback.mock.calls[1][0]).toHaveLength(2);
      expect(processCallback.mock.calls[2][0]).toHaveLength(1);
    });

    it('handles processing errors', async () => {
      const error = new Error('Processing failed');
      const processCallback = jest.fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(undefined);
      
      const batchProcessor = createBatchProcessor(processCallback, {
        batchSize: 2,
        processingDelay: 100,
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      batchProcessor.add(mockReading);

      // Fast-forward timers
      jest.runAllTimers();
      await Promise.resolve(); // Flush promises

      expect(consoleSpy).toHaveBeenCalledWith('Error processing batch:', error);
      expect(processCallback).toHaveBeenCalledTimes(2); // Retry after error

      consoleSpy.mockRestore();
    });
  });

  describe('Daily Readings Cache', () => {
    it('caches and retrieves daily readings', () => {
      cacheDailyReadings(mockDailyReadings);
      const retrieved = getCachedDailyReadings(mockDailyReadings.date);
      expect(retrieved).toEqual(mockDailyReadings);
    });

    it('returns null for non-existent daily readings', () => {
      const retrieved = getCachedDailyReadings('2024-01-02');
      expect(retrieved).toBeNull();
    });

    it('generates correct daily readings key', () => {
      const key = getDailyReadingsKey('2024-01-01');
      expect(key).toBe('daily-readings-2024-01-01');
    });
  });

  describe('Performance Monitoring', () => {
    it('returns cache stats', () => {
      readingCache.set(mockReading.id, mockReading);
      const stats = getCacheStats();
      
      expect(stats).toHaveProperty('cacheSize', 1);
      expect(stats).toHaveProperty('memoryUsage');
    });

    it('handles missing performance.memory', () => {
      // Simulate browser without memory API
      const originalMemory = performance.memory;
      // @ts-ignore - Testing undefined case
      delete performance.memory;

      const stats = getCacheStats();
      expect(stats.memoryUsage).toBeNull();

      // Restore memory API
      // @ts-ignore - Restoring original value
      performance.memory = originalMemory;
    });
  });

  describe('Edge Cases', () => {
    it('handles invalid JSON in localStorage', () => {
      localStorage.setItem(getDailyReadingsKey('2024-01-01'), 'invalid json');
      expect(() => getCachedDailyReadings('2024-01-01')).not.toThrow();
      expect(getCachedDailyReadings('2024-01-01')).toBeNull();
    });

    it('handles concurrent batch processing', async () => {
      const processCallback = jest.fn().mockResolvedValue(undefined);
      const batchProcessor = createBatchProcessor(processCallback, {
        batchSize: 2,
        processingDelay: 100,
      });

      // Add items while processing is ongoing
      batchProcessor.add(mockReading);
      jest.advanceTimersByTime(50); // Half-way through delay
      batchProcessor.add({ ...mockReading, id: 'reading-2' });

      jest.runAllTimers();
      await Promise.resolve();

      expect(processCallback).toHaveBeenCalledTimes(1);
      expect(processCallback.mock.calls[0][0]).toHaveLength(2);
    });
  });
});
