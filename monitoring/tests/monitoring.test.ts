import { WebSocket } from 'ws';
import { metricsCollector } from '../../__tests__/api/inspections/sections/metrics-collector';
import { analyticsService } from '../services/analytics';
import { performanceOptimizer } from '../services/optimizer';
import { resourceManager } from '../services/resource-manager';
import { cacheManager } from '../services/cache-manager';
import { loadBalancer } from '../services/load-balancer';
import { wss, broadcastMetrics } from '../server';

interface WebSocketMessage {
  type: string;
  timestamp: string;
  data: any;
}

class DashboardTester {
  private ws: WebSocket | null = null;
  private messages: WebSocketMessage[] = [];
  private connected: boolean = false;

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket('ws://localhost:3001');

      this.ws.on('open', () => {
        this.connected = true;
        resolve();
      });

      this.ws.on('message', (data: string) => {
        const message = JSON.parse(data) as WebSocketMessage;
        this.messages.push(message);
      });

      this.ws.on('error', (error) => {
        reject(error);
      });

      this.ws.on('close', () => {
        this.connected = false;
      });
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  clearMessages(): void {
    this.messages = [];
  }

  getMessages(): WebSocketMessage[] {
    return [...this.messages];
  }

  getMessagesByType(type: string): WebSocketMessage[] {
    return this.messages.filter(m => m.type === type);
  }

  isConnected(): boolean {
    return this.connected;
  }
}

describe('System Monitoring Tests', () => {
  let dashboardTester: DashboardTester;

  beforeAll(async () => {
    dashboardTester = new DashboardTester();
    await dashboardTester.connect();

    // Set up test environment
    loadBalancer.registerNode('monitor-1', 'http://localhost:3001');
    loadBalancer.registerNode('monitor-2', 'http://localhost:3002');
  });

  afterAll(() => {
    dashboardTester.disconnect();
    cacheManager.stop();
    loadBalancer.stop();
  });

  beforeEach(() => {
    dashboardTester.clearMessages();
    cacheManager.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Dashboard Functionality', () => {
    it('should receive real-time metric updates', async () => {
      // Simulate metric changes
      metricsCollector.recordMetric('cpu', 75);
      metricsCollector.recordMetric('memory', 80);
      
      // Advance timers to trigger updates
      jest.advanceTimersByTime(1000);

      const messages = dashboardTester.getMessagesByType('resources');
      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0].data).toHaveProperty('cpu');
      expect(messages[0].data).toHaveProperty('memory');
    });

    it('should display analytics data', async () => {
      // Generate some analytics data
      for (let i = 0; i < 5; i++) {
        metricsCollector.recordMetric('cpu', 60 + i * 5);
        jest.advanceTimersByTime(1000);
      }

      const messages = dashboardTester.getMessagesByType('analytics');
      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0].data).toHaveProperty('patterns');
      expect(messages[0].data).toHaveProperty('recommendations');
    });
  });

  describe('Alert System', () => {
    it('should trigger alerts on threshold violations', async () => {
      // Simulate critical CPU usage
      metricsCollector.recordMetric('cpu', 95);
      jest.advanceTimersByTime(1000);

      const messages = dashboardTester.getMessages();
      const alerts = messages.filter(m => 
        m.type === 'resources' && m.data.cpu > 90
      );
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('should track alert history', async () => {
      // Generate multiple alerts
      for (let i = 0; i < 3; i++) {
        metricsCollector.recordMetric('memory', 95);
        jest.advanceTimersByTime(1000);
      }

      const resourceMessages = dashboardTester.getMessagesByType('resources');
      const highMemoryAlerts = resourceMessages.filter(m => 
        m.data.memory > 90
      );
      expect(highMemoryAlerts.length).toBe(3);
    });
  });

  describe('Metric Accuracy', () => {
    it('should accurately reflect system state', async () => {
      const testCpu = 65;
      const testMemory = 75;
      
      metricsCollector.recordMetric('cpu', testCpu);
      metricsCollector.recordMetric('memory', testMemory);
      jest.advanceTimersByTime(1000);

      const messages = dashboardTester.getMessagesByType('resources');
      expect(messages[0].data.cpu).toBe(testCpu);
      expect(messages[0].data.memory).toBe(testMemory);
    });

    it('should maintain metric consistency across components', async () => {
      // Record metrics
      metricsCollector.recordMetric('cpu', 70);
      metricsCollector.recordMetric('memory', 80);
      jest.advanceTimersByTime(1000);

      // Get metrics from different sources
      const dashboardMetrics = dashboardTester.getMessagesByType('resources')[0].data;
      const collectorStats = metricsCollector.getCurrentStats();
      const resourceState = resourceManager.getState();

      // Verify consistency
      expect(dashboardMetrics.cpu).toBe(collectorStats.cpu?.current);
      expect(resourceState.limits.cpu.threshold).toBeGreaterThan(dashboardMetrics.cpu);
    });
  });

  describe('Real-time Updates', () => {
    it('should handle rapid metric changes', async () => {
      // Simulate rapid metric changes
      for (let i = 0; i < 10; i++) {
        metricsCollector.recordMetric('cpu', 50 + Math.random() * 20);
        jest.advanceTimersByTime(100);
      }

      const messages = dashboardTester.getMessagesByType('resources');
      expect(messages.length).toBeGreaterThan(5);
      messages.forEach(m => {
        expect(m.data.cpu).toBeDefined();
        expect(typeof m.data.cpu).toBe('number');
      });
    });

    it('should maintain WebSocket connection stability', async () => {
      // Simulate connection drop
      dashboardTester.disconnect();
      await dashboardTester.connect();

      // Verify reconnection and data flow
      metricsCollector.recordMetric('cpu', 65);
      jest.advanceTimersByTime(1000);

      expect(dashboardTester.isConnected()).toBe(true);
      const messages = dashboardTester.getMessages();
      expect(messages.length).toBeGreaterThan(0);
    });
  });

  describe('Cross-component Monitoring', () => {
    it('should monitor cache performance metrics', async () => {
      // Add cache entries
      await cacheManager.set('test-key', { data: 'test' }, {
        type: 'response',
        ttl: 5000
      });

      // Access cache
      await cacheManager.get('test-key', 'response');
      jest.advanceTimersByTime(1000);

      const messages = dashboardTester.getMessagesByType('performance');
      const cacheMetrics = messages.find(m => m.data.operation === 'cache');
      expect(cacheMetrics).toBeDefined();
      expect(cacheMetrics?.data.mean).toBeGreaterThan(0);
    });

    it('should monitor load balancer health', async () => {
      // Update node metrics
      loadBalancer.updateNodeMetrics('monitor-1', {
        responseTime: 200,
        connections: 100
      });
      jest.advanceTimersByTime(1000);

      const messages = dashboardTester.getMessagesByType('performance');
      const lbMetrics = messages.find(m => m.data.operation === 'load-balancer');
      expect(lbMetrics).toBeDefined();
      expect(lbMetrics?.data.mean).toBeLessThanOrEqual(100);
    });
  });
});
