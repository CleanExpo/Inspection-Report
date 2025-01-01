import { jest, expect, describe, it } from '@jest/globals';
import { NextResponse } from 'next/server';
import { 
    requireAuth,
    requireRole,
    UserRole,
    AuthError,
    UnauthorizedError,
    ForbiddenError
} from '../../app/middleware/authMiddleware';
import { generateToken } from '../../app/utils/security';

describe('Auth Middleware', () => {
    const mockRequest = (token?: string) => {
        const headers = new Headers();
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return new Request('http://localhost/api/test', { headers });
    };

    const mockUser = {
        id: '123',
        email: 'test@example.com',
        role: UserRole.USER
    };

    const mockAdminUser = {
        id: '456',
        email: 'admin@example.com',
        role: UserRole.ADMIN
    };

    describe('requireAuth', () => {
        it('should pass with valid token', async () => {
            const token = generateToken(mockUser);
            const request = mockRequest(token);
            const response = await requireAuth(request);

            expect(response).toBeUndefined();
            expect(request.user).toMatchObject(mockUser);
        });

        it('should reject missing token', async () => {
            const request = mockRequest();
            const response = await requireAuth(request);

            expect(response).toBeInstanceOf(NextResponse);
            expect(response?.status).toBe(401);

            const data = await response?.json();
            expect(data.success).toBe(false);
            expect(data.message).toContain('authentication');
        });

        it('should reject invalid token', async () => {
            const request = mockRequest('invalid-token');
            const response = await requireAuth(request);

            expect(response).toBeInstanceOf(NextResponse);
            expect(response?.status).toBe(401);
        });

        it('should reject expired token', async () => {
            // Mock Date.now to simulate token expiration
            const realDateNow = Date.now.bind(global.Date);
            const dateNowStub = jest.fn(() => realDateNow() + 24 * 60 * 60 * 1000);
            global.Date.now = dateNowStub;

            const token = generateToken(mockUser);
            const request = mockRequest(token);
            const response = await requireAuth(request);

            expect(response).toBeInstanceOf(NextResponse);
            expect(response?.status).toBe(401);

            // Restore Date.now
            global.Date.now = realDateNow;
        });
    });

    describe('requireRole', () => {
        it('should pass with correct role', async () => {
            const token = generateToken(mockAdminUser);
            const request = mockRequest(token);
            
            // First apply requireAuth
            await requireAuth(request);
            
            // Then check role
            const response = await requireRole(request, UserRole.ADMIN);

            expect(response).toBeUndefined();
        });

        it('should pass with higher role', async () => {
            const token = generateToken(mockAdminUser);
            const request = mockRequest(token);
            
            await requireAuth(request);
            const response = await requireRole(request, UserRole.USER);

            expect(response).toBeUndefined();
        });

        it('should reject insufficient role', async () => {
            const token = generateToken(mockUser);
            const request = mockRequest(token);
            
            await requireAuth(request);
            const response = await requireRole(request, UserRole.ADMIN);

            expect(response).toBeInstanceOf(NextResponse);
            expect(response?.status).toBe(403);

            const data = await response?.json();
            expect(data.success).toBe(false);
            expect(data.message).toContain('permission');
        });

        it('should reject if not authenticated', async () => {
            const request = mockRequest();
            const response = await requireRole(request, UserRole.USER);

            expect(response).toBeInstanceOf(NextResponse);
            expect(response?.status).toBe(401);
        });

        it('should handle invalid role value', async () => {
            const token = generateToken({ ...mockUser, role: 'INVALID_ROLE' });
            const request = mockRequest(token);
            
            await requireAuth(request);
            const response = await requireRole(request, UserRole.USER);

            expect(response).toBeInstanceOf(NextResponse);
            expect(response?.status).toBe(403);
        });
    });
});
