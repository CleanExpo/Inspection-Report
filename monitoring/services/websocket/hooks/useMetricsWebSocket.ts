import { useState, useCallback, useEffect } from 'react';
import { useWebSocketClient, useWebSocketEvent } from './useWebSocketClient';
import type { WebSocketMessage } from '../types';

export interface MetricData {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface AlertData {
  id: string;
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: number;
  metadata?: Record<string, any>;
  source?: string;
  metric?: MetricData;
  threshold?: number;
  value?: number;
  tags?: Record<string, string>;
}

export interface UseMetricsWebSocketOptions {
  url: string;
  metricNames?: string[];
  alertSeverities?: Array<AlertData['severity']>;
  tags?: Record<string, string>;
  onError?: (error: Error) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  autoReconnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  bufferSize?: number;
}

export interface UseMetricsWebSocketResult {
  metrics: MetricData[];
  alerts: AlertData[];
  isConnected: boolean;
  connecting: boolean;
  error: Error | null;
  clearMetrics: () => void;
  clearAlerts: () => void;
  subscribeToMetrics: (metricNames: string[]) => void;
  unsubscribeFromMetrics: () => void;
  subscribeToAlerts: (severities: Array<AlertData['severity']>) => void;
  unsubscribeFromAlerts: () => void;
}

export function useMetricsWebSocket({
  url,
  metricNames,
  alertSeverities = ['info', 'warning', 'error', 'critical'],
  tags,
  onError,
  onConnected,
  onDisconnected,
  autoReconnect = true,
  reconnectAttempts = 5,
  reconnectDelay = 1000,
  bufferSize = 100
}: UseMetricsWebSocketOptions): UseMetricsWebSocketResult {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);

  const {
    connected: isConnected,
    connecting,
    error,
    subscribe,
    unsubscribe
  } = useWebSocketClient({
    url,
    subscription: {
      events: ['metric', 'alert'],
      filters: {
        metricNames,
        alertSeverities,
        tags
      }
    },
    onError,
    onConnected,
    onDisconnected,
    autoReconnect,
    reconnectAttempts,
    reconnectDelay
  });

  // Handle incoming metrics
  const handleMetric = useCallback((metric: MetricData) => {
    setMetrics(prev => {
      const updated = [...prev, metric];
      // Keep only the most recent metrics based on bufferSize
      return updated.slice(-bufferSize);
    });
  }, [bufferSize]);

  // Handle incoming alerts
  const handleAlert = useCallback((data: AlertData) => {
    setAlerts(prev => {
      const updated = [...prev, {
        ...data,
        type: data.type || 'system',
        metadata: data.metadata || {}
      }];
      // Keep only the most recent alerts based on bufferSize
      return updated.slice(-bufferSize);
    });
  }, [bufferSize]);

  // Subscribe to events
  useWebSocketEvent(isConnected ? { on: subscribe } as any : null, 'metric', handleMetric);
  useWebSocketEvent(isConnected ? { on: subscribe } as any : null, 'alert', handleAlert);

  // Clear metrics
  const clearMetrics = useCallback(() => {
    setMetrics([]);
  }, []);

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Subscribe to metrics
  const subscribeToMetrics = useCallback((names: string[]) => {
    if (isConnected) {
      subscribe({
        events: ['metric'],
        filters: {
          metricNames: names,
          tags
        }
      });
    }
  }, [isConnected, subscribe, tags]);

  // Unsubscribe from metrics
  const unsubscribeFromMetrics = useCallback(() => {
    if (isConnected) {
      unsubscribe();
    }
  }, [isConnected, unsubscribe]);

  // Subscribe to alerts
  const subscribeToAlerts = useCallback((severities: Array<AlertData['severity']>) => {
    if (isConnected) {
      subscribe({
        events: ['alert'],
        filters: {
          alertSeverities: severities,
          tags
        }
      });
    }
  }, [isConnected, subscribe, tags]);

  // Unsubscribe from alerts
  const unsubscribeFromAlerts = useCallback(() => {
    if (isConnected) {
      unsubscribe();
    }
  }, [isConnected, unsubscribe]);

  return {
    metrics,
    alerts,
    isConnected,
    connecting,
    error,
    clearMetrics,
    clearAlerts,
    subscribeToMetrics,
    unsubscribeFromMetrics,
    subscribeToAlerts,
    unsubscribeFromAlerts
  };
}

// Example usage:
/*
function MetricsDisplay() {
  const {
    metrics,
    alerts,
    isConnected,
    connecting,
    error,
    clearMetrics,
    clearAlerts,
    subscribeToMetrics,
    unsubscribeFromMetrics
  } = useMetricsWebSocket({
    url: 'ws://localhost:3002/monitoring',
    metricNames: ['cpu_usage', 'memory_usage'],
    alertSeverities: ['warning', 'error', 'critical'],
    tags: { environment: 'production' },
    bufferSize: 50, // Keep last 50 metrics/alerts
    onError: (error) => {
      console.error('Metrics WebSocket error:', error);
    }
  });

  useEffect(() => {
    if (isConnected) {
      subscribeToMetrics(['cpu_usage', 'memory_usage']);
      return () => unsubscribeFromMetrics();
    }
  }, [isConnected]);

  if (connecting) return <div>Connecting to metrics stream...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!isConnected) return <div>Disconnected from metrics stream</div>;

  return (
    <div>
      <h2>System Metrics</h2>
      <button onClick={clearMetrics}>Clear Metrics History</button>
      <button onClick={clearAlerts}>Clear Alerts History</button>
      <div>
        <h3>Metrics</h3>
        {metrics.map((metric, index) => (
          <div key={index}>
            {metric.name}: {metric.value} ({new Date(metric.timestamp).toLocaleTimeString()})
          </div>
        ))}
      </div>
      <div>
        <h3>Alerts</h3>
        {alerts.map((alert, index) => (
          <div key={index} className={`alert-${alert.severity}`}>
            {alert.message} ({new Date(alert.timestamp).toLocaleTimeString()})
          </div>
        ))}
      </div>
    </div>
  );
}
*/
