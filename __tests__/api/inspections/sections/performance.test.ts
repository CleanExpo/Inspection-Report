import { createMockPrisma, createMockHandlers, validUuid, mockDate, createMockRequestResponse } from './mocks';
import type { InspectionSection } from './types';
import { v4 as uuidv4 } from 'uuid';

// Mock the api-handler middleware
jest.mock('../../../../lib/middleware/api-handler', () => ({
  createApiHandler: (handler: any) => handler
}));

describe('Inspection Sections API Performance', () => {
  const mockPrisma = createMockPrisma();
  const { mockGetSections, mockCreateSection, mockReorderSections } = createMockHandlers(mockPrisma);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());
  });

  describe('Large Dataset Handling', () => {
    it('should handle retrieving large number of sections', async () => {
      // Create 100 mock sections
      const mockSections: InspectionSection[] = Array.from({ length: 100 }, (_, index) => ({
        id: uuidv4(),
        inspectionId: validUuid,
        title: `Section ${index + 1}`,
        order: index,
        content: { key: `value${index}` },
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
      const totalTime = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds

      expect(res._getStatusCode()).toBe(200);
      expect(totalTime).toBeLessThan(1000); // Should complete within 1 second
      
      const response = JSON.parse(res._getData());
      expect(response.data).toHaveLength(100);
    });

    it('should handle reordering large number of sections', async () => {
      // Create 50 sections to reorder
      const reorderSections = Array.from({ length: 50 }, (_, index) => ({
        id: uuidv4(),
        order: 49 - index // Reverse the order
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
      const totalTime = seconds * 1000 + nanoseconds / 1000000;

      expect(res._getStatusCode()).toBe(200);
      expect(totalTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple concurrent section creations', async () => {
      const createRequests = Array.from({ length: 10 }, (_, index) => {
        const sectionData = {
          title: `Concurrent Section ${index}`,
          order: index,
          content: { key: `value${index}` },
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

        return {
          request: createMockRequestResponse({
            method: 'POST',
            query: { id: validUuid },
            body: sectionData
          }),
          expectedSection: mockSection
        };
      });

      const startTime = process.hrtime();
      const results = await Promise.all(
        createRequests.map(({ request }) => mockCreateSection(request.req, request.res))
      );
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const totalTime = seconds * 1000 + nanoseconds / 1000000;

      // Verify all requests succeeded
      createRequests.forEach(({ request }, index) => {
        expect(request.res._getStatusCode()).toBe(201);
        const response = JSON.parse(request.res._getData());
        expect(response.success).toBe(true);
      });

      expect(totalTime).toBeLessThan(3000); // All requests should complete within 3 seconds
    });

    it('should handle concurrent read and write operations', async () => {
      // Setup mock data
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

      // Mix of read and write operations
      const operations = [
        // GET operations
        ...Array.from({ length: 5 }, () => {
          (mockPrisma.inspectionSection.findMany as jest.Mock).mockResolvedValueOnce(mockSections);
          return {
            type: 'GET',
            request: createMockRequestResponse({
              method: 'GET',
              query: { id: validUuid }
            })
          };
        }),

        // POST operations
        ...Array.from({ length: 5 }, (_, index) => {
          const mockSection = { ...mockSections[0], id: uuidv4(), title: `New Section ${index}` };
          (mockPrisma.inspectionSection.create as jest.Mock).mockResolvedValueOnce(mockSection);
          return {
            type: 'POST',
            request: createMockRequestResponse({
              method: 'POST',
              query: { id: validUuid },
              body: {
                title: `New Section ${index}`,
                order: index,
                content: { key: 'value' },
                isCompleted: false
              }
            })
          };
        })
      ];

      const startTime = process.hrtime();
      await Promise.all(
        operations.map(({ type, request }) => {
          switch (type) {
            case 'GET':
              return mockGetSections(request.req, request.res);
            case 'POST':
              return mockCreateSection(request.req, request.res);
            default:
              return Promise.resolve();
          }
        })
      );
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const totalTime = seconds * 1000 + nanoseconds / 1000000;

      // Verify all operations succeeded
      operations.forEach(({ request }) => {
        expect([200, 201]).toContain(request.res._getStatusCode());
        const response = JSON.parse(request.res._getData());
        expect(response.success).toBe(true);
      });

      expect(totalTime).toBeLessThan(5000); // All operations should complete within 5 seconds
    });
  });
});
