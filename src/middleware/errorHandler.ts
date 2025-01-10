import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  errors?: any[];
}

interface PrismaError extends AppError {
  code: string;
  meta?: {
    target?: string[];
    [key: string]: any;
  };
}

export const errorHandler = (
  err: AppError | PrismaError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: err.errors,
      },
    });
    return;
  }

  // Handle Prisma errors
  if (err instanceof PrismaClientKnownRequestError) {
    const prismaError = err as PrismaError;
    switch (prismaError.code) {
      case 'P2002':
        res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_ERROR',
            message: 'Resource already exists',
            details: prismaError.meta,
          },
        });
        break;
      case 'P2025':
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Resource not found',
            details: prismaError.meta,
          },
        });
        break;
      default:
        res.status(500).json({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Database operation failed',
          },
        });
    }
    return;
  }

  // Handle known application errors
  if (err.statusCode && err.code) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.errors,
      },
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred'
        : err.message,
    },
  });
};

// Custom error class for application errors
export class ApplicationError extends Error implements AppError {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR',
    public errors?: any[]
  ) {
    super(message);
    this.name = 'ApplicationError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Helper function to create specific error types
export const createError = {
  badRequest: (message: string, errors?: any[]) => 
    new ApplicationError(message, 400, 'BAD_REQUEST', errors),
  unauthorized: (message: string = 'Unauthorized') => 
    new ApplicationError(message, 401, 'UNAUTHORIZED'),
  forbidden: (message: string = 'Forbidden') => 
    new ApplicationError(message, 403, 'FORBIDDEN'),
  notFound: (message: string = 'Resource not found') => 
    new ApplicationError(message, 404, 'NOT_FOUND'),
  conflict: (message: string, errors?: any[]) => 
    new ApplicationError(message, 409, 'CONFLICT', errors),
  internal: (message: string = 'Internal server error') => 
    new ApplicationError(message, 500, 'INTERNAL_SERVER_ERROR'),
};
