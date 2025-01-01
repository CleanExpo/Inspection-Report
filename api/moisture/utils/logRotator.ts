import fs from 'fs';
import path from 'path';
import { logger } from './logger';

export class LogRotator {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly MAX_FILES = 7; // Keep a week of logs
  private static readonly LOG_DIR = 'logs';

  constructor(private baseFilename: string) {
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(LogRotator.LOG_DIR)) {
      fs.mkdirSync(LogRotator.LOG_DIR, { recursive: true });
    }
  }

  private getCurrentLogPath(): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(LogRotator.LOG_DIR, `${this.baseFilename}-${date}.log`);
  }

  private shouldRotate(filePath: string): boolean {
    try {
      const stats = fs.statSync(filePath);
      return stats.size >= LogRotator.MAX_FILE_SIZE;
    } catch {
      return false;
    }
  }

  private cleanOldLogs(): void {
    const files = fs.readdirSync(LogRotator.LOG_DIR)
      .filter(file => file.startsWith(this.baseFilename))
      .map(file => ({
        name: file,
        path: path.join(LogRotator.LOG_DIR, file),
        time: fs.statSync(path.join(LogRotator.LOG_DIR, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    // Keep only the most recent MAX_FILES files
    files.slice(LogRotator.MAX_FILES).forEach(file => {
      try {
        fs.unlinkSync(file.path);
        logger.debug(`Removed old log file: ${file.name}`);
      } catch (error) {
        logger.error(`Failed to remove old log file: ${file.name}`, { error });
      }
    });
  }

  public rotate(): void {
    const currentLog = this.getCurrentLogPath();

    // Check if we need to rotate based on size
    if (this.shouldRotate(currentLog)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedPath = `${currentLog}.${timestamp}`;

      try {
        // Rename current log file with timestamp
        if (fs.existsSync(currentLog)) {
          fs.renameSync(currentLog, rotatedPath);
        }
        logger.debug(`Rotated log file: ${path.basename(currentLog)} -> ${path.basename(rotatedPath)}`);
      } catch (error) {
        logger.error('Failed to rotate log file', { error });
      }
    }

    // Clean up old log files
    this.cleanOldLogs();
  }
}
