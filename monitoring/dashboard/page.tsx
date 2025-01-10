import { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';
import { 
  MetricData, 
  ResourceMetrics, 
  PerformanceData, 
  MetricMessage,
  AnalyticsData,
  PerformancePattern,
  ResourcePattern,
  OptimizationRecommendation
} from '../types/metrics';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [responseTimeData, setResponseTimeData] = useState<MetricData[]>([]);
  const [resourceData, setResourceData] = useState<ResourceMetrics[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: NodeJS.Timeout;

    const connectWebSocket = () => {
      ws = new WebSocket('ws://localhost:3001');

      ws.onopen = () => {
        console.log('Connected to metrics server');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as MetricMessage;
          updateMetrics(data);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('Disconnected from metrics server. Reconnecting...');
        // Attempt to reconnect after 5 seconds
        reconnectTimer = setTimeout(connectWebSocket, 5000);
      };
    };

    connectWebSocket();

    // Cleanup
    return () => {
      clearTimeout(reconnectTimer);
      ws.close();
    };
  }, []);

  const updateMetrics = (data: MetricMessage) => {
    switch (data.type) {
      case 'responseTime':
        setResponseTimeData(prev => [...prev.slice(-50), data.data as MetricData]);
        break;
      case 'resources':
        setResourceData(prev => [...prev.slice(-50), data.data as ResourceMetrics]);
        break;
      case 'performance':
        setPerformanceData([data.data as PerformanceData]);
        break;
      case 'alert':
        if (data.message) {
          setAlerts(prev => [...prev, data.message as string]);
        }
        break;
      case 'analytics':
        setAnalytics(data.data as AnalyticsData);
        break;
    }
  };

  const responseTimeChartData: ChartData<'line'> = {
    labels: responseTimeData.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Response Time (ms)',
        data: responseTimeData.map(d => d.value),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const resourceChartData: ChartData<'line'> = {
    labels: resourceData.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Memory Usage (%)',
        data: resourceData.map(d => d.memory),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      },
      {
        label: 'CPU Usage (%)',
        data: resourceData.map(d => d.cpu),
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1
      },
      {
        label: 'Active Connections',
        data: resourceData.map(d => d.connections),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const performanceChartData: ChartData<'bar'> = {
    labels: performanceData.map(d => d.operation),
    datasets: [
      {
        label: 'Mean Response Time (ms)',
        data: performanceData.map(d => d.mean),
        backgroundColor: 'rgba(75, 192, 192, 0.5)'
      },
      {
        label: 'P95 Response Time (ms)',
        data: performanceData.map(d => d.p95),
        backgroundColor: 'rgba(255, 99, 132, 0.5)'
      },
      {
        label: 'P99 Response Time (ms)',
        data: performanceData.map(d => d.p99),
        backgroundColor: 'rgba(54, 162, 235, 0.5)'
      }
    ]
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Performance Monitoring Dashboard</h1>

      {/* Response Time Chart */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Response Time Trends</h2>
        <div className="h-64">
          <Line
            data={responseTimeChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
      </div>

      {/* Resource Usage Chart */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Resource Utilization</h2>
        <div className="h-64">
          <Line
            data={resourceChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100
                }
              }
            }}
          />
        </div>
      </div>

      {/* Performance Metrics Chart */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Operation Performance</h2>
        <div className="h-64">
          <Bar
            data={performanceChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
      </div>

      {/* Analytics Panel */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Performance Analytics</h2>
        {analytics && (
          <div className="space-y-4">
            {/* Patterns */}
            <div>
              <h3 className="text-lg font-medium mb-2">Detected Patterns</h3>
              {analytics.patterns.length === 0 ? (
                <p className="text-gray-500">No patterns detected</p>
              ) : (
                <div className="space-y-2">
                  {analytics.patterns.map((pattern, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded ${
                        pattern.type === 'spike' || pattern.type === 'high-usage'
                          ? 'bg-red-50 text-red-700'
                          : pattern.type === 'improvement' || pattern.type === 'trend-down'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-yellow-50 text-yellow-700'
                      }`}
                    >
                      {pattern.description}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-lg font-medium mb-2">Recommendations</h3>
              {analytics.recommendations.length === 0 ? (
                <p className="text-gray-500">No recommendations at this time</p>
              ) : (
                <div className="space-y-2">
                  {analytics.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded ${
                        rec.priority === 'high'
                          ? 'bg-red-50 text-red-700'
                          : rec.priority === 'medium'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      <div className="font-medium">{rec.description}</div>
                      <div className="text-sm mt-1">Impact: {rec.impact}</div>
                      <div className="text-sm font-medium mt-1">Action: {rec.action}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Statistics */}
            <div>
              <h3 className="text-lg font-medium mb-2">Performance Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">Response Time</div>
                  <div className="text-lg font-medium">
                    {analytics.statistics.responseTime.average.toFixed(2)}ms avg
                  </div>
                  <div className="text-sm text-gray-500">
                    {analytics.statistics.responseTime.samples} samples
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">Resource Usage</div>
                  <div className="text-sm">
                    CPU: {analytics.statistics.resources.cpu.current.toFixed(1)}%
                  </div>
                  <div className="text-sm">
                    Memory: {analytics.statistics.resources.memory.current.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Alerts Panel */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>
        <div className="max-h-48 overflow-y-auto">
          {alerts.length === 0 ? (
            <p className="text-gray-500">No recent alerts</p>
          ) : (
            <ul className="space-y-2">
              {alerts.map((alert, index) => (
                <li
                  key={index}
                  className="p-2 bg-red-50 text-red-700 rounded"
                >
                  {alert}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
