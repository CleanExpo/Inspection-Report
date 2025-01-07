import jwt from 'jsonwebtoken';
import {
    generateAccessToken,
    generateRefreshToken,
    generateTokens,
    verifyAccessToken,
    verifyRefreshToken,
    refreshAccessToken,
    extractBearerToken,
    AuthError,
    type TokenPayload,
    type RefreshTokenPayload
} from '../../app/utils/auth';

describe('Authentication Utils', () => {
    const mockUserId = '123';
    const mockRoles = ['user'];
    const mockEmail = 'test@example.com';

    describe('Token Generation', () => {
        it('should generate valid access token', () => {
            const payload: TokenPayload = {
                userId: mockUserId,
                roles: mockRoles,
                email: mockEmail
            };
            const token = generateAccessToken(payload);

            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
        });

        it('should generate valid refresh token', () => {
            const payload: RefreshTokenPayload = {
                userId: mockUserId,
                tokenVersion: 1
            };
            const token = generateRefreshToken(payload);

            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3);
        });

        it('should generate both tokens with generateTokens', () => {
            const tokens = generateTokens(mockUserId, mockRoles, mockEmail);

            expect(tokens).toHaveProperty('accessToken');
            expect(tokens).toHaveProperty('refreshToken');
            expect(tokens).toHaveProperty('expiresIn');
            expect(typeof tokens.accessToken).toBe('string');
            expect(typeof tokens.refreshToken).toBe('string');
            expect(typeof tokens.expiresIn).toBe('number');
        });

        it('should include correct payload in access token', () => {
            const payload: TokenPayload = {
                userId: mockUserId,
                roles: mockRoles,
                email: mockEmail
            };
            const token = generateAccessToken(payload);
            const decoded = jwt.decode(token) as TokenPayload & { exp: number; iat: number };

            expect(decoded.userId).toBe(mockUserId);
            expect(decoded.roles).toEqual(mockRoles);
            expect(decoded.email).toBe(mockEmail);
        });

        it('should respect custom expiration time', () => {
            const payload: TokenPayload = {
                userId: mockUserId,
                roles: mockRoles
            };
            const expiresIn = 60; // 1 minute
            const token = generateAccessToken(payload, expiresIn);
            const decoded = jwt.decode(token) as TokenPayload & { exp: number; iat: number };

            expect(decoded.exp - decoded.iat).toBe(expiresIn);
        });
    });

    describe('Token Verification', () => {
        it('should verify valid access token', () => {
            const payload: TokenPayload = {
                userId: mockUserId,
                roles: mockRoles
            };
            const token = generateAccessToken(payload);
            const decoded = verifyAccessToken(token);

            expect(decoded.userId).toBe(mockUserId);
            expect(decoded.roles).toEqual(mockRoles);
        });

        it('should verify valid refresh token', () => {
            const payload: RefreshTokenPayload = {
                userId: mockUserId,
                tokenVersion: 1
            };
            const token = generateRefreshToken(payload);
            const decoded = verifyRefreshToken(token);

            expect(decoded.userId).toBe(mockUserId);
            expect(decoded.tokenVersion).toBe(1);
        });

        it('should reject expired token', async () => {
            const payload: TokenPayload = {
                userId: mockUserId,
                roles: mockRoles
            };
            const token = generateAccessToken(payload, 1); // 1 second expiry

            // Wait for token to expire
            await new Promise(resolve => setTimeout(resolve, 1100));

            expect(() => verifyAccessToken(token)).toThrow(AuthError);
            expect(() => verifyAccessToken(token)).toThrow('Token expired');
        });

        it('should reject invalid token', () => {
            const invalidToken = 'invalid.token.format';
            expect(() => verifyAccessToken(invalidToken)).toThrow(AuthError);
            expect(() => verifyAccessToken(invalidToken)).toThrow('Invalid token');
        });

        it('should reject tampered token', () => {
            const payload: TokenPayload = {
                userId: mockUserId,
                roles: mockRoles
            };
            const token = generateAccessToken(payload);
            const tamperedToken = token.slice(0, -1) + 'X'; // Modify signature

            expect(() => verifyAccessToken(tamperedToken)).toThrow(AuthError);
        });
    });

    describe('Token Refresh', () => {
        it('should refresh access token with valid refresh token', () => {
            // Generate initial tokens
            const tokens = generateTokens(mockUserId, mockRoles, mockEmail);

            // Refresh access token
            const newTokens = refreshAccessToken(tokens.refreshToken, {
                roles: mockRoles,
                email: mockEmail
            });

            expect(newTokens.accessToken).not.toBe(tokens.accessToken);
            expect(newTokens.refreshToken).not.toBe(tokens.refreshToken);
            expect(newTokens.expiresIn).toBe(15 * 60);

            // Verify new access token
            const decoded = verifyAccessToken(newTokens.accessToken);
            expect(decoded.userId).toBe(mockUserId);
            expect(decoded.roles).toEqual(mockRoles);
            expect(decoded.email).toBe(mockEmail);
        });

        it('should reject refresh with invalid refresh token', () => {
            const invalidToken = 'invalid.refresh.token';
            expect(() => refreshAccessToken(invalidToken, { roles: mockRoles }))
                .toThrow(AuthError);
        });

        it('should reject refresh with expired refresh token', async () => {
            // Generate refresh token with 1 second expiry
            const token = generateRefreshToken({
                userId: mockUserId,
                tokenVersion: 1
            }, 1);

            // Wait for token to expire
            await new Promise(resolve => setTimeout(resolve, 1100));

            expect(() => refreshAccessToken(token, { roles: mockRoles }))
                .toThrow('Refresh token expired');
        });
    });

    describe('Bearer Token Extraction', () => {
        it('should extract token from valid authorization header', () => {
            const token = 'valid.token.here';
            const header = `Bearer ${token}`;
            expect(extractBearerToken(header)).toBe(token);
        });

        it('should reject missing authorization header', () => {
            expect(() => extractBearerToken(null)).toThrow(AuthError);
            expect(() => extractBearerToken(undefined)).toThrow('No authorization header');
        });

        it('should reject invalid authorization header format', () => {
            expect(() => extractBearerToken('InvalidFormat token')).toThrow(AuthError);
            expect(() => extractBearerToken('Bearer')).toThrow('Invalid authorization header format');
            expect(() => extractBearerToken('Bearer token extra')).toThrow('Invalid authorization header format');
        });
    });
});
