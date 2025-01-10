import React, { useEffect, useState } from 'react';
import { monitoringService } from '../../services/monitoringService';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface MetricData {
    timestamp: number;
    memory: number;
    cpu: number;
    network: number;
    fps: number;
}

interface Alert {
    type: 'warning' | 'error';
    message: string;
    timestamp: number;
}

const PerformanceDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<MetricData[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [insights, setInsights] = useState<Record<string, any>>({});
    const [selectedTimeRange, setSelectedTimeRange] = useState<number>(3600000); // 1 hour

    useEffect(() => {
        // Start monitoring when component mounts
        monitoringService.startMonitoring();

        // Subscribe to alerts
        const unsubscribe = monitoringService.subscribeToAlerts((alert) => {
            setAlerts(prev => [...prev, alert]);
        });

        // Update metrics every 5 seconds
        const updateInterval = setInterval(updateDashboard, 5000);

        return () => {
            monitoringService.stopMonitoring();
            unsubscribe();
            clearInterval(updateInterval);
        };
    }, []);

    useEffect(() => {
        updateDashboard();
    }, [selectedTimeRange]);

    const updateDashboard = () => {
        // Get metrics for each type
        const memoryMetrics = monitoringService.getMetrics('memory', selectedTimeRange);
        const cpuMetrics = monitoringService.getMetrics('cpu', selectedTimeRange);
        const networkMetrics = monitoringService.getMetrics('network', selectedTimeRange);
        const fpsMetrics = monitoringService.getMetrics('fps', selectedTimeRange);

        // Combine metrics into chart data
        const chartData: MetricData[] = memoryMetrics.map(metric => ({
            timestamp: metric.timestamp,
            memory: metric.value,
            cpu: cpuMetrics.find(m => m.timestamp === metric.timestamp)?.value || 0,
            network: networkMetrics.find(m => m.timestamp === metric.timestamp)?.value || 0,
            fps: fpsMetrics.find(m => m.timestamp === metric.timestamp)?.value || 0
        }));

        setMetrics(chartData);
        setInsights(monitoringService.getInsights());
    };

    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Performance Dashboard</h2>

            {/* Time Range Selector */}
            <div className="mb-6">
                <select
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(Number(e.target.value))}
                    className="p-2 border rounded"
                >
                    <option value={900000}>Last 15 Minutes</option>
                    <option value={3600000}>Last Hour</option>
                    <option value={86400000}>Last 24 Hours</option>
                </select>
            </div>

            {/* Metrics Chart */}
            <div className="h-96 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={formatTimestamp}
                        />
                        <YAxis />
                        <Tooltip
                            labelFormatter={formatTimestamp}
                            formatter={(value: number) => value.toFixed(2)}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="memory"
                            stroke="#8884d8"
                            name="Memory Usage (%)"
                        />
                        <Line
                            type="monotone"
                            dataKey="cpu"
                            stroke="#82ca9d"
                            name="CPU Usage (%)"
                        />
                        <Line
                            type="monotone"
                            dataKey="network"
                            stroke="#ffc658"
                            name="Network Latency (ms)"
                        />
                        <Line
                            type="monotone"
                            dataKey="fps"
                            stroke="#ff7300"
                            name="FPS"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Insights Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded">
                    <h3 className="text-lg font-semibold mb-3">Performance Insights</h3>
                    <ul className="space-y-2">
                        <li>Memory Usage: {insights.averageMemoryUsage?.toFixed(2)}%</li>
                        <li>CPU Usage: {insights.averageCpuUsage?.toFixed(2)}%</li>
                        <li>Network Latency: {insights.averageNetworkLatency?.toFixed(2)}ms</li>
                        <li>Average FPS: {insights.averageFps?.toFixed(2)}</li>
                    </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                    <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                        {insights.recommendations?.map((rec: string, index: number) => (
                            <li key={index} className="text-blue-600">{rec}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Alerts Panel */}
            <div className="bg-gray-50 p-4 rounded">
                <h3 className="text-lg font-semibold mb-3">Recent Alerts</h3>
                <div className="space-y-2">
                    {alerts.slice(-5).map((alert, index) => (
                        <div
                            key={index}
                            className={`p-3 rounded ${
                                alert.type === 'error'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}
                        >
                            <div className="font-medium">{alert.message}</div>
                            <div className="text-sm">
                                {new Date(alert.timestamp).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PerformanceDashboard;
