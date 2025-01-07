import { describe, expect, test, beforeEach } from '@jest/globals';
import { ascoraService } from '../../app/services/ascoraService';
import type { AscoraJob } from '../../app/types/ascora';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('AscoraService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ASCORA_API_KEY = 'test-api-key';
    process.env.ASCORA_API_URL = 'https://api.ascora.com/v1';
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
    test('should verify job and return job data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ job: mockJob }),
      });

      const { job, cached } = await ascoraService.verifyJob('123');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.ascora.com/v1/jobs/123/verify',
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json',
          },
        })
      );

      expect(job).toEqual(mockJob);
      expect(cached).toBe(false);
    });

    test('should return cached job if available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ job: mockJob }),
      });

      // First call to cache the job
      await ascoraService.verifyJob('123');

      // Second call should return cached job
      const { job, cached } = await ascoraService.verifyJob('123');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(job).toEqual(mockJob);
      expect(cached).toBe(true);
    });

    test('should bypass cache when requested', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ job: mockJob }),
      });

      // First call to cache the job
      await ascoraService.verifyJob('123');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ job: { ...mockJob, jobStatus: 'completed' } }),
      });

      // Second call with bypass cache
      const { job, cached } = await ascoraService.verifyJob('123', true);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(job.jobStatus).toBe('completed');
      expect(cached).toBe(false);
    });

    test('should throw error if API key is not configured', async () => {
      process.env.ASCORA_API_KEY = '';

      await expect(ascoraService.verifyJob('123')).rejects.toThrow('ASCORA_API_KEY is not configured');
    });

    test('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({
          code: 'JOB_NOT_FOUND',
          message: 'Job not found',
        }),
      });

      await expect(ascoraService.verifyJob('999')).rejects.toEqual({
        code: 'JOB_NOT_FOUND',
        message: 'Job not found',
      });
    });
  });

  describe('updateJobStatus', () => {
    test('should update job status', async () => {
      const updatedJob = { ...mockJob, jobStatus: 'completed' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ job: updatedJob }),
      });

      const result = await ascoraService.updateJobStatus('123', 'completed');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.ascora.com/v1/jobs/123/status',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'completed' }),
        })
      );

      expect(result).toEqual(updatedJob);
    });

    test('should update cache after status update', async () => {
      // First verify to cache the job
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ job: mockJob }),
      });
      await ascoraService.verifyJob('123');

      // Update status
      const updatedJob = { ...mockJob, jobStatus: 'completed' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ job: updatedJob }),
      });
      await ascoraService.updateJobStatus('123', 'completed');

      // Get job from cache
      const { job, cached } = await ascoraService.verifyJob('123');
      expect(job.jobStatus).toBe('completed');
      expect(cached).toBe(true);
    });
  });

  describe('syncJobData', () => {
    test('should sync job data', async () => {
      const updatedJob = {
        ...mockJob,
        propertyDetails: {
          ...mockJob.propertyDetails,
          address: '456 New St',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ job: updatedJob }),
      });

      const result = await ascoraService.syncJobData('123', {
        propertyDetails: {
          ...mockJob.propertyDetails,
          address: '456 New St',
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.ascora.com/v1/jobs/123/sync',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            propertyDetails: {
              ...mockJob.propertyDetails,
              address: '456 New St',
            },
          }),
        })
      );

      expect(result).toEqual(updatedJob);
    });

    test('should update cache after sync', async () => {
      // First verify to cache the job
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ job: mockJob }),
      });
      await ascoraService.verifyJob('123');

      // Sync data
      const updatedJob = {
        ...mockJob,
        propertyDetails: {
          ...mockJob.propertyDetails,
          address: '456 New St',
        },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ job: updatedJob }),
      });
      await ascoraService.syncJobData('123', {
        propertyDetails: {
          ...mockJob.propertyDetails,
          address: '456 New St',
        },
      });

      // Get job from cache
      const { job, cached } = await ascoraService.verifyJob('123');
      expect(job.propertyDetails.address).toBe('456 New St');
      expect(cached).toBe(true);
    });
  });

  describe('clearCache', () => {
    test('should clear cache for specific job', async () => {
      // First verify to cache the job
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ job: mockJob }),
      });
      await ascoraService.verifyJob('123');

      // Clear cache for job
      ascoraService.clearCache('123');

      // Verify should hit API again
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ job: mockJob }),
      });
      const { cached } = await ascoraService.verifyJob('123');
      expect(cached).toBe(false);
    });

    test('should clear entire cache when no job ID provided', async () => {
      // Cache multiple jobs
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ job: mockJob }),
      });
      await ascoraService.verifyJob('123');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ job: { ...mockJob, jobId: '456' } }),
      });
      await ascoraService.verifyJob('456');

      // Clear all cache
      ascoraService.clearCache();

      // Verify both jobs should hit API again
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ job: mockJob }),
      });
      const result1 = await ascoraService.verifyJob('123');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ job: { ...mockJob, jobId: '456' } }),
      });
      const result2 = await ascoraService.verifyJob('456');

      expect(result1.cached).toBe(false);
      expect(result2.cached).toBe(false);
    });
  });
});
