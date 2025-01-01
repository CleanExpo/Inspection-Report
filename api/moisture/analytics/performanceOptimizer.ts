import { logger } from '../utils/logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

/**
 * Handles performance optimization for analytics calculations
 */
export class PerformanceOptimizer {
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_CACHE_SIZE = 100;
  private cache = new Map<string, CacheEntry<any>>();

  /**
   * Retrieves or calculates data with caching
   * @param key Cache key
   * @param calculator Function to calculate data if not cached
   * @returns Calculated or cached result
   */
  public async getOrCalculate<T>(
    key: string,
    calculator: () => T | Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    let result: T;

    try {
      const cached = this.cache.get(key);
      if (cached && this.isCacheValid(cached)) {
        result = cached.data;
        logger.debug('Cache hit', { key, timeMs: performance.now() - startTime });
      } else {
        result = await this.calculateAndCache(key, () => Promise.resolve(calculator()));
        logger.debug('Cache miss', { key, timeMs: performance.now() - startTime });
      }

      return result;
    } catch (error) {
      logger.error('Calculation error', { key, error });
      throw error;
    }
  }

  /**
   * Checks if a cache entry is still valid
   */
  private isCacheValid(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp < PerformanceOptimizer.CACHE_TTL;
  }

  /**
   * Calculates and caches result
   */
  private async calculateAndCache<T>(
    key: string,
    calculator: () => Promise<T>
  ): Promise<T> {
    const result = await calculator().catch(error => {
      logger.error('Calculation failed', { key, error });
      throw error;
    });
    
    // Maintain cache size limit
    if (this.cache.size >= PerformanceOptimizer.MAX_CACHE_SIZE) {
      let oldestKey: string | null = null;
      let oldestTime = Date.now();
      
      this.cache.forEach((entry, key) => {
        if (entry.timestamp < oldestTime) {
          oldestTime = entry.timestamp;
          oldestKey = key;
        }
      });
      
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data: result,
      timestamp: Date.now(),
      key
    });

    return result;
  }

  /**
   * Clears expired cache entries
   */
  public clearExpiredCache(): void {
    const now = Date.now();
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp >= PerformanceOptimizer.CACHE_TTL) {
        this.cache.delete(key);
      }
    });
  }
}
