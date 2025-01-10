/**
 * Performance monitoring and metrics collection utilities
 */

import { readingCache, getCacheStats } from './cache';

interface PerformanceMetric {
  value: number;
  timestamp: number;
  context?: string;
}

interface RenderMetric {
  component: string;
  duration: number;
  timestamp: number;
}

interface ErrorMetric {
  message: string;
  context: string;
  stack?: string;
  timestamp: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetric[]>;
  private renderTimes: Map<string, RenderMetric[]>;
  private errors: ErrorMetric[];
  private readonly MAX_HISTORY = 1000;

  private constructor() {
    this.metrics = new Map();
    this.renderTimes = new Map();
    this.errors = [];
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  trackMetric(name: string, value: number, context?: string) {
    const metric: PerformanceMetric = {
      value,
      timestamp: Date.now(),
      context,
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(metric);

    // Maintain history limit
    if (metrics.length > this.MAX_HISTORY) {
      metrics.shift();
    }
  }

  trackRender(component: string, duration: number) {
    const metric: RenderMetric = {
      component,
      duration,
      timestamp: Date.now(),
    };

    if (!this.renderTimes.has(component)) {
      this.renderTimes.set(component, []);
    }

    const renders = this.renderTimes.get(component)!;
    renders.push(metric);

    // Maintain history limit
    if (renders.length > this.MAX_HISTORY) {
      renders.shift();
    }
  }

  trackError(error: Error, context: string) {
    const errorMetric: ErrorMetric = {
      message: error.message,
      context,
      stack: error.stack,
      timestamp: Date.now(),
    };

    this.errors.push(errorMetric);

    // Maintain history limit
    if (this.errors.length > this.MAX_HISTORY) {
      this.errors.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context}]`, error);
    }
  }

  getMetrics(name: string, duration?: number): PerformanceMetric[] {
    const metrics = this.metrics.get(name) || [];
    if (!duration) return metrics;

    const cutoff = Date.now() - duration;
    return metrics.filter(m => m.timestamp >= cutoff);
  }

  getRenderMetrics(component?: string, duration?: number): RenderMetric[] {
    let renders: RenderMetric[] = [];

    if (component) {
      renders = this.renderTimes.get(component) || [];
    } else {
      renders = Array.from(this.renderTimes.values()).flat();
    }

    if (!duration) return renders;

    const cutoff = Date.now() - duration;
    return renders.filter(r => r.timestamp >= cutoff);
  }

  getErrors(duration?: number): ErrorMetric[] {
    if (!duration) return this.errors;

    const cutoff = Date.now() - duration;
    return this.errors.filter(e => e.timestamp >= cutoff);
  }

  getPerformanceReport(duration: number = 3600000) { // Default: last hour
    const cutoff = Date.now() - duration;

    // Get cache statistics
    const cacheStats = getCacheStats();

    // Calculate average render times
    const renderMetrics = this.getRenderMetrics(undefined, duration);
    const avgRenderTimes = new Map<string, number>();
    renderMetrics.forEach(metric => {
      const current = avgRenderTimes.get(metric.component) || 0;
      const count = avgRenderTimes.size || 1;
      avgRenderTimes.set(metric.component, current + (metric.duration / count));
    });

    // Get error counts by context
    const errorCounts = this.errors
      .filter(e => e.timestamp >= cutoff)
      .reduce((acc, error) => {
        acc[error.context] = (acc[error.context] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      timestamp: new Date().toISOString(),
      duration,
      cache: {
        size: cacheStats.cacheSize,
        memoryUsage: cacheStats.memoryUsage,
      },
      rendering: {
        averageTimes: Object.fromEntries(avgRenderTimes),
        totalRenders: renderMetrics.length,
      },
      errors: {
        total: this.errors.filter(e => e.timestamp >= cutoff).length,
        byContext: errorCounts,
      },
      metrics: Array.from(this.metrics.entries()).reduce((acc, [name, metrics]) => {
        const recentMetrics = metrics.filter(m => m.timestamp >= cutoff);
        if (recentMetrics.length > 0) {
          acc[name] = {
            average: recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length,
            min: Math.min(...recentMetrics.map(m => m.value)),
            max: Math.max(...recentMetrics.map(m => m.value)),
            count: recentMetrics.length,
          };
        }
        return acc;
      }, {} as Record<string, { average: number; min: number; max: number; count: number }>),
    };
  }

  clearOldData(maxAge: number = 86400000) { // Default: 24 hours
    const cutoff = Date.now() - maxAge;

    // Clear old metrics
    this.metrics.forEach((metrics, name) => {
      this.metrics.set(
        name,
        metrics.filter(m => m.timestamp >= cutoff)
      );
    });

    // Clear old render times
    this.renderTimes.forEach((renders, component) => {
      this.renderTimes.set(
        component,
        renders.filter(r => r.timestamp >= cutoff)
      );
    });

    // Clear old errors
    this.errors = this.errors.filter(e => e.timestamp >= cutoff);
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// React hook for component performance tracking
export const usePerformanceTracking = (componentName: string) => {
  return {
    trackRender: (duration: number) => performanceMonitor.trackRender(componentName, duration),
    trackError: (error: Error) => performanceMonitor.trackError(error, componentName),
    trackMetric: (name: string, value: number) => 
      performanceMonitor.trackMetric(name, value, componentName),
  };
};

// Utility function to measure execution time
export const measureExecutionTime = async <T>(
  operation: () => Promise<T> | T,
  context: string
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await operation();
    const duration = performance.now() - start;
    performanceMonitor.trackMetric('executionTime', duration, context);
    return result;
  } catch (error) {
    performanceMonitor.trackError(error as Error, context);
    throw error;
  }
};

// Schedule regular cleanup
if (typeof window !== 'undefined') {
  setInterval(() => {
    performanceMonitor.clearOldData();
  }, 3600000); // Clean up every hour
}
