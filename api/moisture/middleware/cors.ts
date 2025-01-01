import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '../utils/logger';

import type { ApiHandler } from '../types/api';

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  // Add production origins here
];

const allowedMethods = ['POST', 'GET', 'OPTIONS'];

export const withCors = (handler: ApiHandler): ApiHandler => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const origin = req.headers.origin;

      // Check if origin is allowed
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }

      // Set allowed headers
      res.setHeader(
        'Access-Control-Allow-Headers',
        'X-Requested-With, Content-Type, Accept, Authorization'
      );

      // Set allowed methods
      res.setHeader('Access-Control-Allow-Methods', allowedMethods.join(', '));

      // Allow credentials
      res.setHeader('Access-Control-Allow-Credentials', 'true');

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }

      logger.debug('CORS headers set', {
        origin: req.headers.origin,
        method: req.method
      });

      return handler(req, res);
    } catch (error) {
      logger.error('Error in CORS middleware', { error });
      throw error;
    }
  };
};
