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

describe('Moisture Analytics Request Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('HTTP Method Validation', () => {
    it('should reject non-POST requests', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET'
      });

      await moistureAnalyticsHandler(req, res);
      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Method not allowed. Use POST.'
      });
    });

    it('should accept POST requests with valid data', async () => {
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
    });
  });

  describe('Parameter Validation', () => {
    it('should require jobId parameter', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-02T00:00:00Z'
        }
      });

      await moistureAnalyticsHandler(req, res);
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Missing required parameter: jobId'
      });
    });

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

  describe('Date Validation', () => {
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

    it('should validate date format', async () => {
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

    it('should validate reasonable date range', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          jobId: 'job123',
          startDate: '2020-01-01T00:00:00Z', // Too far in the past
          endDate: '2024-01-02T00:00:00Z'
        }
      });

      await moistureAnalyticsHandler(req, res);
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Date range too large: maximum range is 1 year'
      });
    });
  });
});
