import React from 'react';
import { DashboardLayout } from '../components';
import type { DashboardLayoutProps } from '../components/DashboardLayout';

type MetricConfig = DashboardLayoutProps['metrics'][number];

const DEFAULT_METRICS: MetricConfig[] = [
  {
    name: 'cpu_usage',
    title: 'CPU Usage',
    unit: '%'
  },
  {
    name: 'memory_usage',
    title: 'Memory Usage',
    unit: 'MB'
  },
  {
    name: 'disk_usage',
    title: 'Disk Usage',
    unit: 'GB'
  },
  {
    name: 'network_usage',
    title: 'Network Usage',
    unit: 'Mbps'
  }
];

const DEFAULT_ALERT_SEVERITY_FILTER: DashboardLayoutProps['alertSeverityFilter'] = [
  'warning',
  'error',
  'critical'
];

const DEFAULT_MAX_ALERTS = 10;
const DEFAULT_REFRESH_INTERVAL = 5000;
const DEFAULT_MAX_DATA_POINTS = 50;

export default function DashboardPage() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    console.error('Dashboard error:', error);
    setError(error);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error.message}</p>
          <button
            onClick={() => setError(null)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      websocketUrl={process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080'}
      metrics={DEFAULT_METRICS}
      alertSeverityFilter={DEFAULT_ALERT_SEVERITY_FILTER}
      maxAlerts={DEFAULT_MAX_ALERTS}
      refreshInterval={DEFAULT_REFRESH_INTERVAL}
      maxDataPoints={DEFAULT_MAX_DATA_POINTS}
      onError={handleError}
    >
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
        <p className="text-gray-600">
          This dashboard displays real-time system metrics and alerts. The metrics are updated every{' '}
          {DEFAULT_REFRESH_INTERVAL / 1000} seconds, and the alerts panel shows the{' '}
          {DEFAULT_MAX_ALERTS} most recent alerts.
        </p>
      </div>
    </DashboardLayout>
  );
}
