import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { logger } from './utils/logger';
import { jobQueue, JobType, JobData } from './services/queue';
import { alertService, AlertType, AlertSeverity } from './services/alerts';
import { notificationService } from './services/notifications';

// Load environment variables
config();

const prisma = new PrismaClient();

class Worker {
  private isProcessing: boolean = false;
  private shutdownRequested: boolean = false;

  constructor() {
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    process.on('SIGTERM', this.handleShutdown.bind(this));
    process.on('SIGINT', this.handleShutdown.bind(this));
  }

  private async handleShutdown() {
    logger.info('Shutdown requested, cleaning up...');
    this.shutdownRequested = true;

    if (!this.isProcessing) {
      await this.cleanup();
    }
  }

  private async cleanup() {
    try {
      await jobQueue.shutdown();
      await prisma.$disconnect();
      logger.info('Cleanup completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during cleanup:', error);
      process.exit(1);
    }
  }

  async processJob(job: JobData) {
    try {
      await jobQueue.updateJobStatus(job.id!, { status: 'processing', startedAt: new Date() });

      switch (job.type) {
        case JobType.PROCESS_READINGS:
          await this.processReadings(job.data);
          break;

        case JobType.GENERATE_REPORT:
          await this.generateReport(job.data);
          break;

        case JobType.EQUIPMENT_MAINTENANCE_CHECK:
          await this.checkEquipmentMaintenance();
          break;

        case JobType.CLEANUP_OLD_DATA:
          await this.cleanupOldData();
          break;

        case JobType.PROCESS_NOTIFICATIONS:
          await this.processNotifications(job.data);
          break;

        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }

      await jobQueue.updateJobStatus(job.id!, { 
        status: 'completed', 
        completedAt: new Date(),
        result: 'success'
      });

    } catch (error) {
      logger.error(`Error processing job ${job.type}:`, error);
      
      await jobQueue.updateJobStatus(job.id!, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        failedAt: new Date()
      });

      if ((job.attempts || 0) < (job.maxAttempts || 3)) {
        await this.requeueJob(job);
      } else {
        await jobQueue.moveToDeadLetter(job, error as Error);
      }
    }
  }

  private async processReadings(data: {
    jobId: string;
    readingIds: string[];
    options?: {
      generateAlerts?: boolean;
      analyzePatterns?: boolean;
    }
  }) {
    logger.info('Processing readings:', { jobId: data.jobId, count: data.readingIds.length });
    
    try {
      const readings = await prisma.reading.findMany({
        where: {
          id: { in: data.readingIds },
        },
        include: {
          job: true,
          equipment: true,
        },
      });

      // Process each reading
      for (const reading of readings) {
        // Analyze reading values
        if (reading.value > 80) {
          // Create high moisture alert
          await alertService.createAlert({
            type: AlertType.HIGH_MOISTURE,
            severity: AlertSeverity.HIGH,
            message: `High moisture reading detected: ${reading.value}%`,
            jobId: reading.jobId,
            readingId: reading.id,
          });
        }

        // Update reading status
        await prisma.reading.update({
          where: { id: reading.id },
          data: { processed: true },
        });
      }

      logger.info('Readings processed successfully', { jobId: data.jobId });
    } catch (error) {
      logger.error('Error processing readings:', error);
      throw error;
    }
  }

  private async generateReport(data: {
    jobId: string;
    type: 'INSPECTION' | 'MAINTENANCE' | 'SUMMARY';
    format: 'PDF' | 'CSV' | 'JSON';
    options?: {
      includePhotos?: boolean;
      includeMaps?: boolean;
    }
  }) {
    logger.info('Generating report:', data);
    
    try {
      const job = await prisma.job.findUnique({
        where: { id: data.jobId },
        include: {
          readings: true,
          equipment: true,
          client: true,
        },
      });

      if (!job) {
        throw new Error(`Job not found: ${data.jobId}`);
      }

      // Generate report based on type and format
      // Implementation would go here
      
      // Update job with report information
      await prisma.job.update({
        where: { id: data.jobId },
        data: {
          reports: {
            create: {
              type: data.type,
              format: data.format,
              status: 'COMPLETED',
              url: 'report-url-here', // Would be actual report URL
            },
          },
        },
      });

    } catch (error) {
      logger.error('Error generating report:', error);
      throw error;
    }
  }

  private async checkEquipmentMaintenance() {
    logger.info('Checking equipment maintenance schedules');
    
    try {
      const dueForMaintenance = await prisma.equipment.findMany({
        where: {
          calibrationDue: {
            lte: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          },
          status: 'AVAILABLE',
        },
      });

      for (const equipment of dueForMaintenance) {
        // Create maintenance alert
        await alertService.createAlert({
          type: AlertType.EQUIPMENT_MAINTENANCE,
          severity: AlertSeverity.MEDIUM,
          message: `Equipment ${equipment.name} is due for maintenance`,
          jobId: equipment.jobs[0]?.id, // Use the most recent job if available
          metadata: {
            equipmentId: equipment.id,
            maintenanceType: 'CALIBRATION',
            dueDate: equipment.calibrationDue,
          },
        });

        // Update equipment status
        await prisma.equipment.update({
          where: { id: equipment.id },
          data: { status: 'MAINTENANCE' },
        });

        logger.info(`Maintenance alert created for equipment ${equipment.id}`);
      }
    } catch (error) {
      logger.error('Error checking equipment maintenance:', error);
      throw error;
    }
  }

  private async cleanupOldData() {
    logger.info('Running data cleanup task');
    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    try {
      // Archive old readings
      await prisma.reading.updateMany({
        where: {
          createdAt: {
            lt: sixMonthsAgo,
          },
          archived: false,
        },
        data: {
          archived: true,
        },
      });

      // Archive old jobs
      await prisma.job.updateMany({
        where: {
          createdAt: {
            lt: sixMonthsAgo,
          },
          status: 'COMPLETED',
          archived: false,
        },
        data: {
          archived: true,
        },
      });

      logger.info('Data cleanup completed successfully');
    } catch (error) {
      logger.error('Error during data cleanup:', error);
      throw error;
    }
  }

  private async processNotifications(data: {
    alertId: string;
    options: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
      slack?: boolean;
    }
  }) {
    logger.info('Processing notifications:', data);
    
    try {
      await notificationService.processAlertNotification(
        data.alertId,
        data.options
      );
      
      logger.info('Notifications processed successfully', { alertId: data.alertId });
    } catch (error) {
      logger.error('Error processing notifications:', error);
      throw error;
    }
  }

  private async requeueJob(job: JobData) {
    const attempts = (job.attempts || 0) + 1;
    const backoffTime = Math.pow(2, attempts) * 1000; // Exponential backoff

    await jobQueue.addJob({
      ...job,
      attempts,
      delay: backoffTime,
    });

    logger.info(`Job ${job.id} requeued with ${attempts} attempts`);
  }

  async start() {
    try {
      logger.info('Worker started, processing jobs...');

      // Start processing delayed jobs periodically
      const delayedJobsInterval = setInterval(() => {
        if (!this.shutdownRequested) {
          jobQueue.processDelayedJobs().catch(error => {
            logger.error('Error processing delayed jobs:', error);
          });
        }
      }, 1000);

      // Main job processing loop
      while (!this.shutdownRequested) {
        this.isProcessing = false;
        
        try {
          const queueLength = await jobQueue.getQueueLength();
          if (queueLength > 0) {
            logger.info(`Current queue length: ${queueLength}`);
          }

          // Process dead letter queue periodically
          if (queueLength === 0) {
            await jobQueue.retryDeadLetterJobs();
          }

        } catch (error) {
          logger.error('Error in job processing loop:', error);
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

      clearInterval(delayedJobsInterval);
      await this.cleanup();
    } catch (error) {
      logger.error('Worker error:', error);
      await this.cleanup();
    }
  }
}

// Start worker if running directly
if (require.main === module) {
  const worker = new Worker();
  worker.start().catch((error) => {
    logger.error('Failed to start worker:', error);
    process.exit(1);
  });
}

export { Worker };
