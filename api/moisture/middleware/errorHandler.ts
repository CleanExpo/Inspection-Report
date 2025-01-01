import { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { 
  ErrorCode, 
  ErrorResponse, 
  ErrorStatusMap, 
  mapPrismaError, 
  mapValidationError 
} from '../utils/errorCodes';
import { logger } from '../utils/logger';

export type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void | any>;

export function withErrorHandler(handler: ApiHandler): ApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const requestId = Math.random().toString(36).substring(7);
    
    try {
      // Log incoming request
      logger.request(req, `Processing request ${requestId}`);

      // Add request ID to response headers
      res.setHeader('X-Request-ID', requestId);

      // Execute the handler
      const result = await handler(req, res);

      // Log successful response
      logger.response(req, res.statusCode, result);

      return result;
    } catch (error) {
      let errorResponse: ErrorResponse;

      // Enhanced error type checking and mapping
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        errorResponse = mapPrismaError(error);
        logger.error('Prisma Error', {
          requestId,
          code: error.code,
          meta: error.meta,
          message: error.message
        });
      } else if (error instanceof ZodError) {
        errorResponse = mapValidationError(error);
        logger.error('Validation Error', {
          requestId,
          issues: error.issues
        });
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        errorResponse = {
          code: ErrorCode.INVALID_REQUEST,
          message: 'Invalid database operation',
          details: error.message
        };
        logger.error('Prisma Validation Error', {
          requestId,
          message: error.message
        });
      } else if (error instanceof Prisma.PrismaClientInitializationError) {
        errorResponse = {
          code: ErrorCode.DATABASE_ERROR,
          message: 'Database connection error',
          details: error.message
        };
        logger.error('Prisma Initialization Error', {
          requestId,
          message: error.message,
          errorCode: error.errorCode
        });
      } else if (error instanceof Prisma.PrismaClientRustPanicError) {
        errorResponse = {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Critical database error',
          details: 'A critical error occurred in the database client'
        };
        logger.error('Prisma Rust Panic', {
          requestId,
          message: error.message
        });
      } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        errorResponse = {
          code: ErrorCode.DATABASE_ERROR,
          message: 'Unknown database error',
          details: error.message
        };
        logger.error('Unknown Prisma Error', {
          requestId,
          message: error.message
        });
      } else if (error instanceof Error) {
        // Check for rate limit error (429)
        if (error.message.includes('rate_limit_error') || error.message.includes('429')) {
          errorResponse = {
            code: ErrorCode.RATE_LIMIT_EXCEEDED,
            message: 'Rate limit exceeded. Please try again later.',
            details: error.message
          };
          logger.warn('Rate Limit Exceeded', {
            requestId,
            message: error.message
          });
        } else {
          errorResponse = {
            code: ErrorCode.INTERNAL_ERROR,
            message: error.message || 'An unexpected error occurred',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
          };
          logger.error('Unexpected Error', {
            requestId,
            message: error.message,
            stack: error.stack
          });
        }
      } else {
        errorResponse = {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'An unexpected error occurred'
        };
        logger.error('Unknown Error Type', {
          requestId,
          error
        });
      }

      // Log error response
      logger.errorResponse(req, errorResponse);

      // Get appropriate status code
      const statusCode = ErrorStatusMap[errorResponse.code];

      // Add request ID to error response
      const responseWithRequestId = {
        ...errorResponse,
        requestId
      };

      // Send error response
      return res.status(statusCode).json(responseWithRequestId);
    }
  };
}

// Helper to wrap multiple middleware functions
export function withMiddleware(...middlewares: Array<(handler: ApiHandler) => ApiHandler>) {
  return (handler: ApiHandler): ApiHandler => {
    return middlewares.reduceRight((wrapped, middleware) => middleware(wrapped), handler);
  };
}

// Combine error handling with timing and request tracking
export const withErrorHandlingAndTiming = withMiddleware(
  withErrorHandler,
  handler => async (req, res) => {
    const start = Date.now();
    const result = await handler(req, res);
    const duration = Date.now() - start;
    
    // Log performance metrics
    logger.performance(req, duration);
    
    return result;
  }
);
