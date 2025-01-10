import { logger } from '../utils/logger';
import { jobQueue, JobType } from './queue';

interface ScheduleConfig {
  equipmentMaintenanceCheck: {
    cronExpression: string;  // e.g., '0 0 * * *' for daily at midnight
    enabled: boolean;
  };
  dataCleanup: {
    cronExpression: string;  // e.g., '0 0 1 * *' for monthly
    enabled: boolean;
  };
  deadLetterQueueRetry: {
    cronExpression: string;  // e.g., '0 */4 * * *' every 4 hours
    enabled: boolean;
  };
}

class JobScheduler {
  private scheduleTimers: NodeJS.Timeout[] = [];
  private readonly defaultConfig: ScheduleConfig = {
    equipmentMaintenanceCheck: {
      cronExpression: '0 0 * * *', // Daily at midnight
      enabled: true,
    },
    dataCleanup: {
      cronExpression: '0 0 1 * *', // Monthly on the 1st
      enabled: true,
    },
    deadLetterQueueRetry: {
      cronExpression: '0 */4 * * *', // Every 4 hours
      enabled: true,
    },
  };

  constructor(private config: ScheduleConfig = {} as ScheduleConfig) {
    this.config = { ...this.defaultConfig, ...config };
  }

  start() {
    logger.info('Starting job scheduler...');

    if (this.config.equipmentMaintenanceCheck.enabled) {
      this.scheduleEquipmentMaintenanceCheck();
    }

    if (this.config.dataCleanup.enabled) {
      this.scheduleDataCleanup();
    }

    if (this.config.deadLetterQueueRetry.enabled) {
      this.scheduleDeadLetterQueueRetry();
    }

    logger.info('Job scheduler started successfully');
  }

  stop() {
    logger.info('Stopping job scheduler...');
    this.scheduleTimers.forEach(timer => clearTimeout(timer));
    this.scheduleTimers = [];
    logger.info('Job scheduler stopped');
  }

  private scheduleEquipmentMaintenanceCheck() {
    this.scheduleJob(
      'Equipment Maintenance Check',
      this.config.equipmentMaintenanceCheck.cronExpression,
      async () => {
        await jobQueue.addJob({
          type: JobType.EQUIPMENT_MAINTENANCE_CHECK,
          data: {
            timestamp: new Date().toISOString(),
          },
        });
      }
    );
  }

  private scheduleDataCleanup() {
    this.scheduleJob(
      'Data Cleanup',
      this.config.dataCleanup.cronExpression,
      async () => {
        await jobQueue.addJob({
          type: JobType.CLEANUP_OLD_DATA,
          data: {
            timestamp: new Date().toISOString(),
          },
        });
      }
    );
  }

  private scheduleDeadLetterQueueRetry() {
    this.scheduleJob(
      'Dead Letter Queue Retry',
      this.config.deadLetterQueueRetry.cronExpression,
      async () => {
        await jobQueue.retryDeadLetterJobs();
      }
    );
  }

  private scheduleJob(name: string, cronExpression: string, job: () => Promise<void>) {
    const scheduleNextRun = () => {
      const nextRun = this.getNextRunTime(cronExpression);
      const delay = nextRun.getTime() - Date.now();

      const timer = setTimeout(async () => {
        try {
          logger.info(`Running scheduled job: ${name}`);
          await job();
          logger.info(`Completed scheduled job: ${name}`);
        } catch (error) {
          logger.error(`Error in scheduled job ${name}:`, error);
        } finally {
          // Schedule next run
          scheduleNextRun();
        }
      }, delay);

      this.scheduleTimers.push(timer);
      logger.info(`Scheduled ${name} to run at ${nextRun.toISOString()}`);
    };

    // Start the scheduling
    scheduleNextRun();
  }

  private getNextRunTime(cronExpression: string): Date {
    // Parse cron expression and calculate next run time
    const [minute, hour, dayOfMonth, month, dayOfWeek] = cronExpression.split(' ');
    const now = new Date();
    const next = new Date(now);

    // Simple cron parser for basic expressions
    // In a production environment, use a proper cron parser library
    if (minute === '*') next.setMinutes(now.getMinutes() + 1);
    else next.setMinutes(parseInt(minute));

    if (hour === '*') next.setHours(now.getHours());
    else next.setHours(parseInt(hour));

    if (dayOfMonth === '*') next.setDate(now.getDate());
    else next.setDate(parseInt(dayOfMonth));

    if (month === '*') next.setMonth(now.getMonth());
    else next.setMonth(parseInt(month) - 1);

    // If the calculated time is in the past, add appropriate interval
    if (next.getTime() <= now.getTime()) {
      if (minute === '*') next.setMinutes(now.getMinutes() + 1);
      else if (hour === '*') next.setHours(now.getHours() + 1);
      else if (dayOfMonth === '*') next.setDate(now.getDate() + 1);
      else if (month === '*') next.setMonth(now.getMonth() + 1);
    }

    return next;
  }

  updateSchedule(newConfig: Partial<ScheduleConfig>) {
    logger.info('Updating job scheduler configuration...');
    this.stop();
    this.config = { ...this.config, ...newConfig };
    this.start();
    logger.info('Job scheduler configuration updated');
  }

  getStatus() {
    return {
      isRunning: this.scheduleTimers.length > 0,
      config: this.config,
      activeTimers: this.scheduleTimers.length,
    };
  }
}

// Export singleton instance
export const jobScheduler = new JobScheduler();
