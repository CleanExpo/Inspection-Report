import * as React from 'react';

export interface MetricChartProps {
  url: string;
  metricName: string;
  title: string;
  unit: string;
  maxDataPoints: number;
  onError?: (error: string) => void;
}

export function MetricChart({ 
  url, 
  metricName, 
  title, 
  unit, 
  maxDataPoints,
  onError 
}: MetricChartProps) {
  const [data, setData] = React.useState<number[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const ws = new WebSocket(url);
    const dataPoints: number[] = [];

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === metricName) {
          dataPoints.push(message.value);
          if (dataPoints.length > maxDataPoints) {
            dataPoints.shift();
          }
          setData([...dataPoints]);
        }
      } catch (err) {
        const errorMessage = 'Failed to parse metric data';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    };

    ws.onerror = () => {
      const errorMessage = 'Failed to connect to metric stream';
      setError(errorMessage);
      onError?.(errorMessage);
    };

    return () => {
      ws.close();
    };
  }, [url, metricName, maxDataPoints, onError]);

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-red-600">{error}</h3>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <span className="text-sm text-gray-500">
          {data[data.length - 1]?.toFixed(2) || '0'} {unit}
        </span>
      </div>
      <div className="h-32 relative">
        {data.length > 0 && (
          <div className="absolute inset-0">
            <svg className="w-full h-full" preserveAspectRatio="none">
              <path
                d={`M ${data
                  .map((value, index) => {
                    const x = (index / (data.length - 1)) * 100;
                    const y = 100 - (value / Math.max(...data)) * 100;
                    return `${x},${y}`;
                  })
                  .join(' L ')}`}
                fill="none"
                stroke="#4F46E5"
                strokeWidth="2"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
