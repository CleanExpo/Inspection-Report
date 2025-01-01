import { NextApiRequest, NextApiResponse } from 'next';
import { ApiHandler } from './errorHandler';
import { logger } from '../utils/logger';
import { getPrismaClient } from '../utils/prisma-singleton';

interface AuditEvent {
  userId?: string;
  action: string;
  resource: string;
  method: string;
  path: string;
  statusCode?: number;
  requestBody?: any;
  responseBody?: any;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export const withAuditTrail = (handler: ApiHandler): ApiHandler => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const startTime = Date.now();
    const originalJson = res.json;
    let responseBody: any;

    // Override res.json to capture response body
    res.json = function (body: any) {
      responseBody = body;
      return originalJson.call(this, body);
    };

    try {
      // Extract user ID from auth token if available
      const userId = req.headers['x-user-id'] as string;

      // Create initial audit event
      const auditEvent: AuditEvent = {
        userId,
        action: req.headers['x-action'] as string || 'unknown',
        resource: req.url?.split('?')[0] || 'unknown',
        method: req.method || 'unknown',
        path: req.url || 'unknown',
        requestBody: req.body,
        metadata: {
          userAgent: req.headers['user-agent'],
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          referrer: req.headers.referer,
        },
        timestamp: new Date(),
      };

      // Execute the handler
      await handler(req, res);

      // Update audit event with response details
      auditEvent.statusCode = res.statusCode;
      auditEvent.responseBody = responseBody;
      auditEvent.metadata = {
        ...auditEvent.metadata,
        duration: Date.now() - startTime,
        success: res.statusCode >= 200 && res.statusCode < 300,
      };

      // Store audit event
      const prisma = await getPrismaClient();
      await prisma.auditLog.create({
        data: {
          userId: auditEvent.userId,
          action: auditEvent.action,
          resource: auditEvent.resource,
          method: auditEvent.method,
          path: auditEvent.path,
          statusCode: auditEvent.statusCode,
          requestBody: auditEvent.requestBody ? JSON.stringify(auditEvent.requestBody) : null,
          responseBody: auditEvent.responseBody ? JSON.stringify(auditEvent.responseBody) : null,
          metadata: auditEvent.metadata ? JSON.stringify(auditEvent.metadata) : null,
          timestamp: auditEvent.timestamp,
        },
      });

      logger.info('Audit trail recorded', {
        userId: auditEvent.userId,
        action: auditEvent.action,
        resource: auditEvent.resource,
        statusCode: auditEvent.statusCode,
      });

    } catch (error) {
      // Log audit failure but don't block the response
      logger.error('Failed to record audit trail', { error });
      
      // Re-throw the error if it's from the handler
      if (error instanceof Error && error.message !== 'Failed to record audit trail') {
        throw error;
      }
    }
  };
};
