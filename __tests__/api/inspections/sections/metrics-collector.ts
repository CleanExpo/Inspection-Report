import { BenchmarkResult } from './types';
import { metricsConfig, analyzePerformance, checkResourceUtilization, calculateLoadParameters } from './metrics-config';
import fs from 'fs';
import path from 'path';

interface ThresholdConfig {
  responseTime: number;
  memory: number;
  cpu: number;
  connections: number;
}

/**
 * Metrics Collector for gathering and analyzing performance data
 */
export class MetricsCollector {
  private metricsFile: string;
  private currentMetrics: {
    memory: number[];
    cpu: number[];
    connections: number[];
    responseTime: number[];
  };
  private failureCount: number;
  private lastWarning: Date | null;
  private thresholds: ThresholdConfig;

  constructor(metricsFilePath?: string) {
    this.metricsFile = metricsFilePath || path.join(__dirname, 'performance-metrics.json');
    this.currentMetrics = {
      memory: [],
      cpu: [],
      connections: [],
      responseTime: []
    };
    this.failureCount = 0;
    this.lastWarning = null;
    this.thresholds = {
      responseTime: metricsConfig.performance.responseTimeThreshold,
      memory: metricsConfig.resources.memoryThreshold,
      cpu: metricsConfig.resources.cpuThreshold,
      connections: metricsConfig.resources.connectionThreshold
    };
  }

  /**
   * Updates performance thresholds dynamically
   */
  updateThresholds(newThresholds: Partial<ThresholdConfig>) {
    this.thresholds = {
      ...this.thresholds,
      ...newThresholds
    };
    
    // Update metrics config with new thresholds
    Object.assign(metricsConfig.performance, {
      responseTimeThreshold: this.thresholds.responseTime
    });
    Object.assign(metricsConfig.resources, {
      memoryThreshold: this.thresholds.memory,
      cpuThreshold: this.thresholds.cpu,
      connectionThreshold: this.thresholds.connections
    });

    // Log threshold updates
    console.log('[MetricsCollector] Updated thresholds:', this.thresholds);
  }

  /**
   * Records a single performance measurement
   */
  recordMetric(type: 'memory' | 'cpu' | 'connections' | 'responseTime', value: number) {
    this.currentMetrics[type].push(value);

    // Keep only last hour of metrics (assuming 1 measurement per second = 3600 samples)
    if (this.currentMetrics[type].length > 3600) {
      this.currentMetrics[type].shift();
    }

    // Check for resource warnings using current thresholds
    if (type !== 'responseTime') {
      this.checkResourceWarnings();
    }
  }

  /**
   * Records a complete benchmark result
   */
  recordBenchmark(result: BenchmarkResult) {
    const existingResults: BenchmarkResult[] = this.loadBenchmarkResults();
    existingResults.push(result);

    // Keep only last 30 days of benchmarks
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const filteredResults = existingResults.filter(r => 
      new Date(r.timestamp) > thirtyDaysAgo
    );

    fs.writeFileSync(this.metricsFile, JSON.stringify(filteredResults, null, 2));

    // Analyze performance
    const analysis = analyzePerformance([result]);
    this.handleAnalysisResults(analysis);
  }

  /**
   * Gets current performance statistics
   */
  getCurrentStats() {
    const calculateStats = (values: number[]) => {
      if (values.length === 0) return null;
      const sorted = [...values].sort((a, b) => a - b);
      return {
        current: values[values.length - 1],
        mean: values.reduce((a, b) => a + b, 0) / values.length,
        p95: sorted[Math.floor(sorted.length * 0.95)],
        max: sorted[sorted.length - 1]
      };
    };

    return {
      memory: calculateStats(this.currentMetrics.memory),
      cpu: calculateStats(this.currentMetrics.cpu),
      connections: calculateStats(this.currentMetrics.connections),
      responseTime: calculateStats(this.currentMetrics.responseTime)
    };
  }

  /**
   * Gets recommended load test parameters based on current metrics
   */
  getLoadTestParameters() {
    const currentLoad = this.currentMetrics.connections.length > 0
      ? Math.max(...this.currentMetrics.connections)
      : metricsConfig.load.baselineConcurrency;

    return calculateLoadParameters(currentLoad);
  }

  /**
   * Checks if system is healthy based on recent metrics
   */
  checkHealth(): {
    healthy: boolean;
    status: string;
    issues: string[];
  } {
    const stats = this.getCurrentStats();
    if (!stats.memory || !stats.cpu || !stats.connections) {
      return {
        healthy: false,
        status: 'Unknown',
        issues: ['Insufficient metrics data']
      };
    }

    const resourceCheck = checkResourceUtilization({
      memory: stats.memory.current,
      cpu: stats.cpu.current,
      connections: stats.connections.current
    });

    return {
      healthy: resourceCheck.status === 'healthy',
      status: resourceCheck.status,
      issues: resourceCheck.issues
    };
  }

  /**
   * Resets failure count after successful operation
   */
  recordSuccess() {
    this.failureCount = 0;
  }

  /**
   * Records a failure and checks alert threshold
   */
  recordFailure() {
    this.failureCount++;
    if (this.failureCount >= metricsConfig.alerts.consecutiveFailures) {
      this.triggerAlert('Multiple consecutive failures detected');
    }
  }

  private loadBenchmarkResults(): BenchmarkResult[] {
    try {
      if (fs.existsSync(this.metricsFile)) {
        return JSON.parse(fs.readFileSync(this.metricsFile, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading benchmark results:', error);
    }
    return [];
  }

  private handleAnalysisResults(analysis: { violations: string[]; warnings: string[] }) {
    if (analysis.violations.length > 0) {
      this.triggerAlert(`Performance violations detected: ${analysis.violations.join(', ')}`);
    }

    if (analysis.warnings.length > 0) {
      this.triggerWarning(`Performance warnings: ${analysis.warnings.join(', ')}`);
    }
  }

  private checkResourceWarnings() {
    const health = this.checkHealth();
    if (health.status === 'critical') {
      this.triggerAlert(`Critical resource usage: ${health.issues.join(', ')}`);
    } else if (health.status === 'warning') {
      this.triggerWarning(`Resource warning: ${health.issues.join(', ')}`);
    }
  }

  private triggerAlert(message: string) {
    // In a real implementation, this would integrate with your alerting system
    console.error(`[ALERT] ${message}`);
    // Record alert in metrics file
    const alert = {
      timestamp: new Date().toISOString(),
      type: 'alert',
      message
    };
    this.recordEvent(alert);
  }

  private triggerWarning(message: string) {
    // Avoid warning spam by enforcing a minimum interval
    const now = new Date();
    if (!this.lastWarning || now.getTime() - this.lastWarning.getTime() > 300000) { // 5 minutes
      console.warn(`[WARNING] ${message}`);
      this.lastWarning = now;
      // Record warning in metrics file
      const warning = {
        timestamp: now.toISOString(),
        type: 'warning',
        message
      };
      this.recordEvent(warning);
    }
  }

  private recordEvent(event: { timestamp: string; type: string; message: string }) {
    try {
      const eventsFile = path.join(__dirname, 'performance-events.json');
      const events = fs.existsSync(eventsFile)
        ? JSON.parse(fs.readFileSync(eventsFile, 'utf8'))
        : [];
      
      events.push(event);
      
      // Keep only last 1000 events
      if (events.length > 1000) {
        events.shift();
      }
      
      fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2));
    } catch (error) {
      console.error('Error recording event:', error);
    }
  }
}

// Export singleton instance
export const metricsCollector = new MetricsCollector();
