import { createMocks } from 'node-mocks-http';
import handler from '../../../../../api/inspections/[id]/sections/index';

describe('Inspection Sections API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/inspections/[id]/sections', () => {
    it('should return sections for a valid inspection ID', async () => {
      const mockSections = [
        {
          id: '1',
          inspectionId: 'test-inspection',
          title: 'Section 1',
          order: 0,
          content: { key: 'value' },
          isCompleted: false,
          completedBy: null,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      global.mockPrisma.$queryRawUnsafe.mockResolvedValueOnce(mockSections);

      const { req, res } = createMocks({
        method: 'GET',
        query: { id: 'test-inspection' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
        data: mockSections
      });
      expect(global.mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM "inspection_sections"'),
        'test-inspection'
      );
    });

    it('should handle invalid inspection ID format', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: 'invalid-uuid' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: expect.any(Object)
      });
    });
  });

  describe('POST /api/inspections/[id]/sections', () => {
    const mockSection = {
      title: 'New Section',
      order: 0,
      content: { key: 'value' },
      isCompleted: false
    };

    it('should create a new section', async () => {
      const mockCreatedSection = {
        id: '1',
        inspectionId: 'test-inspection',
        ...mockSection,
        completedBy: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      global.mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([mockCreatedSection]);

      const { req, res } = createMocks({
        method: 'POST',
        query: { id: 'test-inspection' },
        body: mockSection
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
        data: mockCreatedSection
      });
      expect(global.mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO "inspection_sections"'),
        expect.any(String),
        mockSection.title,
        mockSection.order,
        expect.any(String),
        mockSection.isCompleted,
        null,
        null
      );
    });

    it('should validate required fields', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: { id: 'test-inspection' },
        body: { order: 0 } // Missing required title
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: expect.any(Object)
      });
    });
  });

  describe('PUT /api/inspections/[id]/sections/reorder', () => {
    const mockSections = [
      { id: '1', order: 1 },
      { id: '2', order: 0 }
    ];

    it('should reorder sections', async () => {
      const mockUpdatedSections = mockSections.map(s => ({
        id: s.id,
        inspectionId: 'test-inspection',
        title: `Section ${s.id}`,
        order: s.order,
        content: {},
        isCompleted: false,
        completedBy: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      global.mockPrisma.$transaction.mockImplementationOnce(async (callback) => {
        return mockUpdatedSections;
      });

      const { req, res } = createMocks({
        method: 'PUT',
        query: { id: 'test-inspection' },
        body: { sections: mockSections }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
        data: mockUpdatedSections
      });
    });

    it('should validate section IDs', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        query: { id: 'test-inspection' },
        body: {
          sections: [{ id: 'invalid-uuid', order: 0 }]
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: expect.any(Object)
      });
    });
  });

  describe('Error handling', () => {
    it('should handle database errors', async () => {
      global.mockPrisma.$queryRawUnsafe.mockRejectedValueOnce(new Error('Database error'));

      const { req, res } = createMocks({
        method: 'GET',
        query: { id: 'test-inspection' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: expect.any(Object)
      });
    });

    it('should handle invalid HTTP methods', async () => {
      const { req, res } = createMocks({
        method: 'PATCH',
        query: { id: 'test-inspection' }
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
  });
});
