import * as React from 'react';

export interface Alert {
  id: string;
  message: string;
  severity: 'warning' | 'error' | 'critical';
  timestamp: string;
}

export interface AlertListProps {
  url: string;
  severityFilter: Array<'warning' | 'error' | 'critical'>;
  maxAlerts: number;
  onError?: (error: string) => void;
}

export function AlertList({ url, severityFilter, maxAlerts, onError }: AlertListProps) {
  const [alerts, setAlerts] = React.useState<Alert[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onmessage = (event) => {
      try {
        const alert: Alert = JSON.parse(event.data);
        if (severityFilter.includes(alert.severity)) {
          setAlerts(prev => {
            const newAlerts = [alert, ...prev];
            return newAlerts.slice(0, maxAlerts);
          });
        }
      } catch (err) {
        const errorMessage = 'Failed to parse alert data';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    };

    ws.onerror = () => {
      const errorMessage = 'Failed to connect to alert stream';
      setError(errorMessage);
      onError?.(errorMessage);
    };

    return () => {
      ws.close();
    };
  }, [url, severityFilter, maxAlerts, onError]);

  if (error) {
    return (
      <div className="text-red-600 font-medium">
        {error}
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        No alerts to display
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg ${
            alert.severity === 'critical'
              ? 'bg-red-50 text-red-700'
              : alert.severity === 'error'
              ? 'bg-orange-50 text-orange-700'
              : 'bg-yellow-50 text-yellow-700'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm font-medium">{alert.message}</p>
              <p className="text-xs mt-1 opacity-75">
                {new Date(alert.timestamp).toLocaleString()}
              </p>
            </div>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                alert.severity === 'critical'
                  ? 'bg-red-100 text-red-800'
                  : alert.severity === 'error'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {alert.severity}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
