import { NextApiResponse } from 'next';

export enum ErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED',
  NotFound = 'NOT_FOUND',
  RateLimit = 'RATE_LIMIT',
  ServerError = 'SERVER_ERROR',
  ValidationError = 'VALIDATION_ERROR',
  NetworkError = 'NETWORK_ERROR',
  DatabaseError = 'DATABASE_ERROR'
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: unknown;
  retryable?: boolean;
}

export class ApiErrorResponse extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly error: ApiError
  ) {
    super(error.message);
    this.name = 'ApiErrorResponse';
  }
}

export const errorHandler = {
  badRequest: (message: string, details?: unknown): ApiErrorResponse => {
    return new ApiErrorResponse(400, {
      code: ErrorCode.BadRequest,
      message,
      details,
      retryable: false
    });
  },

  unauthorized: (message: string): ApiErrorResponse => {
    return new ApiErrorResponse(401, {
      code: ErrorCode.Unauthorized,
      message,
      retryable: false
    });
  },

  notFound: (message: string): ApiErrorResponse => {
    return new ApiErrorResponse(404, {
      code: ErrorCode.NotFound,
      message,
      retryable: false
    });
  },

  rateLimit: (message: string): ApiErrorResponse => {
    return new ApiErrorResponse(429, {
      code: ErrorCode.RateLimit,
      message,
      retryable: true
    });
  },

  serverError: (message: string, details?: unknown): ApiErrorResponse => {
    return new ApiErrorResponse(500, {
      code: ErrorCode.ServerError,
      message,
      details,
      retryable: true
    });
  },

  validationError: (message: string, details?: unknown): ApiErrorResponse => {
    return new ApiErrorResponse(422, {
      code: ErrorCode.ValidationError,
      message,
      details,
      retryable: false
    });
  }
};

export const handleApiError = (error: unknown, res: NextApiResponse): void => {
  console.error('API Error:', error);

  if (error instanceof ApiErrorResponse) {
    res.status(error.statusCode).json({
      error: error.error
    });
    return;
  }

  // Handle unknown errors
  const serverError = errorHandler.serverError(
    'An unexpected error occurred',
    process.env.NODE_ENV === 'development' ? error : undefined
  );

  res.status(serverError.statusCode).json({
    error: serverError.error
  });
};

// Retry configuration
export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000,    // 10 seconds
  backoffFactor: 2
};

// Retry logic with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...defaultRetryConfig, ...config };
  let lastError: Error | null = null;
  let delay = retryConfig.initialDelay;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (error instanceof ApiErrorResponse && !error.error.retryable) {
        throw error;
      }

      if (attempt === retryConfig.maxRetries) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Exponential backoff
      delay = Math.min(
        delay * retryConfig.backoffFactor,
        retryConfig.maxDelay
      );
    }
  }

  throw lastError || new Error('Operation failed after retries');
}

// Circuit breaker states
export enum CircuitState {
  CLOSED,
  OPEN,
  HALF_OPEN
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private readonly failureThreshold: number;
  private readonly resetTimeout: number;

  constructor(
    failureThreshold: number = 5,
    resetTimeout: number = 60000 // 1 minute
  ) {
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
  }

  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (
      this.state === CircuitState.HALF_OPEN ||
      this.failureCount >= this.failureThreshold
    ) {
      this.state = CircuitState.OPEN;
    }
  }

  public getState(): CircuitState {
    return this.state;
  }
}
