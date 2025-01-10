import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';

interface MetricPoint {
  timestamp: number;
  value: number;
  tags: Record<string, string>;
}

interface MetricConfig {
  name: string;
  type: 'gauge' | 'counter' | 'histogram';
  unit?: string;
  description?: string;
  labels?: string[];
  aggregation?: {
    type: 'avg' | 'sum' | 'min' | 'max' | 'p95';
    interval: number;  // milliseconds
  };
}

interface MetricSeries {
  config: MetricConfig;
  points: MetricPoint[];
  lastUpdate: number;
  aggregates?: {
    timestamp: number;
    value: number;
  }[];
}

class MetricsCollector extends EventEmitter {
  private metrics: Map<string, MetricSeries>;
  private storageDir: string;
  private flushInterval: NodeJS.Timeout | null;
  private aggregationJobs: Map<string, NodeJS.Timeout>;

  constructor(options: { 
    storageDir?: string;
    flushIntervalMs?: number;
  } = {}) {
    super();
    this.metrics = new Map();
    this.storageDir = options.storageDir || path.join(process.cwd(), 'metrics');
    this.flushInterval = null;
    this.aggregationJobs = new Map();

    // Start periodic flush
    if (options.flushIntervalMs) {
      this.startPeriodicFlush(options.flushIntervalMs);
    }
  }

  async initialize(): Promise<void> {
    // Create storage directory if it doesn't exist
    await fs.mkdir(this.storageDir, { recursive: true });

    // Load existing metrics from disk
    await this.loadMetrics();
  }

  registerMetric(config: MetricConfig): void {
    if (this.metrics.has(config.name)) {
      throw new Error(`Metric ${config.name} already registered`);
    }

    this.metrics.set(config.name, {
      config,
      points: [],
      lastUpdate: Date.now(),
      aggregates: config.aggregation ? [] : undefined
    });

    // Set up aggregation if configured
    if (config.aggregation) {
      this.setupAggregation(config.name, config.aggregation);
    }

    this.emit('metricRegistered', config);
  }

  record(name: string, value: number, tags: Record<string, string> = {}): void {
    const series = this.metrics.get(name);
    if (!series) {
      throw new Error(`Metric ${name} not registered`);
    }

    // Validate tags
    if (series.config.labels) {
      for (const required of series.config.labels) {
        if (!tags[required]) {
          throw new Error(`Missing required label ${required} for metric ${name}`);
        }
      }
    }

    const point: MetricPoint = {
      timestamp: Date.now(),
      value,
      tags
    };

    series.points.push(point);
    series.lastUpdate = point.timestamp;

    this.emit('metricRecorded', { name, point });
  }

  getMetric(name: string, options: {
    start?: number;
    end?: number;
    tags?: Record<string, string>;
    aggregated?: boolean;
  } = {}): MetricPoint[] {
    const series = this.metrics.get(name);
    if (!series) {
      throw new Error(`Metric ${name} not registered`);
    }

    let points = options.aggregated && series.aggregates 
      ? series.aggregates.map(a => ({ timestamp: a.timestamp, value: a.value, tags: {} }))
      : series.points;

    // Apply time range filter
    if (options.start || options.end) {
      points = points.filter(p => 
        (!options.start || p.timestamp >= options.start) &&
        (!options.end || p.timestamp <= options.end)
      );
    }

    // Apply tag filter
    if (options.tags) {
      points = points.filter(p => {
        if (!options.tags) return true;
        const filterTags = options.tags as Record<string, string>;
        return Object.entries(filterTags).every(([key, value]) => {
          const pointTag = p.tags[key as keyof typeof p.tags];
          return pointTag !== undefined && pointTag === value;
        });
      });
    }

    return points;
  }

  async flush(): Promise<void> {
    for (const [name, series] of Array.from(this.metrics.entries())) {
      if (series.points.length === 0) continue;

      const filePath = path.join(this.storageDir, `${name}.json`);
      
      try {
        // Load existing data
        let existing: MetricPoint[] = [];
        try {
          const content = await fs.readFile(filePath, 'utf8');
          existing = JSON.parse(content);
        } catch (error) {
          // File doesn't exist or is corrupt, start fresh
        }

        // Append new points and save
        const allPoints = [...existing, ...series.points];
        await fs.writeFile(filePath, JSON.stringify(allPoints));

        // Clear points after successful save
        series.points = [];

        this.emit('metricsFlushed', { name, pointCount: allPoints.length });
      } catch (error) {
        this.emit('error', { 
          operation: 'flush', 
          metric: name, 
          error 
        });
      }
    }
  }

  private async loadMetrics(): Promise<void> {
    try {
      const files = await fs.readdir(this.storageDir);
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const name = path.basename(file, '.json');
        const content = await fs.readFile(
          path.join(this.storageDir, file), 
          'utf8'
        );

        const points = JSON.parse(content) as MetricPoint[];
        const series = this.metrics.get(name);

        if (series) {
          series.points = points;
          series.lastUpdate = Math.max(...points.map(p => p.timestamp));
        }
      }
    } catch (error) {
      this.emit('error', { 
        operation: 'load', 
        error 
      });
    }
  }

  private startPeriodicFlush(intervalMs: number): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }

    this.flushInterval = setInterval(() => {
      this.flush().catch(error => {
        this.emit('error', { 
          operation: 'periodicFlush', 
          error 
        });
      });
    }, intervalMs);
  }

  private setupAggregation(metricName: string, config: NonNullable<MetricConfig['aggregation']>): void {
    const job = setInterval(() => {
      const series = this.metrics.get(metricName);
      if (!series) return;

      const now = Date.now();
      const windowStart = now - config.interval;

      // Get points in the window
      const points = series.points.filter(p => 
        p.timestamp >= windowStart && p.timestamp <= now
      );

      if (points.length === 0) return;

      // Calculate aggregate
      let value: number;
      const values = points.map(p => p.value);

      switch (config.type) {
        case 'avg':
          value = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'sum':
          value = values.reduce((a, b) => a + b, 0);
          break;
        case 'min':
          value = Math.min(...values);
          break;
        case 'max':
          value = Math.max(...values);
          break;
        case 'p95':
          const sorted = [...values].sort((a, b) => a - b);
          const idx = Math.floor(sorted.length * 0.95);
          value = sorted[idx];
          break;
      }

      // Store aggregate
      series.aggregates!.push({
        timestamp: now,
        value
      });

      // Keep only last 24 hours of aggregates
      const dayAgo = now - 24 * 60 * 60 * 1000;
      series.aggregates = series.aggregates!.filter(a => 
        a.timestamp >= dayAgo
      );

      this.emit('aggregateComputed', {
        metric: metricName,
        timestamp: now,
        value
      });
    }, config.interval);

    this.aggregationJobs.set(metricName, job);
  }

  stop(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    for (const job of Array.from(this.aggregationJobs.values())) {
      clearInterval(job);
    }
    this.aggregationJobs.clear();
  }
}

export { MetricsCollector };
export type { MetricConfig, MetricPoint, MetricSeries };
