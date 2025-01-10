import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MetricChart } from '../MetricChart';

describe('MetricChart', () => {
  const defaultProps = {
    url: 'ws://localhost:8080',
    metricName: 'test_metric',
    title: 'Test Metric',
    unit: 'units',
    maxDataPoints: 50
  };

  let mockWs: WebSocket;

  beforeEach(() => {
    mockWs = new WebSocket('');
    jest.spyOn(global, 'WebSocket').mockImplementation(() => mockWs);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders the title', () => {
    render(<MetricChart {...defaultProps} />);
    expect(screen.getByText('Test Metric')).toBeInTheDocument();
  });

  it('shows initial value with unit', () => {
    render(<MetricChart {...defaultProps} />);
    expect(screen.getByText('0 units')).toBeInTheDocument();
  });

  it('updates value when receiving websocket message', () => {
    render(<MetricChart {...defaultProps} />);

    act(() => {
      if (mockWs.onmessage) {
        mockWs.onmessage(new MessageEvent('message', {
          data: JSON.stringify({
            type: 'test_metric',
            value: 42
          })
        }));
      }
    });

    expect(screen.getByText('42.00 units')).toBeInTheDocument();
  });

  it('shows error message on websocket error', () => {
    render(<MetricChart {...defaultProps} />);

    act(() => {
      if (mockWs.onerror) {
        mockWs.onerror(new Event('error'));
      }
    });

    expect(screen.getByText('Failed to connect to metric stream')).toBeInTheDocument();
  });

  it('shows error message on parse error', () => {
    render(<MetricChart {...defaultProps} />);

    act(() => {
      if (mockWs.onmessage) {
        mockWs.onmessage(new MessageEvent('message', {
          data: 'invalid json'
        }));
      }
    });

    expect(screen.getByText('Failed to parse metric data')).toBeInTheDocument();
  });

  it('calls onError callback on websocket error', () => {
    const onError = jest.fn();
    render(<MetricChart {...defaultProps} onError={onError} />);

    act(() => {
      if (mockWs.onerror) {
        mockWs.onerror(new Event('error'));
      }
    });

    expect(onError).toHaveBeenCalledWith('Failed to connect to metric stream');
  });

  it('calls onError callback on parse error', () => {
    const onError = jest.fn();
    render(<MetricChart {...defaultProps} onError={onError} />);

    act(() => {
      if (mockWs.onmessage) {
        mockWs.onmessage(new MessageEvent('message', {
          data: 'invalid json'
        }));
      }
    });

    expect(onError).toHaveBeenCalledWith('Failed to parse metric data');
  });

  it('limits data points to maxDataPoints', () => {
    render(<MetricChart {...defaultProps} maxDataPoints={2} />);

    // Add three data points
    act(() => {
      if (mockWs.onmessage) {
        mockWs.onmessage(new MessageEvent('message', {
          data: JSON.stringify({ type: 'test_metric', value: 1 })
        }));
        mockWs.onmessage(new MessageEvent('message', {
          data: JSON.stringify({ type: 'test_metric', value: 2 })
        }));
        mockWs.onmessage(new MessageEvent('message', {
          data: JSON.stringify({ type: 'test_metric', value: 3 })
        }));
      }
    });

    // Should show the latest value
    expect(screen.getByText('3.00 units')).toBeInTheDocument();
  });

  it('closes websocket on unmount', () => {
    const { unmount } = render(<MetricChart {...defaultProps} />);
    unmount();
    expect(mockWs.close).toHaveBeenCalled();
  });
});
