import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Represents the possible states of an inspection.
 * 
 * @enum {string}
 */
export enum InspectionStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

/**
 * Represents a section within an inspection report.
 * Contains all data related to a specific section including metadata and completion status.
 * 
 * @interface InspectionSection
 */
export interface InspectionSection {
  id: string;
  inspectionId: string;
  title: string;
  description?: string;
  order: number;
  metadata?: Record<string, any>;
  customFields?: Record<string, any>;
  content?: string | Record<string, any>;
  completedBy?: string | null;
  completedAt?: Date | null;
  isCompleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents an inspection report.
 * Contains general inspection information and optional sections.
 * 
 * @interface Inspection
 */
export interface Inspection {
  id: string;
  title: string;
  status: InspectionStatus;
  createdAt: Date;
  updatedAt: Date;
  sections?: InspectionSection[];
}

/**
 * Represents a mock HTTP request/response pair for testing.
 * Used to simulate API endpoints in tests.
 * 
 * @interface MockRequestResponse
 */
export interface MockRequestResponse {
  req: NextApiRequest;
  res: NextApiResponse;
}

export const validUuid = '123e4567-e89b-12d3-a456-426614174000';

export const mockDate = new Date('2023-01-01T00:00:00.000Z');

/**
 * Represents the result of a performance benchmark test.
 * Contains various metrics and statistics about the test run.
 * 
 * @interface BenchmarkResult
 */
export interface BenchmarkResult {
  operation: string;
  samples: number;
  mean: number;
  standardDeviation: number;
  median?: number;
  p95?: number;
  p99?: number;
  min?: number;
  max?: number;
  stdDev?: number;
  timestamp: string;
  percentiles: {
    p50: number;
    p75: number;
    p95: number;
    p99: number;
  };
}

export const mockSection: InspectionSection = {
  id: validUuid,
  inspectionId: validUuid,
  title: 'Test Section',
  description: 'Test Description',
  order: 1,
  metadata: {},
  customFields: {},
  content: '',
  completedBy: null,
  completedAt: null,
  isCompleted: false,
  createdAt: mockDate,
  updatedAt: mockDate
};

/**
 * Represents mock implementations of API endpoint handlers.
 * Used for testing API functionality without real HTTP requests.
 * 
 * @interface MockHandlers
 */
export interface MockHandlers {
  handleGetSections: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
  handlePostSection: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
  handlePutSection: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
  handleDeleteSection: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
}

/**
 * Represents a mock Prisma client with Jest mock functions.
 * Used to simulate database operations in tests.
 * 
 * @interface ExtendedPrismaClient
 */
export interface ExtendedPrismaClient {
  inspection: {
    create: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  section: {
    create: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    deleteMany: jest.Mock;
  };
  $transaction: jest.Mock;
  $connect: jest.Mock;
  $disconnect: jest.Mock;
}

/**
 * Configuration options for the metrics collector.
 * Controls how metrics are collected and processed.
 * 
 * @interface MetricsCollectorConfig
 */
export interface MetricsCollectorConfig {
  sampleSize?: number;
  warmupRounds?: number;
  cooldownMs?: number;
}

/**
 * Represents a single metric measurement.
 * Contains the operation name, duration, and optional metadata.
 * 
 * @interface MetricSample
 */
export interface MetricSample {
  operation: string;
  duration: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Represents aggregated metrics from a benchmark run.
 * Contains statistical analysis of performance measurements.
 * 
 * @interface BenchmarkMetrics
 */
export interface BenchmarkMetrics {
  operation: string;
  samples: number;
  mean: number;
  median: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  stdDev: number;
  timestamp: string;
}
