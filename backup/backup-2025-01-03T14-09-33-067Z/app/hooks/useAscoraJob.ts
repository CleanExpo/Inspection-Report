import { useState, useCallback } from 'react';
import type { AscoraJob, AscoraError } from '../types/ascora';

interface UseAscoraJobResult {
  job: AscoraJob | null;
  isLoading: boolean;
  error: AscoraError | null;
  verifyJob: (jobId: string, bypassCache?: boolean) => Promise<void>;
  updateJobStatus: (status: AscoraJob['jobStatus']) => Promise<void>;
  syncJobData: (data: Partial<AscoraJob>) => Promise<void>;
  clearJob: () => void;
}

export function useAscoraJob(): UseAscoraJobResult {
  const [job, setJob] = useState<AscoraJob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AscoraError | null>(null);

  const verifyJob = useCallback(async (jobId: string, bypassCache = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ascora/verify-job?jobId=${jobId}&bypassCache=${bypassCache}`);
      const data = await response.json();

      if (!response.ok) {
        throw data.error;
      }

      if (!data.success) {
        throw data.error;
      }

      setJob(data.job);
    } catch (err) {
      setError(err as AscoraError);
      setJob(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateJobStatus = useCallback(async (status: AscoraJob['jobStatus']) => {
    if (!job) {
      setError({
        code: 'NO_ACTIVE_JOB',
        message: 'No active job to update',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ascora/jobs/${job.jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw data.error;
      }

      setJob(data.job);
    } catch (err) {
      setError(err as AscoraError);
    } finally {
      setIsLoading(false);
    }
  }, [job]);

  const syncJobData = useCallback(async (data: Partial<AscoraJob>) => {
    if (!job) {
      setError({
        code: 'NO_ACTIVE_JOB',
        message: 'No active job to sync',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ascora/jobs/${job.jobId}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw responseData.error;
      }

      setJob(responseData.job);
    } catch (err) {
      setError(err as AscoraError);
    } finally {
      setIsLoading(false);
    }
  }, [job]);

  const clearJob = useCallback(() => {
    setJob(null);
    setError(null);
  }, []);

  return {
    job,
    isLoading,
    error,
    verifyJob,
    updateJobStatus,
    syncJobData,
    clearJob,
  };
}
