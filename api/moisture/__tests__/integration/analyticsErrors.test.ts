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

describe('Analytics Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle insufficient data error', async () => {
    const singleReading = generateDbReadings({
      jobId: 'job123',
      count: 1,
      startDate: new Date('2024-01-01T10:00:00Z')
    });

    (prisma.moistureReading.findMany as jest.Mock).mockResolvedValue(singleReading);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        jobId: 'job123',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-02T00:00:00Z'
      }
    });

    await moistureAnalyticsHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Insufficient data for analysis'
    });
  });

  it('should handle invalid spatial data', async () => {
    // Generate readings with missing spatial coordinates
    const readings = generateDbReadings({
      jobId: 'job123',
      count: 3,
      startDate: new Date('2024-01-01T10:00:00Z')
    }).map(reading => ({
      ...reading,
      locationX: undefined,
      locationY: undefined
    }));

    (prisma.moistureReading.findMany as jest.Mock).mockResolvedValue(readings);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        jobId: 'job123',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-02T00:00:00Z'
      }
    });

    await moistureAnalyticsHandler(req, res);
    const responseData = JSON.parse(res._getData());
    expect(responseData.hotspots).toHaveLength(0); // No hotspots due to missing coordinates
  });

  it('should handle data inconsistency errors', async () => {
    // Generate readings with inconsistent room names
    const room1Readings = generateDbReadings({
      jobId: 'job123',
      count: 2,
      startDate: new Date('2024-01-01T10:00:00Z'),
      room: 'Room1'
    });
    const room2Readings = generateDbReadings({
      jobId: 'job123',
      count: 2,
      startDate: new Date('2024-01-01T10:00:00Z'),
      room: undefined // Missing room name
    });

    (prisma.moistureReading.findMany as jest.Mock).mockResolvedValue([
      ...room1Readings,
      ...room2Readings
    ]);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        jobId: 'job123',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-02T00:00:00Z'
      }
    });

    await moistureAnalyticsHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Invalid data: Missing room information'
    });
  });

  it('should handle analytics processing errors', async () => {
    // Generate readings with invalid values
    const readings = generateDbReadings({
      jobId: 'job123',
      count: 3,
      startDate: new Date('2024-01-01T10:00:00Z')
    }).map(reading => ({
      ...reading,
      temperature: NaN // Invalid temperature value
    }));

    (prisma.moistureReading.findMany as jest.Mock).mockResolvedValue(readings);

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
      error: 'Analytics processing error: Invalid measurement values'
    });
  });
});
