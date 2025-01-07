import { PrismaClient } from '@prisma/client';
import { performanceMonitor } from '../../utils/performance';

// Initialize test database
const prisma = new PrismaClient();

// Performance thresholds (in milliseconds)
export const THRESHOLDS = {
  DATABASE: {
    READ: 100,
    WRITE: 200,
    QUERY: 150
  },
  CACHE: {
    HIT: 50,
    MISS: 150
  },
  IMAGE: {
    PROCESS: 500,
    OPTIMIZE: 300
  },
  PDF: {
    GENERATE: 1000,
    RENDER: 800
  },
  API: {
    RESPONSE: 200,
    TOTAL: 500
  }
};

// Test data generation
export const generateTestData = async () => {
  // Clear existing test data
  await prisma.$transaction([
    prisma.imageCache.deleteMany(),
    prisma.generatedPDF.deleteMany(),
    prisma.sDSCache.deleteMany()
  ]);

  // Create test job
  const job = await prisma.job.create({
    data: {
      // Add minimum required job data
    }
  });

  return {
    jobId: job.id
  };
};

// Performance measurement utilities
export const measurePerformance = async (
  name: string,
  operation: () => Promise<any>,
  threshold: number
): Promise<{ duration: number; passedThreshold: boolean }> => {
  const startTime = performance.now();
  await operation();
  const duration = performance.now() - startTime;

  return {
    duration,
    passedThreshold: duration <= threshold
  };
};

// Load test utilities
export const runLoadTest = async (
  operation: () => Promise<any>,
  concurrency: number,
  iterations: number
): Promise<{
  averageResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  successRate: number;
  totalRequests: number;
}> => {
  const results: number[] = [];
  const errors: Error[] = [];
  const batchSize = Math.min(concurrency, iterations);
  const batches = Math.ceil(iterations / batchSize);

  for (let i = 0; i < batches; i++) {
    const currentBatchSize = Math.min(batchSize, iterations - i * batchSize);
    const batch = Array(currentBatchSize).fill(operation);

    const batchResults = await Promise.allSettled(
      batch.map(async (op) => {
        const start = performance.now();
        try {
          await op();
          return performance.now() - start;
        } catch (error) {
          errors.push(error as Error);
          throw error;
        }
      })
    );

    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      }
    });
  }

  return {
    averageResponseTime: results.reduce((a, b) => a + b, 0) / results.length,
    maxResponseTime: Math.max(...results),
    minResponseTime: Math.min(...results),
    successRate: (results.length / iterations) * 100,
    totalRequests: iterations
  };
};

// Memory usage tracking
export const trackMemoryUsage = (): {
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
} => {
  const memory = process.memoryUsage();
  return {
    heapUsed: memory.heapUsed / 1024 / 1024, // MB
    heapTotal: memory.heapTotal / 1024 / 1024, // MB
    external: memory.external / 1024 / 1024, // MB
    arrayBuffers: memory.arrayBuffers / 1024 / 1024 // MB
  };
};

// Cleanup utilities
export const cleanupTestData = async () => {
  await prisma.$transaction([
    prisma.imageCache.deleteMany(),
    prisma.generatedPDF.deleteMany(),
    prisma.sDSCache.deleteMany(),
    prisma.job.deleteMany()
  ]);
};

beforeAll(async () => {
  // Set up test environment
  await generateTestData();
});

afterAll(async () => {
  // Clean up test environment
  await cleanupTestData();
  await prisma.$disconnect();
});
