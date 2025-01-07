import { createMockPrisma, createMockHandlers, validUuid, mockDate, createMockRequestResponse } from './mocks';

// Mock the api-handler middleware
jest.mock('../../../../lib/middleware/api-handler', () => ({
  createApiHandler: (handler: any) => handler
}));

describe('Inspection Sections API Error Handling', () => {
  const mockPrisma = createMockPrisma();
  const { mockGetSections, mockCreateSection, mockReorderSections } = createMockHandlers(mockPrisma);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());
  });

  describe('Common Error Handling', () => {
    it('should handle missing query parameters', async () => {
      const { req, res } = createMockRequestResponse({
        method: 'GET',
        query: {}
      });

      await mockGetSections(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: expect.any(Object)
      });
    });

    it('should handle malformed JSON in request body', async () => {
      const { req, res } = createMockRequestResponse({
        method: 'POST',
        query: { id: validUuid },
        body: {} as any // Simulating malformed data after JSON parsing
      });

      await mockCreateSection(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: expect.any(Object)
      });
    });
  });

  describe('Database Error Handling', () => {
    it('should handle connection errors', async () => {
      (mockPrisma.inspectionSection.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('Connection refused')
      );

      const { req, res } = createMockRequestResponse({
        method: 'GET',
        query: { id: validUuid }
      });

      await mockGetSections(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: expect.any(Object)
      });
    });

    it('should handle transaction rollback', async () => {
      (mockPrisma.$transaction as jest.Mock).mockRejectedValueOnce(
        new Error('Transaction rolled back')
      );

      const { req, res } = createMockRequestResponse({
        method: 'PUT',
        query: { id: validUuid },
        body: {
          sections: [
            { id: validUuid, order: 0 }
          ]
        }
      });

      await mockReorderSections(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: expect.any(Object)
      });
    });
  });

  describe('Validation Error Handling', () => {
    it('should handle invalid UUID format', async () => {
      const { req, res } = createMockRequestResponse({
        method: 'GET',
        query: { id: 'not-a-uuid' }
      });

      await mockGetSections(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: expect.any(Object)
      });
    });

    it('should handle invalid data types', async () => {
      const { req, res } = createMockRequestResponse({
        method: 'POST',
        query: { id: validUuid },
        body: {
          title: 123, // Should be string
          order: 'first', // Should be number
          content: null, // Should be object
          isCompleted: 'yes' // Should be boolean
        }
      });

      await mockCreateSection(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: expect.any(Object)
      });
    });

    it('should handle negative order values', async () => {
      const { req, res } = createMockRequestResponse({
        method: 'PUT',
        query: { id: validUuid },
        body: {
          sections: [
            { id: validUuid, order: -1 }
          ]
        }
      });

      await mockReorderSections(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: expect.any(Object)
      });
    });
  });

  describe('HTTP Method Handling', () => {
    const handler = require('../../../../api/inspections/[id]/sections/index').default;

    it('should handle unsupported HTTP methods', async () => {
      const { req, res } = createMockRequestResponse({
        method: 'PATCH',
        query: { id: validUuid }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: {
          message: 'Method PATCH not allowed'
        }
      });
    });

    it('should handle OPTIONS requests', async () => {
      const { req, res } = createMockRequestResponse({
        method: 'OPTIONS',
        query: { id: validUuid }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: {
          message: 'Method OPTIONS not allowed'
        }
      });
    });
  });
});
