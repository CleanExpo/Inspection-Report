import type { AscoraJob, AscoraJobCache, AscoraError, AscoraConfig } from '../types/ascora';

class AscoraService {
  private config: AscoraConfig;
  private cache: Map<string, AscoraJobCache>;

  constructor() {
    this.config = {
      apiKey: process.env.ASCORA_API_KEY || '',
      apiUrl: process.env.ASCORA_API_URL || 'https://api.ascora.com/v1',
      cacheTimeout: parseInt(process.env.ASCORA_CACHE_TIMEOUT || '300000', 10), // 5 minutes default
    };
    this.cache = new Map();
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    if (!this.config.apiKey) {
      throw new Error('ASCORA_API_KEY is not configured');
    }

    const response = await fetch(`${this.config.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred',
      } as AscoraError;
    }

    return response.json();
  }

  private getCachedJob(jobId: string): AscoraJob | null {
    const cached = this.cache.get(jobId);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.config.cacheTimeout) {
      this.cache.delete(jobId);
      return null;
    }

    return cached.job;
  }

  private setCachedJob(jobId: string, job: AscoraJob) {
    this.cache.set(jobId, {
      job,
      timestamp: Date.now(),
    });
  }

  async verifyJob(jobId: string, bypassCache = false): Promise<{ job: AscoraJob; cached: boolean }> {
    // Check cache first unless bypass is requested
    if (!bypassCache) {
      const cachedJob = this.getCachedJob(jobId);
      if (cachedJob) {
        return { job: cachedJob, cached: true };
      }
    }

    try {
      const response = await this.fetchWithAuth(`/jobs/${jobId}/verify`);
      const job = response.job as AscoraJob;

      // Cache the successful response
      this.setCachedJob(jobId, job);

      return { job, cached: false };
    } catch (error) {
      throw error as AscoraError;
    }
  }

  async getJobDetails(jobId: string): Promise<AscoraJob> {
    try {
      const response = await this.fetchWithAuth(`/jobs/${jobId}`);
      return response.job;
    } catch (error) {
      throw error as AscoraError;
    }
  }

  async updateJobStatus(jobId: string, status: AscoraJob['jobStatus']): Promise<AscoraJob> {
    try {
      const response = await this.fetchWithAuth(`/jobs/${jobId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      // Update cache if exists
      const cachedJob = this.getCachedJob(jobId);
      if (cachedJob) {
        cachedJob.jobStatus = status;
        this.setCachedJob(jobId, cachedJob);
      }

      return response.job;
    } catch (error) {
      throw error as AscoraError;
    }
  }

  async syncJobData(jobId: string, data: Partial<AscoraJob>): Promise<AscoraJob> {
    try {
      const response = await this.fetchWithAuth(`/jobs/${jobId}/sync`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // Update cache if exists
      const cachedJob = this.getCachedJob(jobId);
      if (cachedJob) {
        this.setCachedJob(jobId, { ...cachedJob, ...response.job });
      }

      return response.job;
    } catch (error) {
      throw error as AscoraError;
    }
  }

  clearCache(jobId?: string) {
    if (jobId) {
      this.cache.delete(jobId);
    } else {
      this.cache.clear();
    }
  }
}

// Export singleton instance
export const ascoraService = new AscoraService();
