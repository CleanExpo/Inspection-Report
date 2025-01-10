export type ErrorCode = 
  | 'NOT_FOUND'
  | 'STORAGE_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'
  | 'BAD_REQUEST'
  | 'RATE_LIMIT_EXCEEDED';

export class DatabaseError extends Error {
  constructor(message: string, code?: ErrorCode) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code || 'INTERNAL_ERROR';
    
    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }

  code: ErrorCode;

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
    };
  }
}

export class ValidationError extends Error {
  constructor(message: string, details?: Record<string, any>) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'VALIDATION_ERROR';
    this.details = details;
    
    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }

  code: ErrorCode = 'VALIDATION_ERROR';
  details?: Record<string, any>;

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }
}

export class AuthError extends Error {
  constructor(message: string, code: 'UNAUTHORIZED' | 'FORBIDDEN' = 'UNAUTHORIZED') {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    
    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }

  code: 'UNAUTHORIZED' | 'FORBIDDEN';

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
    };
  }
}

export function isErrorWithCode(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as any).code === 'string'
  );
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

export function getErrorCode(error: unknown): ErrorCode {
  if (isErrorWithCode(error)) {
    return error.code as ErrorCode;
  }
  return 'INTERNAL_ERROR';
}

interface ApiErrorResponse {
  status: number;
  body: {
    error: {
      message: string;
      code: ErrorCode;
      details?: Record<string, any>;
    };
  };
}

export function handleError(error: unknown): ApiErrorResponse {
  console.error('Error:', error);

  if (error instanceof DatabaseError || error instanceof ValidationError || error instanceof AuthError) {
    const status = getStatusFromCode(error.code);
    return {
      status,
      body: {
        error: {
          message: error.message,
          code: error.code,
          details: error instanceof ValidationError ? error.details : undefined,
        },
      },
    };
  }

  if (error instanceof Error) {
    return {
      status: 500,
      body: {
        error: {
          message: error.message,
          code: 'INTERNAL_ERROR',
        },
      },
    };
  }

  return {
    status: 500,
    body: {
      error: {
        message: 'An unknown error occurred',
        code: 'INTERNAL_ERROR',
      },
    },
  };
}

function getStatusFromCode(code: ErrorCode): number {
  switch (code) {
    case 'BAD_REQUEST':
      return 400;
    case 'UNAUTHORIZED':
      return 401;
    case 'FORBIDDEN':
      return 403;
    case 'NOT_FOUND':
      return 404;
    case 'VALIDATION_ERROR':
      return 422;
    case 'CONFLICT':
      return 409;
    case 'RATE_LIMIT_EXCEEDED':
      return 429;
    case 'STORAGE_ERROR':
    case 'INTERNAL_ERROR':
    default:
      return 500;
  }
}

export function createErrorResponse(
  message: string,
  code: ErrorCode,
  details?: Record<string, any>
): ApiErrorResponse {
  return {
    status: getStatusFromCode(code),
    body: {
      error: {
        message,
        code,
        details,
      },
    },
  };
}
