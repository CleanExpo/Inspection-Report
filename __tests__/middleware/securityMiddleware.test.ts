import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import { NextResponse } from 'next/server';
import { 
    rateLimiter,
    corsMiddleware,
    validateRequest,
    RateLimitExceededError,
    RequestValidationError
} from '../../app/middleware/securityMiddleware';
import { loadSecurityConfig } from '../../app/config/security';

describe('Security Middleware', () => {
    const mockRequest = (options: {
        method?: string;
        origin?: string;
        ip?: string;
        body?: any;
    } = {}) => {
        const headers = new Headers();
        if (options.origin) {
            headers.set('Origin', options.origin);
        }
        if (options.ip) {
            headers.set('X-Forwarded-For', options.ip);
        }

        return new Request('http://localhost/api/test', {
            method: options.method || 'GET',
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined
        });
    };

    describe('rateLimiter', () => {
        beforeEach(() => {
            // Clear rate limit store between tests
            jest.isolateModules(() => {
                require('../../app/middleware/securityMiddleware').clearRateLimits();
            });
        });

        it('should allow requests within rate limit', async () => {
            const config = await loadSecurityConfig();
            const request = mockRequest({ ip: '127.0.0.1' });

            // Make multiple requests up to limit
            for (let i = 0; i < config.rateLimit.maxRequests; i++) {
                const response = await rateLimiter(request);
                expect(response).toBeUndefined();
            }
        });

        it('should block requests exceeding rate limit', async () => {
            const config = await loadSecurityConfig();
            const request = mockRequest({ ip: '127.0.0.1' });

            // Exceed rate limit
            for (let i = 0; i < config.rateLimit.maxRequests; i++) {
                await rateLimiter(request);
            }

            const response = await rateLimiter(request);
            expect(response).toBeInstanceOf(NextResponse);
            expect(response?.status).toBe(429);

            const data = await response?.json();
            expect(data.success).toBe(false);
            expect(data.message).toContain('rate limit');
        });

        it('should handle missing IP address', async () => {
            const request = mockRequest();
            const response = await rateLimiter(request);

            expect(response).toBeInstanceOf(NextResponse);
            expect(response?.status).toBe(400);
        });
    });

    describe('corsMiddleware', () => {
        it('should allow requests from allowed origins', async () => {
            const config = await loadSecurityConfig();
            const request = mockRequest({
                origin: config.cors.allowedOrigins[0]
            });

            const response = await corsMiddleware(request);
            expect(response).toBeUndefined();
        });

        it('should block requests from disallowed origins', async () => {
            const request = mockRequest({
                origin: 'http://evil.com'
            });

            const response = await corsMiddleware(request);
            expect(response).toBeInstanceOf(NextResponse);
            expect(response?.status).toBe(403);
        });

        it('should handle missing origin header', async () => {
            const request = mockRequest();
            const response = await corsMiddleware(request);

            expect(response).toBeUndefined();
        });

        it('should handle preflight requests', async () => {
            const config = await loadSecurityConfig();
            const request = mockRequest({
                method: 'OPTIONS',
                origin: config.cors.allowedOrigins[0]
            });

            const response = await corsMiddleware(request);
            expect(response).toBeInstanceOf(NextResponse);
            expect(response?.status).toBe(204);
            expect(response?.headers.get('Access-Control-Allow-Methods'))
                .toBe(config.cors.allowedMethods.join(', '));
        });
    });

    describe('validateRequest', () => {
        it('should validate valid request body', async () => {
            const request = mockRequest({
                method: 'POST',
                body: { test: 'valid' }
            });

            const schema = {
                type: 'object',
                properties: {
                    test: { type: 'string' }
                },
                required: ['test']
            };

            const response = await validateRequest(request, schema);
            expect(response).toBeUndefined();
        });

        it('should reject invalid request body', async () => {
            const request = mockRequest({
                method: 'POST',
                body: { test: 123 }
            });

            const schema = {
                type: 'object',
                properties: {
                    test: { type: 'string' }
                },
                required: ['test']
            };

            const response = await validateRequest(request, schema);
            expect(response).toBeInstanceOf(NextResponse);
            expect(response?.status).toBe(400);

            const data = await response?.json();
            expect(data.success).toBe(false);
            expect(data.errors).toBeDefined();
        });

        it('should handle missing required fields', async () => {
            const request = mockRequest({
                method: 'POST',
                body: {}
            });

            const schema = {
                type: 'object',
                properties: {
                    test: { type: 'string' }
                },
                required: ['test']
            };

            const response = await validateRequest(request, schema);
            expect(response).toBeInstanceOf(NextResponse);
            expect(response?.status).toBe(400);
        });

        it('should handle malformed JSON', async () => {
            const request = new Request('http://localhost/api/test', {
                method: 'POST',
                body: 'invalid json'
            });

            const schema = {
                type: 'object',
                properties: {
                    test: { type: 'string' }
                }
            };

            const response = await validateRequest(request, schema);
            expect(response).toBeInstanceOf(NextResponse);
            expect(response?.status).toBe(400);
        });
    });
});
