interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  persistent?: boolean; // Whether to persist in localStorage
}

class DocumentationCache {
  private memoryCache: Map<string, CacheItem<any>>;
  private readonly defaultTTL = 3600000; // 1 hour default TTL

  constructor() {
    this.memoryCache = new Map();
    this.initializeFromStorage();
  }

  private initializeFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const storedCache = localStorage.getItem('docCache');
      if (storedCache) {
        const parsed = JSON.parse(storedCache);
        Object.entries(parsed).forEach(([key, value]) => {
          const item = value as CacheItem<any>;
          if (item.expiresAt > Date.now()) {
            this.memoryCache.set(key, item);
          }
        });
      }
    } catch (error) {
      console.error('Error initializing cache from storage:', error);
    }
  }

  private persistToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const cacheObject = Object.fromEntries(this.memoryCache.entries());
      localStorage.setItem('docCache', JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Error persisting cache to storage:', error);
    }
  }

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const timestamp = Date.now();
    const ttl = options.ttl || this.defaultTTL;
    const expiresAt = timestamp + ttl;

    const cacheItem: CacheItem<T> = {
      data,
      timestamp,
      expiresAt,
    };

    this.memoryCache.set(key, cacheItem);

    if (options.persistent) {
      this.persistToStorage();
    }
  }

  get<T>(key: string): T | null {
    const item = this.memoryCache.get(key) as CacheItem<T> | undefined;

    if (!item) return null;

    if (item.expiresAt < Date.now()) {
      this.memoryCache.delete(key);
      this.persistToStorage();
      return null;
    }

    return item.data;
  }

  invalidate(key: string): void {
    this.memoryCache.delete(key);
    this.persistToStorage();
  }

  clear(): void {
    this.memoryCache.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('docCache');
    }
  }

  // Helper method for search results
  setSearchResults(query: string, results: any[]): void {
    this.set(`search:${query}`, results, {
      ttl: 300000, // 5 minutes TTL for search results
      persistent: true,
    });
  }

  // Helper method for documentation content
  setDocContent(path: string, content: any): void {
    this.set(`doc:${path}`, content, {
      ttl: this.defaultTTL,
      persistent: true,
    });
  }
}

// Export singleton instance
export const docCache = new DocumentationCache();
