import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import moistureAnalyticsHandler from '../../moisture';
import { prisma } from '../../../../lib/prisma';
import { generateDbReadings } from '../../__tests__/testData';

jest.mock('../../../../lib/prisma', () => ({
  prisma: {
    moistureReading: {
      findMany: jest.fn()
    }
  }
}));

describe('Database Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle database connection error', async () => {
    (prisma.moistureReading.findMany as jest.Mock).mockRejectedValue(
      new Error('Database connection failed')
    );

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        jobId: 'job123',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-02T00:00:00Z'
      }
    });

    await moistureAnalyticsHandler(req, res);
    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Database error: Database connection failed'
    });
  });

  it('should handle database timeout', async () => {
    (prisma.moistureReading.findMany as jest.Mock).mockRejectedValue(
      new Error('Database operation timed out')
    );

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        jobId: 'job123',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-02T00:00:00Z'
      }
    });

    await moistureAnalyticsHandler(req, res);
    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Database error: Database operation timed out'
    });
  });

  it('should handle partial database results', async () => {
    // First query succeeds
    const mockReadings = generateDbReadings({
      jobId: 'job123',
      count: 3,
      startDate: new Date('2024-01-01T10:00:00Z')
    });

    // Mock successful first call, then error on subsequent operation
    let callCount = 0;
    (prisma.moistureReading.findMany as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(mockReadings);
      }
      throw new Error('Database error during analysis');
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        jobId: 'job123',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-02T00:00:00Z'
      }
    });

    await moistureAnalyticsHandler(req, res);
    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Database error: Database error during analysis'
    });
  });

  it('should handle database constraint violations', async () => {
    (prisma.moistureReading.findMany as jest.Mock).mockRejectedValue(
      new Error('Foreign key constraint failed')
    );

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        jobId: 'invalid_job',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-02T00:00:00Z'
      }
    });

    await moistureAnalyticsHandler(req, res);
    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Database error: Foreign key constraint failed'
    });
  });
});
