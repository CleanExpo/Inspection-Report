import { describe, expect, test, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { PATCH } from '../../../../../app/api/ascora/jobs/[id]/status/route';
import { ascoraService } from '../../../../../app/services/ascoraService';
import type { AscoraJob, AscoraError } from '../../../../../app/types/ascora';

// Mock ASCORA service
jest.mock('../../../../../app/services/ascoraService', () => ({
  ascoraService: {
    updateJobStatus: jest.fn().mockImplementation(() => Promise.resolve(null)),
  },
}));

describe('job status API', () => {
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

  describe('PATCH /api/ascora/jobs/[id]/status', () => {
    test('should update job status successfully', async () => {
      const updatedJob = { ...mockJob, jobStatus: 'completed' };
      (ascoraService.updateJobStatus as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve(updatedJob)
      );

      const request = new NextRequest('http://localhost:3000/api/ascora/jobs/123/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
      });

      const response = await PATCH(request, { params: { id: '123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        job: updatedJob,
      });
      expect(ascoraService.updateJobStatus).toHaveBeenCalledWith('123', 'completed');
    });

    test('should return error if status is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/ascora/jobs/123/status', {
        method: 'PATCH',
        body: JSON.stringify({}),
      });

      const response = await PATCH(request, { params: { id: '123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid job status provided',
        },
      });
    });

    test('should return error if status is invalid', async () => {
      const request = new NextRequest('http://localhost:3000/api/ascora/jobs/123/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'invalid_status' }),
      });

      const response = await PATCH(request, { params: { id: '123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid job status provided',
        },
      });
    });

    test('should handle ASCORA API errors', async () => {
      const mockError: AscoraError = {
        code: 'JOB_NOT_FOUND',
        message: 'Job not found',
      };
      (ascoraService.updateJobStatus as jest.Mock).mockImplementationOnce(() => 
        Promise.reject(mockError)
      );

      const request = new NextRequest('http://localhost:3000/api/ascora/jobs/999/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
      });

      const response = await PATCH(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        success: false,
        error: mockError,
      });
    });

    test('should handle internal errors', async () => {
      (ascoraService.updateJobStatus as jest.Mock).mockImplementationOnce(() => 
        Promise.reject(new Error('Internal error'))
      );

      const request = new NextRequest('http://localhost:3000/api/ascora/jobs/123/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
      });

      const response = await PATCH(request, { params: { id: '123' } });
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

    test('should handle rate limiting errors', async () => {
      const mockError: AscoraError = {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
      };
      (ascoraService.updateJobStatus as jest.Mock).mockImplementationOnce(() => 
        Promise.reject(mockError)
      );

      const request = new NextRequest('http://localhost:3000/api/ascora/jobs/123/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
      });

      const response = await PATCH(request, { params: { id: '123' } });
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
      (ascoraService.updateJobStatus as jest.Mock).mockImplementationOnce(() => 
        Promise.reject(mockError)
      );

      const request = new NextRequest('http://localhost:3000/api/ascora/jobs/123/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
      });

      const response = await PATCH(request, { params: { id: '123' } });
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
  });
});
