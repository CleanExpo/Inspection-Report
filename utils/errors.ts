export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ApiError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export function isKnownError(error: unknown): error is Error {
  return error instanceof NotFoundError ||
         error instanceof ValidationError ||
         error instanceof AuthorizationError ||
         error instanceof AuthError ||
         error instanceof DatabaseError ||
         error instanceof ApiError;
}

export function handleError(error: unknown): { message: string; statusCode: number } {
  if (error instanceof NotFoundError) {
    return { message: error.message, statusCode: 404 };
  }
  
  if (error instanceof ValidationError) {
    return { message: error.message, statusCode: 400 };
  }
  
  if (error instanceof AuthorizationError) {
    return { message: error.message, statusCode: 401 };
  }
  
  if (error instanceof DatabaseError) {
    return { message: 'Database operation failed', statusCode: 500 };
  }
  
  if (error instanceof ApiError) {
    return { message: error.message, statusCode: error.statusCode };
  }

  // Unknown error
  console.error('Unhandled error:', error);
  return { message: 'An unexpected error occurred', statusCode: 500 };
}
