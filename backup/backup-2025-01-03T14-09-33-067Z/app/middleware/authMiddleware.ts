import { NextResponse } from 'next/server';
import { verifyAccessToken, extractBearerToken, AuthError } from '../utils/auth';
import { ensurePermissions, type Permission } from '../utils/authorization';
import { formatErrorResponse } from '../utils/errorHandling';

/**
 * Middleware to verify JWT token and extract user information
 */
export async function authenticateRequest(request: Request): Promise<{
    userId: string;
    roles: string[];
    email?: string;
}> {
    try {
        const authHeader = request.headers.get('authorization');
        const token = extractBearerToken(authHeader);
        const decoded = verifyAccessToken(token);
        
        return {
            userId: decoded.userId,
            roles: decoded.roles,
            email: decoded.email
        };
    } catch (error) {
        if (error instanceof AuthError) {
            throw error;
        }
        throw new AuthError('Authentication failed');
    }
}

/**
 * Creates middleware that requires specific permissions
 * @param requiredPermissions Permissions required to access the route
 */
export function requirePermissions(requiredPermissions: Permission[]) {
    return async (request: Request) => {
        try {
            const { roles } = await authenticateRequest(request);
            ensurePermissions(roles, requiredPermissions);
            return null; // Allow request to proceed
        } catch (error) {
            const formattedError = error instanceof Error 
                ? error 
                : new Error('Unknown error occurred');
            return NextResponse.json(
                formatErrorResponse(formattedError),
                { 
                    status: error instanceof AuthError ? error.statusCode : 500
                }
            );
        }
    };
}

/**
 * Creates middleware that requires specific roles
 * @param allowedRoles Roles allowed to access the route
 */
export function requireRoles(allowedRoles: string[]) {
    return async (request: Request) => {
        try {
            const { roles } = await authenticateRequest(request);
            const hasAllowedRole = roles.some(role => allowedRoles.includes(role));
            
            if (!hasAllowedRole) {
                throw new AuthError(
                    `Access denied. Required roles: ${allowedRoles.join(', ')}`,
                    403
                );
            }
            
            return null; // Allow request to proceed
        } catch (error) {
            const formattedError = error instanceof Error 
                ? error 
                : new Error('Unknown error occurred');
            return NextResponse.json(
                formatErrorResponse(formattedError),
                { 
                    status: error instanceof AuthError ? error.statusCode : 500
                }
            );
        }
    };
}

/**
 * Middleware to require admin role
 */
export const requireAdmin = requireRoles(['ADMIN']);

/**
 * Middleware to require read permission
 */
export const requireRead = requirePermissions(['read']);

/**
 * Middleware to require write permission
 */
export const requireWrite = requirePermissions(['write']);

/**
 * Middleware to require delete permission
 */
export const requireDelete = requirePermissions(['delete']);

/**
 * Helper to extract user information from authenticated request
 * Assumes request has been through authentication middleware
 */
export function getAuthenticatedUser(request: Request) {
    return authenticateRequest(request);
}
