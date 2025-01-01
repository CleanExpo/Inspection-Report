import handler from '../../../api/moisture/export';
import { mockReadings, mockExportRequest } from './__mocks__/mockData';
import { createMockRequestResponse, mockPrisma, resetMocks, parseResponse } from './__mocks__/testUtils';
import { ErrorCode } from '../../../api/moisture/utils/errorCodes';

jest.mock('../../../lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma
}));

describe('Moisture Export API', () => {
  beforeEach(() => {
    resetMocks();
  });

  describe('POST /api/moisture/export', () => {
    it('should export data in JSON format', async () => {
      const { req, res } = createMockRequestResponse('POST', mockExportRequest);
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.getHeader('Content-Type')).toBe('application/json');
      expect(res.getHeader('Content-Disposition')).toBe('attachment; filename=moisture-readings.json');
      
      const data = parseResponse(res);
      expect(data).toHaveProperty('readings');
      expect(data).toHaveProperty('exportedAt');
      expect(data).toHaveProperty('totalReadings');
      expect(data).toHaveProperty('totalDataPoints');

      // Verify data structure
      expect(data.readings[0]).toMatchObject({
        id: expect.any(String),
        jobId: expect.any(String),
        location: {
          room: expect.any(String),
          floor: expect.any(String),
          x: expect.any(Number),
          y: expect.any(Number)
        },
        dataPoints: expect.arrayContaining([
          expect.objectContaining({
            value: expect.any(Number),
            unit: expect.any(String),
            createdAt: expect.any(String)
          })
        ])
      });
    });

    it('should export data in CSV format', async () => {
      const { req, res } = createMockRequestResponse('POST', {
        ...mockExportRequest,
        options: { ...mockExportRequest.options, format: 'csv' }
      });
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.getHeader('Content-Type')).toBe('text/csv');
      expect(res.getHeader('Content-Disposition')).toBe('attachment; filename=moisture-readings.csv');
      
      const csvData = parseResponse(res);
      const lines = csvData.toString().split('\n');
      
      // Verify CSV structure
      expect(lines[0]).toContain('Reading ID,Job ID,Room,Floor,Location X,Location Y');
      expect(lines.length).toBeGreaterThan(1);
    });

    it('should apply filters correctly', async () => {
      const { req, res } = createMockRequestResponse('POST', mockExportRequest);
      await handler(req, res);

      expect(mockPrisma.moistureReading.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            jobId: mockExportRequest.filters?.jobId,
            room: mockExportRequest.filters?.room?.toLowerCase(), // verify transformation
            floor: mockExportRequest.filters?.floor
          })
        })
      );
    });

    it('should handle date range filtering', async () => {
      const { req, res } = createMockRequestResponse('POST', mockExportRequest);
      await handler(req, res);

      expect(mockPrisma.moistureReading.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: new Date(mockExportRequest.options.dateRange!.start),
              lte: new Date(mockExportRequest.options.dateRange!.end)
            }
          })
        })
      );
    });

    it('should include metadata when requested', async () => {
      const { req, res } = createMockRequestResponse('POST', mockExportRequest);
      await handler(req, res);

      const data = parseResponse(res);
      expect(data.readings[0]).toHaveProperty('metadata');
      expect(data.readings[0].metadata).toMatchObject({
        temperature: expect.any(Number),
        humidity: expect.any(Number),
        pressure: expect.any(Number),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
    });

    it('should handle validation errors', async () => {
      const invalidRequest = {
        options: {
          format: 'invalid',
          includeMetadata: true
        }
      };

      const { req, res } = createMockRequestResponse('POST', invalidRequest);
      await handler(req, res);

      expect(res.statusCode).toBe(400);
      const error = parseResponse(res);
      expect(error.code).toBe(ErrorCode.INVALID_PARAMETERS);
    });

    it('should handle database errors', async () => {
      (mockPrisma.moistureReading.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('Database error')
      );

      const { req, res } = createMockRequestResponse('POST', mockExportRequest);
      await handler(req, res);

      expect(res.statusCode).toBe(500);
      const error = parseResponse(res);
      expect(error.code).toBe(ErrorCode.DATABASE_ERROR);
    });

    it('should handle invalid HTTP method', async () => {
      const { req, res } = createMockRequestResponse('GET');
      await handler(req, res);

      expect(res.statusCode).toBe(400);
      const error = parseResponse(res);
      expect(error.code).toBe(ErrorCode.INVALID_REQUEST);
    });

    it('should properly transform room names to lowercase', async () => {
      const request = {
        ...mockExportRequest,
        filters: {
          ...mockExportRequest.filters,
          room: 'LIVING ROOM'
        }
      };

      const { req, res } = createMockRequestResponse('POST', request);
      await handler(req, res);

      expect(mockPrisma.moistureReading.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            room: 'living room'
          })
        })
      );
    });

    it('should handle empty result set', async () => {
      (mockPrisma.moistureReading.findMany as jest.Mock).mockResolvedValueOnce([]);

      const { req, res } = createMockRequestResponse('POST', mockExportRequest);
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      const data = parseResponse(res);
      expect(data.readings).toHaveLength(0);
      expect(data.totalReadings).toBe(0);
      expect(data.totalDataPoints).toBe(0);
    });
  });
});
