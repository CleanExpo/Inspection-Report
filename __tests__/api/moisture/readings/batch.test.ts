import handler from '../../../../api/moisture/readings/batch';
import { mockReadings, mockBatchOperations } from '../__mocks__/mockData';
import { createMockRequestResponse, mockPrisma, resetMocks, parseResponse } from '../__mocks__/testUtils';
import { ErrorCode } from '../../../../api/moisture/utils/errorCodes';
import { Prisma } from '@prisma/client';

jest.mock('../../../../lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma
}));

describe('Moisture Batch Operations API', () => {
  beforeEach(() => {
    resetMocks();
  });

  describe('POST /api/moisture/readings/batch', () => {
    it('should handle batch create operation successfully', async () => {
      const { req, res } = createMockRequestResponse('POST', [mockBatchOperations.create]);
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      const data = parseResponse(res);
      
      expect(data.results).toHaveLength(1);
      expect(data.results[0]).toMatchObject({
        success: true,
        id: expect.any(String)
      });
      expect(data.summary.successful).toBe(1);
      expect(data.summary.failed).toBe(0);

      expect(mockPrisma.moistureReading.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            locationX: mockBatchOperations.create.data.locationX,
            locationY: mockBatchOperations.create.data.locationY,
            room: mockBatchOperations.create.data.room.toLowerCase() // verify transformation
          })
        })
      );
    });

    it('should handle batch update operation successfully', async () => {
      const { req, res } = createMockRequestResponse('POST', [mockBatchOperations.update]);
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      const data = parseResponse(res);
      
      expect(data.results).toHaveLength(1);
      expect(data.results[0]).toMatchObject({
        success: true,
        id: mockBatchOperations.update.id
      });

      expect(mockPrisma.moistureReading.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockBatchOperations.update.id },
          data: expect.objectContaining({
            room: mockBatchOperations.update.data.room?.toLowerCase() // verify transformation
          })
        })
      );
    });

    it('should handle batch delete operation successfully', async () => {
      const { req, res } = createMockRequestResponse('POST', [mockBatchOperations.delete]);
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      const data = parseResponse(res);
      
      expect(data.results).toHaveLength(1);
      expect(data.results[0]).toMatchObject({
        success: true,
        id: mockBatchOperations.delete.id
      });

      expect(mockPrisma.moistureReading.delete).toHaveBeenCalledWith({
        where: { id: mockBatchOperations.delete.id }
      });
    });

    it('should handle multiple operations in a transaction', async () => {
      const operations = [
        mockBatchOperations.create,
        mockBatchOperations.update,
        mockBatchOperations.delete
      ];
      
      const { req, res } = createMockRequestResponse('POST', operations);
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      const data = parseResponse(res);
      
      expect(data.results).toHaveLength(3);
      expect(data.summary.total).toBe(3);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const invalidOperation = {
        operation: 'create' as const,
        data: {
          // Missing required fields
          jobId: 'job1'
        }
      };

      const { req, res } = createMockRequestResponse('POST', [invalidOperation]);
      await handler(req, res);

      expect(res.statusCode).toBe(400);
      const error = parseResponse(res);
      expect(error.code).toBe(ErrorCode.INVALID_PARAMETERS);
    });

    it('should handle database errors', async () => {
      (mockPrisma.moistureReading.create as jest.Mock).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '5.0.0'
        })
      );

      const { req, res } = createMockRequestResponse('POST', [mockBatchOperations.create]);
      await handler(req, res);

      expect(res.statusCode).toBe(207); // Multi-Status for partial failure
      const data = parseResponse(res);
      expect(data.results[0].success).toBe(false);
      expect(data.summary.failed).toBe(1);
    });

    it('should handle invalid HTTP method', async () => {
      const { req, res } = createMockRequestResponse('GET');
      await handler(req, res);

      expect(res.statusCode).toBe(400);
      const error = parseResponse(res);
      expect(error.code).toBe(ErrorCode.INVALID_REQUEST);
    });

    it('should properly transform and round numeric values', async () => {
      const operation = {
        ...mockBatchOperations.create,
        data: {
          ...mockBatchOperations.create.data,
          locationX: 30.5555,
          locationY: 40.4444,
          temperature: 21.1111
        }
      };

      const { req, res } = createMockRequestResponse('POST', [operation]);
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      
      expect(mockPrisma.moistureReading.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            locationX: 30.56, // Rounded to 2 decimal places
            locationY: 40.44,
            environmentalData: expect.objectContaining({
              temperature: 21.11
            })
          })
        })
      );
    });

    it('should handle partial failures in batch operations', async () => {
      (mockPrisma.moistureReading.update as jest.Mock).mockRejectedValueOnce(
        new Error('Update failed')
      );

      const operations = [
        mockBatchOperations.create,
        mockBatchOperations.update, // This will fail
        mockBatchOperations.delete
      ];

      const { req, res } = createMockRequestResponse('POST', operations);
      await handler(req, res);

      expect(res.statusCode).toBe(207); // Multi-Status
      const data = parseResponse(res);
      
      expect(data.results).toHaveLength(3);
      expect(data.summary.successful).toBe(2);
      expect(data.summary.failed).toBe(1);
      
      // Verify the failed operation
      expect(data.results[1]).toMatchObject({
        success: false,
        id: mockBatchOperations.update.id,
        error: expect.any(String)
      });
    });
  });
});
