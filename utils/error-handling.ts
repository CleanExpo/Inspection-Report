import { NextApiResponse } from 'next';

export class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public details?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export interface ApiErrorResponse {
    message: string;
    details?: any;
}

export function handleError(error: unknown, res: NextApiResponse<ApiErrorResponse>) {
    console.error('API Error:', error);

    if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
            message: error.message,
            details: error.details
        });
    }

    // Generic error handler
    return res.status(500).json({
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' 
            ? (error instanceof Error ? error.message : String(error))
            : undefined
    });
}

export function assertUser(condition: boolean, message: string) {
    if (!condition) {
        throw new ApiError(403, message);
    }
}

export function assertAuthenticated(condition: boolean) {
    if (!condition) {
        throw new ApiError(401, 'Authentication required');
    }
}

export function assertResourceExists(condition: boolean, message: string) {
    if (!condition) {
        throw new ApiError(404, message);
    }
}
