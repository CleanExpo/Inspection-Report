import {
    MemoryPool,
    AssetPreloader,
    BackgroundProcessor,
    CacheManager
} from '../../utils/resourceOptimization';

describe('Resource Optimization Utilities', () => {
    describe('MemoryPool', () => {
        let pool: MemoryPool<{ value: number }>;

        beforeEach(() => {
            pool = new MemoryPool<{ value: number }>(
                () => ({ value: 0 }),
                (item) => { item.value = 0 },
                2,
                5
            );
        });

        it('should acquire and release objects', () => {
            const obj1 = pool.acquire();
            const obj2 = pool.acquire();
            
            obj1.value = 42;
            obj2.value = 24;

            pool.release(obj1);
            pool.release(obj2);

            const obj3 = pool.acquire();
            expect(obj3.value).toBe(0); // Should be reset
        });

        it('should respect max size', () => {
            const objects = Array.from({ length: 10 }, () => pool.acquire());
            objects.forEach(obj => pool.release(obj));

            // Internal pool size should not exceed maxSize
            const poolSize = (pool as any).pool.length;
            expect(poolSize).toBeLessThanOrEqual(5);
        });
    });

    describe('AssetPreloader', () => {
        let preloader: AssetPreloader;

        beforeEach(() => {
            preloader = new AssetPreloader();
        });

        it('should preload images', async () => {
            const mockImage = {
                onload: null,
                onerror: null,
                src: ''
            } as unknown as HTMLImageElement;
            
            const originalImage = global.Image;
            global.Image = jest.fn().mockImplementation(() => mockImage) as any;

            const loadPromise = preloader.preloadImage('test.jpg');
            
            // Simulate image load
            const mockEvent = new Event('load');
            mockImage.onload?.(mockEvent);

            const result = await loadPromise;
            expect(result).toBe(mockImage);

            global.Image = originalImage;
        });

        it('should handle duplicate preload requests', async () => {
            const mockImage = {
                onload: null,
                onerror: null,
                src: ''
            } as unknown as HTMLImageElement;
            global.Image = jest.fn().mockImplementation(() => mockImage) as any;

            const promise1 = preloader.preloadImage('test.jpg');
            const promise2 = preloader.preloadImage('test.jpg');

            const mockEvent = new Event('load');
            mockImage.onload?.(mockEvent);

            const [result1, result2] = await Promise.all([promise1, promise2]);
            expect(result1).toBe(result2);
        });
    });

    describe('BackgroundProcessor', () => {
        let processor: BackgroundProcessor;

        beforeEach(() => {
            processor = new BackgroundProcessor();
        });

        it('should process tasks in order', async () => {
            const results: number[] = [];
            const tasks = [
                async () => {
                    await new Promise(resolve => setTimeout(resolve, 50));
                    results.push(1);
                },
                async () => {
                    await new Promise(resolve => setTimeout(resolve, 10));
                    results.push(2);
                }
            ];

            await Promise.all(tasks.map(task => processor.addTask(task)));
            expect(results).toEqual([1, 2]);
        });

        it('should handle concurrent tasks', async () => {
            const startTimes: number[] = [];
            const tasks = Array.from({ length: 5 }, (_, i) => async () => {
                startTimes.push(Date.now());
                await new Promise(resolve => setTimeout(resolve, 50));
            });

            const promises = tasks.map(task => processor.addTask(task));
            await Promise.all(promises);

            // Check that some tasks started concurrently
            const uniqueStartTimes = new Set(startTimes);
            expect(uniqueStartTimes.size).toBeLessThan(tasks.length);
        });
    });

    describe('CacheManager', () => {
        let cache: CacheManager;

        beforeEach(() => {
            cache = new CacheManager(3, 100); // Small size and TTL for testing
        });

        it('should store and retrieve values', () => {
            cache.set('key1', 'value1');
            expect(cache.get('key1')).toBe('value1');
        });

        it('should respect max size', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');
            cache.set('key3', 'value3');
            cache.set('key4', 'value4'); // Should evict oldest

            expect(cache.get('key1')).toBeNull();
            expect(cache.get('key4')).toBe('value4');
        });

        it('should respect TTL', async () => {
            cache.set('key1', 'value1', 50); // 50ms TTL
            
            expect(cache.get('key1')).toBe('value1');
            
            await new Promise(resolve => setTimeout(resolve, 60));
            
            expect(cache.get('key1')).toBeNull();
        });

        it('should handle clear operation', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');
            
            cache.clear();
            
            expect(cache.get('key1')).toBeNull();
            expect(cache.get('key2')).toBeNull();
        });
    });
});
