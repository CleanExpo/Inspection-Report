/**
 * Cache management utilities for moisture readings data
 */

import { MoistureReading, DailyReadings } from 'types/moisture';
import { processInChunks } from './performance';

interface CacheConfig {
  maxSize?: number;
  expirationTime?: number; // in milliseconds
}

// Extend Performance type to include memory
declare global {
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}

class ReadingCache {
  private cacheMap: Map<string, {
    data: MoistureReading;
    timestamp: number;
  }>;
  private maxSize: number;
  private expirationTime: number;

  constructor(config: CacheConfig = {}) {
    this.cacheMap = new Map();
    this.maxSize = config.maxSize || 1000;
    this.expirationTime = config.expirationTime || 30 * 60 * 1000; // 30 minutes default
  }

  get(id: string): MoistureReading | null {
    const cached = this.cacheMap.get(id);
    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > this.expirationTime) {
      this.cacheMap.delete(id);
      return null;
    }

    return cached.data;
  }

  set(id: string, reading: MoistureReading): void {
    // Ensure cache doesn't exceed max size
    if (this.cacheMap.size >= this.maxSize) {
      const oldestKey = this.findOldestEntry();
      if (oldestKey) this.cacheMap.delete(oldestKey);
    }

    this.cacheMap.set(id, {
      data: reading,
      timestamp: Date.now(),
    });
  }

  getMany(ids: string[]): MoistureReading[] {
    return ids
      .map(id => this.get(id))
      .filter((reading): reading is MoistureReading => reading !== null);
  }

  setMany(readings: MoistureReading[]): void {
    readings.forEach(reading => this.set(reading.id, reading));
  }

  clear(): void {
    this.cacheMap.clear();
  }

  get size(): number {
    return this.cacheMap.size;
  }

  private findOldestEntry(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    Array.from(this.cacheMap.entries()).forEach(([key, value]) => {
      if (value.timestamp < oldestTime) {
        oldestTime = value.timestamp;
        oldestKey = key;
      }
    });

    return oldestKey;
  }
}

class BatchProcessor {
  private queue: MoistureReading[] = [];
  private processing = false;
  private batchSize: number;
  private processingDelay: number;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(
    private processCallback: (readings: MoistureReading[]) => Promise<void>,
    config: { batchSize?: number; processingDelay?: number } = {}
  ) {
    this.batchSize = config.batchSize || 50;
    this.processingDelay = config.processingDelay || 1000; // 1 second default
  }

  add(reading: MoistureReading): void {
    this.queue.push(reading);
    this.scheduleProcessing();
  }

  addMany(readings: MoistureReading[]): void {
    this.queue.push(...readings);
    this.scheduleProcessing();
  }

  private scheduleProcessing(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.processQueue();
    }, this.processingDelay);
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const items = this.queue.splice(0, this.batchSize);

    try {
      await processInChunks(items, async (chunk) => {
        await this.processCallback(Array.isArray(chunk) ? chunk : [chunk]);
      });
    } catch (error) {
      console.error('Error processing batch:', error);
      // Add failed items back to queue
      this.queue.unshift(...items);
    } finally {
      this.processing = false;
      if (this.queue.length > 0) {
        this.scheduleProcessing();
      }
    }
  }

  clear(): void {
    this.queue = [];
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

// Create singleton instances
export const readingCache = new ReadingCache();

export const createBatchProcessor = (
  processCallback: (readings: MoistureReading[]) => Promise<void>,
  config?: { batchSize?: number; processingDelay?: number }
) => new BatchProcessor(processCallback, config);

// Helper functions for daily readings
export const getDailyReadingsKey = (date: string): string => `daily-readings-${date}`;

export const cacheDailyReadings = (readings: DailyReadings): void => {
  const key = getDailyReadingsKey(readings.date);
  localStorage.setItem(key, JSON.stringify(readings));
};

export const getCachedDailyReadings = (date: string): DailyReadings | null => {
  const key = getDailyReadingsKey(date);
  const cached = localStorage.getItem(key);
  return cached ? JSON.parse(cached) : null;
};

// Performance monitoring
export const getCacheStats = () => ({
  cacheSize: readingCache.size,
  memoryUsage: performance.memory ? {
    usedJSHeapSize: performance.memory.usedJSHeapSize,
    totalJSHeapSize: performance.memory.totalJSHeapSize,
  } : null,
});
