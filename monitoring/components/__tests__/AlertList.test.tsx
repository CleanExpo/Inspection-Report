import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AlertList, type AlertListProps } from '../AlertList';

describe('AlertList', () => {
  const defaultProps: AlertListProps = {
    url: 'ws://localhost:8080',
    severityFilter: ['warning', 'error', 'critical'],
    maxAlerts: 10
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

  it('shows empty state message when no alerts', () => {
    render(<AlertList {...defaultProps} />);
    expect(screen.getByText('No alerts to display')).toBeInTheDocument();
  });

  it('displays alert when receiving websocket message', () => {
    render(<AlertList {...defaultProps} />);

    const alert = {
      id: '1',
      message: 'Test Alert',
      severity: 'warning' as const,
      timestamp: new Date().toISOString()
    };

    act(() => {
      mockWs.onmessage?.(new MessageEvent('message', {
        data: JSON.stringify(alert)
      }));
    });

    expect(screen.getByText('Test Alert')).toBeInTheDocument();
  });

  it('shows error message on websocket error', () => {
    render(<AlertList {...defaultProps} />);

    act(() => {
      mockWs.onerror?.(new Event('error'));
    });

    expect(screen.getByText('Failed to connect to alert stream')).toBeInTheDocument();
  });

  it('shows error message on parse error', () => {
    render(<AlertList {...defaultProps} />);

    act(() => {
      mockWs.onmessage?.(new MessageEvent('message', {
        data: 'invalid json'
      }));
    });

    expect(screen.getByText('Failed to parse alert data')).toBeInTheDocument();
  });

  it('filters alerts based on severity', () => {
    render(<AlertList {...defaultProps} severityFilter={['critical']} />);

    const warningAlert = {
      id: '1',
      message: 'Warning Alert',
      severity: 'warning' as const,
      timestamp: new Date().toISOString()
    };

    const criticalAlert = {
      id: '2',
      message: 'Critical Alert',
      severity: 'critical' as const,
      timestamp: new Date().toISOString()
    };

    act(() => {
      mockWs.onmessage?.(new MessageEvent('message', {
        data: JSON.stringify(warningAlert)
      }));
      mockWs.onmessage?.(new MessageEvent('message', {
        data: JSON.stringify(criticalAlert)
      }));
    });

    expect(screen.queryByText('Warning Alert')).not.toBeInTheDocument();
    expect(screen.getByText('Critical Alert')).toBeInTheDocument();
  });

  it('limits number of alerts displayed', () => {
    render(<AlertList {...defaultProps} maxAlerts={2} />);

    const alerts = [
      {
        id: '1',
        message: 'First Alert',
        severity: 'warning' as const,
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        message: 'Second Alert',
        severity: 'error' as const,
        timestamp: new Date().toISOString()
      },
      {
        id: '3',
        message: 'Third Alert',
        severity: 'critical' as const,
        timestamp: new Date().toISOString()
      }
    ];

    act(() => {
      alerts.forEach(alert => {
        mockWs.onmessage?.(new MessageEvent('message', {
          data: JSON.stringify(alert)
        }));
      });
    });

    expect(screen.queryByText('First Alert')).not.toBeInTheDocument();
    expect(screen.getByText('Second Alert')).toBeInTheDocument();
    expect(screen.getByText('Third Alert')).toBeInTheDocument();
  });

  it('calls onError callback on websocket error', () => {
    const onError = jest.fn();
    render(<AlertList {...defaultProps} onError={onError} />);

    act(() => {
      mockWs.onerror?.(new Event('error'));
    });

    expect(onError).toHaveBeenCalledWith('Failed to connect to alert stream');
  });

  it('closes websocket on unmount', () => {
    const { unmount } = render(<AlertList {...defaultProps} />);
    unmount();
    expect(mockWs.close).toHaveBeenCalled();
  });
});
