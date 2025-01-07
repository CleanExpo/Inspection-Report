import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, withRole, Role, AuthenticatedRequest } from '../../middleware/auth';
import { performanceMonitor } from '../../utils/performance';
import { verify } from 'jsonwebtoken';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../utils/performance');

describe('Auth Middleware', () => {
    let mockReq: Partial<NextApiRequest>;
    let mockRes: Partial<NextApiResponse>;
    let mockHandler: jest.Mock;
    let mockVerify: jest.MockedFunction<typeof verify>;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup request mock
        mockReq = {
            headers: {},
            method: 'GET'
        };

        // Setup response mock
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            setHeader: jest.fn()
        };

        // Setup handler mock
        mockHandler = jest.fn().mockImplementation((req, res) => {
            return res.status(200).json({ success: true });
        });

        // Setup JWT verify mock
        mockVerify = verify as jest.MockedFunction<typeof verify>;
    });

    describe('Authentication', () => {
        it('should reject requests without authorization header', async () => {
            const handler = withAuth(mockHandler);
            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Missing or invalid authorization header'
            });
        });

        it('should reject requests with invalid token format', async () => {
            mockReq.headers = { authorization: 'Invalid token' };
            const handler = withAuth(mockHandler);
            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Missing or invalid authorization header'
            });
        });

        it('should reject requests with expired token', async () => {
            mockReq.headers = { authorization: 'Bearer valid.token.here' };
            mockVerify.mockImplementationOnce(() => {
                throw { name: 'TokenExpiredError' };
            });

            const handler = withAuth(mockHandler);
            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Token expired'
            });
        });

        it('should accept valid tokens and add user info to request', async () => {
            mockReq.headers = { authorization: 'Bearer valid.token.here' };
            const mockUser = {
                userId: '123',
                role: Role.ADMIN,
                email: 'admin@example.com'
            };
            mockVerify.mockReturnValueOnce(mockUser as any);

            const handler = withAuth(mockHandler);
            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            expect(mockHandler).toHaveBeenCalled();
            const authReq = mockHandler.mock.calls[0][0] as AuthenticatedRequest;
            expect(authReq.user).toEqual({
                id: mockUser.userId,
                role: mockUser.role,
                email: mockUser.email
            });
        });
    });

    describe('Role-based Authorization', () => {
        const setupAuthenticatedRequest = (role: Role) => {
            mockReq.headers = { authorization: 'Bearer valid.token.here' };
            mockVerify.mockReturnValueOnce({
                userId: '123',
                role,
                email: 'user@example.com'
            } as any);
        };

        it('should allow access to admin for any role requirement', async () => {
            setupAuthenticatedRequest(Role.ADMIN);

            const handler = withRole(Role.TECHNICIAN)(mockHandler);
            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            expect(mockHandler).toHaveBeenCalled();
            expect(mockRes.status).not.toHaveBeenCalledWith(403);
        });

        it('should allow access when user has exact required role', async () => {
            setupAuthenticatedRequest(Role.TECHNICIAN);

            const handler = withRole(Role.TECHNICIAN)(mockHandler);
            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            expect(mockHandler).toHaveBeenCalled();
            expect(mockRes.status).not.toHaveBeenCalledWith(403);
        });

        it('should deny access when user has insufficient role', async () => {
            setupAuthenticatedRequest(Role.VIEWER);

            const handler = withRole(Role.TECHNICIAN)(mockHandler);
            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            expect(mockHandler).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Insufficient permissions'
            });
        });

        it('should handle role hierarchy correctly', async () => {
            // Test each role against each permission level
            const roles = [Role.VIEWER, Role.TECHNICIAN, Role.ADMIN];
            const testMatrix = roles.map(userRole => 
                roles.map(requiredRole => ({
                    userRole,
                    requiredRole,
                    shouldAllow: userRole === Role.ADMIN || userRole === requiredRole
                }))
            ).flat();

            for (const { userRole, requiredRole, shouldAllow } of testMatrix) {
                jest.clearAllMocks();
                setupAuthenticatedRequest(userRole);

                const handler = withRole(requiredRole)(mockHandler);
                await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

                if (shouldAllow) {
                    expect(mockHandler).toHaveBeenCalled();
                    expect(mockRes.status).not.toHaveBeenCalledWith(403);
                } else {
                    expect(mockHandler).not.toHaveBeenCalled();
                    expect(mockRes.status).toHaveBeenCalledWith(403);
                }
            }
        });
    });

    describe('Performance Monitoring', () => {
        it('should record authentication metrics', async () => {
            mockReq.headers = { authorization: 'Bearer valid.token.here' };
            mockVerify.mockReturnValueOnce({
                userId: '123',
                role: Role.ADMIN,
                email: 'admin@example.com'
            } as any);

            const handler = withAuth(mockHandler);
            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            expect(performanceMonitor.measureAsync).toHaveBeenCalledWith(
                'auth_middleware',
                expect.any(Function)
            );
            expect(performanceMonitor.recordMetric).toHaveBeenCalledWith(
                'auth_success',
                1,
                expect.any(Object)
            );
        });

        it('should record authentication failures', async () => {
            mockReq.headers = { authorization: 'Bearer invalid.token' };
            mockVerify.mockImplementationOnce(() => {
                throw new Error('Invalid token');
            });

            const handler = withAuth(mockHandler);
            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            expect(performanceMonitor.recordMetric).toHaveBeenCalledWith(
                'auth_failure',
                1,
                expect.any(Object)
            );
        });

        it('should record role check metrics', async () => {
            mockReq.headers = { authorization: 'Bearer valid.token.here' };
            mockVerify.mockReturnValueOnce({
                userId: '123',
                role: Role.ADMIN,
                email: 'admin@example.com'
            } as any);

            const handler = withRole(Role.TECHNICIAN)(mockHandler);
            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            expect(performanceMonitor.measureAsync).toHaveBeenCalledWith(
                'role_check',
                expect.any(Function)
            );
            expect(performanceMonitor.recordMetric).toHaveBeenCalledWith(
                'role_check_success',
                1,
                expect.any(Object)
            );
        });
    });

    describe('Error Handling', () => {
        it('should handle missing JWT_SECRET gracefully', async () => {
            mockReq.headers = { authorization: 'Bearer valid.token.here' };
            process.env.JWT_SECRET = '';

            const handler = withAuth(mockHandler);
            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Internal server error'
            });
        });

        it('should handle JWT verification errors gracefully', async () => {
            mockReq.headers = { authorization: 'Bearer valid.token.here' };
            mockVerify.mockImplementationOnce(() => {
                throw new Error('Verification failed');
            });

            const handler = withAuth(mockHandler);
            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Invalid token'
            });
        });
    });
});
