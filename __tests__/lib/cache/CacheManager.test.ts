import CacheManager, { CacheConfig } from '../../../app/lib/cache/CacheManager';

describe('CacheManager', () => {
  let cache: InstanceType<typeof CacheManager>;

  beforeEach(() => {
    // Get a fresh instance for each test
    cache = CacheManager.getInstance({
      stdTTL: 60,
      checkperiod: 30,
      maxKeys: 100
    });
  });

  afterEach(async () => {
    await cache.flush();
  });

  describe('Basic Operations', () => {
    it('should set and get values', async () => {
      const key = 'test-key';
      const value = { data: 'test-value' };

      await cache.set(key, value);
      const retrieved = await cache.get<typeof value>(key);

      expect(retrieved).toEqual(value);
    });

    it('should handle undefined values', async () => {
      const key = 'non-existent';
      const value = await cache.get(key);

      expect(value).toBeUndefined();
    });

    it('should delete values', async () => {
      const key = 'delete-test';
      const value = { data: 'to-be-deleted' };

      await cache.set(key, value);
      await cache.del(key);
      const retrieved = await cache.get(key);

      expect(retrieved).toBeUndefined();
    });

    it('should respect TTL', async () => {
      const key = 'ttl-test';
      const value = { data: 'expires-soon' };
      const ttl = 1; // 1 second

      await cache.set(key, value, ttl);
      
      // Value should exist immediately
      let retrieved = await cache.get(key);
      expect(retrieved).toEqual(value);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Value should be gone
      retrieved = await cache.get(key);
      expect(retrieved).toBeUndefined();
    });
  });

  describe('Bulk Operations', () => {
    it('should handle multiple sets and gets', async () => {
      const items = {
        'key1': { data: 'value1' },
        'key2': { data: 'value2' },
        'key3': { data: 'value3' }
      };

      await cache.mset(items);
      const retrieved = await cache.mget(Object.keys(items));

      expect(retrieved).toEqual(items);
    });

    it('should flush all items', async () => {
      const items = {
        'flush1': { data: 'value1' },
        'flush2': { data: 'value2' }
      };

      await cache.mset(items);
      await cache.flush();

      const keys = await cache.keys();
      expect(keys.length).toBe(0);
    });
  });

  describe('Pattern Operations', () => {
    it('should invalidate by pattern', async () => {
      await cache.set('user:1', { id: 1 });
      await cache.set('user:2', { id: 2 });
      await cache.set('post:1', { id: 1 });

      await cache.invalidatePattern('user:.*');

      expect(await cache.get('user:1')).toBeUndefined();
      expect(await cache.get('user:2')).toBeUndefined();
      expect(await cache.get('post:1')).toBeDefined();
    });

    it('should find keys by pattern', async () => {
      await cache.set('test:1', { id: 1 });
      await cache.set('test:2', { id: 2 });
      await cache.set('other:1', { id: 1 });

      const keys = await cache.keys('test:.*');
      expect(keys).toHaveLength(2);
      expect(keys).toContain('test:1');
      expect(keys).toContain('test:2');
    });
  });

  describe('Memory Management', () => {
    it('should optimize memory when threshold reached', async () => {
      // Fill cache with items
      const items = Array.from({ length: 50 }, (_, i) => ({
        key: `key${i}`,
        value: { data: 'x'.repeat(1000) } // Create large objects
      }));

      for (const item of items) {
        await cache.set(item.key, item.value);
      }

      const beforeStats = await cache.getStats();
      await cache.optimizeMemory(0.1); // Set low threshold to trigger optimization
      const afterStats = await cache.getStats();

      expect(afterStats.keys).toBeLessThan(beforeStats.keys);
    });

    it('should track memory usage', async () => {
      const usage = await cache.getMemoryUsage();
      expect(usage).toHaveProperty('heapUsed');
      expect(usage).toHaveProperty('heapTotal');
      expect(typeof usage.heapUsed).toBe('number');
      expect(typeof usage.heapTotal).toBe('number');
    });
  });

  describe('Statistics', () => {
    it('should track hits and misses', async () => {
      const key = 'stats-test';
      const value = { data: 'test' };

      await cache.set(key, value);
      
      // Generate some hits and misses
      await cache.get(key); // hit
      await cache.get(key); // hit
      await cache.get('non-existent'); // miss
      
      const stats = await cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
    });

    it('should track key and value sizes', async () => {
      const key = 'size-test';
      const value = { data: 'x'.repeat(1000) };

      await cache.set(key, value);
      
      const stats = await cache.getStats();
      expect(stats.ksize).toBeGreaterThan(0);
      expect(stats.vsize).toBeGreaterThan(0);
    });
  });

  describe('Event Handling', () => {
    it('should emit events for cache operations', async () => {
      const events: string[] = [];
      
      cache.onEvent('cache:set', () => events.push('set'));
      cache.onEvent('cache:get', () => events.push('get'));
      cache.onEvent('cache:del', () => events.push('del'));

      await cache.set('event-test', { data: 'test' });
      await cache.get('event-test');
      await cache.del('event-test');

      expect(events).toContain('set');
      expect(events).toContain('del');
    });
  });
});
