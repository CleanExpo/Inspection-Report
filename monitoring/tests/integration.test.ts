import { metricsCollector } from '../../__tests__/api/inspections/sections/metrics-collector';
import { analyticsService } from '../services/analytics';
import { performanceOptimizer } from '../services/optimizer';
import { resourceManager } from '../services/resource-manager';
import { cacheManager } from '../services/cache-manager';
import { loadBalancer } from '../services/load-balancer';

describe('Performance Optimization Integration Tests', () => {
  beforeAll(() => {
    // Set up test nodes
    loadBalancer.registerNode('test-node-1', 'http://localhost:3001');
    loadBalancer.registerNode('test-node-2', 'http://localhost:3002');
  });

  afterAll(() => {
    // Cleanup
    cacheManager.stop();
    loadBalancer.stop();
  });

  beforeEach(() => {
    // Reset metrics and caches
    cacheManager.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Optimizer and Resource Manager Integration', () => {
    it('should adjust resource limits based on optimizer profile', async () => {
      // Simulate high CPU usage
      metricsCollector.recordMetric('cpu', 85);
      
      // Run optimization cycle
      await performanceOptimizer.optimize();
      
      // Verify resource manager adjusted limits
      const resourceState = resourceManager.getState();
      expect(resourceState.limits.cpu.threshold).toBeLessThan(85);
    });

    it('should trigger profile change on sustained high load', async () => {
      // Simulate sustained high load
      for (let i = 0; i < 5; i++) {
        metricsCollector.recordMetric('cpu', 90);
        metricsCollector.recordMetric('memory', 85);
        jest.advanceTimersByTime(60000);
      }

      // Run optimization
      await performanceOptimizer.optimize();
      
      // Verify profile changed to conservative
      const optimizerState = performanceOptimizer.getState();
      expect(optimizerState.currentProfile.name).toBe('conservative');
    });
  });

  describe('Cache and Load Balancer Integration', () => {
    it('should update cache settings when load balancer reports high load', async () => {
      // Simulate high traffic on nodes
      loadBalancer.updateNodeMetrics('test-node-1', {
        connections: 800,
        responseTime: 500
      });
      loadBalancer.updateNodeMetrics('test-node-2', {
        connections: 900,
        responseTime: 600
      });

      // Run optimization cycle
      await performanceOptimizer.optimize();

      // Verify cache became more aggressive
      const cacheStats = cacheManager.getStats();
      expect(cacheStats.size).toBeGreaterThan(0);
    });

    it('should adjust routing strategy based on cache performance', async () => {
      // Simulate poor cache performance
      for (let i = 0; i < 100; i++) {
        await cacheManager.get('test-key', 'response');
      }

      // Run optimization cycle
      await performanceOptimizer.optimize();

      // Verify load balancer switched to response time based routing
      const lbStatus = loadBalancer.getStatus();
      expect(lbStatus.strategy).toBe('response-time');
    });
  });

  describe('Analytics Integration', () => {
    it('should detect performance patterns across components', async () => {
      // Simulate various metrics
      metricsCollector.recordMetric('cpu', 75);
      metricsCollector.recordMetric('memory', 80);
      loadBalancer.updateNodeMetrics('test-node-1', {
        responseTime: 400,
        connections: 500
      });

      // Add some cache entries
      await cacheManager.set('test-key', { data: 'test' }, {
        type: 'response',
        ttl: 300000
      });

      // Get analytics
      const analytics = analyticsService.getAnalytics();

      // Verify pattern detection
      expect(analytics.patterns.length).toBeGreaterThan(0);
      expect(analytics.recommendations.length).toBeGreaterThan(0);
    });

    it('should generate accurate recommendations based on all metrics', async () => {
      // Simulate degraded performance scenario
      metricsCollector.recordMetric('cpu', 88);
      metricsCollector.recordMetric('memory', 82);
      loadBalancer.updateNodeMetrics('test-node-1', {
        responseTime: 800,
        connections: 950
      });

      // Run optimization cycle
      await performanceOptimizer.optimize();

      // Get analytics
      const analytics = analyticsService.getAnalytics();

      // Verify recommendations
      const highPriorityRecs = analytics.recommendations.filter(
        r => r.priority === 'high'
      );
      expect(highPriorityRecs.length).toBeGreaterThan(0);
    });
  });

  describe('System-wide Behavior', () => {
    it('should maintain stability under rapid changes', async () => {
      const initialOptimizer = performanceOptimizer.getState();
      
      // Simulate rapid metric changes
      for (let i = 0; i < 10; i++) {
        metricsCollector.recordMetric('cpu', Math.random() * 100);
        metricsCollector.recordMetric('memory', Math.random() * 100);
        loadBalancer.updateNodeMetrics('test-node-1', {
          responseTime: Math.random() * 1000,
          connections: Math.random() * 1000
        });
        jest.advanceTimersByTime(1000);
      }

      // Run optimization
      await performanceOptimizer.optimize();
      
      // Verify system remained stable
      const finalOptimizer = performanceOptimizer.getState();
      expect(finalOptimizer.stabilityScore).toBeGreaterThan(0.7);
    });

    it('should recover from component failures', async () => {
      // Simulate node failure
      loadBalancer.removeNode('test-node-1');
      
      // Verify system adapts
      const lbStatus = loadBalancer.getStatus();
      expect(lbStatus.activeNodes).toBe(1);
      
      // Add node back
      loadBalancer.registerNode('test-node-1', 'http://localhost:3001');
      
      // Verify recovery
      const newStatus = loadBalancer.getStatus();
      expect(newStatus.activeNodes).toBe(2);
    });
  });
});
