import { PrismaClient } from '@prisma/client';
import { createMocks as createHttpMocks } from 'node-mocks-http';
import { v4 as uuidv4 } from 'uuid';
import { InspectionSection, InspectionStatus, MockRequestResponse } from './types';

interface ExtendedMockResponse {
  _getStatusCode: () => number;
  _getData: () => string;
}

export function createMockRequestResponse(options: {
  method?: string;
  query?: Record<string, any>;
  body?: any;
}): { req: any; res: any & ExtendedMockResponse } {
  return createHttpMocks({
    method: options.method || 'GET',
    query: options.query || {},
    body: options.body || {}
  });
}

export async function createTestInspection(prisma: any) {
  return await prisma.inspection.create({
    data: {
      id: uuidv4(),
      title: `Test Inspection ${Date.now()}`,
      status: InspectionStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
}

interface CreateTestSectionOptions {
  order?: number;
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
  customFields?: Record<string, any>;
  content?: string | Record<string, any>;
  completedBy?: string | null;
  completedAt?: Date | null;
  isCompleted?: boolean;
}

export async function createTestSection(
  prisma: any,
  inspectionId: string,
  options: CreateTestSectionOptions = {}
): Promise<InspectionSection> {
  const {
    order = 1,
    title = `Test Section ${Date.now()}`,
    description = 'Test Description',
    metadata = {},
    customFields = {},
    content = '',
    completedBy = null,
    completedAt = null,
    isCompleted = false
  } = options;

  return await prisma.section.create({
    data: {
      id: uuidv4(),
      inspectionId,
      title,
      description,
      order,
      metadata,
      customFields,
      content,
      completedBy,
      completedAt,
      isCompleted,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
}

export function createMockPrisma() {
  return {
    inspection: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    section: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn()
    },
    $transaction: jest.fn(),
    $connect: jest.fn(),
    $disconnect: jest.fn()
  };
}

export function createMockHandlers() {
  return {
    handleGetSections: jest.fn(),
    handlePostSection: jest.fn(),
    handlePutSection: jest.fn(),
    handleDeleteSection: jest.fn(),
    mockGetSections: jest.fn(),
    mockCreateSection: jest.fn(),
    mockReorderSections: jest.fn()
  };
}

export function createBenchmarkResult(options: {
  operation: string;
  samples?: number;
  mean?: number;
  median?: number;
  p95?: number;
  p99?: number;
  min?: number;
  max?: number;
  stdDev?: number;
}) {
  const now = new Date();
  return {
    operation: options.operation,
    samples: options.samples || 100,
    mean: options.mean || 100,
    median: options.median || 95,
    standardDeviation: options.stdDev || 10,
    p95: options.p95 || 150,
    p99: options.p99 || 200,
    min: options.min || 50,
    max: options.max || 250,
    stdDev: options.stdDev || 10,
    timestamp: now.toISOString(),
    percentiles: {
      p50: options.median || 95,
      p75: 125,
      p95: options.p95 || 150,
      p99: options.p99 || 200
    }
  };
}

export const validUuid = '123e4567-e89b-12d3-a456-426614174000';
export const mockDate = new Date('2023-01-01T00:00:00.000Z');
