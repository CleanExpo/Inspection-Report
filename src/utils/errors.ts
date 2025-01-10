import { logger } from './logger';

// Base error class for application errors
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public status: string,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);

    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// HTTP error factory
export const createError = {
  badRequest: (message = 'Bad Request') =>
    new AppError(400, 'error', message),
  unauthorized: (message = 'Unauthorized') =>
    new AppError(401, 'error', message),
  forbidden: (message = 'Forbidden') =>
    new AppError(403, 'error', message),
  notFound: (message = 'Not Found') =>
    new AppError(404, 'error', message),
  conflict: (message = 'Conflict') =>
    new AppError(409, 'error', message),
  validationError: (message = 'Validation Error') =>
    new AppError(422, 'error', message),
  tooManyRequests: (message = 'Too Many Requests') =>
    new AppError(429, 'error', message),
  internal: (message = 'Internal Server Error') =>
    new AppError(500, 'error', message, false),
};

// Error response formatter
export const formatErrorResponse = (error: AppError | Error) => {
  if (error instanceof AppError) {
    return {
      status: error.status,
      statusCode: error.statusCode,
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    };
  }

  // Handle unknown errors
  const appError = createError.internal(
    process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : error.message
  );

  return {
    status: appError.status,
    statusCode: appError.statusCode,
    message: appError.message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      originalError: error,
    }),
  };
};

// Validation error helper
export class ValidationError extends AppError {
  constructor(
    public errors: Record<string, string[]>,
    message = 'Validation Error'
  ) {
    super(422, 'error', message);
    this.errors = errors;
  }
}

// Database error helper
export class DatabaseError extends AppError {
  constructor(
    public originalError: Error,
    message = 'Database Error'
  ) {
    super(500, 'error', message, false);
    this.originalError = originalError;
  }
}

// Authentication error helper
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication Error') {
    super(401, 'error', message);
  }
}

// Authorization error helper
export class AuthorizationError extends AppError {
  constructor(message = 'Authorization Error') {
    super(403, 'error', message);
  }
}

// Not found error helper
export class NotFoundError extends AppError {
  constructor(resource = 'Resource', id?: string) {
    super(
      404,
      'error',
      id ? `${resource} with id ${id} not found` : `${resource} not found`
    );
  }
}

// Rate limit error helper
export class RateLimitError extends AppError {
  constructor(message = 'Too Many Requests') {
    super(429, 'error', message);
  }
}

// Error handler middleware
export const errorHandler = (err: Error, req: any, res: any, next: any) => {
  // Log error
  logger.error('Error:', {
    error: err,
    request: {
      method: req.method,
      url: req.url,
      body: req.body,
      user: req.user?.id,
    },
  });

  // Format and send error response
  const errorResponse = formatErrorResponse(err);
  res.status(errorResponse.statusCode).json(errorResponse);
};

// Async handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Error type guards
export const isAppError = (error: any): error is AppError => {
  return error instanceof AppError;
};

export const isValidationError = (error: any): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isDatabaseError = (error: any): error is DatabaseError => {
  return error instanceof DatabaseError;
};

export const isAuthenticationError = (
  error: any
): error is AuthenticationError => {
  return error instanceof AuthenticationError;
};

export const isAuthorizationError = (error: any): error is AuthorizationError => {
  return error instanceof AuthorizationError;
};

export const isNotFoundError = (error: any): error is NotFoundError => {
  return error instanceof NotFoundError;
};

export const isRateLimitError = (error: any): error is RateLimitError => {
  return error instanceof RateLimitError;
};

// Error utilities
export const handleValidationError = (errors: Record<string, string[]>) => {
  throw new ValidationError(errors);
};

export const handleDatabaseError = (error: Error) => {
  throw new DatabaseError(error);
};

export const handleAuthenticationError = (message?: string) => {
  throw new AuthenticationError(message);
};

export const handleAuthorizationError = (message?: string) => {
  throw new AuthorizationError(message);
};

export const handleNotFoundError = (resource: string, id?: string) => {
  throw new NotFoundError(resource, id);
};

export const handleRateLimitError = (message?: string) => {
  throw new RateLimitError(message);
};
