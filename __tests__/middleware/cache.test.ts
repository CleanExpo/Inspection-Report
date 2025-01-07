import { NextApiRequest, NextApiResponse } from 'next';
import { withCache, invalidateCache } from '../../middleware/cache';
import { redis } from '../../lib/redis';
import { performanceMonitor } from '../../utils/performance';

// Mock dependencies
jest.mock('../../lib/redis');
jest.mock('../../utils/performance');

describe('Cache Middleware', () => {
    let mockReq: Partial<NextApiRequest>;
    let mockRes: Partial<NextApiResponse>;
    let mockHandler: jest.Mock;
    let mockRedis: jest.Mocked<typeof redis>;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup request mock
        mockReq = {
            method: 'GET',
            url: '/api/test',
            query: {},
            headers: {}
        };

        // Setup response mock
        mockRes = {
            setHeader: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Setup handler mock
        mockHandler = jest.fn().mockImplementation((req, res) => {
            return res.status(200).json({ data: 'test' });
        });

        // Setup Redis mock
        mockRedis = redis as jest.Mocked<typeof redis>;
    });

    describe('Cache Hit Scenarios', () => {
        it('should return cached data when available', async () => {
            // Setup cache hit
            const cachedData = {
                data: { test: 'data' },
                headers: { 'content-type': 'application/json' }
            };
            mockRedis.get.mockResolvedValueOnce(JSON.stringify(cachedData));

            // Execute middleware
            const handler = withCache(mockHandler);
            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            // Verify cache hit behavior
            expect(mockRedis.get).toHaveBeenCalled();
            expect(mockHandler).not.toHaveBeenCalled();
            expect(mockRes.setHeader).toHaveBeenCalledWith('X-Cache', 'HIT');
            expect(mockRes.json).toHaveBeenCalledWith(cachedData.data);
        });

        it('should respect cache TTL settings', async () => {
            // Setup handler with custom TTL
            const handler = withCache(mockHandler, { ttl: 60 });
            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            // Verify TTL was set correctly
            expect(mockRedis.setex).toHaveBeenCalledWith(
                expect.any(String),
                60,
                expect.any(String)
            );
        });
    });

    describe('Cache Miss Scenarios', () => {
        it('should cache response on miss', async () => {
            // Setup cache miss
            mockRedis.get.mockResolvedValueOnce(null);

            // Execute middleware
            const handler = withCache(mockHandler);
            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            // Verify cache miss behavior
            expect(mockHandler).toHaveBeenCalled();
            expect(mockRes.setHeader).toHaveBeenCalledWith('X-Cache', 'MISS');
            expect(mockRedis.setex).toHaveBeenCalled();
        });

        it('should not cache non-200 responses', async () => {
            // Setup error response
            mockHandler.mockImplementationOnce((req, res) => {
                return res.status(404).json({ error: 'Not found' });
            });

            // Execute middleware
            const handler = withCache(mockHandler);
            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            // Verify no caching occurred
            expect(mockRedis.setex).not.toHaveBeenCalled();
        });
    });

    describe('Cache Key Generation', () => {
        it('should generate correct cache key with query params', async () => {
            // Setup request with query params
            mockReq.query = { id: '123', filter: 'active' };
            mockReq.url = '/api/test?id=123&filter=active';

            const handler = withCache(mockHandler, {
                varyByQuery: ['id', 'filter']
            });
            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            // Verify cache key includes query params
            const expectedKey = 'api:GET:/api/test:id=123&filter=active';
            expect(mockRedis.get).toHaveBeenCalledWith(expectedKey);
        });

        it('should ignore non-specified query params in cache key', async () => {
            // Setup request with extra query params
            mockReq.query = { id: '123', filter: 'active', ignore: 'me' };
            mockReq.url = '/api/test?id=123&filter=active&ignore=me';

            const handler = withCache(mockHandler, {
                varyByQuery: ['id', 'filter']
            });
            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            // Verify cache key excludes non-specified params
            const expectedKey = 'api:GET:/api/test:id=123&filter=active';
            expect(mockRedis.get).toHaveBeenCalledWith(expectedKey);
        });
    });

    describe('Cache Bypass', () => {
        it('should bypass cache with header', async () => {
            // Setup bypass header
            mockReq.headers = { 'x-bypass-cache': 'true' };

            const handler = withCache(mockHandler);
            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            // Verify cache was bypassed
            expect(mockRedis.get).not.toHaveBeenCalled();
            expect(mockHandler).toHaveBeenCalled();
        });

        it('should bypass cache for non-GET requests', async () => {
            // Setup POST request
            mockReq.method = 'POST';

            const handler = withCache(mockHandler);
            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            // Verify cache was bypassed
            expect(mockRedis.get).not.toHaveBeenCalled();
            expect(mockHandler).toHaveBeenCalled();
        });
    });

    describe('Cache Invalidation', () => {
        it('should invalidate cache entries matching pattern', async () => {
            // Setup Redis keys mock
            const keys = ['key1', 'key2', 'key3'];
            mockRedis.keys.mockResolvedValueOnce(keys);

            await invalidateCache('test:*');

            // Verify keys were deleted
            expect(mockRedis.del).toHaveBeenCalledWith(...keys);
        });

        it('should handle empty key set during invalidation', async () => {
            // Setup empty keys result
            mockRedis.keys.mockResolvedValueOnce([]);

            await invalidateCache('test:*');

            // Verify no deletion was attempted
            expect(mockRedis.del).not.toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('should fallback to handler on cache error', async () => {
            // Setup cache error
            mockRedis.get.mockRejectedValueOnce(new Error('Redis error'));

            const handler = withCache(mockHandler);
            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            // Verify fallback behavior
            expect(mockHandler).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith({ data: 'test' });
        });

        it('should handle cache storage errors gracefully', async () => {
            // Setup cache storage error
            mockRedis.setex.mockRejectedValueOnce(new Error('Redis error'));

            const handler = withCache(mockHandler);
            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            // Verify response was still sent
            expect(mockRes.json).toHaveBeenCalledWith({ data: 'test' });
        });
    });

    describe('Performance Monitoring', () => {
        it('should record cache-related metrics', async () => {
            const handler = withCache(mockHandler);
            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            // Verify metrics were recorded
            expect(performanceMonitor.measureAsync).toHaveBeenCalledWith(
                'cache_middleware',
                expect.any(Function)
            );
        });
    });
});
