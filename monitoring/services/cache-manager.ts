interface CacheEntry {
  data: any;
  type: 'response' | 'data';
  expiry: number;
}

interface CacheConfig {
  maxSize: number;  // in bytes
  maxAge: number;   // in milliseconds
  cleanupInterval: number;  // in milliseconds
}

interface CacheStats {
  hitRate: number;
  size: number;
  entries: number;
}

class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private hits: number = 0;
  private misses: number = 0;
  private config: CacheConfig = {
    maxSize: 100 * 1024 * 1024, // 100MB
    maxAge: 5 * 60 * 1000,      // 5 minutes
    cleanupInterval: 60 * 1000   // 1 minute
  };

  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cleanupInterval = setInterval(() => this.cleanup(), this.config.cleanupInterval);
  }

  async set(key: string, data: any, options: { type: 'response' | 'data'; ttl?: number }): Promise<void> {
    const expiry = Date.now() + (options.ttl || this.config.maxAge);
    this.cache.set(key, {
      data,
      type: options.type,
      expiry
    });
  }

  async get(key: string, type: 'response' | 'data'): Promise<any> {
    const entry = this.cache.get(key);
    
    if (!entry || entry.type !== type || entry.expiry < Date.now()) {
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  updateConfig(profile: string): void {
    switch (profile) {
      case 'conservative':
        this.config = {
          maxSize: 50 * 1024 * 1024,  // 50MB
          maxAge: 5 * 60 * 1000,      // 5 minutes
          cleanupInterval: 60 * 1000   // 1 minute
        };
        break;
      case 'balanced':
        this.config = {
          maxSize: 100 * 1024 * 1024, // 100MB
          maxAge: 15 * 60 * 1000,     // 15 minutes
          cleanupInterval: 60 * 1000   // 1 minute
        };
        break;
      case 'aggressive':
        this.config = {
          maxSize: 200 * 1024 * 1024, // 200MB
          maxAge: 30 * 60 * 1000,     // 30 minutes
          cleanupInterval: 60 * 1000   // 1 minute
        };
        break;
    }
  }

  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hitRate: total > 0 ? this.hits / total : 0,
      size: this.calculateSize(),
      entries: this.cache.size
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (entry.expiry < now) {
        this.cache.delete(key);
      }
    }

    // Check size limit
    while (this.calculateSize() > this.config.maxSize) {
      // Remove oldest entry
      const [firstKey] = Array.from(this.cache.keys());
      this.cache.delete(firstKey);
    }
  }

  private calculateSize(): number {
    let size = 0;
    for (const [key, entry] of Array.from(this.cache.entries())) {
      size += key.length * 2; // UTF-16 characters
      size += JSON.stringify(entry.data).length * 2;
    }
    return size;
  }
}

export const cacheManager = new CacheManager();
