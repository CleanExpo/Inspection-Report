import { imageService } from '../../services/imageService';
import { THRESHOLDS, measurePerformance, runLoadTest } from './setup';
import { readFileSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

describe('Image Service Performance Tests', () => {
  const testImagePath = join(__dirname, '../fixtures/test-image.jpg');
  const imageBuffer = readFileSync(testImagePath);

  describe('Image Processing Performance', () => {
    it('should process images within threshold', async () => {
      const { duration, passedThreshold } = await measurePerformance(
        'image_processing',
        () => imageService.processForReport(imageBuffer, 'jpeg' as keyof sharp.FormatEnum),
        THRESHOLDS.IMAGE.PROCESS
      );

      expect(passedThreshold).toBe(true);
      expect(duration).toBeLessThanOrEqual(THRESHOLDS.IMAGE.PROCESS);
    });

    it('should create thumbnails within threshold', async () => {
      const { duration, passedThreshold } = await measurePerformance(
        'thumbnail_creation',
        () => imageService.createThumbnail(imageBuffer),
        THRESHOLDS.IMAGE.OPTIMIZE
      );

      expect(passedThreshold).toBe(true);
      expect(duration).toBeLessThanOrEqual(THRESHOLDS.IMAGE.OPTIMIZE);
    });
  });

  describe('Image Cache Performance', () => {
    it('should have fast cache hits', async () => {
      // First, process and cache an image
      const processed = await imageService.processForReport(imageBuffer, 'jpeg' as keyof sharp.FormatEnum);
      await imageService.cacheImage('test-image-1', processed);

      // Then measure cache retrieval
      const { duration, passedThreshold } = await measurePerformance(
        'cache_hit',
        () => imageService.getCachedImage('test-image-1', processed.width, 'jpeg' as keyof sharp.FormatEnum),
        THRESHOLDS.CACHE.HIT
      );

      expect(passedThreshold).toBe(true);
      expect(duration).toBeLessThanOrEqual(THRESHOLDS.CACHE.HIT);
    });

    it('should handle cache misses efficiently', async () => {
      const { duration, passedThreshold } = await measurePerformance(
        'cache_miss',
        () => imageService.getCachedImage('non-existent', 800, 'jpeg' as keyof sharp.FormatEnum),
        THRESHOLDS.CACHE.MISS
      );

      expect(passedThreshold).toBe(true);
      expect(duration).toBeLessThanOrEqual(THRESHOLDS.CACHE.MISS);
    });
  });

  describe('Load Testing', () => {
    it('should handle concurrent image processing', async () => {
      const results = await runLoadTest(
        () => imageService.processForReport(imageBuffer, 'jpeg' as keyof sharp.FormatEnum),
        5, // concurrency
        20 // total iterations
      );

      expect(results.successRate).toBeGreaterThanOrEqual(99);
      expect(results.averageResponseTime).toBeLessThanOrEqual(THRESHOLDS.IMAGE.PROCESS * 1.5);
    });

    it('should handle concurrent cache operations', async () => {
      const processed = await imageService.processForReport(imageBuffer, 'jpeg' as keyof sharp.FormatEnum);
      
      const results = await runLoadTest(
        () => imageService.getCachedImage('test-image-1', processed.width, 'jpeg' as keyof sharp.FormatEnum),
        10, // concurrency
        50 // total iterations
      );

      expect(results.successRate).toBeGreaterThanOrEqual(99);
      expect(results.averageResponseTime).toBeLessThanOrEqual(THRESHOLDS.CACHE.HIT * 1.5);
    });
  });

  describe('Memory Usage', () => {
    it('should maintain stable memory usage during batch processing', async () => {
      const initialMemory = process.memoryUsage();
      
      // Process multiple images
      await Promise.all(
        Array(10).fill(null).map(() => imageService.processForReport(imageBuffer, 'jpeg' as keyof sharp.FormatEnum))
      );

      const finalMemory = process.memoryUsage();
      const heapGrowth = (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024;

      // Heap shouldn't grow more than 100MB
      expect(heapGrowth).toBeLessThanOrEqual(100);
    });
  });
});
