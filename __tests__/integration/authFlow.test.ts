import { POST as loginPost } from '../../app/api/auth/login/route';
import { POST as refreshPost } from '../../app/api/auth/refresh/route';
import { POST as logoutPost } from '../../app/api/auth/logout/route';
import { GET as jobsGet } from '../../app/api/jobs/route';
import { createRequest } from '../utils/testUtils';
import { JobService } from '../../app/services/jobService';

// Import mocked service
import { mockListJobs } from '../mocks/jobService';

/**
 * End-to-end authentication flow tests
 * Tests complete authentication lifecycle including:
 * - Login
 * - Token refresh
 * - Protected route access
 * - Logout
 */

describe('Authentication Flow Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Login Flow', () => {
        it('should authenticate valid credentials', async () => {
            const response = await loginPost(createRequest.post('/api/auth/login', {
                email: 'admin@example.com',
                password: 'admin123'
            }));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.accessToken).toBeDefined();
            expect(data.refreshToken).toBeDefined();
            expect(data.expiresIn).toBeDefined();
        });

        it('should reject invalid credentials', async () => {
            const response = await loginPost(createRequest.post('/api/auth/login', {
                email: 'admin@example.com',
                password: 'wrongpassword'
            }));
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.errors).toBeDefined();
        });

        it('should require all fields', async () => {
            const response = await loginPost(createRequest.post('/api/auth/login', {
                email: 'admin@example.com'
                // missing password
            }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'password'
                })
            );
        });
    });

    describe('Token Refresh Flow', () => {
        it('should refresh valid tokens', async () => {
            // First login to get tokens
            const loginResponse = await loginPost(createRequest.post('/api/auth/login', {
                email: 'admin@example.com',
                password: 'admin123'
            }));
            const loginData = await loginResponse.json();
            const refreshToken = loginData.refreshToken;

            // Then try to refresh
            const refreshResponse = await refreshPost(createRequest.post('/api/auth/refresh', {
                refreshToken
            }));
            const refreshData = await refreshResponse.json();

            expect(refreshResponse.status).toBe(200);
            expect(refreshData.success).toBe(true);
            expect(refreshData.accessToken).toBeDefined();
            expect(refreshData.refreshToken).toBeDefined();
            expect(refreshData.accessToken).not.toBe(loginData.accessToken);
        });

        it('should reject invalid refresh tokens', async () => {
            const response = await refreshPost(createRequest.post('/api/auth/refresh', {
                refreshToken: 'invalid.refresh.token'
            }));
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
        });
    });

    describe('Protected Route Access', () => {
        it('should access protected route with valid token', async () => {
            // First login to get token
            const loginResponse = await loginPost(createRequest.post('/api/auth/login', {
                email: 'admin@example.com',
                password: 'admin123'
            }));
            const { accessToken } = await loginResponse.json();

            // Mock jobs service
            mockListJobs.mockResolvedValueOnce({
                jobs: [],
                total: 0
            });

            // Try to access protected route
            const response = await jobsGet(createRequest.get('/api/jobs', {}, {
                authorization: `Bearer ${accessToken}`
            }));

            expect(response.status).toBe(200);
        });

        it('should reject access without token', async () => {
            const response = await jobsGet(createRequest.get('/api/jobs'));
            expect(response.status).toBe(401);
        });

        it('should reject access with invalid token', async () => {
            const response = await jobsGet(createRequest.get('/api/jobs', {}, {
                authorization: 'Bearer invalid.token'
            }));
            expect(response.status).toBe(401);
        });
    });

    describe('Logout Flow', () => {
        it('should successfully logout with valid token', async () => {
            // First login to get token
            const loginResponse = await loginPost(createRequest.post('/api/auth/login', {
                email: 'admin@example.com',
                password: 'admin123'
            }));
            const { refreshToken } = await loginResponse.json();

            // Then logout
            const logoutResponse = await logoutPost(createRequest.post('/api/auth/logout', {}, {
                authorization: `Bearer ${refreshToken}`
            }));
            const logoutData = await logoutResponse.json();

            expect(logoutResponse.status).toBe(200);
            expect(logoutData.success).toBe(true);
        });

        it('should handle logout without token', async () => {
            const response = await logoutPost(createRequest.post('/api/auth/logout'));
            expect(response.status).toBe(400);
        });

        it('should prevent refresh token reuse after logout', async () => {
            // First login
            const loginResponse = await loginPost(createRequest.post('/api/auth/login', {
                email: 'admin@example.com',
                password: 'admin123'
            }));
            const { refreshToken } = await loginResponse.json();

            // Then logout
            await logoutPost(createRequest.post('/api/auth/logout', {}, {
                authorization: `Bearer ${refreshToken}`
            }));

            // Try to refresh with the same token
            const refreshResponse = await refreshPost(createRequest.post('/api/auth/refresh', {
                refreshToken
            }));

            expect(refreshResponse.status).toBe(401);
        });
    });

    describe('Complete Authentication Lifecycle', () => {
        it('should handle full authentication flow', async () => {
            // 1. Login
            const loginResponse = await loginPost(createRequest.post('/api/auth/login', {
                email: 'admin@example.com',
                password: 'admin123'
            }));
            const { accessToken, refreshToken } = await loginResponse.json();
            expect(loginResponse.status).toBe(200);

            // 2. Access protected route
            mockListJobs.mockResolvedValueOnce({
                jobs: [],
                total: 0
            });
            const protectedResponse = await jobsGet(createRequest.get('/api/jobs', {}, {
                authorization: `Bearer ${accessToken}`
            }));
            expect(protectedResponse.status).toBe(200);

            // 3. Refresh token
            const refreshResponse = await refreshPost(createRequest.post('/api/auth/refresh', {
                refreshToken
            }));
            const { accessToken: newAccessToken } = await refreshResponse.json();
            expect(refreshResponse.status).toBe(200);
            expect(newAccessToken).not.toBe(accessToken);

            // 4. Logout
            const logoutResponse = await logoutPost(createRequest.post('/api/auth/logout', {}, {
                authorization: `Bearer ${refreshToken}`
            }));
            expect(logoutResponse.status).toBe(200);

            // 5. Verify cannot use tokens after logout
            const finalResponse = await jobsGet(createRequest.get('/api/jobs', {}, {
                authorization: `Bearer ${newAccessToken}`
            }));
            expect(finalResponse.status).toBe(401);
        });
    });
});
