import { NextResponse } from 'next/server';
import {
    authenticateRequest,
    requirePermissions,
    requireRoles,
    requireAdmin,
    requireRead,
    requireWrite,
    requireDelete
} from '../../app/middleware/authMiddleware';
import { generateAccessToken } from '../../app/utils/auth';
import { AuthError } from '../../app/utils/auth';

describe('Auth Middleware', () => {
    const mockUserId = '123';
    const mockRoles = ['USER'];
    const mockEmail = 'test@example.com';

    function createMockRequest(token?: string, method: string = 'GET') {
        const headers = new Headers();
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return new Request('http://localhost/api/test', {
            method,
            headers
        });
    }

    describe('authenticateRequest', () => {
        it('should authenticate valid token', async () => {
            const token = generateAccessToken({ userId: mockUserId, roles: mockRoles, email: mockEmail });
            const request = createMockRequest(token);
            
            const user = await authenticateRequest(request);
            expect(user.userId).toBe(mockUserId);
            expect(user.roles).toEqual(mockRoles);
            expect(user.email).toBe(mockEmail);
        });

        it('should reject missing token', async () => {
            const request = createMockRequest();
            await expect(authenticateRequest(request)).rejects.toThrow(AuthError);
        });

        it('should reject invalid token format', async () => {
            const request = createMockRequest('invalid.token');
            await expect(authenticateRequest(request)).rejects.toThrow(AuthError);
        });

        it('should reject expired token', async () => {
            const token = generateAccessToken(
                { userId: mockUserId, roles: mockRoles },
                1 // 1 second expiry
            );
            
            // Wait for token to expire
            await new Promise(resolve => setTimeout(resolve, 1100));
            
            const request = createMockRequest(token);
            await expect(authenticateRequest(request)).rejects.toThrow('Token expired');
        });
    });

    describe('Permission-based Middleware', () => {
        it('should allow access with required permissions', async () => {
            const token = generateAccessToken({ userId: mockUserId, roles: ['ADMIN'] });
            const request = createMockRequest(token);
            
            const middleware = requirePermissions(['read', 'write']);
            const response = await middleware(request);
            
            expect(response).toBeNull(); // Null response means proceed
        });

        it('should deny access without required permissions', async () => {
            const token = generateAccessToken({ userId: mockUserId, roles: ['VIEWER'] });
            const request = createMockRequest(token);
            
            const middleware = requirePermissions(['write']);
            const response = await middleware(request);
            
            expect(response).toBeInstanceOf(NextResponse);
            expect(response?.status).toBe(403);
        });

        it('should handle authentication errors', async () => {
            const request = createMockRequest('invalid.token');
            
            const middleware = requirePermissions(['read']);
            const response = await middleware(request);
            
            expect(response).toBeInstanceOf(NextResponse);
            expect(response?.status).toBe(401);
        });
    });

    describe('Role-based Middleware', () => {
        it('should allow access with required role', async () => {
            const token = generateAccessToken({ userId: mockUserId, roles: ['ADMIN'] });
            const request = createMockRequest(token);
            
            const middleware = requireRoles(['ADMIN']);
            const response = await middleware(request);
            
            expect(response).toBeNull();
        });

        it('should deny access without required role', async () => {
            const token = generateAccessToken({ userId: mockUserId, roles: ['USER'] });
            const request = createMockRequest(token);
            
            const middleware = requireRoles(['ADMIN']);
            const response = await middleware(request);
            
            expect(response).toBeInstanceOf(NextResponse);
            expect(response?.status).toBe(403);
        });
    });

    describe('Convenience Middlewares', () => {
        const adminToken = generateAccessToken({ userId: mockUserId, roles: ['ADMIN'] });
        const userToken = generateAccessToken({ userId: mockUserId, roles: ['USER'] });
        const viewerToken = generateAccessToken({ userId: mockUserId, roles: ['VIEWER'] });

        it('should enforce admin access', async () => {
            const adminRequest = createMockRequest(adminToken);
            const userRequest = createMockRequest(userToken);
            
            expect(await requireAdmin(adminRequest)).toBeNull();
            expect((await requireAdmin(userRequest))?.status).toBe(403);
        });

        it('should enforce read permission', async () => {
            const viewerRequest = createMockRequest(viewerToken);
            const invalidRequest = createMockRequest('invalid.token');
            
            expect(await requireRead(viewerRequest)).toBeNull();
            expect((await requireRead(invalidRequest))?.status).toBe(401);
        });

        it('should enforce write permission', async () => {
            const userRequest = createMockRequest(userToken);
            const viewerRequest = createMockRequest(viewerToken);
            
            expect(await requireWrite(userRequest)).toBeNull();
            expect((await requireWrite(viewerRequest))?.status).toBe(403);
        });

        it('should enforce delete permission', async () => {
            const adminRequest = createMockRequest(adminToken);
            const userRequest = createMockRequest(userToken);
            
            expect(await requireDelete(adminRequest)).toBeNull();
            expect((await requireDelete(userRequest))?.status).toBe(403);
        });
    });

    describe('Error Responses', () => {
        it('should return formatted error responses', async () => {
            const request = createMockRequest('invalid.token');
            const middleware = requirePermissions(['read']);
            const response = await middleware(request);
            
            const data = await response?.json();
            expect(data).toEqual(expect.objectContaining({
                success: false,
                message: expect.any(String),
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: expect.any(String),
                        message: expect.any(String)
                    })
                ])
            }));
        });

        it('should include appropriate status codes', async () => {
            const invalidAuthRequest = createMockRequest('invalid.token');
            const invalidPermRequest = createMockRequest(
                generateAccessToken({ userId: mockUserId, roles: ['VIEWER'] })
            );
            
            const middleware = requirePermissions(['write']);
            
            expect((await middleware(invalidAuthRequest))?.status).toBe(401);
            expect((await middleware(invalidPermRequest))?.status).toBe(403);
        });
    });
});
