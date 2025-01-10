import winston, { Logger as WinstonLogger } from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
} as const;

// Create the base winston logger
const winstonLogger = winston.createLogger({
  levels: logLevels,
  format: logFormat,
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  winstonLogger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ level, message, timestamp, ...metadata }) => {
          let msg = `${timestamp} [${level}] : ${message}`;
          if (Object.keys(metadata).length > 0) {
            msg += '\n' + JSON.stringify(metadata, null, 2);
          }
          return msg;
        })
      ),
    })
  );
}

// Create HTTP log stream for Morgan middleware
export const httpStream = {
  write: (message: string) => {
    winstonLogger.http(message.trim());
  },
};

// Request context type
interface RequestContext {
  requestId: string;
  method: string;
  url: string;
  ip: string;
  userId?: string;
}

// Add request context logging
const addRequestContext = (req: any): RequestContext => {
  return {
    requestId: req.id,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.user?.id,
  };
};

// Custom logger interface extending Winston's Logger
interface CustomLogger extends WinstonLogger {
  logStream: typeof httpStream;
  withRequest: (req: any) => WinstonLogger;
}

// Create base logger with required methods
const baseLogger: CustomLogger = Object.assign(winstonLogger, {
  logStream: httpStream,
  withRequest: (req: any) => winstonLogger.child(addRequestContext(req)),
});

// Error handling helper
export const logError = (error: Error, context?: Record<string, unknown>) => {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    ...context,
  };

  if (error.name === 'ValidationError') {
    baseLogger.warn(errorLog);
  } else {
    baseLogger.error(errorLog);
  }
};

// Performance logging helper
export const logPerformance = (
  operation: string,
  startTime: [number, number],
  metadata?: Record<string, unknown>
) => {
  const endTime = process.hrtime(startTime);
  const duration = (endTime[0] * 1e9 + endTime[1]) / 1e6; // Convert to milliseconds

  baseLogger.info(`Performance: ${operation} took ${duration.toFixed(2)}ms`, {
    operation,
    duration,
    ...metadata,
  });
};

// Security logging helper
export const logSecurityEvent = (
  event: string,
  success: boolean,
  metadata?: Record<string, unknown>
) => {
  const level = success ? 'info' : 'warn';
  baseLogger.log(level, `Security: ${event}`, {
    event,
    success,
    ...metadata,
  });
};

// Audit logging helper
export const logAuditEvent = (
  userId: string,
  action: string,
  resource: string,
  metadata?: Record<string, unknown>
) => {
  baseLogger.info(`Audit: ${action} on ${resource}`, {
    userId,
    action,
    resource,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
};

// System event logging helper
export const logSystemEvent = (
  event: string,
  status: 'start' | 'complete' | 'fail',
  metadata?: Record<string, unknown>
) => {
  const level = status === 'fail' ? 'error' : 'info';
  baseLogger.log(level, `System: ${event} - ${status}`, {
    event,
    status,
    ...metadata,
  });
};

// Create a child logger with additional context
export const createContextLogger = (context: Record<string, unknown>) => {
  return baseLogger.child(context);
};

// Export the logger
export const logger = baseLogger;

// Export types
export type Logger = typeof baseLogger;
export type LogLevel = keyof typeof logLevels;
