import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useAscoraJob } from '../../app/hooks/useAscoraJob';
import type { AscoraJob, AscoraError } from '../../app/types/ascora';

// Mock fetch with proper Response type
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('useAscoraJob', () => {
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

  describe('verifyJob', () => {
    test('should verify job successfully', async () => {
      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({
          success: true,
          job: mockJob,
          cached: false,
        }),
        { status: 200 }
      ));

      const { result } = renderHook(() => useAscoraJob());

      await act(async () => {
        await result.current.verifyJob('123');
      });

      expect(result.current.job).toEqual(mockJob);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/ascora/verify-job?jobId=123&bypassCache=false',
        expect.any(Object)
      );
    });

    test('should handle verification error', async () => {
      const mockError: AscoraError = {
        code: 'JOB_NOT_FOUND',
        message: 'Job not found',
      };

      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({
          success: false,
          error: mockError,
        }),
        { status: 404 }
      ));

      const { result } = renderHook(() => useAscoraJob());

      await act(async () => {
        await result.current.verifyJob('999');
      });

      expect(result.current.job).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toEqual(mockError);
    });

    test('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAscoraJob());

      await act(async () => {
        await result.current.verifyJob('123');
      });

      expect(result.current.job).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toEqual({
        code: 'NETWORK_ERROR',
        message: 'Network error',
      });
    });
  });

  describe('updateJobStatus', () => {
    test('should update job status successfully', async () => {
      const updatedJob = { ...mockJob, jobStatus: 'completed' };

      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({
          success: true,
          job: updatedJob,
        }),
        { status: 200 }
      ));

      const { result } = renderHook(() => useAscoraJob());
      result.current.job = mockJob; // Set initial job

      await act(async () => {
        await result.current.updateJobStatus('completed');
      });

      expect(result.current.job).toEqual(updatedJob);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/ascora/jobs/${mockJob.jobId}/status`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'completed' }),
        })
      );
    });

    test('should handle update error', async () => {
      const mockError: AscoraError = {
        code: 'INVALID_STATUS',
        message: 'Invalid status',
      };

      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({
          success: false,
          error: mockError,
        }),
        { status: 400 }
      ));

      const { result } = renderHook(() => useAscoraJob());
      result.current.job = mockJob;

      await act(async () => {
        await result.current.updateJobStatus('invalid_status' as any);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toEqual(mockError);
    });

    test('should handle no active job', async () => {
      const { result } = renderHook(() => useAscoraJob());

      await act(async () => {
        await result.current.updateJobStatus('completed');
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toEqual({
        code: 'NO_ACTIVE_JOB',
        message: 'No active job to update',
      });
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('syncJobData', () => {
    test('should sync job data successfully', async () => {
      const updatedJob = {
        ...mockJob,
        propertyDetails: {
          ...mockJob.propertyDetails,
          address: '456 New St',
        },
      };

      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({
          success: true,
          job: updatedJob,
        }),
        { status: 200 }
      ));

      const { result } = renderHook(() => useAscoraJob());
      result.current.job = mockJob;

      await act(async () => {
        await result.current.syncJobData({
          propertyDetails: {
            ...mockJob.propertyDetails,
            address: '456 New St',
          },
        });
      });

      expect(result.current.job).toEqual(updatedJob);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/ascora/jobs/${mockJob.jobId}/sync`,
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String),
        })
      );
    });

    test('should handle sync error', async () => {
      const mockError: AscoraError = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid data',
      };

      mockFetch.mockResolvedValueOnce(new Response(
        JSON.stringify({
          success: false,
          error: mockError,
        }),
        { status: 400 }
      ));

      const { result } = renderHook(() => useAscoraJob());
      result.current.job = mockJob;

      await act(async () => {
        await result.current.syncJobData({
          propertyDetails: {
            ...mockJob.propertyDetails,
            address: '',
          },
        });
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toEqual(mockError);
    });

    test('should handle no active job', async () => {
      const { result } = renderHook(() => useAscoraJob());

      await act(async () => {
        await result.current.syncJobData({
          propertyDetails: mockJob.propertyDetails,
        });
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toEqual({
        code: 'NO_ACTIVE_JOB',
        message: 'No active job to sync',
      });
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('clearJob', () => {
    test('should clear job and error state', () => {
      const { result } = renderHook(() => useAscoraJob());
      result.current.job = mockJob;
      result.current.error = {
        code: 'SOME_ERROR',
        message: 'Some error',
      };

      act(() => {
        result.current.clearJob();
      });

      expect(result.current.job).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });
});
