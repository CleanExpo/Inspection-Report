import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import { 
    generateToken,
    validateToken,
    refreshToken,
    TokenError,
    TokenExpiredError,
    TokenInvalidError
} from '../../app/utils/security';

describe('Security Utilities', () => {
    const mockUser = {
        id: '123',
        email: 'test@example.com',
        role: 'user'
    };

    beforeEach(() => {
        // Reset JWT_SECRET for each test
        process.env.JWT_SECRET = 'test-secret';
        process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    });

    describe('generateToken', () => {
        it('should generate access token', () => {
            const token = generateToken(mockUser);
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
        });

        it('should generate refresh token', () => {
            const token = generateToken(mockUser, true);
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
        });

        it('should throw error if JWT_SECRET is not set', () => {
            delete process.env.JWT_SECRET;
            expect(() => generateToken(mockUser)).toThrow(TokenError);
        });

        it('should throw error if JWT_REFRESH_SECRET is not set for refresh token', () => {
            delete process.env.JWT_REFRESH_SECRET;
            expect(() => generateToken(mockUser, true)).toThrow(TokenError);
        });
    });

    describe('validateToken', () => {
        it('should validate valid token', () => {
            const token = generateToken(mockUser);
            const decoded = validateToken(token);
            expect(decoded).toMatchObject({
                id: mockUser.id,
                email: mockUser.email,
                role: mockUser.role
            });
        });

        it('should validate refresh token', () => {
            const token = generateToken(mockUser, true);
            const decoded = validateToken(token, true);
            expect(decoded).toMatchObject({
                id: mockUser.id,
                email: mockUser.email,
                role: mockUser.role
            });
        });

        it('should throw TokenInvalidError for invalid token', () => {
            expect(() => validateToken('invalid-token')).toThrow(TokenInvalidError);
        });

        it('should throw TokenExpiredError for expired token', () => {
            // Mock Date.now to simulate token expiration
            const realDateNow = Date.now.bind(global.Date);
            const dateNowStub = jest.fn(() => realDateNow() + 24 * 60 * 60 * 1000); // Add 24 hours
            global.Date.now = dateNowStub;

            const token = generateToken(mockUser);
            expect(() => validateToken(token)).toThrow(TokenExpiredError);

            // Restore Date.now
            global.Date.now = realDateNow;
        });

        it('should throw TokenInvalidError if wrong secret used', () => {
            const token = generateToken(mockUser);
            process.env.JWT_SECRET = 'different-secret';
            expect(() => validateToken(token)).toThrow(TokenInvalidError);
        });
    });

    describe('refreshToken', () => {
        it('should generate new access token from refresh token', () => {
            const refreshTokenStr = generateToken(mockUser, true);
            const newToken = refreshToken(refreshTokenStr);
            expect(newToken).toBeDefined();
            expect(typeof newToken).toBe('string');

            // Validate new token
            const decoded = validateToken(newToken);
            expect(decoded).toMatchObject({
                id: mockUser.id,
                email: mockUser.email,
                role: mockUser.role
            });
        });

        it('should throw TokenInvalidError for invalid refresh token', () => {
            expect(() => refreshToken('invalid-token')).toThrow(TokenInvalidError);
        });

        it('should throw TokenExpiredError for expired refresh token', () => {
            // Mock Date.now to simulate token expiration
            const realDateNow = Date.now.bind(global.Date);
            const dateNowStub = jest.fn(() => realDateNow() + 7 * 24 * 60 * 60 * 1000); // Add 7 days
            global.Date.now = dateNowStub;

            const refreshTokenStr = generateToken(mockUser, true);
            expect(() => refreshToken(refreshTokenStr)).toThrow(TokenExpiredError);

            // Restore Date.now
            global.Date.now = realDateNow;
        });

        it('should throw TokenError if secrets not configured', () => {
            const refreshTokenStr = generateToken(mockUser, true);
            delete process.env.JWT_SECRET;
            delete process.env.JWT_REFRESH_SECRET;
            expect(() => refreshToken(refreshTokenStr)).toThrow(TokenError);
        });
    });
});
