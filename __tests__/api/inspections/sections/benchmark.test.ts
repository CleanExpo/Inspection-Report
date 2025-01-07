import { createMockPrisma, createMockHandlers, validUuid, mockDate, createMockRequestResponse } from './mocks';
import type { InspectionSection } from './types';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// Mock the api-handler middleware
jest.mock('../../../../lib/middleware/api-handler', () => ({
  createApiHandler: (handler: any) => handler
}));

interface BenchmarkResult {
  operation: string;
  samples: number;
  mean: number;
  median: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  stdDev: number;
  timestamp: string;
}

describe('Inspection Sections API Benchmarks', () => {
  const mockPrisma = createMockPrisma();
  const { mockGetSections, mockCreateSection, mockReorderSections } = createMockHandlers(mockPrisma);
  const BENCHMARK_FILE = path.join(__dirname, 'benchmark-results.json');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());
  });

  // Helper function to calculate statistics
  const calculateStats = (times: number[]): Omit<BenchmarkResult, 'operation' | 'timestamp'> => {
    const sorted = [...times].sort((a, b) => a - b);
    const mean = times.reduce((a, b) => a + b, 0) / times.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const variance = times.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / times.length;
    const stdDev = Math.sqrt(variance);

    return {
      samples: times.length,
      mean,
      median,
      p95,
      p99,
      min,
      max,
      stdDev
    };
  };

  // Helper function to save benchmark results
  const saveBenchmarkResults = (results: BenchmarkResult[]) => {
    const existingResults: BenchmarkResult[] = fs.existsSync(BENCHMARK_FILE)
      ? JSON.parse(fs.readFileSync(BENCHMARK_FILE, 'utf8'))
      : [];

    const updatedResults = [...existingResults, ...results];
    fs.writeFileSync(BENCHMARK_FILE, JSON.stringify(updatedResults, null, 2));
  };

  // Helper function to compare with baseline
  const compareWithBaseline = (current: BenchmarkResult, operation: string) => {
    if (!fs.existsSync(BENCHMARK_FILE)) return;

    const results: BenchmarkResult[] = JSON.parse(fs.readFileSync(BENCHMARK_FILE, 'utf8'));
    const baseline = results
      .filter(r => r.operation === operation)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    if (!baseline) return;

    // Allow for some variation (20%)
    const threshold = 1.2;
    expect(current.mean).toBeLessThan(baseline.mean * threshold);
    expect(current.p95).toBeLessThan(baseline.p95 * threshold);
    expect(current.p99).toBeLessThan(baseline.p99 * threshold);
  };

  describe('Read Operation Benchmarks', () => {
    it('should benchmark GET operations', async () => {
      const NUM_SAMPLES = 100;
      const mockSections: InspectionSection[] = Array.from({ length: 20 }, (_, index) => ({
        id: uuidv4(),
        inspectionId: validUuid,
        title: `Section ${index}`,
        order: index,
        content: { key: `value${index}` },
        isCompleted: false,
        completedBy: null,
        completedAt: null,
        createdAt: mockDate,
        updatedAt: mockDate
      }));

      const responseTimes: number[] = [];

      // Collect samples
      for (let i = 0; i < NUM_SAMPLES; i++) {
        (mockPrisma.inspectionSection.findMany as jest.Mock).mockResolvedValue(mockSections);

        const { req, res } = createMockRequestResponse({
          method: 'GET',
          query: { id: validUuid }
        });

        const startTime = process.hrtime();
        await mockGetSections(req, res);
        const [seconds, nanoseconds] = process.hrtime(startTime);
        responseTimes.push(seconds * 1000 + nanoseconds / 1000000);

        expect(res._getStatusCode()).toBe(200);
      }

      const stats = calculateStats(responseTimes);
      const result: BenchmarkResult = {
        operation: 'GET_sections',
        ...stats,
        timestamp: new Date().toISOString()
      };

      // Save results
      saveBenchmarkResults([result]);

      // Compare with baseline
      compareWithBaseline(result, 'GET_sections');
    });
  });

  describe('Write Operation Benchmarks', () => {
    it('should benchmark POST operations', async () => {
      const NUM_SAMPLES = 50;
      const responseTimes: number[] = [];

      for (let i = 0; i < NUM_SAMPLES; i++) {
        const sectionData = {
          title: `Benchmark Section ${i}`,
          order: i,
          content: { key: `value${i}` },
          isCompleted: false
        };

        const mockSection: InspectionSection = {
          id: uuidv4(),
          inspectionId: validUuid,
          ...sectionData,
          completedBy: null,
          completedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate
        };

        (mockPrisma.inspectionSection.create as jest.Mock).mockResolvedValueOnce(mockSection);

        const { req, res } = createMockRequestResponse({
          method: 'POST',
          query: { id: validUuid },
          body: sectionData
        });

        const startTime = process.hrtime();
        await mockCreateSection(req, res);
        const [seconds, nanoseconds] = process.hrtime(startTime);
        responseTimes.push(seconds * 1000 + nanoseconds / 1000000);

        expect(res._getStatusCode()).toBe(201);
      }

      const stats = calculateStats(responseTimes);
      const result: BenchmarkResult = {
        operation: 'POST_section',
        ...stats,
        timestamp: new Date().toISOString()
      };

      saveBenchmarkResults([result]);
      compareWithBaseline(result, 'POST_section');
    });
  });

  describe('Transaction Operation Benchmarks', () => {
    it('should benchmark reorder operations', async () => {
      const NUM_SAMPLES = 30;
      const NUM_SECTIONS = 50;
      const responseTimes: number[] = [];

      for (let i = 0; i < NUM_SAMPLES; i++) {
        const reorderSections = Array.from({ length: NUM_SECTIONS }, (_, index) => ({
          id: uuidv4(),
          order: NUM_SECTIONS - index - 1
        }));

        const mockUpdatedSections: InspectionSection[] = reorderSections.map((s, index) => ({
          id: s.id,
          inspectionId: validUuid,
          title: `Section ${index}`,
          order: s.order,
          content: {},
          isCompleted: false,
          completedBy: null,
          completedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate
        }));

        const mockTx = mockPrisma;
        (mockTx.inspectionSection.update as jest.Mock).mockResolvedValue(null);
        (mockTx.inspectionSection.findMany as jest.Mock).mockResolvedValue(mockUpdatedSections);
        (mockPrisma.$transaction as jest.Mock).mockImplementation(async (callback) => callback(mockTx));

        const { req, res } = createMockRequestResponse({
          method: 'PUT',
          query: { id: validUuid },
          body: { sections: reorderSections }
        });

        const startTime = process.hrtime();
        await mockReorderSections(req, res);
        const [seconds, nanoseconds] = process.hrtime(startTime);
        responseTimes.push(seconds * 1000 + nanoseconds / 1000000);

        expect(res._getStatusCode()).toBe(200);
      }

      const stats = calculateStats(responseTimes);
      const result: BenchmarkResult = {
        operation: 'PUT_reorder',
        ...stats,
        timestamp: new Date().toISOString()
      };

      saveBenchmarkResults([result]);
      compareWithBaseline(result, 'PUT_reorder');
    });
  });
});
