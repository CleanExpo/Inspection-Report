import { metricsCollector } from '../../__tests__/api/inspections/sections/metrics-collector';
import { analyticsService } from '../services/analytics';
import { performanceOptimizer } from '../services/optimizer';
import { resourceManager } from '../services/resource-manager';
import { cacheManager } from '../services/cache-manager';
import { loadBalancer } from '../services/load-balancer';

interface PerformanceBaseline {
  responseTime: {
    mean: number;
    p95: number;
    max: number;
  };
  resources: {
    cpuUsage: number;
    memoryUsage: number;
    connections: number;
  };
  optimization: {
    performanceScore: number;
    stabilityScore: number;
  };
  cache: {
    hitRate: number;
    evictionRate: number;
  };
}

class RegressionTester {
  private baseline: PerformanceBaseline | null = null;
  private readonly DEGRADATION_THRESHOLD = 0.15; // 15% degradation threshold
  private readonly IMPROVEMENT_THRESHOLD = 0.10; // 10% improvement threshold

  async captureBaseline(): Promise<void> {
    // Run system under normal load
    await this.generateBaselineLoad();
    
    // Capture metrics
    const stats = metricsCollector.getCurrentStats();
    const optimizerState = performanceOptimizer.getState();
    const cacheStats = cacheManager.getStats();

    this.baseline = {
      responseTime: {
        mean: stats.responseTime?.mean || 0,
        p95: stats.responseTime?.p95 || 0,
        max: stats.responseTime?.max || 0
      },
      resources: {
        cpuUsage: stats.cpu?.mean || 0,
        memoryUsage: stats.memory?.mean || 0,
        connections: stats.connections?.mean || 0
      },
      optimization: {
        performanceScore: optimizerState.performanceScore,
        stabilityScore: optimizerState.stabilityScore
      },
      cache: {
        hitRate: cacheStats.hitRate,
        evictionRate: (cacheStats.size / (1024 * 1024)) / cacheStats.entries
      }
    };
  }

  async compareWithBaseline(): Promise<{
    regressions: string[];
    improvements: string[];
  }> {
    if (!this.baseline) {
      throw new Error('Baseline not captured');
    }

    // Run system under same load as baseline
    await this.generateBaselineLoad();

    // Capture current metrics
    const stats = metricsCollector.getCurrentStats();
    const optimizerState = performanceOptimizer.getState();
    const cacheStats = cacheManager.getStats();

    const regressions: string[] = [];
    const improvements: string[] = [];

    // Compare response times
    this.compareMetric(
      'Response time (mean)',
      this.baseline.responseTime.mean,
      stats.responseTime?.mean || 0,
      regressions,
      improvements
    );

    this.compareMetric(
      'Response time (p95)',
      this.baseline.responseTime.p95,
      stats.responseTime?.p95 || 0,
      regressions,
      improvements
    );

    // Compare resource usage
    this.compareMetric(
      'CPU usage',
      this.baseline.resources.cpuUsage,
      stats.cpu?.mean || 0,
      regressions,
      improvements
    );

    this.compareMetric(
      'Memory usage',
      this.baseline.resources.memoryUsage,
      stats.memory?.mean || 0,
      regressions,
      improvements
    );

    // Compare optimization scores
    this.compareMetric(
      'Performance score',
      this.baseline.optimization.performanceScore,
      optimizerState.performanceScore,
      regressions,
      improvements
    );

    this.compareMetric(
      'Stability score',
      this.baseline.optimization.stabilityScore,
      optimizerState.stabilityScore,
      regressions,
      improvements
    );

    // Compare cache performance
    this.compareMetric(
      'Cache hit rate',
      this.baseline.cache.hitRate,
      cacheStats.hitRate,
      regressions,
      improvements
    );

    return { regressions, improvements };
  }

