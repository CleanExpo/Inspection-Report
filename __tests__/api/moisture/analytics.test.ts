import handler from '../../../api/moisture/analytics';
import { mockReadings, mockAnalyticsRequest } from './__mocks__/mockData';
import { createMockRequestResponse, mockPrisma, resetMocks, parseResponse } from './__mocks__/testUtils';
import { ErrorCode } from '../../../api/moisture/utils/errorCodes';
import { MockResponse } from 'node-mocks-http';

jest.mock('../../../lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma
}));

describe('Moisture Analytics API', () => {
  beforeEach(() => {
    resetMocks();
  });

  describe('GET /api/moisture/analytics', () => {
    it('should return analytics data for valid request', async () => {
      const { req, res } = createMockRequestResponse('GET', null, mockAnalyticsRequest);
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      const data = parseResponse(res);
      
      expect(data).toHaveProperty('trends');
      expect(data).toHaveProperty('hotspots');
      expect(data).toHaveProperty('metadata');
      expect(data.metadata).toMatchObject({
        jobId: mockAnalyticsRequest.jobId,
        room: mockAnalyticsRequest.room,
        floor: mockAnalyticsRequest.floor,
        timeframe: mockAnalyticsRequest.timeframe
      });
    });

    it('should handle invalid request parameters', async () => {
      const { req, res } = createMockRequestResponse('GET', null, {
        ...mockAnalyticsRequest,
        timeframe: 'invalid'
      });
      await handler(req, res);

      expect(res.statusCode).toBe(400);
      const error = parseResponse(res);
      expect(error.code).toBe(ErrorCode.INVALID_PARAMETERS);
    });

    it('should handle missing required parameters', async () => {
      const { req, res } = createMockRequestResponse('GET', null, {
        room: 'living room' // missing jobId
      });
      await handler(req, res);

      expect(res.statusCode).toBe(400);
      const error = parseResponse(res);
      expect(error.code).toBe(ErrorCode.INVALID_PARAMETERS);
    });

    it('should handle database errors', async () => {
      (mockPrisma.moistureReading.findMany as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
      
      const { req, res } = createMockRequestResponse('GET', null, mockAnalyticsRequest);
      await handler(req, res);

      expect(res.statusCode).toBe(500);
      const error = parseResponse(res);
      expect(error.code).toBe(ErrorCode.DATABASE_ERROR);
    });

    it('should handle invalid HTTP method', async () => {
      const { req, res } = createMockRequestResponse('POST', mockAnalyticsRequest);
      await handler(req, res);

      expect(res.statusCode).toBe(400);
      const error = parseResponse(res);
      expect(error.code).toBe(ErrorCode.INVALID_REQUEST);
    });

    it('should properly transform room names to lowercase', async () => {
      const { req, res } = createMockRequestResponse('GET', null, {
        ...mockAnalyticsRequest,
        room: 'LIVING ROOM'
      });
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      const data = parseResponse(res);
      expect(data.metadata.room).toBe('living room');
      
      // Verify the query was made with transformed room name
      expect(mockPrisma.moistureReading.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            room: 'living room'
          })
        })
      );
    });

    it('should calculate correct trend statistics', async () => {
      const { req, res } = createMockRequestResponse('GET', null, mockAnalyticsRequest);
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      const data = parseResponse(res);
      
      expect(data.trends).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            averageValue: expect.any(Number),
            minValue: expect.any(Number),
            maxValue: expect.any(Number),
            readingCount: expect.any(Number)
          })
        ])
      );

      // Verify trend calculations
      const trend = data.trends[0];
      expect(trend.minValue).toBeLessThanOrEqual(trend.averageValue);
      expect(trend.maxValue).toBeGreaterThanOrEqual(trend.averageValue);
      expect(trend.readingCount).toBeGreaterThan(0);
    });

    it('should identify moisture hotspots correctly', async () => {
      const { req, res } = createMockRequestResponse('GET', null, mockAnalyticsRequest);
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      const data = parseResponse(res);
      
      expect(data.hotspots).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            x: expect.any(Number),
            y: expect.any(Number),
            averageValue: expect.any(Number),
            readingCount: expect.any(Number)
          })
        ])
      );

      // Verify hotspots are sorted by average value descending
      const hotspots = data.hotspots;
      for (let i = 1; i < hotspots.length; i++) {
        expect(hotspots[i].averageValue).toBeLessThanOrEqual(hotspots[i-1].averageValue);
      }
    });
  });
});
