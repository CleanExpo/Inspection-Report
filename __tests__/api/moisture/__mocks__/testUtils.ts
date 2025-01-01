import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks, RequestMethod } from 'node-mocks-http';
import { mockReadings } from './mockData';
import { PrismaClient } from '@prisma/client';
import { Mock } from 'jest-mock';

// Mock Prisma Client
export const mockPrisma = {
  moistureReading: {
    findMany: jest.fn().mockResolvedValue(mockReadings),
    create: jest.fn().mockImplementation((args) => {
      const reading = {
        id: 'new-reading',
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return Promise.resolve(reading);
    }),
    update: jest.fn().mockImplementation((args) => {
      const reading = mockReadings.find(r => r.id === args.where.id);
      if (!reading) throw new Error('Reading not found');
      return Promise.resolve({
        ...reading,
        ...args.data,
        updatedAt: new Date()
      });
    }),
    delete: jest.fn().mockImplementation((args) => {
      const reading = mockReadings.find(r => r.id === args.where.id);
      if (!reading) throw new Error('Reading not found');
      return Promise.resolve(reading);
    })
  },
  $transaction: jest.fn().mockImplementation((fn) => {
    return fn(mockPrisma);
  })
} as unknown as PrismaClient;

// Create mock request/response objects
export function createMockRequestResponse(method: RequestMethod = 'GET', body: any = null, query: any = {}) {
  const { req, res } = createMocks({
    method,
    body,
    query
  });

  return {
    req: req as unknown as NextApiRequest,
    res: res as unknown as NextApiResponse
  };
}

// Helper to parse JSON response
export function parseResponse(res: NextApiResponse) {
  return JSON.parse((res as any)._getData());
}

// Helper to check if response matches expected schema
export function validateResponseSchema(response: any, schema: any) {
  const result = schema.safeParse(response);
  if (!result.success) {
    console.error('Schema validation failed:', result.error);
    return false;
  }
  return true;
}

// Helper to check error response structure
export function validateErrorResponse(response: any) {
  return (
    typeof response === 'object' &&
    response !== null &&
    typeof response.code === 'string' &&
    typeof response.message === 'string'
  );
}

// Helper to create test context with mocked dependencies
export function createTestContext() {
  const { req, res } = createMockRequestResponse();
  
  return {
    req,
    res,
    prisma: mockPrisma,
    parseResponse: () => parseResponse(res),
    validateResponse: (schema: any) => validateResponseSchema(parseResponse(res), schema)
  };
}

// Reset all mocks between tests
export function resetMocks() {
  jest.clearAllMocks();
  Object.values(mockPrisma).forEach(mock => {
    if (typeof mock === 'object' && mock !== null) {
      Object.values(mock).forEach(fn => {
        if (typeof fn === 'function' && fn.hasOwnProperty('mockReset')) {
          (fn as Mock).mockReset();
        }
      });
    }
  });
}
