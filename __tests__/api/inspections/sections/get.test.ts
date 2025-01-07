import { createMockPrisma, createMockHandlers, mockSection, validUuid, mockDate, createMockRequestResponse } from './mocks';
import type { InspectionSection } from './types';

// Mock the api-handler middleware
jest.mock('../../../../lib/middleware/api-handler', () => ({
  createApiHandler: (handler: any) => handler
}));

describe('GET /api/inspections/[id]/sections', () => {
  const mockPrisma = createMockPrisma();
  const { mockGetSections } = createMockHandlers(mockPrisma);

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date.now() to return a consistent date
    jest.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());
  });

  it('should return sections for a valid inspection ID', async () => {
    const mockSections: InspectionSection[] = [mockSection];

    (mockPrisma.inspectionSection.findMany as jest.Mock).mockResolvedValueOnce(mockSections);

    const { req, res } = createMockRequestResponse({
      method: 'GET',
      query: { id: validUuid }
    });

    await mockGetSections(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: mockSections.map(section => ({
        ...section,
        createdAt: section.createdAt.toISOString(),
        updatedAt: section.updatedAt.toISOString()
      }))
    });

    // Verify Prisma query
    expect(mockPrisma.inspectionSection.findMany).toHaveBeenCalledWith({
      where: { inspectionId: validUuid },
      orderBy: { order: 'asc' }
    });
  });

  it('should handle invalid inspection ID format', async () => {
    const { req, res } = createMockRequestResponse({
      method: 'GET',
      query: { id: 'invalid-uuid' }
    });

    await mockGetSections(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: expect.any(Object)
    });

    // Verify Prisma was not called
    expect(mockPrisma.inspectionSection.findMany).not.toHaveBeenCalled();
  });

  it('should handle database errors', async () => {
    (mockPrisma.inspectionSection.findMany as jest.Mock).mockRejectedValueOnce(
      new Error('Database error')
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

  it('should handle missing ID parameter', async () => {
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
});
