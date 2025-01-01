import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import PerformanceDashboard from '@/components/PerformanceDashboard/PerformanceDashboard';
import { performanceMonitor } from '@/utils/monitoring';

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-chart">Chart</div>,
}));

// Mock performance.now
const originalPerformanceNow = performance.now;
beforeAll(() => {
  let time = 0;
  performance.now = jest.fn(() => time++);
});

afterAll(() => {
  performance.now = originalPerformanceNow;
});

describe('PerformanceDashboard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Reset performance monitor
    performanceMonitor['metrics'].clear();
    performanceMonitor['renderTimes'].clear();
    performanceMonitor['errors'] = [];
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders initial dashboard with empty data', () => {
    render(<PerformanceDashboard />);
    
    expect(screen.getByText('Performance Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Cache Performance')).toBeInTheDocument();
    expect(screen.getByText('Rendering Performance')).toBeInTheDocument();
    expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
    expect(screen.getByText('Errors')).toBeInTheDocument();
  });

  it('displays cache statistics', () => {
    // Add some cache metrics
    performanceMonitor.trackMetric('cacheHits', 100);
    performanceMonitor.trackMetric('cacheMisses', 20);

    render(<PerformanceDashboard />);
    
    expect(screen.getByText(/Cache Size:/)).toBeInTheDocument();
    if (performance.memory) {
      expect(screen.getByText(/Memory Usage:/)).toBeInTheDocument();
    }
  });

  it('displays render times', () => {
    // Add some render metrics
    performanceMonitor.trackRender('TestComponent', 50);
    performanceMonitor.trackRender('TestComponent', 100);

    render(<PerformanceDashboard />);
    
    expect(screen.getByText('TestComponent')).toBeInTheDocument();
    expect(screen.getByText(/75(ms|s)/)).toBeInTheDocument(); // Average time
  });

  it('displays error statistics', () => {
    // Add some errors
    performanceMonitor.trackError(new Error('Test Error 1'), 'Context1');
    performanceMonitor.trackError(new Error('Test Error 2'), 'Context1');
    performanceMonitor.trackError(new Error('Test Error 3'), 'Context2');

    render(<PerformanceDashboard />);
    
    expect(screen.getByText('Context1')).toBeInTheDocument();
    expect(screen.getByText('Context2')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Context1 count
    expect(screen.getByText('1')).toBeInTheDocument(); // Context2 count
  });

  it('updates data on time range change', () => {
    // Add metrics at different times
    performanceMonitor.trackMetric('testMetric', 100);
    
    jest.advanceTimersByTime(7200000); // Advance 2 hours
    
    performanceMonitor.trackMetric('testMetric', 200);

    render(<PerformanceDashboard />);
    
    // Change to Last Hour range
    fireEvent.mouseDown(screen.getByLabelText('Time Range'));
    fireEvent.click(screen.getByText('Last Hour'));
    
    // Should only show recent metrics
    const charts = screen.getAllByTestId('mock-chart');
    expect(charts.length).toBeGreaterThan(0);
  });

  it('auto-refreshes data', () => {
    render(<PerformanceDashboard />);
    
    // Add new metric after render
    act(() => {
      performanceMonitor.trackMetric('newMetric', 100);
      jest.advanceTimersByTime(60000); // Advance 1 minute
    });
    
    // Should show new metric after refresh
    expect(screen.getByText('newMetric')).toBeInTheDocument();
  });

  it('handles manual refresh', () => {
    render(<PerformanceDashboard />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    
    // Add new metric
    performanceMonitor.trackMetric('refreshTest', 100);
    
    // Click refresh
    fireEvent.click(refreshButton);
    
    // Should show new metric
    expect(screen.getByText('refreshTest')).toBeInTheDocument();
  });

  it('formats durations correctly', () => {
    // Add metrics with different durations
    performanceMonitor.trackMetric('shortDuration', 50); // 50ms
    performanceMonitor.trackMetric('longDuration', 1500); // 1.5s

    render(<PerformanceDashboard />);
    
    expect(screen.getByText(/50.00ms/)).toBeInTheDocument();
    expect(screen.getByText(/1.50s/)).toBeInTheDocument();
  });

  it('handles empty metrics gracefully', () => {
    render(<PerformanceDashboard />);
    
    // Should show empty states
    expect(screen.getByText(/Cache Size: 0/)).toBeInTheDocument();
    expect(screen.getByText(/Total: 0/)).toBeInTheDocument();
  });

  describe('Chart Rendering', () => {
    it('renders charts for each metric', () => {
      // Add multiple metrics
      performanceMonitor.trackMetric('metric1', 100);
      performanceMonitor.trackMetric('metric2', 200);

      render(<PerformanceDashboard />);
      
      const charts = screen.getAllByTestId('mock-chart');
      expect(charts.length).toBe(2);
    });

    it('updates charts when time range changes', () => {
      performanceMonitor.trackMetric('metric1', 100);
      
      const { rerender } = render(<PerformanceDashboard />);
      
      // Change time range
      fireEvent.mouseDown(screen.getByLabelText('Time Range'));
      fireEvent.click(screen.getByText('Last 24 Hours'));
      
      rerender(<PerformanceDashboard />);
      
      expect(screen.getAllByTestId('mock-chart')).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('handles missing performance.memory', () => {
      const originalMemory = performance.memory;
      // @ts-ignore - Testing undefined case
      delete performance.memory;

      render(<PerformanceDashboard />);
      
      expect(screen.queryByText(/Memory Usage:/)).not.toBeInTheDocument();

      // Restore memory API
      // @ts-ignore - Restoring original value
      performance.memory = originalMemory;
    });

    it('handles component errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Force an error in the component
      performanceMonitor.trackError(new Error('Component Error'), 'TestComponent');
      
      render(<PerformanceDashboard />);
      
      expect(screen.getByText('TestComponent')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });
});
