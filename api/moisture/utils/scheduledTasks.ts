import { logger } from './logger';
import { LogRotation } from './logRotation';

/**
 * Scheduled task configuration
 */
/** Interval for log rotation (24 hours in milliseconds) */
const ROTATION_INTERVAL = 24 * 60 * 60 * 1000;

/** Log rotation instance with default configuration */
const logRotation = new LogRotation({
  retentionDays: 30, // Keep logs for 30 days
  logDirectory: 'logs/audit' // Relative to project root
});

/**
 * Initializes and starts all scheduled maintenance tasks
 * Currently handles:
 * - Log rotation (daily at midnight)
 */
export function startScheduledTasks(): void {
  // Schedule log rotation
  setInterval(async () => {
    try {
      logger.info('Starting scheduled log rotation');
      await logRotation.rotateAuditLogs();
      logger.info('Log rotation completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Scheduled log rotation failed', { error: errorMessage });
    }
  }, ROTATION_INTERVAL);

  // Run immediately on startup
  logRotation.rotateAuditLogs().catch(error => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Initial log rotation failed', { error: errorMessage });
  });

  logger.info('Scheduled tasks initialized', {
    tasks: ['Log Rotation'],
    interval: `${ROTATION_INTERVAL / (60 * 60 * 1000)} hours`,
    config: {
      retentionDays: 30,
      logDirectory: 'logs/audit'
    }
  });
}
