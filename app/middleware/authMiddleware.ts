import { NextResponse } from 'next/server';
import { validateToken } from '../utils/security';
import { formatErrorResponse } from '../utils/errorHandling';

/**
 * User roles enum with hierarchical values
 */
export enum UserRole {
    USER = 0,
    MANAGER = 1,
    ADMIN = 2
}

/**
 * Base authentication error
 */
export class AuthError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.name = 'AuthError';
        this.statusCode = statusCode;
    }
}

/**
 * Unauthorized error (no/invalid token)
 */
export class UnauthorizedError extends AuthError {
    constructor(message: string = 'Authentication required') {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}

/**
 * Forbidden error (insufficient permissions)
 */
export class ForbiddenError extends AuthError {
    constructor(message: string = 'Insufficient permissions') {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}

/**
 * Extend Request type to include user
 */
declare module 'next/server' {
    interface Request {
        user?: {
            id: string;
            email: string;
            role: string;
        };
    }
}

/**
 * Middleware to require authentication
 * @param request Next.js request object
 * @returns NextResponse if authentication fails, undefined if successful
 */
export async function requireAuth(request: Request): Promise<NextResponse | undefined> {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            throw new UnauthorizedError('Missing or invalid authorization header');
        }

        const token = authHeader.substring(7);
        const userData = validateToken(token);

        // Attach user data to request
        request.user = userData;

        return undefined;
    } catch (error) {
        console.error('Authentication error:', error);
        return NextResponse.json(
            formatErrorResponse(
                error instanceof AuthError 
                    ? error 
                    : new UnauthorizedError('Invalid token')
            ),
            { status: 401 }
        );
    }
}

/**
 * Middleware to require specific role
 * @param request Next.js request object
 * @param requiredRole Minimum required role
 * @returns NextResponse if authorization fails, undefined if successful
 */
export async function requireRole(
    request: Request,
    requiredRole: UserRole
): Promise<NextResponse | undefined> {
    try {
        // Check if user is authenticated
        if (!request.user) {
            throw new UnauthorizedError();
        }

        // Get user's role value
        const userRoleValue = UserRole[request.user.role as keyof typeof UserRole];
        if (userRoleValue === undefined) {
            throw new ForbiddenError('Invalid role');
        }

        // Check if user's role is sufficient
        if (userRoleValue < requiredRole) {
            throw new ForbiddenError();
        }

        return undefined;
    } catch (error) {
        console.error('Authorization error:', error);
        return NextResponse.json(
            formatErrorResponse(
                error instanceof AuthError 
                    ? error 
                    : new ForbiddenError()
            ),
            { status: error instanceof UnauthorizedError ? 401 : 403 }
        );
    }
}
