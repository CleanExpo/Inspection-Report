/**
 * Resource Optimization Utilities
 * Handles memory pooling, asset preloading, and cache optimization
 */

// Memory Pool for reusing objects
class MemoryPool<T> {
    private pool: T[] = [];
    private createFn: () => T;
    private resetFn: (item: T) => void;
    private maxSize: number;

    constructor(
        createFn: () => T,
        resetFn: (item: T) => void,
        initialSize: number = 10,
        maxSize: number = 100
    ) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.maxSize = maxSize;

        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }

    acquire(): T {
        if (this.pool.length > 0) {
            return this.pool.pop()!;
        }
        return this.createFn();
    }

    release(item: T): void {
        this.resetFn(item);
        if (this.pool.length < this.maxSize) {
            this.pool.push(item);
        }
    }

    clear(): void {
        this.pool = [];
    }
}

// Asset Preloader
class AssetPreloader {
    private loadedAssets: Map<string, any> = new Map();
    private loadingPromises: Map<string, Promise<any>> = new Map();
    private priorityQueue: string[] = [];

    async preloadImage(url: string, priority: number = 0): Promise<HTMLImageElement> {
        if (this.loadedAssets.has(url)) {
            return this.loadedAssets.get(url);
        }

        if (this.loadingPromises.has(url)) {
            return this.loadingPromises.get(url);
        }

        const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.loadedAssets.set(url, img);
                this.loadingPromises.delete(url);
                resolve(img);
            };
            img.onerror = reject;
            img.src = url;
        });

        this.loadingPromises.set(url, loadPromise);
        this.addToPriorityQueue(url, priority);

        return loadPromise;
    }

    private addToPriorityQueue(url: string, priority: number): void {
        const index = this.priorityQueue.findIndex(
            (existingUrl) => this.getPriority(existingUrl) < priority
        );
        if (index === -1) {
            this.priorityQueue.push(url);
        } else {
            this.priorityQueue.splice(index, 0, url);
        }
    }

    private getPriority(url: string): number {
        // Implement priority logic based on your needs
        return 0;
    }

    async preloadFont(fontFamily: string, url: string): Promise<void> {
        const font = new FontFace(fontFamily, `url(${url})`);
        await font.load();
        document.fonts.add(font);
    }

    clearCache(): void {
        this.loadedAssets.clear();
        this.loadingPromises.clear();
        this.priorityQueue = [];
    }
}

// Background Task Processor
class BackgroundProcessor {
    private taskQueue: (() => Promise<void>)[] = [];
    private isProcessing: boolean = false;
    private maxConcurrent: number = 3;
    private activeCount: number = 0;

    async addTask(task: () => Promise<void>): Promise<void> {
        this.taskQueue.push(task);
        this.processNextTask();
    }

    private async processNextTask(): Promise<void> {
        if (this.isProcessing || this.activeCount >= this.maxConcurrent || this.taskQueue.length === 0) {
            return;
        }

        this.isProcessing = true;
        this.activeCount++;

        try {
            const task = this.taskQueue.shift();
            if (task) {
                await task();
            }
        } finally {
            this.activeCount--;
            this.isProcessing = false;
            if (this.taskQueue.length > 0) {
                this.processNextTask();
            }
        }
    }

    clearQueue(): void {
        this.taskQueue = [];
    }
}

// Cache Manager
class CacheManager {
    private cache: Map<string, { data: any; expires: number }> = new Map();
    private maxSize: number;
    private defaultTTL: number;

    constructor(maxSize: number = 100, defaultTTL: number = 5 * 60 * 1000) {
        this.maxSize = maxSize;
        this.defaultTTL = defaultTTL;
    }

    set(key: string, value: any, ttl: number = this.defaultTTL): void {
        if (this.cache.size >= this.maxSize) {
            this.evictOldest();
        }

        this.cache.set(key, {
            data: value,
            expires: Date.now() + ttl
        });
    }

    get<T>(key: string): T | null {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expires) {
            this.cache.delete(key);
            return null;
        }

        return item.data as T;
    }

    private evictOldest(): void {
        const oldest = Array.from(this.cache.entries())
            .reduce((a, b) => (a[1].expires < b[1].expires ? a : b));
        this.cache.delete(oldest[0]);
    }

    clear(): void {
        this.cache.clear();
    }
}

// Export instances
export const memoryPool = new MemoryPool<any>(
    () => ({}),
    (item) => {
        for (const key in item) {
            delete item[key];
        }
    }
);

export const assetPreloader = new AssetPreloader();
export const backgroundProcessor = new BackgroundProcessor();
export const cacheManager = new CacheManager();

// Export classes for custom instantiation
export { MemoryPool, AssetPreloader, BackgroundProcessor, CacheManager };
