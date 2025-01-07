import { MetricsCollector } from './metrics-collector';
import { metricsConfig } from './metrics-config';
import fs from 'fs';
import path from 'path';

describe('MetricsCollector', () => {
  let collector: MetricsCollector;
  const testMetricsFile = path.join(__dirname, 'test-metrics.json');
  const testEventsFile = path.join(__dirname, 'test-events.json');

  beforeEach(() => {
    // Clean up test files
    if (fs.existsSync(testMetricsFile)) {
      fs.unlinkSync(testMetricsFile);
    }
    if (fs.existsSync(testEventsFile)) {
      fs.unlinkSync(testEventsFile);
    }
    collector = new MetricsCollector(testMetricsFile);
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testMetricsFile)) {
      fs.unlinkSync(testMetricsFile);
    }
    if (fs.existsSync(testEventsFile)) {
      fs.unlinkSync(testEventsFile);
    }
  });

  describe('Metric Recording', () => {
    it('should record and maintain metrics history', () => {
      // Record more than an hour of metrics (3600 samples)
      for (let i = 0; i < 4000; i++) {
        collector.recordMetric('memory', i);
      }

      const stats = collector.getCurrentStats();
      expect(stats.memory).toBeTruthy();
      expect(stats.memory?.current).toBe(3999);
      // Should only keep last hour (3600 samples)
      expect(stats.memory?.mean).toBeGreaterThan(2199); // Average of last 3600 samples
    });

    it('should calculate correct statistics', () => {
      // Record known values
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      values.forEach(v => collector.recordMetric('cpu', v));

      const stats = collector.getCurrentStats();
      expect(stats.cpu).toEqual({
        current: 10,
        mean: 5.5,
        p95: 10,
        max: 10
      });
    });
  });

  describe('Benchmark Recording', () => {
    it('should record and analyze benchmark results', () => {
      const benchmark = {
        operation: 'GET_sections',
        samples: 100,
        mean: 50,
        median: 45,
        p95: 75,
        p99: 90,
        min: 30,
        max: 100,
        stdDev: 15,
        timestamp: new Date().toISOString()
      };

      collector.recordBenchmark(benchmark);

      const results = JSON.parse(fs.readFileSync(testMetricsFile, 'utf8'));
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(benchmark);
    });

    it('should maintain benchmark history within time window', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);

      const oldBenchmark = {
        operation: 'GET_sections',
        samples: 100,
        mean: 50,
        median: 45,
        p95: 75,
        p99: 90,
        min: 30,
        max: 100,
        stdDev: 15,
        timestamp: oldDate.toISOString()
      };

      const newBenchmark = {
        ...oldBenchmark,
        timestamp: new Date().toISOString()
      };

      collector.recordBenchmark(oldBenchmark);
      collector.recordBenchmark(newBenchmark);

      const results = JSON.parse(fs.readFileSync(testMetricsFile, 'utf8'));
      expect(results).toHaveLength(1);
      expect(results[0].timestamp).toBe(newBenchmark.timestamp);
    });
  });

  describe('Health Checking', () => {
    it('should report healthy status when metrics are within limits', () => {
      collector.recordMetric('memory', metricsConfig.resources.memory.warning - 100);
      collector.recordMetric('cpu', metricsConfig.resources.cpu.warning - 10);
      collector.recordMetric('connections', metricsConfig.resources.connections.warning - 100);

      const health = collector.checkHealth();
      expect(health.healthy).toBe(true);
      expect(health.status).toBe('healthy');
      expect(health.issues).toHaveLength(0);
    });

    it('should report warning status when metrics exceed warning thresholds', () => {
      collector.recordMetric('memory', metricsConfig.resources.memory.warning + 100);
      collector.recordMetric('cpu', metricsConfig.resources.cpu.warning + 10);
      collector.recordMetric('connections', metricsConfig.resources.connections.warning - 100);

      const health = collector.checkHealth();
      expect(health.healthy).toBe(false);
      expect(health.status).toBe('warning');
      expect(health.issues.length).toBeGreaterThan(0);
    });

    it('should report critical status when metrics exceed critical thresholds', () => {
      collector.recordMetric('memory', metricsConfig.resources.memory.critical + 100);
      collector.recordMetric('cpu', metricsConfig.resources.cpu.critical + 10);
      collector.recordMetric('connections', metricsConfig.resources.connections.critical + 100);

      const health = collector.checkHealth();
      expect(health.healthy).toBe(false);
      expect(health.status).toBe('critical');
      expect(health.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Load Test Parameters', () => {
    it('should calculate appropriate load test parameters', () => {
      // Record some connection metrics
      for (let i = 0; i < 100; i++) {
        collector.recordMetric('connections', i);
      }

      const params = collector.getLoadTestParameters();
      expect(params.concurrency).toBeLessThanOrEqual(metricsConfig.load.maxConcurrency);
      expect(params.concurrency).toBeGreaterThanOrEqual(metricsConfig.load.baselineConcurrency);
      expect(params.duration).toBe(metricsConfig.load.sustainedDuration);
      expect(params.rampUp).toHaveLength(metricsConfig.load.rampUpSteps);
    });

    it('should respect maximum concurrency limits', () => {
      // Record high connection counts
      for (let i = 0; i < 1000; i++) {
        collector.recordMetric('connections', i);
      }

      const params = collector.getLoadTestParameters();
      expect(params.concurrency).toBe(metricsConfig.load.maxConcurrency);
    });
  });

  describe('Failure Handling', () => {
    it('should track consecutive failures', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Record failures up to threshold
      for (let i = 0; i < metricsConfig.alerts.consecutiveFailures; i++) {
        collector.recordFailure();
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Multiple consecutive failures detected')
      );

      consoleSpy.mockRestore();
    });

    it('should reset failure count on success', () => {
      // Record some failures
      for (let i = 0; i < metricsConfig.alerts.consecutiveFailures - 1; i++) {
        collector.recordFailure();
      }

      collector.recordSuccess();
      collector.recordFailure(); // This single failure shouldn't trigger alert

      const events = fs.existsSync(testEventsFile)
        ? JSON.parse(fs.readFileSync(testEventsFile, 'utf8'))
        : [];

      const alerts = events.filter((e: any) => e.type === 'alert');
      expect(alerts).toHaveLength(0);
    });
  });
});
