# Monitoring System

A real-time monitoring system for ServiceSphere, featuring WebSocket-based metrics collection, interactive dashboards, and configurable alerts.

## Features

- Real-time metrics visualization
- Configurable thresholds and alerts
- WebSocket-based data streaming
- Responsive dashboard layout
- Custom metric support
- Alert history tracking

## Architecture

### Components

- **MetricChart**: Real-time chart component with threshold visualization
- **AlertList**: Real-time alert display with severity filtering
- **DashboardLayout**: Main dashboard layout with configurable metrics
- **WebSocket Client**: Real-time data streaming client
- **Metrics Collector**: Server-side metrics collection service
- **Alert Manager**: Alert generation and notification service

### Technologies

- React with TypeScript
- Chart.js for visualization
- WebSocket for real-time communication
- Express for API endpoints
- Node.js for server-side components

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Required environment variables:
```env
NEXT_PUBLIC_WS_URL=ws://localhost:3002
MONITORING_PORT=3002
METRICS_RETENTION_DAYS=30
ALERT_NOTIFICATIONS_ENABLED=true
```

3. Start the monitoring server:
```bash
npm run monitoring:setup
npm run monitoring:start
```

4. Access the dashboard:
```
http://localhost:3000/monitoring
```

## Usage

### Adding Custom Metrics

1. Define metric configuration in `dashboard.tsx`:
```typescript
const metrics: MetricConfig[] = [
  {
    name: 'custom_metric',
    title: 'Custom Metric',
    yAxisLabel: 'Units',
    timeWindow: 30,
    thresholds: [
      { value: 90, color: 'rgb(239, 68, 68)', label: 'Critical' },
      { value: 70, color: 'rgb(234, 179, 8)', label: 'Warning' }
    ]
  }
];
```

2. Send metrics via WebSocket:
```typescript
ws.send(JSON.stringify({
  event: 'metric',
  data: {
    name: 'custom_metric',
    value: 75,
    timestamp: new Date().toISOString()
  }
}));
```

### Configuring Alerts

1. Set up alert thresholds in metric configuration:
```typescript
thresholds: [
  {
    value: 90,
    color: 'rgb(239, 68, 68)',
    label: 'Critical'
  }
]
```

2. Configure alert notifications in `.env`:
```env
ALERT_NOTIFICATIONS_ENABLED=true
SLACK_WEBHOOK_URL=your_webhook_url
EMAIL_NOTIFICATIONS_ENABLED=true
```

### Dashboard Customization

1. Modify layout in `DashboardLayout.tsx`:
```typescript
<div className="dashboard-layout" style={{
  gridTemplateColumns: '1fr 300px',  // Adjust layout
  gap: '24px'
}}>
```

2. Customize chart appearance:
```typescript
const chartOptions: ChartOptions<'line'> = {
  // Customize chart options
};
```

## API Reference

### WebSocket Events

#### Metric Event
```typescript
interface MetricMessage {
  event: 'metric';
  data: {
    name: string;
    value: number;
    timestamp: string;
    tags?: Record<string, string>;
  };
}
```

#### Alert Event
```typescript
interface AlertMessage {
  event: 'alert';
  data: {
    id: string;
    type: string;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    timestamp: string;
    metadata?: Record<string, any>;
  };
}
```

### Component Props

#### MetricChart
```typescript
interface MetricChartProps {
  websocketUrl: string;
  metricName: string;
  title: string;
  timeWindow?: number;
  yAxisLabel?: string;
  thresholds?: MetricThreshold[];
}
```

#### AlertList
```typescript
interface AlertListProps {
  websocketUrl: string;
  maxAlerts?: number;
  severityFilter?: ('info' | 'warning' | 'error' | 'critical')[];
}
```

## Development

### Running Tests
```bash
npm test
npm run test:coverage
```

### Building for Production
```bash
npm run build
```

### Deployment
```bash
npm run setup-production
npm run monitoring:verify
```

## Troubleshooting

### Common Issues

1. WebSocket Connection Failed
   - Check if the WebSocket server is running
   - Verify the WebSocket URL in environment variables
   - Check for firewall or network issues

2. Missing Metrics
   - Verify metric names match between client and server
   - Check metric collection service is running
   - Review WebSocket connection status

3. Alert Notifications Not Working
   - Verify notification service configuration
   - Check webhook URLs and credentials
   - Review alert manager logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
