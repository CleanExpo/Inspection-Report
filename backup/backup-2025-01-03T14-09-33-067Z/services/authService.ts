import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthError } from '../utils/errors';

const prisma = new PrismaClient();

// Ensure JWT secret is available
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m';  // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d';  // 7 days

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  static async generateTokens(userId: string): Promise<TokenPair> {
    try {
      // Get user data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        throw new AuthError('User not found');
      }

      // Create token payload
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      // Generate access token with non-null JWT_SECRET
      const accessToken = jwt.sign(payload, JWT_SECRET!, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
      });

      // Generate refresh token with non-null JWT_SECRET
      const refreshToken = jwt.sign(payload, JWT_SECRET!, {
        expiresIn: REFRESH_TOKEN_EXPIRY,
      });

      // Store refresh token in database
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Failed to generate tokens');
    }
  }

  static async verifyToken(token: string): Promise<JWTPayload> {
    try {
      // Verify token with non-null JWT_SECRET
      const decoded = jwt.verify(token, JWT_SECRET!) as JWTPayload & jwt.JwtPayload;
      
      // Ensure required fields are present
      if (!decoded.userId || !decoded.email || !decoded.role) {
        throw new AuthError('Invalid token payload');
      }

      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthError('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthError('Token expired');
      }
      throw new AuthError('Token verification failed');
    }
  }

  static async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      // Verify refresh token
      const decoded = await this.verifyToken(refreshToken);

      // Check if refresh token exists in database
      const storedToken = await prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          userId: decoded.userId,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!storedToken) {
        throw new AuthError('Invalid refresh token');
      }

      // Generate new access token with non-null JWT_SECRET
      const accessToken = jwt.sign(
        {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        },
        JWT_SECRET!,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
      );

      return accessToken;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Failed to refresh access token');
    }
  }

  static async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      await prisma.refreshToken.delete({
        where: {
          token: refreshToken,
        },
      });
    } catch (error) {
      throw new AuthError('Failed to revoke refresh token');
    }
  }

  static async validateRole(userId: string, requiredRole: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user) {
        throw new AuthError('User not found');
      }

      // Define role hierarchy
      const roleHierarchy: Record<string, number> = {
        ADMIN: 3,
        TECHNICIAN: 2,
        VIEWER: 1,
      };

      const userRoleLevel = roleHierarchy[user.role] || 0;
      const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

      return userRoleLevel >= requiredRoleLevel;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Failed to validate role');
    }
  }
}
