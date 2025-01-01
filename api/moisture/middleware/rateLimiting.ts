import { NextApiRequest, NextApiResponse } from 'next';
import { ApiHandler } from './errorHandler';
import { logger } from '../utils/logger';
import { createErrorResponse, ErrorCode } from '../utils/errorCodes';

// Simple in-memory store for rate limiting
// Note: In production, use Redis or similar for distributed systems
interface RateLimit {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimit>();

// Configuration
const WINDOW_SIZE_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute
const CLEANUP_INTERVAL = 5 * 60 * 1000; // Clean up every 5 minutes

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, limit] of Array.from(rateLimits.entries())) {
    if (now > limit.resetTime) {
      rateLimits.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

// Get client identifier (IP address or API key)
const getClientId = (req: NextApiRequest): string => {
  // In production, you might want to use API keys
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? (typeof forwarded === 'string' ? forwarded : forwarded[0])
    : req.socket.remoteAddress;
  return ip || 'unknown';
};

export const withRateLimiting = (handler: ApiHandler): ApiHandler => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void | any> => {
    const clientId = getClientId(req);
    const now = Date.now();

    // Get or create rate limit entry
    let rateLimit = rateLimits.get(clientId);
    if (!rateLimit || now > rateLimit.resetTime) {
      rateLimit = {
        count: 0,
        resetTime: now + WINDOW_SIZE_MS
      };
    }

    // Check if limit exceeded
    if (rateLimit.count >= MAX_REQUESTS) {
      logger.warn('Rate limit exceeded', {
        clientId,
        count: rateLimit.count,
        resetTime: new Date(rateLimit.resetTime).toISOString()
      });

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimit.resetTime / 1000));

      throw createErrorResponse(
        ErrorCode.RATE_LIMIT_EXCEEDED,
        'Too many requests, please try again later',
        {
          retryAfter: Math.ceil((rateLimit.resetTime - now) / 1000),
          limit: MAX_REQUESTS,
          windowSize: `${WINDOW_SIZE_MS / 1000} seconds`
        }
      );
    }

    // Increment counter
    rateLimit.count++;
    rateLimits.set(clientId, rateLimit);

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', MAX_REQUESTS - rateLimit.count);
    res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimit.resetTime / 1000));

    logger.debug('Rate limit status', {
      clientId,
      count: rateLimit.count,
      remaining: MAX_REQUESTS - rateLimit.count,
      resetTime: new Date(rateLimit.resetTime).toISOString()
    });

    return handler(req, res);
  };
};
