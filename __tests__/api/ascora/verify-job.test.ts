import { describe, expect, test, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST, GET } from '../../../app/api/ascora/verify-job/route';
import { ascoraService } from '../../../app/services/ascoraService';
import type { AscoraJob, AscoraError } from '../../../app/types/ascora';

// Mock ASCORA service
jest.mock('../../../app/services/ascoraService', () => ({
  ascoraService: {
    verifyJob: jest.fn().mockImplementation(() => Promise.resolve({
      job: null,
      cached: false,
    })),
  },
}));

describe('verify-job API', () => {
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

  describe('POST /api/ascora/verify-job', () => {
    test('should verify job successfully', async () => {
      const mockResponse = { job: mockJob, cached: false };
      (ascoraService.verifyJob as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve(mockResponse)
      );

      const request = new NextRequest('http://localhost:3000/api/ascora/verify-job', {
        method: 'POST',
        body: JSON.stringify({ jobId: '123' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        job: mockJob,
        cached: false,
      });
    });

    test('should return error if jobId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/ascora/verify-job', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        success: false,
        error: {
          code: 'INVALID_JOB_ID',
          message: 'Job ID is required',
        },
      });
    });

    test('should handle ASCORA API errors', async () => {
      const mockError: AscoraError = {
        code: 'JOB_NOT_FOUND',
        message: 'Job not found',
      };
      (ascoraService.verifyJob as jest.Mock).mockImplementationOnce(() => 
        Promise.reject(mockError)
      );

      const request = new NextRequest('http://localhost:3000/api/ascora/verify-job', {
        method: 'POST',
        body: JSON.stringify({ jobId: '999' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        success: false,
        error: mockError,
      });
    });

    test('should handle internal errors', async () => {
      (ascoraService.verifyJob as jest.Mock).mockImplementationOnce(() => 
        Promise.reject(new Error('Internal error'))
      );

      const request = new NextRequest('http://localhost:3000/api/ascora/verify-job', {
        method: 'POST',
        body: JSON.stringify({ jobId: '123' }),
      });

      const response = await POST(request);
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

  describe('GET /api/ascora/verify-job', () => {
    test('should verify job successfully', async () => {
      const mockResponse = { job: mockJob, cached: false };
      (ascoraService.verifyJob as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve(mockResponse)
      );

      const url = new URL('http://localhost:3000/api/ascora/verify-job');
      url.searchParams.set('jobId', '123');
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        job: mockJob,
        cached: false,
      });
    });

    test('should return error if jobId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/ascora/verify-job');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        success: false,
        error: {
          code: 'INVALID_JOB_ID',
          message: 'Job ID is required',
        },
      });
    });

    test('should handle bypass cache parameter', async () => {
      const mockResponse = { job: mockJob, cached: false };
      (ascoraService.verifyJob as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve(mockResponse)
      );

      const url = new URL('http://localhost:3000/api/ascora/verify-job');
      url.searchParams.set('jobId', '123');
      url.searchParams.set('bypassCache', 'true');
      const request = new NextRequest(url);

      await GET(request);

      expect(ascoraService.verifyJob).toHaveBeenCalledWith('123', true);
    });
  });
});
