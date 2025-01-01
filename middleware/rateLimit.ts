import { NextApiRequest, NextApiResponse } from 'next';
import { AuthError } from '../utils/errors';

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  max: number;       // Max requests per window
}

// Store rate limit data in memory
// In production, use Redis or similar for distributed systems
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Default config: 100 requests per minute
const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 100,
};

// Different limits for different endpoints
const endpointConfigs: Record<string, RateLimitConfig> = {
  '/api/moisture': {
    windowMs: 60 * 1000,    // 1 minute
    max: 100,               // 100 requests per minute
  },
  '/api/validate': {
    windowMs: 60 * 1000,    // 1 minute
    max: 200,               // 200 requests per minute
  },
  '/api/generate': {
    windowMs: 60 * 1000,    // 1 minute
    max: 50,                // 50 requests per minute
  },
};

export function withRateLimit(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void | NextApiResponse>,
  endpoint?: string
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void | NextApiResponse> => {
    const config = endpoint ? endpointConfigs[endpoint] || defaultConfig : defaultConfig;
    
    // Get client identifier (IP address or API key)
    const clientId = (req.headers['x-forwarded-for'] as string) || 
                    req.socket.remoteAddress || 
                    'unknown';
    
    const now = Date.now();
    const key = `${clientId}:${endpoint || 'default'}`;
    const limitData = rateLimitStore.get(key);

    // Initialize or reset if window has passed
    if (!limitData || now > limitData.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
    } else {
      // Increment count if within window
      limitData.count += 1;
      
      // Check if over limit
      if (limitData.count > config.max) {
        const resetIn = Math.ceil((limitData.resetTime - now) / 1000);
        
        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', config.max);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', Math.ceil(limitData.resetTime / 1000));
        
        throw new AuthError(`Rate limit exceeded. Please try again in ${resetIn} seconds`);
      }
      
      // Update store
      rateLimitStore.set(key, limitData);
    }

    // Set rate limit headers
    const current = rateLimitStore.get(key)!;
    res.setHeader('X-RateLimit-Limit', config.max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, config.max - current.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(current.resetTime / 1000));

    // Call the next handler
    return handler(req, res);
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  // Collect keys to delete
  rateLimitStore.forEach((data, key) => {
    if (now > data.resetTime) {
      keysToDelete.push(key);
    }
  });
  
  // Delete collected keys
  keysToDelete.forEach(key => rateLimitStore.delete(key));
}, 60000); // Clean up every minute
