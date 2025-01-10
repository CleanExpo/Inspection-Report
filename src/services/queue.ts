import { createClient } from 'redis';
import { logger } from '../utils/logger';

export enum JobType {
  PROCESS_READINGS = 'PROCESS_READINGS',
  GENERATE_REPORT = 'GENERATE_REPORT',
  EQUIPMENT_MAINTENANCE_CHECK = 'EQUIPMENT_MAINTENANCE_CHECK',
  CLEANUP_OLD_DATA = 'CLEANUP_OLD_DATA',
  PROCESS_NOTIFICATIONS = 'PROCESS_NOTIFICATIONS',
}

export interface JobData {
  id?: string;
  type: JobType;
  data: any;
  priority?: number;
  attempts?: number;
  maxAttempts?: number;
  delay?: number;
  timestamp?: number;
}

interface QueueItem {
  type: string;
  _count: number;
}

class JobQueue {
  private redis;
  private readonly defaultQueue = 'job_queue';
  private readonly deadLetterQueue = 'dead_letter_queue';

  constructor() {
    this.redis = createClient({
      url: process.env.REDIS_URL,
      password: process.env.REDIS_PASSWORD,
    });

    this.redis.on('error', (err) => {
      logger.error('Redis Queue Error:', err);
    });

    this.connect();
  }

  private async connect() {
    try {
      await this.redis.connect();
      logger.info('Job Queue connected to Redis');
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async addJob(jobData: JobData): Promise<string> {
    try {
      const job = {
        ...jobData,
        id: jobData.id || crypto.randomUUID(),
        timestamp: Date.now(),
        attempts: 0,
        maxAttempts: jobData.maxAttempts || 3,
      };

      if (jobData.delay) {
        // Add to delayed queue
        const executeAt = Date.now() + jobData.delay;
        await this.redis.zAdd('delayed_jobs', {
          score: executeAt,
          value: JSON.stringify(job),
        });
        logger.info(`Job ${job.id} scheduled for ${new Date(executeAt)}`);
      } else {
        // Add to main queue based on priority
        const queue = jobData.priority ? `${this.defaultQueue}:${jobData.priority}` : this.defaultQueue;
        await this.redis.lPush(queue, JSON.stringify(job));
        logger.info(`Job ${job.id} added to queue ${queue}`);
      }

      return job.id;
    } catch (error) {
      logger.error('Error adding job to queue:', error);
      throw error;
    }
  }

  async processDelayedJobs() {
    try {
      const now = Date.now();
      const jobs = await this.redis.zRangeByScore('delayed_jobs', '-inf', now);

      for (const jobString of jobs) {
        const job = JSON.parse(jobString);
        await this.addJob(job);
        await this.redis.zRem('delayed_jobs', jobString);
      }
    } catch (error) {
      logger.error('Error processing delayed jobs:', error);
    }
  }

  async moveToDeadLetter(job: JobData, error: Error) {
    try {
      const deadJob = {
        ...job,
        error: {
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
        },
      };

      await this.redis.lPush(this.deadLetterQueue, JSON.stringify(deadJob));
      logger.warn(`Job ${job.id} moved to dead letter queue`);
    } catch (error) {
      logger.error('Error moving job to dead letter queue:', error);
    }
  }

  async retryDeadLetterJobs() {
    try {
      const job = await this.redis.rPop(this.deadLetterQueue);
      if (job) {
        const parsedJob = JSON.parse(job);
        // Reset attempts and add back to main queue
        parsedJob.attempts = 0;
        await this.addJob(parsedJob);
        logger.info(`Job ${parsedJob.id} retried from dead letter queue`);
      }
    } catch (error) {
      logger.error('Error retrying dead letter jobs:', error);
    }
  }

  async getQueueLength(queue: string = this.defaultQueue): Promise<number> {
    try {
      return await this.redis.lLen(queue);
    } catch (error) {
      logger.error('Error getting queue length:', error);
      throw error;
    }
  }

  async clearQueue(queue: string = this.defaultQueue): Promise<void> {
    try {
      await this.redis.del(queue);
      logger.info(`Queue ${queue} cleared`);
    } catch (error) {
      logger.error('Error clearing queue:', error);
      throw error;
    }
  }

  async getJobStatus(jobId: string): Promise<any> {
    try {
      const status = await this.redis.get(`job:${jobId}:status`);
      return status ? JSON.parse(status) : null;
    } catch (error) {
      logger.error('Error getting job status:', error);
      throw error;
    }
  }

  async updateJobStatus(jobId: string, status: any): Promise<void> {
    try {
      await this.redis.set(`job:${jobId}:status`, JSON.stringify(status));
    } catch (error) {
      logger.error('Error updating job status:', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    try {
      await this.redis.quit();
      logger.info('Job Queue disconnected from Redis');
    } catch (error) {
      logger.error('Error shutting down job queue:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const jobQueue = new JobQueue();
