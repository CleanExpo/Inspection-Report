import React from 'react';

interface PerformanceMetrics {
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  timeToFirstByte?: number;
  timeToFirstPaint?: number;
  timeToFirstContentfulPaint?: number;
}

interface ErrorMetrics {
  message: string;
  stack?: string;
  timestamp: string;
  componentName?: string;
  additionalInfo?: Record<string, any>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private errors: ErrorMetrics[] = [];
  private maxErrorLogs: number = 100;

  private constructor() {
    // Initialize performance observer
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers() {
    // Observe paint timing
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.logMetric(entry.name, entry.startTime);
      }
    });

    try {
      paintObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.warn('Paint timing not supported:', e);
    }

    // Observe long tasks
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.logMetric('longTask', entry.duration);
      }
    });

    try {
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.warn('Long task timing not supported:', e);
    }
  }

  public measureSync<T>(label: string, callback: () => T): T {
    const start = performance.now();
    try {
      const result = callback();
      const duration = performance.now() - start;
      this.logMetric(label, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.logMetric(`${label}_error`, duration);
      throw error;
    }
  }

  public async measureAsync<T>(
    label: string,
    callback: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await callback();
      const duration = performance.now() - start;
      this.logMetric(label, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.logMetric(`${label}_error`, duration);
      throw error;
    }
  }

  public logMetric(label: string, value: number): void {
    const metrics = this.metrics.get(label) || [];
    metrics.push(value);
    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
    this.metrics.set(label, metrics);
  }

  public getMetrics(label: string): number[] {
    return this.metrics.get(label) || [];
  }

  public getAverageMetric(label: string): number {
    const metrics = this.getMetrics(label);
    if (metrics.length === 0) return 0;
    return metrics.reduce((a, b) => a + b, 0) / metrics.length;
  }

  public trackError(error: Error, componentName?: string, additionalInfo?: Record<string, any>) {
    const errorMetric: ErrorMetrics = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      componentName,
      additionalInfo,
    };

    this.errors.unshift(errorMetric);
    if (this.errors.length > this.maxErrorLogs) {
      this.errors.pop();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Performance Error]', errorMetric);
    }
  }

  public getMemoryUsage(): Partial<PerformanceMetrics> {
    if (
      typeof window !== 'undefined' &&
      performance &&
      (performance as any).memory
    ) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
      };
    }
    return {};
  }

  public clearMetrics(): void {
    this.metrics.clear();
    this.errors = [];
  }

  public getErrorLogs(): ErrorMetrics[] {
    return [...this.errors];
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Utility hooks and functions
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
): React.FC<P> {
  const DisplayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  function PerformanceTrackedComponent(props: P) {
    React.useEffect(() => {
      const start = performance.now();
      
      return () => {
        const duration = performance.now() - start;
        performanceMonitor.logMetric(`${componentName}_mounted`, duration);
      };
    }, []);

    try {
      return React.createElement(WrappedComponent, props);
    } catch (error) {
      performanceMonitor.trackError(
        error instanceof Error ? error : new Error(String(error)),
        componentName
      );
      throw error;
    }
  }

  PerformanceTrackedComponent.displayName = `WithPerformanceTracking(${DisplayName})`;
  return PerformanceTrackedComponent;
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
