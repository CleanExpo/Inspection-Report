import { createMockPrisma, createMockHandlers, validUuid, mockDate, createMockRequestResponse } from './mocks';
import type { InspectionSection } from './types';
import { v4 as uuidv4 } from 'uuid';

// Mock the api-handler middleware
jest.mock('../../../../lib/middleware/api-handler', () => ({
  createApiHandler: (handler: any) => handler
}));

describe('Inspection Sections API Stress Tests', () => {
  const mockPrisma = createMockPrisma();
  const { mockGetSections, mockCreateSection, mockReorderSections } = createMockHandlers(mockPrisma);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());
  });

  describe('High Concurrency Stress Tests', () => {
    it('should handle massive concurrent read operations', async () => {
      const NUM_CONCURRENT_REQUESTS = 1000;
      const mockSections: InspectionSection[] = Array.from({ length: 50 }, (_, index) => ({
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

      // Setup mock for all requests
      (mockPrisma.inspectionSection.findMany as jest.Mock).mockResolvedValue(mockSections);

      // Create concurrent requests
      const requests = Array.from({ length: NUM_CONCURRENT_REQUESTS }, () =>
        createMockRequestResponse({
          method: 'GET',
          query: { id: validUuid }
        })
      );

      const startTime = process.hrtime();
      
      // Execute all requests concurrently
      const results = await Promise.all(
        requests.map(request => mockGetSections(request.req, request.res))
      );

      const [seconds, nanoseconds] = process.hrtime(startTime);
      const totalTime = seconds * 1000 + nanoseconds / 1000000;

      // Verify all requests succeeded
      requests.forEach(({ res }) => {
        expect(res._getStatusCode()).toBe(200);
        const response = JSON.parse(res._getData());
        expect(response.success).toBe(true);
        expect(response.data).toHaveLength(50);
      });

      // Performance assertions
      expect(totalTime).toBeLessThan(10000); // Should handle 1000 concurrent requests within 10 seconds
      expect(mockPrisma.inspectionSection.findMany).toHaveBeenCalledTimes(NUM_CONCURRENT_REQUESTS);
    });

    it('should handle rapid-fire write operations', async () => {
      const NUM_OPERATIONS = 500;
      const operations = Array.from({ length: NUM_OPERATIONS }, (_, index) => ({
        title: `Stress Test Section ${index}`,
        order: index,
        content: { key: `value${index}` },
        isCompleted: false
      }));

      // Setup mock responses
      operations.forEach(op => {
        const mockSection: InspectionSection = {
          id: uuidv4(),
          inspectionId: validUuid,
          ...op,
          completedBy: null,
          completedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate
        };
        (mockPrisma.inspectionSection.create as jest.Mock).mockResolvedValueOnce(mockSection);
      });

      const startTime = process.hrtime();

      // Execute rapid-fire create operations
      const results = await Promise.all(
        operations.map(op => {
          const { req, res } = createMockRequestResponse({
            method: 'POST',
            query: { id: validUuid },
            body: op
          });
          return mockCreateSection(req, res);
        })
      );

      const [seconds, nanoseconds] = process.hrtime(startTime);
      const totalTime = seconds * 1000 + nanoseconds / 1000000;

      expect(totalTime).toBeLessThan(5000); // Should handle 500 writes within 5 seconds
      expect(mockPrisma.inspectionSection.create).toHaveBeenCalledTimes(NUM_OPERATIONS);
    });
  });

  describe('Resource Exhaustion Tests', () => {
    it('should handle large payload reordering', async () => {
      const NUM_SECTIONS = 1000;
      const reorderSections = Array.from({ length: NUM_SECTIONS }, (_, index) => ({
        id: uuidv4(),
        order: NUM_SECTIONS - index - 1 // Reverse order
      }));

      const mockUpdatedSections: InspectionSection[] = reorderSections.map((s, index) => ({
        id: s.id,
        inspectionId: validUuid,
        title: `Section ${index}`,
        order: s.order,
        content: { key: `value${index}` },
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
      const totalTime = seconds * 1000 + nanoseconds / 1000000;

      expect(res._getStatusCode()).toBe(200);
      expect(totalTime).toBeLessThan(8000); // Should handle 1000 reorders within 8 seconds
    });

    it('should handle memory-intensive operations', async () => {
      const NUM_SECTIONS = 500;
      const LARGE_CONTENT_SIZE = 100 * 1024; // 100KB per section

      // Create sections with large content
      const mockSections: InspectionSection[] = Array.from({ length: NUM_SECTIONS }, (_, index) => ({
        id: uuidv4(),
        inspectionId: validUuid,
        title: `Large Section ${index}`,
        order: index,
        content: {
          key: `value${index}`,
          largeData: 'X'.repeat(LARGE_CONTENT_SIZE) // Generate large string
        },
        isCompleted: false,
        completedBy: null,
        completedAt: null,
        createdAt: mockDate,
        updatedAt: mockDate
      }));

      (mockPrisma.inspectionSection.findMany as jest.Mock).mockResolvedValueOnce(mockSections);

      const { req, res } = createMockRequestResponse({
        method: 'GET',
        query: { id: validUuid }
      });

      const startTime = process.hrtime();
      await mockGetSections(req, res);
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const totalTime = seconds * 1000 + nanoseconds / 1000000;

      expect(res._getStatusCode()).toBe(200);
      expect(totalTime).toBeLessThan(5000); // Should handle large payload within 5 seconds

      const response = JSON.parse(res._getData());
      expect(response.data).toHaveLength(NUM_SECTIONS);
      expect(response.data[0].content.largeData.length).toBe(LARGE_CONTENT_SIZE);
    });
  });

  describe('Recovery Scenarios', () => {
    it('should handle retry after transaction failure', async () => {
      const reorderSections = Array.from({ length: 10 }, (_, index) => ({
        id: uuidv4(),
        order: index
      }));

      // Simulate first attempt failing
      (mockPrisma.$transaction as jest.Mock)
        .mockRejectedValueOnce(new Error('Transaction failed'))
        // Second attempt succeeds
        .mockImplementationOnce(async (callback) => {
          const mockTx = mockPrisma;
          (mockTx.inspectionSection.update as jest.Mock).mockResolvedValue(null);
          return callback(mockTx);
        });

      const { req, res } = createMockRequestResponse({
        method: 'PUT',
        query: { id: validUuid },
        body: { sections: reorderSections }
      });

      // First attempt
      await mockReorderSections(req, res);
      expect(res._getStatusCode()).toBe(500);

      // Retry
      const retryRes = createMockRequestResponse({
        method: 'PUT',
        query: { id: validUuid },
        body: { sections: reorderSections }
      });

      await mockReorderSections(retryRes.req, retryRes.res);
      expect(retryRes.res._getStatusCode()).toBe(200);
    });
  });
});
