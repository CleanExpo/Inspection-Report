import * as React from 'react';
import { MetricChart } from './MetricChart';
import { AlertList } from './AlertList';

export interface MetricConfig {
  name: string;
  title: string;
  unit: string;
}

export interface DashboardLayoutProps {
  websocketUrl: string;
  metrics: MetricConfig[];
  alertSeverityFilter: Array<'warning' | 'error' | 'critical'>;
  maxAlerts: number;
  refreshInterval: number;
  maxDataPoints: number;
  onError?: (error: Error) => void;
  children?: any;
}

export function DashboardLayout({
  websocketUrl,
  metrics,
  alertSeverityFilter,
  maxAlerts,
  maxDataPoints,
  onError,
  children
}: DashboardLayoutProps) {
  const renderChildren = React.useMemo(() => {
    if (!children) return null;
    return <div className="mt-6">{children}</div>;
  }, [children]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Metrics */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {metrics.map((metric) => (
                <MetricChart
                  key={metric.name}
                  url={websocketUrl}
                  metricName={metric.name}
                  title={metric.title}
                  unit={metric.unit}
                  maxDataPoints={maxDataPoints}
                  onError={(error) => onError?.(new Error(error))}
                />
              ))}
            </div>
            {/* Additional Content */}
            {renderChildren}
          </div>

          {/* Alerts Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">System Alerts</h2>
              </div>
              <div className="p-4">
                <AlertList
                  url={websocketUrl}
                  severityFilter={alertSeverityFilter}
                  maxAlerts={maxAlerts}
                  onError={(error) => onError?.(new Error(error))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

DashboardLayout.displayName = 'DashboardLayout';
