import { metricsCollector } from '../../__tests__/api/inspections/sections/metrics-collector';
import { analyticsService } from '../services/analytics';
import { performanceOptimizer } from '../services/optimizer';
import { resourceManager } from '../services/resource-manager';
import { cacheManager } from '../services/cache-manager';
import { loadBalancer } from '../services/load-balancer';

interface ValidationMetrics {
  optimizationEffectiveness: {
    profileChanges: number;
    thresholdAdjustments: number;
    performanceImprovements: number;
  };
  resourceEfficiency: {
    averageCpuUsage: number;
    averageMemoryUsage: number;
    peakConnections: number;
  };
  cachePerformance: {
    hitRate: number;
    missRate: number;
    evictionRate: number;
    averageSize: number;
  };
  loadDistribution: {
    nodeBalance: number;
    routingEfficiency: number;
    failoverSuccess: number;
  };
}

class PerformanceValidator {
  private metrics: ValidationMetrics = {
    optimizationEffectiveness: {
      profileChanges: 0,
      thresholdAdjustments: 0,
      performanceImprovements: 0
    },
    resourceEfficiency: {
      averageCpuUsage: 0,
      averageMemoryUsage: 0,
      peakConnections: 0
    },
    cachePerformance: {
      hitRate: 0,
      missRate: 0,
      evictionRate: 0,
      averageSize: 0
    },
    loadDistribution: {
      nodeBalance: 0,
      routingEfficiency: 0,
      failoverSuccess: 0
    }
  };

  private measurements: {
    cpu: number[];
    memory: number[];
    connections: number[];
  } = {
    cpu: [],
    memory: [],
    connections: []
  };

