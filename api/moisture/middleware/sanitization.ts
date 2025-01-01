import { NextApiRequest, NextApiResponse } from 'next';
import { ApiHandler } from './errorHandler';
import { logger } from '../utils/logger';

// Helper function to sanitize strings
const sanitizeString = (str: string): string => {
  return str
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes that could break JSON
    .trim(); // Remove leading/trailing whitespace
};

// Helper function to recursively sanitize objects
const sanitizeValue = (value: any): any => {
  if (typeof value === 'string') {
    return sanitizeString(value);
  }
  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item));
  }
  if (value && typeof value === 'object') {
    return Object.keys(value).reduce((acc, key) => ({
      ...acc,
      [key]: sanitizeValue(value[key])
    }), {});
  }
  return value;
};

export const withSanitization = (handler: ApiHandler): ApiHandler => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void | any> => {
    try {
      // Sanitize query parameters
      if (req.query) {
        req.query = sanitizeValue(req.query);
      }

      // Sanitize body if it exists and is an object
      if (req.body && typeof req.body === 'object') {
        req.body = sanitizeValue(req.body);
      }

      // Log sanitization completion
      logger.debug('Request parameters sanitized', {
        method: req.method,
        url: req.url,
        hasBody: !!req.body,
        hasQuery: Object.keys(req.query).length > 0
      });

      // Add header to indicate sanitization was performed
      res.setHeader('X-Content-Sanitized', 'true');

      return handler(req, res);
    } catch (error) {
      logger.error('Error in sanitization middleware', { error });
      throw error;
    }
  };
};
