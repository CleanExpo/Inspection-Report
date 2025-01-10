import { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../lib/redis';

interface CacheOptions {
    duration?: number; // Cache duration in seconds
    keyPrefix?: string; // Prefix for cache keys
    customKey?: (req: NextApiRequest) => string; // Custom key generator
}

export function withCache(handler: any, options: CacheOptions = {}) {
    const {
        duration = 3600, // Default 1 hour
        keyPrefix = 'api:cache:',
        customKey
    } = options;

    return async (req: NextApiRequest, res: NextApiResponse) => {
        // Skip cache for non-GET requests
        if (req.method !== 'GET') {
            return handler(req, res);
        }

        // Generate cache key
        const cacheKey = customKey 
            ? customKey(req)
            : `${keyPrefix}${req.url}`;

        try {
            // Try to get cached response
            const cachedData = await redis.getCacheItem(cacheKey);

            if (cachedData) {
                console.log(`Cache hit for ${cacheKey}`);
                return res.status(200).json(cachedData);
            }

            // Modify response to cache the result
            const originalJson = res.json;
            res.json = async (body: any) => {
                try {
                    // Cache the response
                    await redis.setCacheItem(cacheKey, body, duration);
                    console.log(`Cached response for ${cacheKey}`);
                } catch (error) {
                    console.error('Failed to cache response:', error);
                }
                return originalJson.call(res, body);
            };

            // Process the request
            return handler(req, res);

        } catch (error) {
            console.error('Cache middleware error:', error);
            // Continue without cache on error
            return handler(req, res);
        }
    };
}

// Helper to invalidate cache
export async function invalidateCache(pattern: string): Promise<void> {
    try {
        await redis.invalidateCache(pattern);
        console.log(`Invalidated cache for pattern: ${pattern}`);
    } catch (error) {
        console.error('Failed to invalidate cache:', error);
        throw error;
    }
}

// Example usage:
/*
export default withCache(async function handler(req: NextApiRequest, res: NextApiResponse) {
    const data = await fetchSomeData();
    res.json(data);
}, {
    duration: 1800, // 30 minutes
    keyPrefix: 'api:inspections:'
});
*/
