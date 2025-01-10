import { NextResponse } from 'next/server';
import { AuthError } from '../../../utils/auth';

export interface LogoutResponse {
    success: boolean;
    message?: string;
    errors?: Array<{
        field: string;
        message: string;
    }>;
}

/**
 * POST /api/auth/logout
 * Logs out user by invalidating their refresh token
 * In a real implementation, this would:
 * 1. Add the refresh token to a blacklist
 * 2. Clear any session data
 * 3. Potentially notify other services
 */
export async function POST(request: Request) {
    try {
        // Get refresh token from Authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({
                success: false,
                message: 'Missing refresh token',
                errors: [
                    { field: 'refreshToken', message: 'Refresh token is required' }
                ]
            } as LogoutResponse, { status: 400 });
        }

        const refreshToken = authHeader.split(' ')[1];

        // In a real implementation, we would:
        // 1. Verify the refresh token
        // 2. Add it to a blacklist or invalidate it in the database
        // 3. Clear any associated session data

        // For now, we'll just return success
        return NextResponse.json({
            success: true,
            message: 'Logout successful'
        } as LogoutResponse);

    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({
                success: false,
                message: error.message,
                errors: [{
                    field: 'general',
                    message: error.message
                }]
            } as LogoutResponse, { status: error.statusCode });
        }

        console.error('Logout error:', error);
        return NextResponse.json({
            success: false,
            message: 'Logout failed',
            errors: [{
                field: 'general',
                message: 'An unexpected error occurred'
            }]
        } as LogoutResponse, { status: 500 });
    }
}

/**
 * DELETE /api/auth/logout
 * Alternative endpoint for logout using DELETE method
 */
export const DELETE = POST;
