import { NextResponse } from 'next/server';
import { generateTokens } from '../../../utils/auth';
import { AuthError } from '../../../utils/auth';
import { validateCredentials } from '../../../services/authService';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
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
 * POST /api/auth/login
 * Authenticates user credentials and returns JWT tokens
 */
export async function POST(request: Request) {
    try {
        // Parse request body
        const body = await request.json() as LoginRequest;

        // Validate required fields
        if (!body.email || !body.password) {
            return NextResponse.json({
                success: false,
                message: 'Missing required fields',
                errors: [
                    { field: 'email', message: 'Email is required' },
                    { field: 'password', message: 'Password is required' }
                ]
            } as LoginResponse, { status: 400 });
        }

        // Validate credentials and get user data
        const userData = await validateCredentials(body.email, body.password);

        // Generate tokens
        const { accessToken, refreshToken, expiresIn } = generateTokens(
            userData.userId,
            userData.roles,
            userData.email
        );

        // Return success response with tokens
        return NextResponse.json({
            success: true,
            message: 'Login successful',
            accessToken,
            refreshToken,
            expiresIn
        } as LoginResponse);

    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({
                success: false,
                message: error.message,
                errors: [{
                    field: 'general',
                    message: error.message
                }]
            } as LoginResponse, { status: error.statusCode });
        }

        console.error('Login error:', error);
        return NextResponse.json({
            success: false,
            message: 'Login failed',
            errors: [{
                field: 'general',
                message: 'An unexpected error occurred'
            }]
        } as LoginResponse, { status: 500 });
    }
}
