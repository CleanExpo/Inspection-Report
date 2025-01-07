import { createMockPrisma, createMockHandlers, mockSection, validUuid, mockDate, createMockRequestResponse } from './mocks';
import type { InspectionSection } from './types';

// Mock the api-handler middleware
jest.mock('../../../../lib/middleware/api-handler', () => ({
  createApiHandler: (handler: any) => handler
}));

describe('POST /api/inspections/[id]/sections', () => {
  const mockPrisma = createMockPrisma();
  const { mockCreateSection } = createMockHandlers(mockPrisma);

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date.now() to return a consistent date
    jest.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());
  });

  const newSectionData = {
    title: 'New Section',
    order: 0,
    content: { key: 'value' },
    isCompleted: false
  };

  it('should create a new section', async () => {
    const mockCreatedSection: InspectionSection = {
      id: validUuid,
      inspectionId: validUuid,
      ...newSectionData,
      completedBy: null,
      completedAt: null,
      createdAt: mockDate,
      updatedAt: mockDate
    };

    (mockPrisma.inspectionSection.create as jest.Mock).mockResolvedValueOnce(mockCreatedSection);

    const { req, res } = createMockRequestResponse({
      method: 'POST',
      query: { id: validUuid },
      body: newSectionData
    });

    await mockCreateSection(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: {
        ...mockCreatedSection,
        createdAt: mockCreatedSection.createdAt.toISOString(),
        updatedAt: mockCreatedSection.updatedAt.toISOString()
      }
    });

    // Verify Prisma create call
    expect(mockPrisma.inspectionSection.create).toHaveBeenCalledWith({
      data: {
        inspectionId: validUuid,
        ...newSectionData
      }
    });
  });

  it('should validate required fields', async () => {
    const { req, res } = createMockRequestResponse({
      method: 'POST',
      query: { id: validUuid },
      body: { order: 0 } // Missing required fields
    });

    await mockCreateSection(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: expect.any(Object)
    });

    // Verify Prisma was not called
    expect(mockPrisma.inspectionSection.create).not.toHaveBeenCalled();
  });

  it('should handle invalid inspection ID', async () => {
    const { req, res } = createMockRequestResponse({
      method: 'POST',
      query: { id: 'invalid-uuid' },
      body: newSectionData
    });

    await mockCreateSection(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: expect.any(Object)
    });
  });

  it('should handle database errors', async () => {
    (mockPrisma.inspectionSection.create as jest.Mock).mockRejectedValueOnce(
      new Error('Database error')
    );

    const { req, res } = createMockRequestResponse({
      method: 'POST',
      query: { id: validUuid },
      body: newSectionData
    });

    await mockCreateSection(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: expect.any(Object)
    });
  });

  it('should handle optional fields correctly', async () => {
    const completedAt = new Date('2024-01-02T00:00:00Z');
    const sectionWithOptionals = {
      ...newSectionData,
      completedBy: validUuid,
      completedAt
    };

    const mockCreatedSection: InspectionSection = {
      id: validUuid,
      inspectionId: validUuid,
      title: sectionWithOptionals.title,
      order: sectionWithOptionals.order,
      content: sectionWithOptionals.content,
      isCompleted: sectionWithOptionals.isCompleted,
      completedBy: sectionWithOptionals.completedBy,
      completedAt: completedAt,
      createdAt: mockDate,
      updatedAt: mockDate
    };

    (mockPrisma.inspectionSection.create as jest.Mock).mockResolvedValueOnce(mockCreatedSection);

    const { req, res } = createMockRequestResponse({
      method: 'POST',
      query: { id: validUuid },
      body: sectionWithOptionals
    });

    await mockCreateSection(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: {
        ...mockCreatedSection,
        completedAt: (mockCreatedSection.completedAt as Date).toISOString(),
        createdAt: mockCreatedSection.createdAt.toISOString(),
        updatedAt: mockCreatedSection.updatedAt.toISOString()
      }
    });
  });
});
