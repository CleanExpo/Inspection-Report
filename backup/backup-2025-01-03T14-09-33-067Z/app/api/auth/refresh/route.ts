import { NextResponse } from 'next/server';
import { refreshAccessToken, AuthError } from '../../../utils/auth';
import { getUserById } from '../../../services/authService';

export interface RefreshRequest {
    refreshToken: string;
}

export interface RefreshResponse {
    success: boolean;
    message?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    errors?: Array<{
        field: string;
        message: string;
    }>;
}

/**
 * POST /api/auth/refresh
 * Refreshes access token using refresh token
 */
export async function POST(request: Request) {
    try {
        // Parse request body
        const body = await request.json() as RefreshRequest;

        // Validate required fields
        if (!body.refreshToken) {
            return NextResponse.json({
                success: false,
                message: 'Missing refresh token',
                errors: [
                    { field: 'refreshToken', message: 'Refresh token is required' }
                ]
            } as RefreshResponse, { status: 400 });
        }

        // Get user data from refresh token
        const { userId } = await getUserById('1'); // Temporary: Get from refresh token payload
        const userData = await getUserById(userId);

        // Generate new tokens
        const tokens = refreshAccessToken(body.refreshToken, {
            roles: userData.roles,
            email: userData.email
        });

        // Return success response with new tokens
        return NextResponse.json({
            success: true,
            message: 'Token refresh successful',
            ...tokens
        } as RefreshResponse);

    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({
                success: false,
                message: error.message,
                errors: [{
                    field: 'general',
                    message: error.message
                }]
            } as RefreshResponse, { status: error.statusCode });
        }

        console.error('Token refresh error:', error);
        return NextResponse.json({
            success: false,
            message: 'Token refresh failed',
            errors: [{
                field: 'general',
                message: 'An unexpected error occurred'
            }]
        } as RefreshResponse, { status: 500 });
    }
}
