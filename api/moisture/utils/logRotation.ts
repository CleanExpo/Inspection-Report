import fs from 'fs/promises';
import path from 'path';

/**
 * Configuration interface for log rotation settings
 */
interface LogRotationConfig {
  retentionDays: number;
  logDirectory: string;
}

/**
 * Handles the rotation of log files based on retention period
 * Automatically removes log files that are older than the specified retention period
 */
export class LogRotation {
  private config: LogRotationConfig;

  /**
   * @param config Configuration object containing retention period and log directory
   */
  constructor(config: LogRotationConfig) {
    this.config = config;
  }

  /**
   * Gets the absolute path to the log directory
   */
  private getLogFilePath(): string {
    return path.join(process.cwd(), this.config.logDirectory);
  }

  /**
   * Retrieves all log files from the configured directory
   * @returns Promise resolving to array of log file names
   */
  private async getLogFiles(): Promise<string[]> {
    const logPath = this.getLogFilePath();
    const files = await fs.readdir(logPath);
    return files.filter(file => file.endsWith('.log'));
  }

  /**
   * Checks if a log file has exceeded the retention period
   * @param filePath Path to the log file
   * @returns Promise resolving to true if file should be deleted
   */
  private isExpired(filePath: string): Promise<boolean> {
    return fs.stat(filePath).then(stats => {
      const now = new Date();
      const daysOld = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
      return daysOld > this.config.retentionDays;
    });
  }

  /**
   * Executes the log rotation process
   * Removes all log files that have exceeded the retention period
   * @throws Error if rotation process fails
   */
  public async rotateAuditLogs(): Promise<void> {
    try {
      const logFiles = await this.getLogFiles();
      
      for (const file of logFiles) {
        const filePath = path.join(this.getLogFilePath(), file);
        const expired = await this.isExpired(filePath);
        
        if (expired) {
          await fs.unlink(filePath);
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Log rotation failed: ${errorMessage}`);
    }
  }
}
