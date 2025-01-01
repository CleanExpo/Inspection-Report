import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import moistureAnalyticsHandler from '../../moisture';
import { prisma } from '../../../../lib/prisma';
import { dbReadings, generateDbReadings } from '../../__tests__/testData';

jest.mock('../../../../lib/prisma', () => ({
  prisma: {
    moistureReading: {
      findMany: jest.fn()
    }
  }
}));

describe('Moisture Analytics API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process moisture readings and return analytics', async () => {

    (prisma.moistureReading.findMany as jest.Mock).mockResolvedValue(dbReadings);

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
    expect(responseData).toHaveProperty('trends');
    expect(responseData).toHaveProperty('hotspots');
    expect(responseData).toHaveProperty('statistics');
    expect(responseData).toHaveProperty('metadata');
    expect(responseData.metadata).toHaveProperty('jobId', 'job123');
    
    // Verify database query
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
  });

  it('should handle missing required parameters', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        // Missing jobId
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-02T00:00:00Z'
      }
    });

    await moistureAnalyticsHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });

  it('should handle database errors gracefully', async () => {
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
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });

  it('should validate date range', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        jobId: 'job123',
        startDate: '2024-01-02T00:00:00Z', // Start date after end date
        endDate: '2024-01-01T00:00:00Z'
      }
    });

    await moistureAnalyticsHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });

  it('should handle multiple rooms', async () => {
    const multiRoomReadings = [
      ...generateDbReadings({ jobId: 'job123', count: 2, startDate: new Date('2024-01-01T10:00:00Z'), room: 'Room1' }),
      ...generateDbReadings({ jobId: 'job123', count: 2, startDate: new Date('2024-01-01T10:00:00Z'), room: 'Room2' })
    ];

    (prisma.moistureReading.findMany as jest.Mock).mockResolvedValue(multiRoomReadings);

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
    expect(responseData.statistics.hourly.length).toBeGreaterThan(1); // Should have stats for each room
  });
});
