import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { verifyToken, extractTokenFromHeader, isTokenBlacklisted } from '../utils/jwt';
import { createError } from './errorHandler';
import { User, UserRole, UserPermission, Permission } from '../types/auth';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (isTokenBlacklisted(token)) {
      throw createError.unauthorized('Token has been revoked');
    }

    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || !user.active) {
      throw createError.unauthorized('User not found or inactive');
    }

    req.user = user as User;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError.unauthorized('User not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError.forbidden('Insufficient permissions'));
    }

    next();
  };
};

export const requirePermissions = (...permissions: Permission[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createError.unauthorized('User not authenticated');
      }

      const userPermissions = await prisma.userPermission.findMany({
        where: { userId: req.user.id },
        select: { permission: true },
      });

      const hasPermission = permissions.every(permission =>
        userPermissions.some((up: UserPermission) => up.permission === permission)
      );

      if (!hasPermission) {
        throw createError.forbidden('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireOwnership = (resourceType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createError.unauthorized('User not authenticated');
      }

      const resourceId = req.params.id;
      if (!resourceId) {
        throw createError.badRequest('Resource ID not provided');
      }

      // Check if user owns or has access to the resource
      const resource = await prisma[resourceType].findFirst({
        where: {
          id: resourceId,
          OR: [
            { userId: req.user.id },
            { sharedWith: { some: { userId: req.user.id } } },
          ],
        },
      });

      if (!resource) {
        throw createError.forbidden('Access denied to this resource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
