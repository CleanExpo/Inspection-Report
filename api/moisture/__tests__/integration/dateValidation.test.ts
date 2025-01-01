import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import moistureAnalyticsHandler from '../../moisture';
import { generateDbReadings } from '../../__tests__/testData';
import { prisma } from '../../../../lib/prisma';

jest.mock('../../../../lib/prisma', () => ({
  prisma: {
    moistureReading: {
      findMany: jest.fn()
    }
  }
}));

describe('Date Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Required Parameters', () => {
    it('should require startDate parameter', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          jobId: 'job123',
          endDate: '2024-01-02T00:00:00Z'
        }
      });

      await moistureAnalyticsHandler(req, res);
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Missing required parameter: startDate'
      });
    });

    it('should require endDate parameter', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          jobId: 'job123',
          startDate: '2024-01-01T00:00:00Z'
        }
      });

      await moistureAnalyticsHandler(req, res);
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Missing required parameter: endDate'
      });
    });
  });

  describe('Date Format Validation', () => {
    it('should validate startDate format', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          jobId: 'job123',
          startDate: 'invalid-date',
          endDate: '2024-01-02T00:00:00Z'
        }
      });

      await moistureAnalyticsHandler(req, res);
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Invalid date format: startDate'
      });
    });

    it('should validate endDate format', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          jobId: 'job123',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-13-45' // Invalid date
        }
      });

      await moistureAnalyticsHandler(req, res);
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Invalid date format: endDate'
      });
    });
  });

  describe('Date Range Validation', () => {
    it('should validate date range order', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          jobId: 'job123',
          startDate: '2024-01-02T00:00:00Z',
          endDate: '2024-01-01T00:00:00Z'
        }
      });

      await moistureAnalyticsHandler(req, res);
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Invalid date range: startDate must be before endDate'
      });
    });

    it('should validate maximum date range', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          jobId: 'job123',
          startDate: '2023-01-01T00:00:00Z',
          endDate: '2024-01-02T00:00:00Z' // More than 1 year
        }
      });

      await moistureAnalyticsHandler(req, res);
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Date range too large: maximum range is 1 year'
      });
    });

    it('should validate dates are not in future', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          jobId: 'job123',
          startDate: '2024-01-01T00:00:00Z',
          endDate: futureDate.toISOString()
        }
      });

      await moistureAnalyticsHandler(req, res);
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Invalid date range: dates cannot be in the future'
      });
    });
  });

  describe('Valid Date Ranges', () => {
    it('should accept valid date range with mock data', async () => {
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
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.metadata.dateRange).toEqual({
        start: '2024-01-01T00:00:00Z',
        end: '2024-01-02T00:00:00Z'
      });
    });

    it('should handle timezone offsets correctly', async () => {
      const mockReadings = generateDbReadings({
        jobId: 'job123',
        count: 3,
        startDate: new Date('2024-01-01T10:00:00+10:00') // UTC+10
      });
      
      (prisma.moistureReading.findMany as jest.Mock).mockResolvedValue(mockReadings);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          jobId: 'job123',
          startDate: '2024-01-01T00:00:00+10:00',
          endDate: '2024-01-02T00:00:00+10:00'
        }
      });

      await moistureAnalyticsHandler(req, res);
      expect(res._getStatusCode()).toBe(200);
    });
  });
});
