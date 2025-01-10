import { Request, Response, NextFunction } from 'express';
import { RateLimitError } from '../utils/errors';
import { logger } from '../utils/logger';
import { createClient, RedisClientType } from 'redis';

interface RateLimitOptions {
  windowMs?: number;      // Time window in milliseconds
  max?: number;          // Max number of requests per window
  keyPrefix?: string;    // Redis key prefix
  handler?: (req: Request, res: Response, next: NextFunction) => void;
  skipFailedRequests?: boolean;  // Don't count failed requests
  skipSuccessfulRequests?: boolean;  // Don't count successful requests
  keyGenerator?: (req: Request) => string;  // Custom key generator
  skip?: (req: Request) => boolean;  // Skip rate limiting for certain requests
}

const defaultOptions: Required<RateLimitOptions> = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  keyPrefix: 'rl:', // Redis key prefix
  handler: (req: Request, res: Response, next: NextFunction) => {
    throw new RateLimitError();
  },
  skipFailedRequests: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req: Request): string => {
    return req.ip || 
           (Array.isArray(req.headers['x-forwarded-for']) 
             ? req.headers['x-forwarded-for'][0] 
             : req.headers['x-forwarded-for']) as string || 
           'unknown';
  },
  skip: () => false,
};

export class RateLimiter {
  private redis: RedisClientType | null = null;
  private options: Required<RateLimitOptions>;
  private ready: boolean = false;

  constructor(options: RateLimitOptions = {}) {
    this.options = { ...defaultOptions, ...options };
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      this.redis = createClient({
        url: process.env.REDIS_URL,
        password: process.env.REDIS_PASSWORD,
      });

      this.redis.on('error', (err: Error) => {
        logger.error('Redis Rate Limiter Error:', err);
        this.ready = false;
      });

      this.redis.on('connect', () => {
        logger.info('Redis Rate Limiter Connected');
        this.ready = true;
      });

      await this.redis.connect();
    } catch (error) {
      logger.error('Failed to initialize Redis Rate Limiter:', error);
      this.ready = false;
    }
  }

  private getKey(req: Request): string {
    const key = this.options.keyGenerator(req);
    return `${this.options.keyPrefix}${key}`;
  }

  private async getRateLimit(key: string): Promise<[number, number]> {
    if (!this.redis) {
      return [0, 0];
    }

    const multi = this.redis.multi();
    const now = Date.now();
    const windowStart = now - this.options.windowMs;

    // Remove old entries
    multi.zRemRangeByScore(key, 0, windowStart);
    // Add new entry
    multi.zAdd(key, { score: now, value: now.toString() });
    // Get count of requests in window
    multi.zCard(key);
    // Set expiry on key
    multi.expire(key, Math.ceil(this.options.windowMs / 1000));

    const results = await multi.exec();
    const count = (results?.[2] as number | null) || 0;

    return [count, Math.ceil((this.options.windowMs - (now % this.options.windowMs)) / 1000)];
  }

  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!this.ready || !this.redis) {
        logger.warn('Rate limiter not ready, skipping...');
        return next();
      }

      if (this.options.skip(req)) {
        return next();
      }

      const key = this.getKey(req);
      const redis = this.redis;
      const options = this.options;

      try {
        const [hits, resetTime] = await this.getRateLimit(key);

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', options.max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, options.max - hits));
        res.setHeader('X-RateLimit-Reset', resetTime);

        if (hits > options.max) {
          logger.warn('Rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            hits,
            limit: options.max,
          });

          return options.handler(req, res, next);
        }

        // Handle response counting
        if (options.skipFailedRequests || options.skipSuccessfulRequests) {
          const originalEnd = res.end;

          // Override end method
          res.end = function(
            this: Response,
            chunk?: any,
            encoding?: BufferEncoding | (() => void),
            cb?: () => void
          ): Response {
            const statusCode = res.statusCode;
            const shouldCount = 
              (!options.skipFailedRequests || statusCode < 400) &&
              (!options.skipSuccessfulRequests || statusCode >= 400);

            if (!shouldCount) {
              redis.zRem(key, Date.now().toString()).catch((err: Error) => {
                logger.error('Error removing rate limit count:', err);
              });
            }

            if (typeof encoding === 'function') {
              cb = encoding;
              encoding = undefined;
            }

            return originalEnd.call(this, chunk, encoding as BufferEncoding, cb);
          };
        }

        next();
      } catch (error) {
        logger.error('Rate limiter error:', error);
        // Fail open - allow request if rate limiter fails
        next();
      }
    };
  }

  // Create middleware with specific options for a route
  static createMiddleware(options: RateLimitOptions = {}) {
    const limiter = new RateLimiter(options);
    return limiter.middleware();
  }
}

// Export pre-configured middlewares for common scenarios
export const rateLimiter = {
  // Default rate limiter
  default: new RateLimiter().middleware(),

  // Strict rate limiter for sensitive endpoints
  strict: new RateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // 20 requests per 5 minutes
  }).middleware(),

  // Lenient rate limiter for public endpoints
  lenient: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // 1000 requests per hour
  }).middleware(),

  // Rate limiter for authentication endpoints
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    skipSuccessfulRequests: true, // Don't count successful logins
  }).middleware(),

  // API rate limiter
  api: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    keyGenerator: (req: Request): string => {
      return (req.headers['x-api-key'] as string) || req.ip || 'unknown';
    },
  }).middleware(),

  // Custom rate limiter factory
  create: (options: RateLimitOptions) => {
    return new RateLimiter(options).middleware();
  },
};
