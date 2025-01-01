import { NextApiRequest, NextApiResponse } from 'next';
import { ApiHandler } from './errorHandler';
import { logger } from '../utils/logger';
import { ErrorCode, ErrorResponse } from '../utils/errorCodes';

// Configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Error codes that should not be retried
const NON_RETRYABLE_ERRORS = new Set([
  ErrorCode.INVALID_REQUEST,
  ErrorCode.INVALID_PARAMETERS,
  ErrorCode.INVALID_FORMAT,
  ErrorCode.UNAUTHORIZED,
  ErrorCode.FORBIDDEN,
  ErrorCode.NOT_FOUND,
  ErrorCode.DUPLICATE_ENTRY,
  ErrorCode.CONFLICT,
  ErrorCode.REQUEST_TOO_LARGE,
  ErrorCode.NO_DATA,
  ErrorCode.INSUFFICIENT_DATA
]);

// Helper to determine if an error is retryable
const isRetryableError = (error: any): boolean => {
  // If it's our ErrorResponse type, check the code
  if (error && 'code' in error) {
    return !NON_RETRYABLE_ERRORS.has(error.code as ErrorCode);
  }

  // For network or system errors, retry
  if (error instanceof Error) {
    return error.message.toLowerCase().includes('network') ||
           error.message.toLowerCase().includes('timeout') ||
           error.message.toLowerCase().includes('connection') ||
           error.message.toLowerCase().includes('econnrefused');
  }

  // Default to not retrying unknown error types
  return false;
};

// Helper to calculate delay with exponential backoff
const getRetryDelay = (attempt: number): number => {
  return INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
};

// Helper to sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const withRetryLogic = (handler: ApiHandler): ApiHandler => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void | any> => {
    let lastError: any;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Clone the request body for retries since it might be consumed
        if (req.body) {
          req.body = JSON.parse(JSON.stringify(req.body));
        }

        // Attempt to handle the request
        const result = await handler(req, res);

        // If successful, add retry metadata header
        if (attempt > 1) {
          res.setHeader('X-Retry-Count', attempt - 1);
        }

        return result;
      } catch (error) {
        lastError = error;

        // Check if we should retry
        if (!isRetryableError(error)) {
          logger.debug('Non-retryable error encountered', {
            error,
            attempt
          });
          throw error;
        }

        // Check if we have retries remaining
        if (attempt === MAX_RETRIES) {
          logger.error('Max retries exceeded', {
            error,
            maxRetries: MAX_RETRIES
          });
          throw error;
        }

        // Calculate delay for next retry
        const delay = getRetryDelay(attempt);

        logger.warn('Request failed, retrying', {
          error,
          attempt,
          nextRetryDelay: delay,
          remainingRetries: MAX_RETRIES - attempt
        });

        // Wait before retrying
        await sleep(delay);
      }
    }

    // This should never be reached due to the throw in the last iteration
    // but TypeScript doesn't know that
    throw lastError;
  };
};
