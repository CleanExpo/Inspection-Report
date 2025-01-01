/**
 * Base API Error class
 */
export class ApiError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
    }
}

/**
 * Field error type for validation errors
 */
export interface FieldError {
    field: string;
    message: string;
}

/**
 * Validation Error class
 */
export class ValidationError extends ApiError {
    field?: string;
    fieldErrors?: FieldError[];

    constructor(message: string, field?: string, fieldErrors?: FieldError[]) {
        super(message, 400);
        this.name = 'ValidationError';
        this.field = field;
        this.fieldErrors = fieldErrors;
    }
}

/**
 * Database Error class
 */
export class DatabaseError extends ApiError {
    originalError?: Error;

    constructor(message: string, originalError?: Error) {
        super(message, 500);
        this.name = 'DatabaseError';
        this.originalError = originalError;
    }
}

/**
 * Type guard for API errors
 */
export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

/**
 * Formats an error for logging and debugging
 */
export function formatError(error: Error): Record<string, unknown> {
    const formatted: Record<string, unknown> = {
        message: error.message,
        type: error.name,
        statusCode: isApiError(error) ? error.statusCode : 500
    };

    if (error instanceof ValidationError) {
        if (error.field) {
            formatted.field = error.field;
        }
        if (error.fieldErrors) {
            formatted.fieldErrors = error.fieldErrors;
        }
    }

    if (error instanceof DatabaseError && error.originalError) {
        formatted.originalError = formatError(error.originalError);
    }

    return formatted;
}

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
    success: false;
    message: string;
    errors: FieldError[];
}

/**
 * Formats an error into a standard API response
 */
export function formatErrorResponse(error: Error): ApiErrorResponse {
    if (error instanceof ValidationError && error.fieldErrors) {
        return {
            success: false,
            message: error.message,
            errors: error.fieldErrors
        };
    }

    return {
        success: false,
        message: error.message,
        errors: [{
            field: 'general',
            message: error.message
        }]
    };
}
