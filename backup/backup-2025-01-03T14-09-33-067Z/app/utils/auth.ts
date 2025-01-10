import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandling';

// Environment variables (should be properly configured in production)
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'development-refresh-secret';

export interface TokenPayload {
    userId: string;
    roles: string[];
    email?: string;
}

export interface RefreshTokenPayload {
    userId: string;
    tokenVersion: number;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export class AuthError extends ApiError {
    constructor(message: string, statusCode: number = 401) {
        super(message, statusCode);
        this.name = 'AuthError';
    }
}

/**
 * Generates a new access token
 * @param payload User information to encode in the token
 * @param expiresIn Token expiration time in seconds (default: 15 minutes)
 */
export function generateAccessToken(payload: TokenPayload, expiresIn: number = 15 * 60): string {
    try {
        return jwt.sign(payload, JWT_SECRET, {
            expiresIn,
            algorithm: 'HS256'
        });
    } catch (error) {
        throw new AuthError('Failed to generate access token');
    }
}

/**
 * Generates a new refresh token
 * @param payload User information for refresh token
 * @param expiresIn Token expiration time in seconds (default: 7 days)
 */
export function generateRefreshToken(payload: RefreshTokenPayload, expiresIn: number = 7 * 24 * 60 * 60): string {
    try {
        return jwt.sign(payload, JWT_REFRESH_SECRET, {
            expiresIn,
            algorithm: 'HS256'
        });
    } catch (error) {
        throw new AuthError('Failed to generate refresh token');
    }
}

/**
 * Generates both access and refresh tokens
 * @param userId User identifier
 * @param roles User roles
 * @param email Optional user email
 */
export function generateTokens(userId: string, roles: string[], email?: string): TokenResponse {
    const accessToken = generateAccessToken({ userId, roles, email });
    const refreshToken = generateRefreshToken({ userId, tokenVersion: 1 });
    
    return {
        accessToken,
        refreshToken,
        expiresIn: 15 * 60 // 15 minutes in seconds
    };
}

/**
 * Verifies and decodes an access token
 * @param token JWT access token to verify
 */
export function verifyAccessToken(token: string): TokenPayload {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new AuthError('Token expired');
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new AuthError('Invalid token');
        }
        throw new AuthError('Token verification failed');
    }
}

/**
 * Verifies and decodes a refresh token
 * @param token JWT refresh token to verify
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new AuthError('Refresh token expired');
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new AuthError('Invalid refresh token');
        }
        throw new AuthError('Refresh token verification failed');
    }
}

/**
 * Refreshes an access token using a refresh token
 * @param refreshToken Valid refresh token
 * @param userData User data to include in new access token
 */
export function refreshAccessToken(refreshToken: string, userData: Omit<TokenPayload, 'userId'>): TokenResponse {
    try {
        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);
        
        // Generate new tokens
        const accessToken = generateAccessToken({
            userId: decoded.userId,
            ...userData
        });

        // Generate new refresh token with same version
        const newRefreshToken = generateRefreshToken({
            userId: decoded.userId,
            tokenVersion: decoded.tokenVersion
        });

        return {
            accessToken,
            refreshToken: newRefreshToken,
            expiresIn: 15 * 60 // 15 minutes in seconds
        };
    } catch (error) {
        if (error instanceof AuthError) {
            throw error;
        }
        throw new AuthError('Failed to refresh access token');
    }
}

/**
 * Extracts the bearer token from an authorization header
 * @param authHeader Authorization header value
 */
export function extractBearerToken(authHeader: string | null | undefined): string {
    if (!authHeader) {
        throw new AuthError('No authorization header');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        throw new AuthError('Invalid authorization header format');
    }

    return parts[1];
}
