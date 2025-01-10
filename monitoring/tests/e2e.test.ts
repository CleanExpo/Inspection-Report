import { WebSocket } from 'ws';
import { metricsCollector } from '../../__tests__/api/inspections/sections/metrics-collector';
import { analyticsService } from '../services/analytics';
import { performanceOptimizer } from '../services/optimizer';
import { resourceManager } from '../services/resource-manager';
import { cacheManager } from '../services/cache-manager';
import { loadBalancer } from '../services/load-balancer';
import { wss } from '../server';

class SystemTester {
  private ws: WebSocket | null = null;
  private messageLog: any[] = [];
  private systemState: {
    nodes: Set<string>;
    cacheEntries: Set<string>;
    alerts: string[];
  } = {
    nodes: new Set(),
    cacheEntries: new Set(),
    alerts: []
  };

  async initialize(): Promise<void> {
    // Connect to WebSocket server
    await this.connectWebSocket();

    // Register initial nodes
    this.registerNodes(['e2e-node-1', 'e2e-node-2', 'e2e-node-3']);

    // Clear existing state
    cacheManager.clear();
    this.messageLog = [];
  }

  async cleanup(): Promise<void> {
    // Remove test nodes
    Array.from(this.systemState.nodes).forEach(nodeId => {
      loadBalancer.removeNode(nodeId);
    });

    // Clear cache
    cacheManager.clear();

    // Close WebSocket connection
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket('ws://localhost:3001');
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
      this.ws.on('message', (data: string) => {
        this.messageLog.push(JSON.parse(data));
      });
    });
  }

  private registerNodes(nodeIds: string[]): void {
    nodeIds.forEach((id, index) => {
      loadBalancer.registerNode(id, `http://localhost:${3001 + index}`);
      this.systemState.nodes.add(id);
    });
  }

  async simulateHighLoad(): Promise<void> {
    for (let i = 0; i < 10; i++) {
      metricsCollector.recordMetric('cpu', 80 + Math.random() * 15);
      metricsCollector.recordMetric('memory', 75 + Math.random() * 20);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async simulateNodeFailure(nodeId: string): Promise<void> {
    loadBalancer.removeNode(nodeId);
    this.systemState.nodes.delete(nodeId);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async simulateCacheOperations(): Promise<void> {
    const keys = ['test1', 'test2', 'test3'];
    for (const key of keys) {
      await cacheManager.set(key, { data: key }, {
        type: 'response',
        ttl: 5000
      });
      this.systemState.cacheEntries.add(key);
    }

    // Simulate cache hits and misses
    for (const key of keys) {
      await cacheManager.get(key, 'response');
      await cacheManager.get(`missing-${key}`, 'response');
    }
  }

  getSystemMetrics() {
    return {
      nodes: loadBalancer.getStatus(),
      cache: cacheManager.getStats(),
      resources: resourceManager.getState(),
      optimizer: performanceOptimizer.getState(),
      analytics: analyticsService.getAnalytics()
    };
  }

  getMessageLog() {
    return [...this.messageLog];
  }
}

describe('End-to-End System Tests', () => {
  let systemTester: SystemTester;

  beforeAll(async () => {
    systemTester = new SystemTester();
    await systemTester.initialize();
  });

  afterAll(async () => {
    await systemTester.cleanup();
  });

  describe('Complete System Workflows', () => {
    it('should handle high load scenario with automatic optimization', async () => {
      // Initial state
      const initialMetrics = systemTester.getSystemMetrics();
      
      // Simulate high load
      await systemTester.simulateHighLoad();
      
      // Allow system to optimize
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Final state
      const finalMetrics = systemTester.getSystemMetrics();

      // Verify system adaptation
      expect(finalMetrics.optimizer.currentProfile.name).toBe('conservative');
      expect(finalMetrics.resources.limits.cpu.threshold)
        .toBeLessThan(initialMetrics.resources.limits.cpu.threshold);
    });

    it('should recover from node failures with minimal impact', async () => {
      // Initial state
      const initialNodes = systemTester.getSystemMetrics().nodes.activeNodes;

      // Simulate node failure
      await systemTester.simulateNodeFailure('e2e-node-2');

      // Allow system to adapt
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify system adaptation
      const currentMetrics = systemTester.getSystemMetrics();
      expect(currentMetrics.nodes.activeNodes).toBe(initialNodes - 1);
      expect(currentMetrics.nodes.strategy).toBe('least-connections');
    });

    it('should optimize cache usage under load', async () => {
      // Simulate cache operations
      await systemTester.simulateCacheOperations();

      // Allow system to process
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify cache effectiveness
      const metrics = systemTester.getSystemMetrics();
      expect(metrics.cache.hitRate).toBeGreaterThan(0.5);
      expect(metrics.analytics.patterns.some(p => 
        p.type === 'improvement'
      )).toBe(true);
    });
  });

  describe('Error Handling Scenarios', () => {
    it('should handle multiple concurrent failures gracefully', async () => {
      // Simulate multiple issues
      await Promise.all([
        systemTester.simulateHighLoad(),
        systemTester.simulateNodeFailure('e2e-node-1'),
        systemTester.simulateCacheOperations()
      ]);

      // Allow system to stabilize
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify system stability
      const metrics = systemTester.getSystemMetrics();
      expect(metrics.optimizer.stabilityScore).toBeGreaterThan(0.5);
      expect(metrics.nodes.activeNodes).toBeGreaterThan(0);
    });
  });

  describe('Recovery Procedures', () => {
    it('should restore optimal performance after stress', async () => {
      // Create stress conditions
      await systemTester.simulateHighLoad();
      
      // Allow system to optimize
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verify recovery
      const metrics = systemTester.getSystemMetrics();
      expect(metrics.optimizer.performanceScore).toBeGreaterThan(0.7);
      expect(metrics.resources.limits.cpu.threshold).toBeLessThan(90);
    });
  });

  describe('Performance Boundaries', () => {
    it('should maintain stability at performance limits', async () => {
      // Push system to limits
      await Promise.all([
        systemTester.simulateHighLoad(),
        systemTester.simulateCacheOperations()
      ]);

      // Allow system to adapt
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify system remains within bounds
      const metrics = systemTester.getSystemMetrics();
      expect(metrics.resources.limits.memory.threshold).toBeLessThan(95);
      expect(metrics.cache.hitRate).toBeGreaterThan(0);
      expect(metrics.nodes.strategy).toBe('least-connections');
    });
  });

  describe('System Integration', () => {
    it('should maintain metric consistency across components', async () => {
      // Generate system activity
      await systemTester.simulateHighLoad();
      await systemTester.simulateCacheOperations();

      // Allow metrics to propagate
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify metric consistency
      const metrics = systemTester.getSystemMetrics();
      const messages = systemTester.getMessageLog();

      // Check dashboard updates
      const resourceMessages = messages.filter(m => m.type === 'resources');
      expect(resourceMessages.length).toBeGreaterThan(0);

      // Verify metric alignment
      const lastMessage = resourceMessages[resourceMessages.length - 1];
      expect(lastMessage.data.cpu).toBeDefined();
      expect(lastMessage.data.memory).toBeDefined();
    });
  });
});
