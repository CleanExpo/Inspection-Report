import { SignJWT, jwtVerify } from 'jose';
import { JWTPayload, RefreshTokenPayload, TokenPair } from '../types/auth';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-development-secret'
);

const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'default-development-refresh-secret'
);

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m';  // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d';  // 7 days

/**
 * Generate an access token for a user
 */
export async function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
  
  return token;
}

/**
 * Generate a refresh token for a user
 */
export async function generateRefreshToken(userId: string, tokenVersion: number): Promise<string> {
  const payload: RefreshTokenPayload = {
    userId,
    tokenVersion
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(JWT_REFRESH_SECRET);

  return token;
}

/**
 * Generate both access and refresh tokens
 */
export async function generateTokenPair(
  payload: Omit<JWTPayload, 'iat' | 'exp'>, 
  tokenVersion: number
): Promise<TokenPair> {
  const [token, refreshToken] = await Promise.all([
    generateAccessToken(payload),
    generateRefreshToken(payload.userId, tokenVersion)
  ]);

  return { token, refreshToken };
}

/**
 * Verify an access token
 */
export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch (error) {
    throw new Error('Invalid access token');
  }
}

/**
 * Verify a refresh token
 */
export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);
    return payload as RefreshTokenPayload;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(exp?: number): boolean {
  if (!exp) return true;
  return Date.now() >= exp * 1000;
}
