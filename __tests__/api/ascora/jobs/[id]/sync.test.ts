import { describe, expect, test, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST } from '../../../../../app/api/ascora/jobs/[id]/sync/route';
import { ascoraService } from '../../../../../app/services/ascoraService';
import type { AscoraJob, AscoraError } from '../../../../../app/types/ascora';

// Mock ASCORA service
jest.mock('../../../../../app/services/ascoraService', () => ({
  ascoraService: {
    syncJobData: jest.fn().mockImplementation(() => Promise.resolve(null)),
  },
}));

describe('job sync API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockJob: AscoraJob = {
    jobId: '123',
    propertyDetails: {
      address: '123 Test St',
      propertyType: 'Residential',
      contactName: 'John Doe',
      contactPhone: '555-0123',
    },
    insuranceDetails: {
      company: 'Test Insurance',
      policyNumber: 'POL123',
      claimNumber: 'CLM456',
    },
    jobStatus: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('POST /api/ascora/jobs/[id]/sync', () => {
    test('should sync job data successfully', async () => {
      const updatedJob = {
        ...mockJob,
        propertyDetails: {
          ...mockJob.propertyDetails,
          address: '456 New St',
        },
      };
      (ascoraService.syncJobData as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve(updatedJob)
      );

      const request = new NextRequest('http://localhost:3000/api/ascora/jobs/123/sync', {
        method: 'POST',
        body: JSON.stringify({
          propertyDetails: {
            ...mockJob.propertyDetails,
            address: '456 New St',
          },
        }),
      });

      const response = await POST(request, { params: { id: '123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        job: updatedJob,
      });
      expect(ascoraService.syncJobData).toHaveBeenCalledWith('123', {
        propertyDetails: {
          ...mockJob.propertyDetails,
          address: '456 New St',
        },
      });
    });

    test('should return error if data is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/ascora/jobs/123/sync', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request, { params: { id: '123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        success: false,
        error: {
          code: 'INVALID_DATA',
          message: 'Invalid job data provided',
        },
      });
    });

    test('should validate property details format', async () => {
      const request = new NextRequest('http://localhost:3000/api/ascora/jobs/123/sync', {
        method: 'POST',
        body: JSON.stringify({
          propertyDetails: {
            address: 123, // Invalid type
          },
        }),
      });

      const response = await POST(request, { params: { id: '123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        success: false,
        error: {
          code: 'INVALID_PROPERTY_DETAILS',
          message: 'Invalid property details format',
        },
      });
    });

    test('should validate insurance details format', async () => {
      const request = new NextRequest('http://localhost:3000/api/ascora/jobs/123/sync', {
        method: 'POST',
        body: JSON.stringify({
          insuranceDetails: {
            company: 123, // Invalid type
          },
        }),
      });

      const response = await POST(request, { params: { id: '123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        success: false,
        error: {
          code: 'INVALID_INSURANCE_DETAILS',
          message: 'Invalid insurance details format',
        },
      });
    });

    test('should handle ASCORA API errors', async () => {
      const mockError: AscoraError = {
        code: 'JOB_NOT_FOUND',
        message: 'Job not found',
      };
      (ascoraService.syncJobData as jest.Mock).mockImplementationOnce(() => 
        Promise.reject(mockError)
      );

      const request = new NextRequest('http://localhost:3000/api/ascora/jobs/999/sync', {
        method: 'POST',
        body: JSON.stringify({
          propertyDetails: mockJob.propertyDetails,
        }),
      });

      const response = await POST(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        success: false,
        error: mockError,
      });
    });

    test('should handle validation errors from ASCORA API', async () => {
      const mockError: AscoraError = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid data provided',
      };
      (ascoraService.syncJobData as jest.Mock).mockImplementationOnce(() => 
        Promise.reject(mockError)
      );

      const request = new NextRequest('http://localhost:3000/api/ascora/jobs/123/sync', {
        method: 'POST',
        body: JSON.stringify({
          propertyDetails: mockJob.propertyDetails,
        }),
      });

      const response = await POST(request, { params: { id: '123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        success: false,
        error: mockError,
      });
    });

    test('should handle rate limiting errors', async () => {
      const mockError: AscoraError = {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
      };
      (ascoraService.syncJobData as jest.Mock).mockImplementationOnce(() => 
        Promise.reject(mockError)
      );

      const request = new NextRequest('http://localhost:3000/api/ascora/jobs/123/sync', {
        method: 'POST',
        body: JSON.stringify({
          propertyDetails: mockJob.propertyDetails,
        }),
      });

      const response = await POST(request, { params: { id: '123' } });
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data).toEqual({
        success: false,
        error: mockError,
      });
    });

    test('should handle authentication errors', async () => {
      const mockError: AscoraError = {
        code: 'INVALID_API_KEY',
        message: 'Invalid API key',
      };
      (ascoraService.syncJobData as jest.Mock).mockImplementationOnce(() => 
        Promise.reject(mockError)
      );

      const request = new NextRequest('http://localhost:3000/api/ascora/jobs/123/sync', {
        method: 'POST',
        body: JSON.stringify({
          propertyDetails: mockJob.propertyDetails,
        }),
      });

      const response = await POST(request, { params: { id: '123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: 'Failed to authenticate with ASCORA API',
        },
      });
    });

    test('should handle internal errors', async () => {
      (ascoraService.syncJobData as jest.Mock).mockImplementationOnce(() => 
        Promise.reject(new Error('Internal error'))
      );

      const request = new NextRequest('http://localhost:3000/api/ascora/jobs/123/sync', {
        method: 'POST',
        body: JSON.stringify({
          propertyDetails: mockJob.propertyDetails,
        }),
      });

      const response = await POST(request, { params: { id: '123' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to process the request',
        },
      });
    });
  });
});
