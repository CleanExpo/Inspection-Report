import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import type { RequestMethod } from 'node-mocks-http';
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

describe('HTTP Method Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Invalid Methods', () => {
    const invalidMethods: RequestMethod[] = ['GET', 'PUT', 'PATCH', 'DELETE'];

    invalidMethods.forEach(method => {
      it(`should reject ${method} requests`, async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method
        });

        await moistureAnalyticsHandler(req, res);
        expect(res._getStatusCode()).toBe(405);
        expect(JSON.parse(res._getData())).toEqual({
          error: 'Method not allowed. Use POST.'
        });
      });
    });

    it('should include Allow header in response', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET'
      });

      await moistureAnalyticsHandler(req, res);
      expect(res.getHeader('Allow')).toBe('POST');
    });
  });

  describe('Valid POST Method', () => {
    it('should accept POST request with valid data', async () => {
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
      expect(JSON.parse(res._getData())).toHaveProperty('metadata');
    });

    it('should handle POST request with empty body', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST'
      });

      await moistureAnalyticsHandler(req, res);
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Missing request body'
      });
    });

    it('should handle POST request with invalid content type', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          'content-type': 'text/plain'
        },
        body: Buffer.from('not json')
      });

      await moistureAnalyticsHandler(req, res);
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Invalid content type. Use application/json'
      });
    });
  });
});
