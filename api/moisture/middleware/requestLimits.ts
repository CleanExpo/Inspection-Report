import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '../utils/logger';
import { ApiHandler } from './errorHandler';
import { createErrorResponse, ErrorCode } from '../utils/errorCodes';

const MAX_REQUEST_SIZE_BYTES = 1024 * 1024; // 1MB limit

export const withRequestLimits = (handler: ApiHandler): ApiHandler => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void | any> => {
    try {
      const contentLength = parseInt(req.headers['content-length'] || '0', 10);

      if (contentLength > MAX_REQUEST_SIZE_BYTES) {
        logger.warn('Request size exceeds limit', {
          size: contentLength,
          limit: MAX_REQUEST_SIZE_BYTES,
          path: req.url
        });

        throw createErrorResponse(
          ErrorCode.REQUEST_TOO_LARGE,
          'Request body exceeds size limit',
          {
            maxSize: `${MAX_REQUEST_SIZE_BYTES / 1024}KB`,
            receivedSize: `${Math.round(contentLength / 1024)}KB`
          }
        );
      }

      // Add Content-Length to response for transparency
      res.setHeader('X-Max-Content-Length', MAX_REQUEST_SIZE_BYTES.toString());

      return handler(req, res);
    } catch (error) {
      logger.error('Error in request limits middleware', { error });
      throw error;
    }
  };
};
