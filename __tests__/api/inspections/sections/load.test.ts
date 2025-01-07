import { createMockPrisma, createMockHandlers, validUuid, mockDate, createMockRequestResponse } from './mocks';
import type { InspectionSection } from './types';
import { v4 as uuidv4 } from 'uuid';

// Mock the api-handler middleware
jest.mock('../../../../lib/middleware/api-handler', () => ({
  createApiHandler: (handler: any) => handler
}));

describe('Inspection Sections API Load Tests', () => {
  const mockPrisma = createMockPrisma();
  const { mockGetSections, mockCreateSection, mockReorderSections } = createMockHandlers(mockPrisma);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());
  });

  describe('Gradual Load Increase', () => {
    it('should maintain performance under increasing read load', async () => {
      const loadLevels = [10, 50, 100, 200, 500]; // Increasing number of concurrent requests
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

      const results: { level: number; avgResponseTime: number }[] = [];

      // Test each load level
      for (const numRequests of loadLevels) {
        (mockPrisma.inspectionSection.findMany as jest.Mock).mockResolvedValue(mockSections);

        const requests = Array.from({ length: numRequests }, () =>
          createMockRequestResponse({
            method: 'GET',
            query: { id: validUuid }
          })
        );

        const startTime = process.hrtime();
        await Promise.all(
          requests.map(request => mockGetSections(request.req, request.res))
        );
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const totalTime = seconds * 1000 + nanoseconds / 1000000;
        const avgResponseTime = totalTime / numRequests;

        results.push({ level: numRequests, avgResponseTime });

        // Verify responses
        requests.forEach(({ res }) => {
          expect(res._getStatusCode()).toBe(200);
          const response = JSON.parse(res._getData());
          expect(response.success).toBe(true);
        });

        // Performance assertions for each level
        expect(avgResponseTime).toBeLessThan(50); // Average response time should be under 50ms
      }

      // Verify response time degradation is reasonable
      const maxDegradation = Math.max(
        ...results.slice(1).map((result, index) => 
          result.avgResponseTime / results[index].avgResponseTime
        )
      );
      expect(maxDegradation).toBeLessThan(3); // Response time should not increase more than 3x between levels
    });

    it('should handle sustained write operations', async () => {
      const DURATION_MS = 5000; // 5 second test
      const INTERVAL_MS = 100; // New request every 100ms
      const mockSections: InspectionSection[] = [];
      let requestCount = 0;

      const startTime = Date.now();
      while (Date.now() - startTime < DURATION_MS) {
        const sectionData = {
          title: `Load Test Section ${requestCount}`,
          order: requestCount,
          content: { key: `value${requestCount}` },
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
        mockSections.push(mockSection);

        const { req, res } = createMockRequestResponse({
          method: 'POST',
          query: { id: validUuid },
          body: sectionData
        });

        await mockCreateSection(req, res);
        expect(res._getStatusCode()).toBe(201);

        requestCount++;
        await new Promise(resolve => setTimeout(resolve, INTERVAL_MS));
      }

      // Verify sustained operation
      expect(requestCount).toBeGreaterThan(DURATION_MS / INTERVAL_MS * 0.8); // At least 80% of theoretical maximum requests
      expect(mockPrisma.inspectionSection.create).toHaveBeenCalledTimes(requestCount);
    });
  });

  describe('Sustained Peak Load', () => {
    it('should maintain performance under sustained peak load', async () => {
      const PEAK_DURATION_MS = 3000; // 3 second peak load
      const CONCURRENT_REQUESTS = 100;
      const ITERATIONS = 3;

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

      // Run multiple iterations of peak load
      for (let iteration = 0; iteration < ITERATIONS; iteration++) {
        const startTime = process.hrtime();
        const endTime = Date.now() + PEAK_DURATION_MS;

        while (Date.now() < endTime) {
          (mockPrisma.inspectionSection.findMany as jest.Mock).mockResolvedValue(mockSections);

          const requests = Array.from({ length: CONCURRENT_REQUESTS }, () =>
            createMockRequestResponse({
              method: 'GET',
              query: { id: validUuid }
            })
          );

          const batchStartTime = process.hrtime();
          await Promise.all(
            requests.map(request => mockGetSections(request.req, request.res))
          );
          const [seconds, nanoseconds] = process.hrtime(batchStartTime);
          const batchTime = seconds * 1000 + nanoseconds / 1000000;

          responseTimes.push(batchTime / CONCURRENT_REQUESTS);

          // Verify responses
          requests.forEach(({ res }) => {
            expect(res._getStatusCode()).toBe(200);
            const response = JSON.parse(res._getData());
            expect(response.success).toBe(true);
          });
        }

        // Short cool-down period between iterations
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Calculate statistics
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const minResponseTime = Math.min(...responseTimes);
      const variance = responseTimes.reduce((a, b) => a + Math.pow(b - avgResponseTime, 2), 0) / responseTimes.length;
      const stdDev = Math.sqrt(variance);

      // Performance assertions
      expect(avgResponseTime).toBeLessThan(50); // Average response time under 50ms
      expect(maxResponseTime).toBeLessThan(100); // Max response time under 100ms
      expect(stdDev).toBeLessThan(avgResponseTime * 0.5); // Standard deviation should be less than 50% of mean
    });
  });

  describe('Load Pattern Tests', () => {
    it('should handle periodic load spikes', async () => {
      const BASE_LOAD = 10;
      const SPIKE_LOAD = 100;
      const NUM_SPIKES = 3;
      
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

      for (let spike = 0; spike < NUM_SPIKES; spike++) {
        // Base load period
        const baseRequests = Array.from({ length: BASE_LOAD }, () =>
          createMockRequestResponse({
            method: 'GET',
            query: { id: validUuid }
          })
        );

        (mockPrisma.inspectionSection.findMany as jest.Mock).mockResolvedValue(mockSections);
        await Promise.all(
          baseRequests.map(request => mockGetSections(request.req, request.res))
        );

        // Spike period
        const spikeRequests = Array.from({ length: SPIKE_LOAD }, () =>
          createMockRequestResponse({
            method: 'GET',
            query: { id: validUuid }
          })
        );

        const spikeStartTime = process.hrtime();
        await Promise.all(
          spikeRequests.map(request => mockGetSections(request.req, request.res))
        );
        const [seconds, nanoseconds] = process.hrtime(spikeStartTime);
        const spikeTime = seconds * 1000 + nanoseconds / 1000000;

        // Verify spike handling
        expect(spikeTime).toBeLessThan(2000); // Spike should be processed within 2 seconds
        spikeRequests.forEach(({ res }) => {
          expect(res._getStatusCode()).toBe(200);
          const response = JSON.parse(res._getData());
          expect(response.success).toBe(true);
        });

        // Cool-down period
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    });
  });
});
