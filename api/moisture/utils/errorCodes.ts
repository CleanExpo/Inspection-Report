import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

// Error codes enum for consistent error handling
export enum ErrorCode {
  // Validation errors (400 range)
  INVALID_REQUEST = 'INVALID_REQUEST',
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Authentication/Authorization errors (400-403)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  
  // Resource errors (404)
  NOT_FOUND = 'NOT_FOUND',
  
  // Conflict errors (409)
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  CONFLICT = 'CONFLICT',
  
  // Rate limiting and size limits (429, 413)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  REQUEST_TOO_LARGE = 'REQUEST_TOO_LARGE',
  
  // Analytics errors (400 range)
  NO_DATA = 'NO_DATA',
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
  ANALYSIS_ERROR = 'ANALYSIS_ERROR',

  // Server errors (500 range)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  PARTIAL_FAILURE = 'PARTIAL_FAILURE'
}

// HTTP status code mapping
export const ErrorStatusMap: Record<ErrorCode, number> = {
  [ErrorCode.INVALID_REQUEST]: 400,
  [ErrorCode.INVALID_PARAMETERS]: 400,
  [ErrorCode.INVALID_FORMAT]: 400,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.DUPLICATE_ENTRY]: 409,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.REQUEST_TOO_LARGE]: 413, // HTTP 413 Payload Too Large
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorCode.NO_DATA]: 404, // No data found is a not found condition
  [ErrorCode.INSUFFICIENT_DATA]: 400, // Not enough data is a client error
  [ErrorCode.ANALYSIS_ERROR]: 422, // Analysis failure is an unprocessable entity
  [ErrorCode.PARTIAL_FAILURE]: 207 // Using 207 Multi-Status for partial failures
};

// Error response interface
export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: any;
}

// Map Prisma errors to our error codes
export function mapPrismaError(error: Prisma.PrismaClientKnownRequestError): ErrorResponse {
  switch (error.code) {
    case 'P2002': // Unique constraint violation
      return {
        code: ErrorCode.DUPLICATE_ENTRY,
        message: 'A record with this data already exists'
      };
    case 'P2025': // Record not found
      return {
        code: ErrorCode.NOT_FOUND,
        message: 'The requested resource was not found'
      };
    case 'P2003': // Foreign key constraint failed
      return {
        code: ErrorCode.INVALID_REQUEST,
        message: 'Invalid reference to a related resource'
      };
    default:
      return {
        code: ErrorCode.DATABASE_ERROR,
        message: 'Database operation failed',
        details: error.message
      };
  }
}

// Map Zod validation errors to our error format
export function mapValidationError(error: ZodError): ErrorResponse {
  return {
    code: ErrorCode.INVALID_PARAMETERS,
    message: 'Invalid request parameters',
    details: error.issues
  };
}

// Create a standardized error response
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: any
): ErrorResponse {
  return {
    code,
    message,
    ...(details && { details })
  };
}