  private async generateBaselineLoad(): Promise<void> {
    // Simulate consistent load pattern
    for (let i = 0; i < 10; i++) {
      metricsCollector.recordMetric('cpu', 50 + Math.random() * 20);
      metricsCollector.recordMetric('memory', 60 + Math.random() * 15);
      metricsCollector.recordMetric('connections', 100 + Math.random() * 50);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Allow system to stabilize
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private compareMetric(
    name: string,
    baseline: number,
    current: number,
    regressions: string[],
    improvements: string[]
  ): void {
    const change = (current - baseline) / baseline;

    if (change > this.DEGRADATION_THRESHOLD) {
      regressions.push(
        `${name} degraded by ${(change * 100).toFixed(1)}% (${baseline.toFixed(2)} -> ${current.toFixed(2)})`
      );
    } else if (change < -this.IMPROVEMENT_THRESHOLD) {
      improvements.push(
        `${name} improved by ${(-change * 100).toFixed(1)}% (${baseline.toFixed(2)} -> ${current.toFixed(2)})`
      );
    }
  }
}

describe('Regression Tests', () => {
  let regressionTester: RegressionTester;

  beforeAll(async () => {
    regressionTester = new RegressionTester();
    
    // Set up test environment
    loadBalancer.registerNode('regression-1', 'http://localhost:3001');
    loadBalancer.registerNode('regression-2', 'http://localhost:3002');
  });

  afterAll(() => {
    cacheManager.stop();
    loadBalancer.stop();
  });

  beforeEach(() => {
    cacheManager.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Performance Baselines', () => {
    it('should establish and maintain performance baselines', async () => {
      // Capture initial baseline
      await regressionTester.captureBaseline();

      // Compare with current performance
      const { regressions, improvements } = await regressionTester.compareWithBaseline();

      // Verify system stability
      expect(regressions.length).toBe(0);
      console.log('Improvements:', improvements);
    });

    it('should detect performance regressions', async () => {
      // Capture baseline
      await regressionTester.captureBaseline();

      // Simulate degraded performance
      for (let i = 0; i < 5; i++) {
        metricsCollector.recordMetric('cpu', 85 + Math.random() * 10);
        metricsCollector.recordMetric('memory', 80 + Math.random() * 15);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Compare with baseline
      const { regressions } = await regressionTester.compareWithBaseline();
      expect(regressions.length).toBeGreaterThan(0);
      expect(regressions[0]).toContain('degraded');
    });
  });

  describe('Resource Utilization', () => {
    it('should maintain consistent resource usage patterns', async () => {
      // Capture baseline
      await regressionTester.captureBaseline();

      // Simulate normal operation
      for (let i = 0; i < 5; i++) {
        metricsCollector.recordMetric('cpu', 55 + Math.random() * 10);
        metricsCollector.recordMetric('memory', 65 + Math.random() * 10);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Compare with baseline
      const { regressions } = await regressionTester.compareWithBaseline();
      expect(regressions.length).toBe(0);
    });
  });

  describe('Optimization Effectiveness', () => {
    it('should maintain optimization effectiveness', async () => {
      // Capture baseline
      await regressionTester.captureBaseline();

      // Simulate optimization scenarios
      await performanceOptimizer.optimize();
      
      // Compare with baseline
      const { regressions, improvements } = await regressionTester.compareWithBaseline();
      
      // Either no regressions or clear improvements
      if (regressions.length > 0) {
        expect(improvements.length).toBeGreaterThan(regressions.length);
      }
    });
  });

  describe('System Stability', () => {
    it('should maintain system stability over time', async () => {
      // Capture baseline
      await regressionTester.captureBaseline();

      // Simulate extended operation
      for (let i = 0; i < 10; i++) {
        metricsCollector.recordMetric('cpu', 60 + Math.random() * 10);
        metricsCollector.recordMetric('memory', 70 + Math.random() * 10);
        await performanceOptimizer.optimize();
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Compare with baseline
      const { regressions } = await regressionTester.compareWithBaseline();
      expect(regressions.length).toBe(0);
    });
  });
});
