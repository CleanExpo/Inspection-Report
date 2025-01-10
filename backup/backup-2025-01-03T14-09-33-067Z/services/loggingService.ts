import { NextApiRequest } from 'next';
import { ErrorResponse } from '../api/moisture/utils/errorCodes';

// Log levels with numeric values for filtering
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  source?: string;
  environment: string;
  correlationId?: string;
}

interface LogDestination {
  name: string;
  minLevel: LogLevel;
  handler: (entry: LogEntry) => Promise<void>;
}

class LoggingService {
  private destinations: LogDestination[] = [];
  private readonly environment: string;
  private readonly retryAttempts = 3;
  private readonly retryDelay = 1000; // ms

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.setupDefaultDestinations();
  }

  private setupDefaultDestinations() {
    // Console logging
    this.addDestination({
      name: 'console',
      minLevel: this.environment === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
      handler: async (entry) => {
        const formattedEntry = this.formatLogEntry(entry);
        switch (entry.level) {
          case LogLevel.ERROR:
            console.error(formattedEntry);
            break;
          case LogLevel.WARN:
            console.warn(formattedEntry);
            break;
          default:
            console.log(formattedEntry);
        }
      }
    });

    // Production logging destinations
    if (this.environment === 'production') {
      // Add file logging if configured
      if (process.env.LOG_FILE_PATH) {
        this.addFileLogging(process.env.LOG_FILE_PATH);
      }

      // Add external service logging if configured
      if (process.env.LOG_SERVICE_URL) {
        this.addExternalLogging(process.env.LOG_SERVICE_URL);
      }
    }
  }

  private addFileLogging(filePath: string) {
    // Only import fs in Node.js environment
    if (typeof window === 'undefined') {
      const fs = require('fs').promises;
      this.addDestination({
        name: 'file',
        minLevel: LogLevel.INFO,
        handler: async (entry) => {
          const line = this.formatLogEntry(entry) + '\n';
          await fs.appendFile(filePath, line, 'utf8');
        }
      });
    }
  }

  private addExternalLogging(serviceUrl: string) {
    this.addDestination({
      name: 'external',
      minLevel: LogLevel.INFO,
      handler: async (entry) => {
        let attempt = 0;
        while (attempt < this.retryAttempts) {
          try {
            const response = await fetch(serviceUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-API-Key': process.env.LOG_SERVICE_API_KEY || ''
              },
              body: JSON.stringify(entry)
            });

            if (response.ok) return;
            throw new Error(`Failed to send log: ${response.statusText}`);
          } catch (error) {
            attempt++;
            if (attempt === this.retryAttempts) {
              // If all retries failed, log to console as fallback
              console.error('Failed to send log to external service:', error);
              console.error('Original log entry:', entry);
              return;
            }
            await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
          }
        }
      }
    });
  }

  private addDestination(destination: LogDestination) {
    this.destinations.push(destination);
  }

  private formatLogEntry(entry: LogEntry): string {
    return JSON.stringify({
      ...entry,
      level: LogLevel[entry.level]
    });
  }

  private async log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      environment: this.environment,
      correlationId: this.getCorrelationId()
    };

    await Promise.all(
      this.destinations
        .filter(dest => level >= dest.minLevel)
        .map(dest => dest.handler(entry).catch(error => {
          console.error(`Failed to log to destination ${dest.name}:`, error);
        }))
    );
  }

  private getCorrelationId(): string {
    if (typeof window === 'undefined') {
      // On server side, use async local storage or request context
      // This is a simplified version
      return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    return 'client-side';
  }

  // Public logging methods
  async info(message: string, data?: any) {
    await this.log(LogLevel.INFO, message, data);
  }

  async warn(message: string, data?: any) {
    await this.log(LogLevel.WARN, message, data);
  }

  async error(message: string, data?: any) {
    await this.log(LogLevel.ERROR, message, data);
  }

  async debug(message: string, data?: any) {
    if (this.environment === 'development') {
      await this.log(LogLevel.DEBUG, message, data);
    }
  }

  // Request logging
  async logRequest(req: NextApiRequest, message?: string) {
    const requestInfo = {
      method: req.method || 'UNKNOWN',
      url: req.url || 'UNKNOWN',
      query: req.query,
      ...(req.method !== 'GET' && { body: req.body })
    };
    await this.info(message || 'Incoming request', requestInfo);
  }

  // Response logging
  async logResponse(req: NextApiRequest, statusCode: number, responseData?: any) {
    await this.info('Response sent', {
      request: {
        method: req.method,
        url: req.url,
        query: req.query
      },
      response: {
        statusCode,
        data: responseData
      }
    });
  }

  // Error logging
  async logError(req: NextApiRequest, error: ErrorResponse) {
    await this.error('Error response', {
      request: {
        method: req.method,
        url: req.url,
        query: req.query
      },
      error
    });
  }

  // Performance logging
  async logPerformance(req: NextApiRequest, duration: number) {
    await this.info('Request performance', {
      request: {
        method: req.method,
        url: req.url
      },
      duration: `${duration}ms`
    });
  }
}

// Export singleton instance
export const loggingService = new LoggingService();

// Performance timing decorator
export function withTiming(fn: Function) {
  return async (...args: any[]) => {
    const start = Date.now();
    const result = await fn(...args);
    const duration = Date.now() - start;
    
    if (args[0]?.url) {
      await loggingService.logPerformance(args[0], duration);
    }
    
    return result;
  };
}
