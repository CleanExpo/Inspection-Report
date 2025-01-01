import { NextApiRequest, NextApiResponse } from 'next';
import { ApiHandler } from './errorHandler';
import { logger } from '../utils/logger';
import { createErrorResponse, ErrorCode } from '../utils/errorCodes';

// Configuration
const DEFAULT_TIMEOUT_MS = 30000; // 30 seconds default timeout

// Custom error for timeouts
class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

// Helper to create a promise that rejects after a timeout
const createTimeout = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(`Request timed out after ${ms}ms`));
    }, ms);
  });
};

export const withTimeout = (timeoutMs: number = DEFAULT_TIMEOUT_MS) => {
  return (handler: ApiHandler): ApiHandler => {
    return async (req: NextApiRequest, res: NextApiResponse): Promise<void | any> => {
      try {
        // Add timeout header
        res.setHeader('X-Timeout-Limit', timeoutMs);

        // Race between the handler and the timeout
        const result = await Promise.race([
          handler(req, res),
          createTimeout(timeoutMs)
        ]);

        return result;
      } catch (error) {
        if (error instanceof TimeoutError) {
          logger.warn('Request timed out', {
            method: req.method,
            url: req.url,
            timeoutMs
          });

          // Check if headers have been sent before attempting to send error response
          if (!res.headersSent) {
            throw createErrorResponse(
              ErrorCode.EXTERNAL_SERVICE_ERROR,
              'Request processing timed out',
              {
                timeoutMs,
                message: error.message
              }
            );
          }
        }

        // Re-throw other errors
        throw error;
      }
    };
  };
};
