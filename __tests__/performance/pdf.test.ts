import { pdfService } from '../../services/pdfService';
import { THRESHOLDS, measurePerformance, runLoadTest } from './setup';
import { readFileSync } from 'fs';
import { join } from 'path';
import { RoomLayout, DrawingElement } from '../../services/roomLayoutService';
import { MoistureReadingData } from '../../components/MoistureMappingSystem/MoistureReading';
import { v4 as uuidv4 } from 'uuid';

describe('PDF Service Performance Tests', () => {
  // Test data
  const mockLayout: RoomLayout = {
    id: uuidv4(),
    jobNumber: 'test-job',
    elements: [
      {
        id: uuidv4(),
        type: 'wall',
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 800, y: 0 }
      }
    ],
    scale: 1,
    width: 800,
    height: 600,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockReadings: MoistureReadingData[] = [
    {
      id: 'reading-1',
      position: { x: 100, y: 100 },
      values: [
        { value: 15.5, timestamp: new Date().toISOString() }
      ]
    }
  ];

  describe('PDF Generation Performance', () => {
    it('should generate PDFs within threshold', async () => {
      const { duration, passedThreshold } = await measurePerformance(
        'pdf_generation',
        () => pdfService.generatePDF('test-job-1', mockLayout, mockReadings, {
          includeReadings: true,
          includeLayout: true,
          cacheResult: false
        }),
        THRESHOLDS.PDF.GENERATE
      );

      expect(passedThreshold).toBe(true);
      expect(duration).toBeLessThanOrEqual(THRESHOLDS.PDF.GENERATE);
    });

    it('should render complex layouts within threshold', async () => {
      const complexLayout: RoomLayout = {
        id: uuidv4(),
        jobNumber: 'test-job-complex',
        elements: Array(100).fill(null).map(() => ({
          id: uuidv4(),
          type: 'wall' as const,
          startPoint: { x: Math.random() * 1200, y: 0 },
          endPoint: { x: Math.random() * 1200, y: 800 }
        })),
        scale: 1,
        width: 1200,
        height: 800,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { duration, passedThreshold } = await measurePerformance(
        'complex_pdf_rendering',
        () => pdfService.generatePDF('test-job-2', complexLayout, mockReadings, {
          includeReadings: true,
          includeLayout: true,
          cacheResult: false
        }),
        THRESHOLDS.PDF.RENDER
      );

      expect(passedThreshold).toBe(true);
      expect(duration).toBeLessThanOrEqual(THRESHOLDS.PDF.RENDER);
    });
  });

  describe('PDF Cache Performance', () => {
    it('should have fast cache hits', async () => {
      // First, generate and cache a PDF
      await pdfService.generatePDF('test-job-3', mockLayout, mockReadings, {
        includeReadings: true,
        includeLayout: true,
        cacheResult: true
      });

      // Then measure cache retrieval by generating again with cache enabled
      const { duration, passedThreshold } = await measurePerformance(
        'pdf_cache_hit',
        () => pdfService.generatePDF('test-job-3', mockLayout, mockReadings, {
          includeReadings: true,
          includeLayout: true,
          cacheResult: true
        }),
        THRESHOLDS.CACHE.HIT
      );

      expect(passedThreshold).toBe(true);
      expect(duration).toBeLessThanOrEqual(THRESHOLDS.CACHE.HIT);
    });

    it('should handle cache misses efficiently', async () => {
      const { duration, passedThreshold } = await measurePerformance(
        'pdf_cache_miss',
        () => pdfService.generatePDF('non-existent', mockLayout, mockReadings, {
          includeReadings: true,
          includeLayout: true,
          cacheResult: true
        }),
        THRESHOLDS.CACHE.MISS
      );

      expect(passedThreshold).toBe(true);
      expect(duration).toBeLessThanOrEqual(THRESHOLDS.CACHE.MISS);
    });
  });

  describe('Load Testing', () => {
    it('should handle concurrent PDF generation', async () => {
      const results = await runLoadTest(
        () => pdfService.generatePDF('test-job-4', mockLayout, mockReadings, {
          includeReadings: true,
          includeLayout: true,
          cacheResult: false
        }),
        3, // concurrency
        10 // total iterations
      );

      expect(results.successRate).toBeGreaterThanOrEqual(99);
      expect(results.averageResponseTime).toBeLessThanOrEqual(THRESHOLDS.PDF.GENERATE * 1.5);
    });

    it('should handle concurrent cache operations', async () => {
      // First, generate and cache a PDF
      await pdfService.generatePDF('test-job-5', mockLayout, mockReadings, {
        includeReadings: true,
        includeLayout: true,
        cacheResult: true
      });

      const results = await runLoadTest(
        () => pdfService.generatePDF('test-job-5', mockLayout, mockReadings, {
          includeReadings: true,
          includeLayout: true,
          cacheResult: true
        }),
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
      
      // Generate multiple PDFs
      await Promise.all(
        Array(5).fill(null).map((_, i) => 
          pdfService.generatePDF(`test-job-${i + 6}`, mockLayout, mockReadings, {
            includeReadings: true,
            includeLayout: true,
            cacheResult: false
          })
        )
      );

      const finalMemory = process.memoryUsage();
      const heapGrowth = (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024;

      // Heap shouldn't grow more than 200MB
      expect(heapGrowth).toBeLessThanOrEqual(200);
    });
  });
});
