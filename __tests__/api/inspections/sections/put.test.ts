import { createMockPrisma, createMockHandlers, mockSection, validUuid, mockDate, createMockRequestResponse } from './mocks';
import type { InspectionSection } from './types';
import { v4 as uuidv4 } from 'uuid';

// Mock the api-handler middleware
jest.mock('../../../../lib/middleware/api-handler', () => ({
  createApiHandler: (handler: any) => handler
}));

describe('PUT /api/inspections/[id]/sections/reorder', () => {
  const mockPrisma = createMockPrisma();
  const { mockReorderSections } = createMockHandlers(mockPrisma);

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date.now() to return a consistent date
    jest.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());
  });

  const mockSections = [
    { id: validUuid, order: 1 },
    { id: uuidv4(), order: 0 }
  ];

  it('should reorder sections successfully', async () => {
    const mockUpdatedSections: InspectionSection[] = mockSections.map(s => ({
      id: s.id,
      inspectionId: validUuid,
      title: `Section ${s.id}`,
      order: s.order,
      content: {},
      isCompleted: false,
      completedBy: null,
      completedAt: null,
      createdAt: mockDate,
      updatedAt: mockDate
    }));

    // Mock transaction operations
    const mockTx = mockPrisma;
    (mockTx.inspectionSection.update as jest.Mock).mockResolvedValue(null);
    (mockTx.inspectionSection.findMany as jest.Mock).mockResolvedValue(mockUpdatedSections);
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (callback) => callback(mockTx));

    const { req, res } = createMockRequestResponse({
      method: 'PUT',
      query: { id: validUuid },
      body: { sections: mockSections }
    });

    await mockReorderSections(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: mockUpdatedSections.map(section => ({
        ...section,
        createdAt: section.createdAt.toISOString(),
        updatedAt: section.updatedAt.toISOString()
      }))
    });

    // Verify transaction operations
    expect(mockPrisma.$transaction).toHaveBeenCalled();
    mockSections.forEach(section => {
      expect(mockTx.inspectionSection.update).toHaveBeenCalledWith({
        where: { id: section.id },
        data: { order: section.order }
      });
    });
  });

  it('should validate section IDs', async () => {
    const { req, res } = createMockRequestResponse({
      method: 'PUT',
      query: { id: validUuid },
      body: {
        sections: [{ id: 'invalid-uuid', order: 0 }]
      }
    });

    await mockReorderSections(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: expect.any(Object)
    });

    // Verify transaction was not started
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('should handle transaction failures', async () => {
    (mockPrisma.$transaction as jest.Mock).mockRejectedValueOnce(
      new Error('Transaction failed')
    );

    const { req, res } = createMockRequestResponse({
      method: 'PUT',
      query: { id: validUuid },
      body: { sections: mockSections }
    });

    await mockReorderSections(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: expect.any(Object)
    });
  });

  it('should handle invalid inspection ID', async () => {
    const { req, res } = createMockRequestResponse({
      method: 'PUT',
      query: { id: 'invalid-uuid' },
      body: { sections: mockSections }
    });

    await mockReorderSections(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: expect.any(Object)
    });
  });

  it('should handle empty sections array', async () => {
    const { req, res } = createMockRequestResponse({
      method: 'PUT',
      query: { id: validUuid },
      body: { sections: [] }
    });

    await mockReorderSections(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: expect.any(Object)
    });
  });

  it('should maintain order after reordering', async () => {
    const orderedSections = [
      { id: uuidv4(), order: 0 },
      { id: uuidv4(), order: 1 },
      { id: uuidv4(), order: 2 }
    ];

    const mockUpdatedSections: InspectionSection[] = orderedSections.map(s => ({
      id: s.id,
      inspectionId: validUuid,
      title: `Section ${s.id}`,
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
      body: { sections: orderedSections }
    });

    await mockReorderSections(req, res);

    expect(res._getStatusCode()).toBe(200);
    const response = JSON.parse(res._getData());
    
    // Verify sections are returned in correct order
    response.data.forEach((section: any, index: number) => {
      expect(section.order).toBe(index);
      expect(section.id).toBe(orderedSections[index].id);
    });
  });
});
