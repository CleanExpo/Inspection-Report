import { NextResponse } from 'next/server';
import { ApiError, formatErrorResponse, isApiError } from '../utils/errorHandling';

/**
 * Global error handler middleware
 * Transforms errors into standardized API responses
 */
export async function errorHandler(error: unknown, request: Request): Promise<NextResponse> {
    // Log error in development
    if (process.env.NODE_ENV !== 'production') {
        console.error('API Error:', error);
    }

    // Handle known API errors
    if (isApiError(error)) {
        return NextResponse.json(
            formatErrorResponse(error),
            { status: error.statusCode }
        );
    }

    // Handle unknown errors
    const internalError = new ApiError(
        process.env.NODE_ENV === 'production' 
            ? 'Internal server error'
            : error instanceof Error ? error.message : 'Unknown error',
        500
    );

    return NextResponse.json(
        formatErrorResponse(internalError),
        { status: internalError.statusCode }
    );
}
