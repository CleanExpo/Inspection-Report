import jwt from 'jsonwebtoken';
import { createError } from '../middleware/errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

interface TokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export const generateToken = (user: TokenPayload): TokenResponse => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    {
      id: user.id,
      type: 'refresh',
    },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );

  return {
    token,
    refreshToken,
    expiresIn: parseInt(JWT_EXPIRES_IN) || 86400, // 1 day in seconds
  };
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw createError.unauthorized('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw createError.unauthorized('Invalid token');
    }
    throw error;
  }
};

export const verifyRefreshToken = (token: string): { id: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; type: string };
    if (decoded.type !== 'refresh') {
      throw createError.unauthorized('Invalid refresh token');
    }
    return { id: decoded.id };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw createError.unauthorized('Refresh token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw createError.unauthorized('Invalid refresh token');
    }
    throw error;
  }
};

export const extractTokenFromHeader = (authHeader?: string): string => {
  if (!authHeader) {
    throw createError.unauthorized('No token provided');
  }

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    throw createError.unauthorized('Invalid token format');
  }

  return token;
};

// Token blacklist using Set (consider using Redis for production)
const tokenBlacklist = new Set<string>();

export const blacklistToken = (token: string): void => {
  tokenBlacklist.add(token);
};

export const isTokenBlacklisted = (token: string): boolean => {
  return tokenBlacklist.has(token);
};

// Clean up expired tokens from blacklist periodically
setInterval(() => {
  tokenBlacklist.forEach(token => {
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        tokenBlacklist.delete(token);
      }
    }
  });
}, 3600000); // Clean up every hour