  async validatePerformance(duration: number): Promise<ValidationMetrics> {
    const startTime = Date.now();
    const endTime = startTime + duration;
    const initialState = this.captureSystemState();

    while (Date.now() < endTime) {
      await this.recordMeasurements();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const finalState = this.captureSystemState();
    this.calculateMetrics(initialState, finalState);
    
    return this.metrics;
  }

  private captureSystemState() {
    return {
      optimizer: performanceOptimizer.getState(),
      resources: resourceManager.getState(),
      cache: cacheManager.getStats(),
      loadBalancer: loadBalancer.getStatus()
    };
  }

  private async recordMeasurements() {
    const stats = metricsCollector.getCurrentStats();
    
    if (stats.cpu?.current) {
      this.measurements.cpu.push(stats.cpu.current);
    }
    if (stats.memory?.current) {
      this.measurements.memory.push(stats.memory.current);
    }
    if (stats.connections?.current) {
      this.measurements.connections.push(stats.connections.current);
    }
  }

  private calculateMetrics(initialState: any, finalState: any) {
    // Calculate optimization effectiveness
    this.metrics.optimizationEffectiveness = {
      profileChanges: this.countProfileChanges(initialState.optimizer, finalState.optimizer),
      thresholdAdjustments: this.countThresholdChanges(initialState.resources, finalState.resources),
      performanceImprovements: this.countImprovements(initialState, finalState)
    };

    // Calculate resource efficiency
    this.metrics.resourceEfficiency = {
      averageCpuUsage: this.calculateAverage(this.measurements.cpu),
      averageMemoryUsage: this.calculateAverage(this.measurements.memory),
      peakConnections: Math.max(...this.measurements.connections)
    };

    // Calculate cache performance
    this.metrics.cachePerformance = {
      hitRate: finalState.cache.hitRate,
      missRate: 1 - finalState.cache.hitRate,
      evictionRate: this.calculateEvictionRate(initialState.cache, finalState.cache),
      averageSize: finalState.cache.size
    };

    // Calculate load distribution
    this.metrics.loadDistribution = {
      nodeBalance: this.calculateNodeBalance(finalState.loadBalancer),
      routingEfficiency: this.calculateRoutingEfficiency(finalState.loadBalancer),
      failoverSuccess: this.calculateFailoverSuccess()
    };
  }

  private countProfileChanges(initial: any, final: any): number {
    return initial.currentProfile.name !== final.currentProfile.name ? 1 : 0;
  }

  private countThresholdChanges(initial: any, final: any): number {
    let changes = 0;
    ['cpu', 'memory', 'connections'].forEach(metric => {
      if (initial.limits[metric].threshold !== final.limits[metric].threshold) {
        changes++;
      }
    });
    return changes;
  }

  private countImprovements(initial: any, final: any): number {
    let improvements = 0;
    
    // Check performance score improvement
    if (final.optimizer.performanceScore > initial.optimizer.performanceScore) {
      improvements++;
    }

    // Check stability score improvement
    if (final.optimizer.stabilityScore > initial.optimizer.stabilityScore) {
      improvements++;
    }

    // Check resource utilization improvement
    if (this.calculateAverage(this.measurements.cpu.slice(-10)) < 
        this.calculateAverage(this.measurements.cpu.slice(0, 10))) {
      improvements++;
    }

    return improvements;
  }

  private calculateAverage(values: number[]): number {
    return values.length > 0 
      ? values.reduce((a, b) => a + b, 0) / values.length 
      : 0;
  }

  private calculateEvictionRate(initial: any, final: any): number {
    const totalEntries = initial.entries + final.entries;
    return totalEntries > 0 ? (initial.entries - final.entries) / totalEntries : 0;
  }

  private calculateNodeBalance(lbStatus: any): number {
    const nodeLoads = lbStatus.nodeStatus.map((n: any) => n.metrics.connections);
    const avgLoad = this.calculateAverage(nodeLoads);
    const maxDeviation = Math.max(...nodeLoads.map((load: number) => Math.abs(load - avgLoad)));
    return avgLoad > 0 ? 1 - (maxDeviation / avgLoad) : 1;
  }

  private calculateRoutingEfficiency(lbStatus: any): number {
    const responseTimesBalanced = lbStatus.nodeStatus.every((n: any) => 
      n.metrics.responseTime < 1000
    );
    const connectionsBalanced = this.calculateNodeBalance(lbStatus) > 0.7;
    return (responseTimesBalanced && connectionsBalanced) ? 1 : 0;
  }

  private calculateFailoverSuccess(): number {
    const analytics = analyticsService.getAnalytics();
    const failurePatterns = analytics.patterns.filter(p => 
      p.type === 'degradation' || p.type === 'high-usage'
    );
    return failurePatterns.length > 0 ? 0 : 1;
  }
}

describe('Performance Validation Tests', () => {
  let validator: PerformanceValidator;
  const VALIDATION_DURATION = 60000; // 1 minute

  beforeAll(() => {
    validator = new PerformanceValidator();
    
    // Set up test environment
    loadBalancer.registerNode('validation-1', 'http://localhost:3001');
    loadBalancer.registerNode('validation-2', 'http://localhost:3002');
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

  describe('Optimization Effectiveness', () => {
    it('should validate performance improvements', async () => {
      // Simulate varying load conditions
      for (let i = 0; i < 5; i++) {
        metricsCollector.recordMetric('cpu', 60 + Math.random() * 30);
        metricsCollector.recordMetric('memory', 70 + Math.random() * 20);
        jest.advanceTimersByTime(10000);
      }

      const metrics = await validator.validatePerformance(VALIDATION_DURATION);

      expect(metrics.optimizationEffectiveness.performanceImprovements).toBeGreaterThan(0);
      expect(metrics.optimizationEffectiveness.thresholdAdjustments).toBeGreaterThan(0);
    });
  });

  describe('Resource Efficiency', () => {
    it('should maintain efficient resource utilization', async () => {
      const metrics = await validator.validatePerformance(VALIDATION_DURATION);

      expect(metrics.resourceEfficiency.averageCpuUsage).toBeLessThan(80);
      expect(metrics.resourceEfficiency.averageMemoryUsage).toBeLessThan(80);
      expect(metrics.resourceEfficiency.peakConnections).toBeLessThan(1000);
    });
  });

  describe('Cache Performance', () => {
    it('should validate cache effectiveness', async () => {
      // Pre-populate cache
      await cacheManager.set('validation-key', { data: 'test' }, {
        type: 'response',
        ttl: VALIDATION_DURATION
      });

      const metrics = await validator.validatePerformance(VALIDATION_DURATION);

      expect(metrics.cachePerformance.hitRate).toBeGreaterThan(0.6);
      expect(metrics.cachePerformance.evictionRate).toBeLessThan(0.2);
    });
  });

  describe('Load Distribution', () => {
    it('should maintain balanced load distribution', async () => {
      const metrics = await validator.validatePerformance(VALIDATION_DURATION);

      expect(metrics.loadDistribution.nodeBalance).toBeGreaterThan(0.8);
      expect(metrics.loadDistribution.routingEfficiency).toBe(1);
      expect(metrics.loadDistribution.failoverSuccess).toBe(1);
    });
  });
});
