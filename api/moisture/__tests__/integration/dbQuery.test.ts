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

describe('Database Query', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should query with correct parameters', async () => {
    const mockReadings = generateDbReadings({
      jobId: 'job123',
      count: 3,
      startDate: new Date('2024-01-01T10:00:00Z')
    });

    (prisma.moistureReading.findMany as jest.Mock).mockResolvedValue(mockReadings);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        jobId: 'job123',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-02T00:00:00Z'
      }
    });

    await moistureAnalyticsHandler(req, res);
    
    expect(prisma.moistureReading.findMany).toHaveBeenCalledWith({
      where: {
        jobId: 'job123',
        createdAt: {
          gte: new Date('2024-01-01T00:00:00Z'),
          lte: new Date('2024-01-02T00:00:00Z')
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData.metadata.readingCount).toBe(3);
  });

  it('should handle queries for multiple rooms', async () => {
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
      room: 'Room2'
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
    expect(res._getStatusCode()).toBe(200);
    
    const responseData = JSON.parse(res._getData());
    expect(responseData.metadata.readingCount).toBe(4);
    expect(responseData.statistics.hourly.length).toBeGreaterThan(1); // Stats for each room
  });

  it('should handle empty result sets', async () => {
    (prisma.moistureReading.findMany as jest.Mock).mockResolvedValue([]);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        jobId: 'job123',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-02T00:00:00Z'
      }
    });

    await moistureAnalyticsHandler(req, res);
    expect(res._getStatusCode()).toBe(200);
    
    const responseData = JSON.parse(res._getData());
    expect(responseData.metadata.readingCount).toBe(0);
    expect(responseData.statistics.hourly).toHaveLength(0);
    expect(responseData.hotspots).toHaveLength(0);
  });
});
