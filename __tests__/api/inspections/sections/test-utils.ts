import { NextApiRequest, NextApiResponse } from 'next';
import { createMockRequestResponse, createMockPrisma, createTestSection } from './mocks';
import { InspectionSection } from './types';

/**
 * Represents the test context containing all necessary dependencies and state
 * for running tests against the Inspection Sections API.
 * 
 * @interface TestContext
 */
export interface TestContext {
  req: NextApiRequest;
  res: NextApiResponse;
  prisma: ReturnType<typeof createMockPrisma>;
  sections: InspectionSection[];
}

/**
 * Sets up a test context with mock implementations and initial test data.
 * 
 * @param options - Configuration options for the test context
 * @param options.method - HTTP method for the request (default: 'GET')
 * @param options.query - Query parameters for the request
 * @param options.body - Request body data
 * @param options.sections - Initial test sections data
 * @returns {Promise<TestContext>} Configured test context
 * 
 * @example
 * const context = await setupTestContext({
 *   method: 'POST',
 *   query: { inspectionId: 'test-id' },
 *   body: { title: 'Test Section' }
 * });
 */
export async function setupTestContext(options: {
  method?: string;
  query?: Record<string, any>;
  body?: any;
  sections?: InspectionSection[];
}): Promise<TestContext> {
  const { req, res } = createMockRequestResponse({
    method: options.method || 'GET',
    query: options.query || {},
    body: options.body
  });

  // Attach mock data to request object
  (req as any)._mockData = {
    sections: options.sections || []
  };

  const prisma = createMockPrisma();
  const sections = options.sections || [];

  // Setup common mock implementations
  prisma.section.findMany.mockResolvedValue(sections);
  prisma.section.findUnique.mockImplementation((args) => {
    return Promise.resolve(
      sections.find(section => section.id === args.where.id) || null
    );
  });

  prisma.section.create.mockImplementation(async (args) => {
    const newSection = await createTestSection(prisma, args.data.inspectionId, args.data);
    sections.push(newSection);
    return newSection;
  });

  prisma.section.update.mockImplementation((args) => {
    const index = sections.findIndex(section => section.id === args.where.id);
    if (index === -1) return null;

    const updatedSection = {
      ...sections[index],
      ...args.data,
      updatedAt: new Date()
    };
    sections[index] = updatedSection;
    return Promise.resolve(updatedSection);
  });

  prisma.section.delete.mockImplementation((args) => {
    const index = sections.findIndex(section => section.id === args.where.id);
    if (index === -1) return null;

    const deletedSection = sections[index];
    sections.splice(index, 1);
    return Promise.resolve(deletedSection);
  });

  return { req, res, prisma, sections };
}

/**
 * Validates a section response against expected values.
 * Checks both required and optional fields, ensuring data integrity.
 * 
 * @param actual - The actual section response from the API
 * @param expected - The expected section data to validate against
 * @throws {Error} When validation fails
 * 
 * @example
 * validateSectionResponse(response, {
 *   title: 'Test Section',
 *   order: 1,
 *   inspectionId: 'test-id'
 * });
 */
export function validateSectionResponse(
  actual: Partial<InspectionSection>,
  expected: Partial<InspectionSection>
) {
  // Required fields
  expect(actual.id).toBeDefined();
  expect(actual.inspectionId).toBe(expected.inspectionId);
  expect(actual.title).toBe(expected.title);
  expect(actual.order).toBe(expected.order);

  // Optional fields
  if (expected.description) {
    expect(actual.description).toBe(expected.description);
  }
  if (expected.metadata) {
    expect(actual.metadata).toEqual(expected.metadata);
  }
  if (expected.customFields) {
    expect(actual.customFields).toEqual(expected.customFields);
  }
  if (expected.content !== undefined) {
    expect(actual.content).toEqual(expected.content);
  }
  if (expected.completedBy !== undefined) {
    expect(actual.completedBy).toBe(expected.completedBy);
  }
  if (expected.completedAt !== undefined) {
    expect(actual.completedAt).toEqual(expected.completedAt);
  }
  if (expected.isCompleted !== undefined) {
    expect(actual.isCompleted).toBe(expected.isCompleted);
  }

  // Timestamps
  expect(actual.createdAt).toBeDefined();
  expect(actual.updatedAt).toBeDefined();
}

/**
 * Validates an error response from the API.
 * 
 * @param res - The API response object
 * @param statusCode - Expected HTTP status code
 * @param message - Optional error message to validate
 * @throws {Error} When validation fails
 * 
 * @example
 * expectErrorResponse(res, 400, 'Invalid input');
 */
export function expectErrorResponse(res: any, statusCode: number, message?: string) {
  expect(res._getStatusCode()).toBe(statusCode);
  const data = JSON.parse(res._getData());
  expect(data.error).toBeDefined();
  if (message) {
    expect(data.error).toContain(message);
  }
}

/**
 * Validates a successful response from the API and optionally runs additional validations.
 * 
 * @template T - Type of the response data
 * @param res - The API response object
 * @param statusCode - Expected HTTP status code
 * @param validator - Optional function to perform additional validation on the response data
 * @returns {Promise<T>} The parsed response data
 * @throws {Error} When validation fails
 * 
 * @example
 * const data = await expectSuccessResponse<Section[]>(res, 200, (sections) => {
 *   expect(sections).toHaveLength(1);
 * });
 */
export async function expectSuccessResponse<T>(
  res: any,
  statusCode: number,
  validator?: (data: T) => void | Promise<void>
) {
  expect(res._getStatusCode()).toBe(statusCode);
  const data = JSON.parse(res._getData());
  expect(data.error).toBeUndefined();
  if (validator) {
    await validator(data);
  }
  return data;
}

/**
 * Creates an array of test sections with sequential IDs and default values.
 * 
 * @param count - Number of test sections to create
 * @param inspectionId - Inspection ID to associate with the sections
 * @returns {InspectionSection[]} Array of test sections
 * 
 * @example
 * const sections = createTestSections(3, 'test-inspection-id');
 * // Creates 3 sections with IDs section-1, section-2, section-3
 */
export function createTestSections(count: number, inspectionId: string): InspectionSection[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `section-${i + 1}`,
    inspectionId,
    title: `Test Section ${i + 1}`,
    description: `Description ${i + 1}`,
    order: i + 1,
    metadata: {},
    customFields: {},
    content: '',
    completedBy: null,
    completedAt: null,
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }));
}
