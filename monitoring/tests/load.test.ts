import { metricsCollector } from '../../__tests__/api/inspections/sections/metrics-collector';
import { analyticsService } from '../services/analytics';
import { performanceOptimizer } from '../services/optimizer';
import { resourceManager } from '../services/resource-manager';
import { cacheManager } from '../services/cache-manager';
import { loadBalancer } from '../services/load-balancer';

const LOAD_TEST_DURATION = 300000; // 5 minutes
const RAMP_UP_DURATION = 60000;    // 1 minute
const MAX_VIRTUAL_USERS = 1000;
const REQUEST_INTERVAL = 100;      // 100ms between requests

interface TestMetrics {
  responseTime: number[];
  errors: number;
  throughput: number;
  concurrentUsers: number;
}

class LoadGenerator {
  private metrics: TestMetrics = {
    responseTime: [],
    errors: 0,
    throughput: 0,
    concurrentUsers: 0
  };

  private startTime: number = 0;
  private activeRequests: Set<Promise<void>> = new Set();

  async generateLoad(
    duration: number,
    maxUsers: number,
    rampUpTime: number
  ): Promise<TestMetrics> {
    this.startTime = Date.now();
    const endTime = this.startTime + duration;
    
    while (Date.now() < endTime) {
      const elapsedTime = Date.now() - this.startTime;
      const targetUsers = this.calculateTargetUsers(elapsedTime, maxUsers, rampUpTime);
      
      // Adjust current load
      while (this.activeRequests.size < targetUsers) {
        this.spawnUser();
      }

      // Update metrics
      this.metrics.concurrentUsers = this.activeRequests.size;
      this.metrics.throughput = this.calculateThroughput();

      // Wait before next iteration
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Wait for remaining requests to complete
    await Promise.all(Array.from(this.activeRequests));
    
    return this.metrics;
  }

  private calculateTargetUsers(
    elapsedTime: number,
    maxUsers: number,
    rampUpTime: number
  ): number {
    if (elapsedTime >= rampUpTime) {
      return maxUsers;
    }
    return Math.floor((elapsedTime / rampUpTime) * maxUsers);
  }

  private calculateThroughput(): number {
    const elapsedSeconds = (Date.now() - this.startTime) / 1000;
    return this.metrics.responseTime.length / elapsedSeconds;
  }

  private async spawnUser(): Promise<void> {
    const request = this.simulateUserActivity();
    this.activeRequests.add(request);
    await request;
    this.activeRequests.delete(request);
  }

  private async simulateUserActivity(): Promise<void> {
    try {
      const startTime = Date.now();

      // Simulate a series of requests
      await this.simulateRequest();
      
      const endTime = Date.now();
      this.metrics.responseTime.push(endTime - startTime);

    } catch (error) {
      this.metrics.errors++;
    }
  }

  private async simulateRequest(): Promise<void> {
    // Get next node from load balancer
    const node = loadBalancer.getNextNode('/api/test');
    if (!node) {
      throw new Error('No healthy nodes available');
    }

    // Simulate request processing
    await new Promise(resolve => setTimeout(resolve, REQUEST_INTERVAL));

    // Update node metrics
    loadBalancer.updateNodeMetrics(node.id, {
      responseTime: REQUEST_INTERVAL,
      connections: this.activeRequests.size
    });
  }
}

describe('System Load Tests', () => {
  let loadGenerator: LoadGenerator;

  beforeAll(() => {
    loadGenerator = new LoadGenerator();
    
    // Set up test nodes
    loadBalancer.registerNode('load-test-1', 'http://localhost:3001');
    loadBalancer.registerNode('load-test-2', 'http://localhost:3002');
    loadBalancer.registerNode('load-test-3', 'http://localhost:3003');
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

  describe('Load Testing Scenarios', () => {
    it('should handle gradual traffic increase', async () => {
      const metrics = await loadGenerator.generateLoad(
        LOAD_TEST_DURATION,
        MAX_VIRTUAL_USERS,
        RAMP_UP_DURATION
      );

      // Verify system performance
      expect(metrics.errors).toBeLessThan(metrics.responseTime.length * 0.01); // Less than 1% errors
      
      const avgResponseTime = metrics.responseTime.reduce((a, b) => a + b, 0) / metrics.responseTime.length;
      expect(avgResponseTime).toBeLessThan(1000); // Less than 1s average response time
      
      // Verify load balancing
      const lbStatus = loadBalancer.getStatus();
      expect(lbStatus.activeNodes).toBeGreaterThan(1);
    });

    it('should maintain performance under sustained peak load', async () => {
      // Run at peak load immediately
      const metrics = await loadGenerator.generateLoad(
        LOAD_TEST_DURATION,
        MAX_VIRTUAL_USERS,
        0 // No ramp-up
      );

      // Verify system stability
      const optimizerState = performanceOptimizer.getState();
      expect(optimizerState.stabilityScore).toBeGreaterThan(0.6);

      // Check resource utilization
      const resourceState = resourceManager.getState();
      expect(resourceState.limits.cpu.threshold).toBeLessThan(90);
      expect(resourceState.limits.memory.threshold).toBeLessThan(90);
    });

    it('should utilize caching effectively under load', async () => {
      // Pre-populate cache
      await cacheManager.set('test-data', { data: 'cached' }, {
        type: 'response',
        ttl: LOAD_TEST_DURATION
      });

      const metrics = await loadGenerator.generateLoad(
        LOAD_TEST_DURATION / 2, // Shorter duration for cache test
        MAX_VIRTUAL_USERS / 2,  // Lower load for cache test
        RAMP_UP_DURATION / 2
      );

      // Verify cache effectiveness
      const cacheStats = cacheManager.getStats();
      expect(cacheStats.hitRate).toBeGreaterThan(0.7); // At least 70% hit rate
    });

    it('should recover from node failures during load', async () => {
      // Start load test
      const loadPromise = loadGenerator.generateLoad(
        LOAD_TEST_DURATION,
        MAX_VIRTUAL_USERS,
        RAMP_UP_DURATION
      );

      // Simulate node failure mid-test
      setTimeout(() => {
        loadBalancer.removeNode('load-test-2');
      }, LOAD_TEST_DURATION / 2);

      const metrics = await loadPromise;

      // Verify system adapted
      const lbStatus = loadBalancer.getStatus();
      expect(lbStatus.strategy).toBe('least-connections');
      expect(metrics.errors).toBeLessThan(metrics.responseTime.length * 0.05); // Less than 5% errors during failover
    });

    it('should optimize resource usage under varying load', async () => {
      const initialState = resourceManager.getState();

      // Run varying load patterns
      for (let i = 0; i < 3; i++) {
        await loadGenerator.generateLoad(
          LOAD_TEST_DURATION / 3,
          Math.random() * MAX_VIRTUAL_USERS,
          RAMP_UP_DURATION / 3
        );
      }

      const finalState = resourceManager.getState();
      
      // Verify resource limits were adjusted
      expect(finalState.limits).not.toEqual(initialState.limits);
      
      // Check analytics for optimization patterns
      const analytics = analyticsService.getAnalytics();
      expect(analytics.patterns.some(p => p.type === 'improvement')).toBe(true);
    });
  });
});
