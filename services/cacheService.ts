import { performanceMonitor } from '../utils/performance';

interface CacheOptions {
  maxAge?: number; // Time in milliseconds
  maxSize?: number; // Maximum number of items
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

class CacheService<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxAge: number;
  private maxSize: number;

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.maxAge = options.maxAge || 5 * 60 * 1000; // 5 minutes default
    this.maxSize = options.maxSize || 100; // 100 items default
  }

  set(key: string, value: T): void {
    performanceMonitor.measureSync('cache_set', () => {
      // Remove oldest entry if cache is full
      if (this.cache.size >= this.maxSize) {
        const entries = Array.from(this.cache.entries());
        if (entries.length > 0) {
          const [oldestKey] = entries[0];
          this.cache.delete(oldestKey);
        }
      }

      this.cache.set(key, {
        value,
        timestamp: Date.now(),
      });
    });
  }

  get(key: string): T | null {
    const result = performanceMonitor.measureSync('cache_get', () => {
      const entry = this.cache.get(key);
      
      if (!entry) {
        return null;
      }

      // Check if entry has expired
      if (Date.now() - entry.timestamp > this.maxAge) {
        this.cache.delete(key);
        return null;
      }

      return entry.value;
    });

    return result as T | null;
  }

  async getOrSet(key: string, getValue: () => Promise<T>): Promise<T> {
    return performanceMonitor.measureAsync('cache_get_or_set', async () => {
      const cachedValue = this.get(key);
      if (cachedValue !== null) {
        return cachedValue;
      }

      const value = await getValue();
      this.set(key, value);
      return value;
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  size(): number {
    return this.cache.size;
  }

  cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(key);
      }
    });
  }

  // Start automatic cleanup
  startCleanupInterval(interval: number = 60000): NodeJS.Timer {
    return setInterval(() => this.cleanup(), interval);
  }

  // Get all valid entries
  getAll(): T[] {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    return entries
      .filter(([_, entry]) => now - entry.timestamp <= this.maxAge)
      .map(([_, entry]) => entry.value);
  }
}

// Create cache instances for different data types
export const roomLayoutCache = new CacheService<any>({
  maxAge: 10 * 60 * 1000, // 10 minutes
  maxSize: 50, // 50 layouts
});

export const moistureReadingCache = new CacheService<any>({
  maxAge: 5 * 60 * 1000, // 5 minutes
  maxSize: 100, // 100 readings
});

// Start cleanup intervals
if (typeof window !== 'undefined') {
  roomLayoutCache.startCleanupInterval();
  moistureReadingCache.startCleanupInterval();
}

export function createCache<T>(options?: CacheOptions): CacheService<T> {
  return new CacheService<T>(options);
}
