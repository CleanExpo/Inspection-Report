import jwt from 'jsonwebtoken';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * Base token error
 */
export class TokenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TokenError';
    }
}

/**
 * Token expired error
 */
export class TokenExpiredError extends TokenError {
    constructor(message: string = 'Token has expired') {
        super(message);
        this.name = 'TokenExpiredError';
    }
}

/**
 * Token invalid error
 */
export class TokenInvalidError extends TokenError {
    constructor(message: string = 'Token is invalid') {
        super(message);
        this.name = 'TokenInvalidError';
    }
}

/**
 * User data interface for tokens
 */
export interface TokenUser {
    id: string;
    email: string;
    role: string;
}

/**
 * Generates a JWT token for a user
 * @param user User data to encode in token
 * @param isRefresh Whether to generate a refresh token
 * @returns JWT token string
 */
export function generateToken(user: TokenUser, isRefresh: boolean = false): string {
    const secret = isRefresh ? process.env.JWT_REFRESH_SECRET : process.env.JWT_SECRET;
    
    if (!secret) {
        throw new TokenError(
            isRefresh 
                ? 'JWT_REFRESH_SECRET not configured'
                : 'JWT_SECRET not configured'
        );
    }

    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        secret,
        {
            expiresIn: isRefresh ? REFRESH_TOKEN_EXPIRY : ACCESS_TOKEN_EXPIRY
        }
    );
}

/**
 * Validates a JWT token
 * @param token Token to validate
 * @param isRefresh Whether this is a refresh token
 * @returns Decoded token data
 */
export function validateToken(token: string, isRefresh: boolean = false): TokenUser {
    const secret = isRefresh ? process.env.JWT_REFRESH_SECRET : process.env.JWT_SECRET;
    
    if (!secret) {
        throw new TokenError(
            isRefresh 
                ? 'JWT_REFRESH_SECRET not configured'
                : 'JWT_SECRET not configured'
        );
    }

    try {
        const decoded = jwt.verify(token, secret) as TokenUser & { exp: number };

        // Check if token has expired
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
            throw new TokenExpiredError();
        }

        return {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };
    } catch (error) {
        if (error instanceof TokenError) {
            throw error;
        }
        if (error instanceof jwt.TokenExpiredError) {
            throw new TokenExpiredError();
        }
        throw new TokenInvalidError();
    }
}

/**
 * Refreshes an access token using a refresh token
 * @param refreshToken Refresh token to use
 * @returns New access token
 */
export function refreshToken(refreshToken: string): string {
    // Validate refresh token
    const userData = validateToken(refreshToken, true);
    
    // Generate new access token
    return generateToken(userData);
}
