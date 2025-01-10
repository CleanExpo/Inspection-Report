import { Point } from './moisture';

export enum CacheLevel {
  MEMORY = 'MEMORY',
  LOCAL_STORAGE = 'LOCAL_STORAGE',
  INDEXED_DB = 'INDEXED_DB'
}

export enum LoadingPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  PREFETCH = 'PREFETCH'
}

export enum ProcessingMode {
  SYNC = 'SYNC',
  ASYNC = 'ASYNC',
  PARALLEL = 'PARALLEL',
  BATCH = 'BATCH'
}

export enum OptimizationStrategy {
  MEMORY = 'MEMORY',
  SPEED = 'SPEED',
  BALANCED = 'BALANCED'
}

export interface LoadingConfig {
  chunkSize: number;
  concurrency: number;
  retryAttempts: number;
  timeout: number;
  priority: LoadingPriority;
  preloadDistance: number;
  unloadDistance: number;
  memoryLimit: number;
  optimizeImages: {
    enabled: boolean;
    maxDimension?: number;
    quality?: number;
    format?: 'jpeg' | 'webp' | 'avif';
  };
}

export interface CoordinateOptimization {
  gridSize: number;
  spatialIndex: boolean;
  useWorkers: boolean;
  workerCount: number;
  batchSize: number;
  precision: number;
  transformCache: boolean;
  boundingBoxes: boolean;
  quadTree: {
    enabled: boolean;
    maxDepth: number;
    maxObjects: number;
  };
}

export interface CacheConfig {
  levels: CacheLevel[];
  maxSize: {
    [CacheLevel.MEMORY]: number;
    [CacheLevel.LOCAL_STORAGE]: number;
    [CacheLevel.INDEXED_DB]: number;
  };
  ttl: {
    [CacheLevel.MEMORY]: number;
    [CacheLevel.LOCAL_STORAGE]: number;
    [CacheLevel.INDEXED_DB]: number;
  };
  compression: {
    enabled: boolean;
    algorithm: 'gzip' | 'brotli' | 'lz4';
    level: number;
  };
  evictionPolicy: 'LRU' | 'LFU' | 'FIFO';
}

export interface BatchConfig {
  maxBatchSize: number;
  flushInterval: number;
  retryStrategy: {
    attempts: number;
    backoff: number;
    maxDelay: number;
  };
  priorityLevels: number;
  transactionMode: 'ATOMIC' | 'PARTIAL';
  errorHandling: 'CONTINUE' | 'ROLLBACK' | 'RETRY';
}

export interface LoadingChunk {
  id: string;
  url: string;
  bounds: {
    min: Point;
    max: Point;
  };
  priority: LoadingPriority;
  size: number;
  loaded: number;
  status: 'PENDING' | 'LOADING' | 'COMPLETE' | 'ERROR';
  error?: string;
  attempts: number;
  startTime: number;
  endTime?: number;
}

export interface CacheEntry {
  key: string;
  data: any;
  size: number;
  level: CacheLevel;
  created: number;
  accessed: number;
  hits: number;
  expires?: number;
  metadata?: Record<string, any>;
}

export interface BatchOperation {
  id: string;
  type: string;
  data: any;
  priority: number;
  timestamp: number;
  retries: number;
  dependencies?: string[];
  callback?: (error?: Error) => void;
}

export interface BatchResult {
  batchId: string;
  operations: {
    id: string;
    success: boolean;
    error?: string;
  }[];
  timing: {
    queued: number;
    started: number;
    completed: number;
  };
  stats: {
    total: number;
    succeeded: number;
    failed: number;
    retried: number;
  };
}

export interface PerformanceMetrics {
  memory: {
    used: number;
    peak: number;
    limit: number;
  };
  loading: {
    activeChunks: number;
    queuedChunks: number;
    loadedChunks: number;
    averageLoadTime: number;
    errorRate: number;
  };
  cache: {
    size: Record<CacheLevel, number>;
    hits: Record<CacheLevel, number>;
    misses: Record<CacheLevel, number>;
    evictions: Record<CacheLevel, number>;
  };
  batch: {
    queueLength: number;
    processingRate: number;
    averageBatchSize: number;
    successRate: number;
  };
  coordinates: {
    calculationsPerSecond: number;
    averageProcessingTime: number;
    cacheHitRate: number;
    workerUtilization: number;
  };
}

export interface OptimizationProfile {
  id: string;
  name: string;
  strategy: OptimizationStrategy;
  loading: Partial<LoadingConfig>;
  coordinates: Partial<CoordinateOptimization>;
  cache: Partial<CacheConfig>;
  batch: Partial<BatchConfig>;
  triggers: {
    memoryThreshold?: number;
    loadingThreshold?: number;
    errorThreshold?: number;
    performanceThreshold?: number;
  };
}

export interface PerformanceSnapshot {
  id: string;
  timestamp: number;
  profile: OptimizationProfile;
  metrics: PerformanceMetrics;
  issues: {
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    context?: Record<string, any>;
  }[];
  recommendations: {
    target: 'LOADING' | 'COORDINATES' | 'CACHE' | 'BATCH';
    action: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    details: string;
  }[];
}
