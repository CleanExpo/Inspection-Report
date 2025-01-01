import { performanceMonitor, usePerformanceTracking, measureExecutionTime } from '@/utils/monitoring';
import { renderHook } from '@testing-library/react';

describe('Performance Monitoring', () => {
  beforeEach(() => {
    // Reset performance monitor before each test
    jest.useFakeTimers();
    performanceMonitor['metrics'].clear();
    performanceMonitor['renderTimes'].clear();
    performanceMonitor['errors'] = [];
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Metric Tracking', () => {
    it('tracks metrics with context', () => {
      performanceMonitor.trackMetric('testMetric', 100, 'testContext');
      
      const metrics = performanceMonitor.getMetrics('testMetric');
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        value: 100,
        context: 'testContext',
      });
    });

    it('maintains history limit', () => {
      // Add more than MAX_HISTORY metrics
      for (let i = 0; i < 1100; i++) {
        performanceMonitor.trackMetric('testMetric', i);
      }

      const metrics = performanceMonitor.getMetrics('testMetric');
      expect(metrics).toHaveLength(1000); // MAX_HISTORY
      expect(metrics[0].value).toBe(100); // First item should be 100th entry
    });

    it('filters metrics by duration', () => {
      performanceMonitor.trackMetric('testMetric', 1);
      
      jest.advanceTimersByTime(2000); // Advance 2 seconds
      
      performanceMonitor.trackMetric('testMetric', 2);
      
      const recentMetrics = performanceMonitor.getMetrics('testMetric', 1000); // Last 1 second
      expect(recentMetrics).toHaveLength(1);
      expect(recentMetrics[0].value).toBe(2);
    });
  });

  describe('Render Tracking', () => {
    it('tracks component render times', () => {
      performanceMonitor.trackRender('TestComponent', 50);
      
      const renders = performanceMonitor.getRenderMetrics('TestComponent');
      expect(renders).toHaveLength(1);
      expect(renders[0]).toMatchObject({
        component: 'TestComponent',
        duration: 50,
      });
    });

    it('calculates average render times in performance report', () => {
      performanceMonitor.trackRender('TestComponent', 50);
      performanceMonitor.trackRender('TestComponent', 100);
      
      const report = performanceMonitor.getPerformanceReport();
      expect(report.rendering.averageTimes).toHaveProperty('TestComponent');
      expect(report.rendering.totalRenders).toBe(2);
    });
  });

  describe('Error Tracking', () => {
    it('tracks errors with context', () => {
      const error = new Error('Test error');
      performanceMonitor.trackError(error, 'TestContext');
      
      const errors = performanceMonitor.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        message: 'Test error',
        context: 'TestContext',
      });
    });

    it('includes error counts in performance report', () => {
      performanceMonitor.trackError(new Error('Error 1'), 'Context1');
      performanceMonitor.trackError(new Error('Error 2'), 'Context1');
      performanceMonitor.trackError(new Error('Error 3'), 'Context2');
      
      const report = performanceMonitor.getPerformanceReport();
      expect(report.errors.total).toBe(3);
      expect(report.errors.byContext).toEqual({
        Context1: 2,
        Context2: 1,
      });
    });
  });

  describe('Data Cleanup', () => {
    it('clears old data', () => {
      performanceMonitor.trackMetric('testMetric', 1);
      performanceMonitor.trackRender('TestComponent', 50);
      performanceMonitor.trackError(new Error('Test error'), 'TestContext');
      
      jest.advanceTimersByTime(25 * 60 * 60 * 1000); // Advance 25 hours
      
      performanceMonitor.clearOldData(24 * 60 * 60 * 1000); // 24 hours
      
      expect(performanceMonitor.getMetrics('testMetric')).toHaveLength(0);
      expect(performanceMonitor.getRenderMetrics('TestComponent')).toHaveLength(0);
      expect(performanceMonitor.getErrors()).toHaveLength(0);
    });
  });

  describe('usePerformanceTracking Hook', () => {
    it('provides tracking methods', () => {
      const { result } = renderHook(() => usePerformanceTracking('TestComponent'));
      
      expect(result.current).toHaveProperty('trackRender');
      expect(result.current).toHaveProperty('trackError');
      expect(result.current).toHaveProperty('trackMetric');
    });

    it('tracks metrics with component context', () => {
      const { result } = renderHook(() => usePerformanceTracking('TestComponent'));
      
      result.current.trackMetric('testMetric', 100);
      
      const metrics = performanceMonitor.getMetrics('testMetric');
      expect(metrics[0]).toMatchObject({
        value: 100,
        context: 'TestComponent',
      });
    });
  });

  describe('measureExecutionTime', () => {
    beforeEach(() => {
      jest.spyOn(performance, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(100);
    });

    it('measures synchronous operation time', async () => {
      const result = await measureExecutionTime(
        () => 'test result',
        'TestOperation'
      );

      expect(result).toBe('test result');
      const metrics = performanceMonitor.getMetrics('executionTime');
      expect(metrics[0]).toMatchObject({
        value: 100,
        context: 'TestOperation',
      });
    });

    it('measures asynchronous operation time', async () => {
      const result = await measureExecutionTime(
        async () => {
          await new Promise(resolve => setTimeout(resolve, 0));
          return 'test result';
        },
        'TestAsyncOperation'
      );

      expect(result).toBe('test result');
      const metrics = performanceMonitor.getMetrics('executionTime');
      expect(metrics[0]).toMatchObject({
        value: 100,
        context: 'TestAsyncOperation',
      });
    });

    it('handles errors and tracks them', async () => {
      const error = new Error('Test error');
      await expect(measureExecutionTime(
        () => { throw error; },
        'TestErrorOperation'
      )).rejects.toThrow('Test error');

      const errors = performanceMonitor.getErrors();
      expect(errors[0]).toMatchObject({
        message: 'Test error',
        context: 'TestErrorOperation',
      });
    });
  });

  describe('Performance Report', () => {
    it('generates comprehensive report', () => {
      // Add various metrics
      performanceMonitor.trackMetric('metric1', 100);
      performanceMonitor.trackMetric('metric1', 200);
      performanceMonitor.trackRender('Component1', 50);
      performanceMonitor.trackError(new Error('Error1'), 'Context1');

      const report = performanceMonitor.getPerformanceReport();

      expect(report).toMatchObject({
        timestamp: expect.any(String),
        duration: expect.any(Number),
        cache: expect.any(Object),
        rendering: expect.any(Object),
        errors: expect.any(Object),
        metrics: expect.any(Object),
      });

      expect(report.metrics.metric1).toMatchObject({
        average: 150,
        min: 100,
        max: 200,
        count: 2,
      });
    });

    it('filters data by duration in report', () => {
      performanceMonitor.trackMetric('metric1', 100);
      
      jest.advanceTimersByTime(2000); // Advance 2 seconds
      
      performanceMonitor.trackMetric('metric1', 200);
      
      const report = performanceMonitor.getPerformanceReport(1000); // Last 1 second
      expect(report.metrics.metric1).toMatchObject({
        average: 200,
        min: 200,
        max: 200,
        count: 1,
      });
    });
  });
});
