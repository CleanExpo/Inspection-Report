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

describe('JobId Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Required Parameter', () => {
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

    it('should not accept empty jobId', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          jobId: '',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-02T00:00:00Z'
        }
      });

      await moistureAnalyticsHandler(req, res);
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Invalid jobId: cannot be empty'
      });
    });
  });

  describe('Format Validation', () => {
    it('should validate jobId format', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          jobId: 'invalid#id',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-02T00:00:00Z'
        }
      });

      await moistureAnalyticsHandler(req, res);
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Invalid jobId format: use only letters, numbers, and hyphens'
      });
    });

    it('should enforce jobId length limits', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          jobId: 'a'.repeat(51), // Too long
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-02T00:00:00Z'
        }
      });

      await moistureAnalyticsHandler(req, res);
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Invalid jobId: length must be between 1 and 50 characters'
      });
    });
  });

  describe('Valid JobId', () => {
    it('should accept valid jobId with mock data', async () => {
      const mockReadings = generateDbReadings({
        jobId: 'job-123',
        count: 3,
        startDate: new Date('2024-01-01T10:00:00Z')
      });
      
      (prisma.moistureReading.findMany as jest.Mock).mockResolvedValue(mockReadings);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          jobId: 'job-123',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-02T00:00:00Z'
        }
      });

      await moistureAnalyticsHandler(req, res);
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData()).metadata.jobId).toBe('job-123');
    });

    it('should handle multiple valid jobId formats', async () => {
      const validJobIds = ['job123', 'job-123', 'JOB-123', '123'];
      
      for (const jobId of validJobIds) {
        const mockReadings = generateDbReadings({
          jobId,
          count: 3,
          startDate: new Date('2024-01-01T10:00:00Z')
        });
        
        (prisma.moistureReading.findMany as jest.Mock).mockResolvedValue(mockReadings);

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'POST',
          body: {
            jobId,
            startDate: '2024-01-01T00:00:00Z',
            endDate: '2024-01-02T00:00:00Z'
          }
        });

        await moistureAnalyticsHandler(req, res);
        expect(res._getStatusCode()).toBe(200);
        expect(JSON.parse(res._getData()).metadata.jobId).toBe(jobId);
      }
    });
  });
});
