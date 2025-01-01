# Moisture Mapping Integration

Complete guide for integrating moisture mapping functionality into your inspection reports.

## Getting Started

### Prerequisites

Before integrating moisture mapping, ensure you have:

- Node.js 18.0 or higher installed
- Access to the inspection report API
- API key for authentication
- Basic understanding of TypeScript and React

### Installation

1. Install the required packages:

```bash
npm install @inspection/moisture-mapping @inspection/api-client
```

2. Configure environment variables:

```env
INSPECTION_API_KEY=your_api_key_here
INSPECTION_API_URL=https://api.example.com
```

## Basic Integration

### Setting Up the Client

First, set up the API client for moisture readings:

```typescript
import { createApiClient } from '@inspection/api-client';
import { MoistureMapConfig } from '@inspection/moisture-mapping';

export function setupMoistureClient() {
    const config: MoistureMapConfig = {
        apiKey: process.env.INSPECTION_API_KEY,
        apiUrl: process.env.INSPECTION_API_URL,
        options: {
            cacheTimeout: 5 * 60 * 1000, // 5 minutes
            retryAttempts: 3
        }
    };

    return createApiClient(config);
}
```

### Adding the Map Component

Add the moisture map component to your inspection report:

```tsx
import { MoistureMap } from '@inspection/moisture-mapping';
import { useMoistureReadings } from '@inspection/hooks';

export function InspectionReport() {
    const { readings, isLoading, error } = useMoistureReadings();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="report-section">
            <h2>Moisture Map</h2>
            <MoistureMap
                readings={readings}
                width={800}
                height={600}
                onReadingClick={(reading) => {
                    console.log('Selected reading:', reading);
                }}
            />
        </div>
    );
}
```

## Advanced Features

### Real-time Updates

To enable real-time updates of moisture readings:

```typescript
import { createRealtimeClient } from '@inspection/api-client';

export function setupRealtimeUpdates() {
    const client = createRealtimeClient({
        url: process.env.INSPECTION_WS_URL,
        reconnectInterval: 5000
    });

    client.subscribe('moisture-readings', (reading) => {
        console.log('New reading:', reading);
    });

    return client;
}
```

### Custom Visualizations

Create custom visualizations using the moisture data:

```typescript
import { MoistureChart } from '@inspection/moisture-mapping';

export function MoistureTrends() {
    const { readings } = useMoistureReadings();
    
    return (
        <MoistureChart
            data={readings}
            type="line"
            options={{
                showLegend: true,
                timeRange: '24h'
            }}
        />
    );
}
```

## Best Practices

### Data Management

- Cache moisture readings locally for offline access
- Implement retry logic for failed API requests
- Batch updates when sending multiple readings
- Validate readings before sending to API

### Performance Optimization

- Use pagination when fetching large datasets
- Implement data virtualization for large maps
- Cache and reuse rendered map tiles
- Optimize WebSocket message frequency

### Error Handling

- Implement proper error boundaries
- Add retry logic for failed connections
- Cache last known good state
- Provide clear error messages to users

## Troubleshooting

Common issues and their solutions:

1. Connection Errors
   - Verify API key and URL
   - Check network connectivity
   - Ensure proper CORS configuration

2. Performance Issues
   - Reduce data payload size
   - Implement pagination
   - Use data caching
   - Optimize render cycles

3. Data Inconsistencies
   - Validate data formats
   - Check timestamp synchronization
   - Verify sensor calibration
   - Monitor data transmission logs

## Examples

### Complete Integration Example

```typescript
import { 
    MoistureMap, 
    MoistureChart,
    createApiClient,
    useMoistureReadings
} from '@inspection/moisture-mapping';

export function MoistureReport() {
    const client = createApiClient({
        apiKey: process.env.INSPECTION_API_KEY,
        apiUrl: process.env.INSPECTION_API_URL
    });

    const { readings, isLoading, error } = useMoistureReadings(client);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="moisture-report">
            <h1>Moisture Analysis</h1>
            
            <section>
                <h2>Current Readings</h2>
                <MoistureMap readings={readings} />
            </section>

            <section>
                <h2>Trends</h2>
                <MoistureChart 
                    data={readings}
                    type="line"
                    timeRange="24h"
                />
            </section>
        </div>
    );
}
```

### WebSocket Integration

```typescript
import { createRealtimeClient } from '@inspection/api-client';

const wsClient = createRealtimeClient({
    url: process.env.INSPECTION_WS_URL,
    options: {
        reconnectInterval: 5000,
        maxRetries: 3
    }
});

wsClient.on('connect', () => {
    console.log('Connected to realtime updates');
});

wsClient.subscribe('moisture-readings', (reading) => {
    console.log('New reading received:', reading);
});

wsClient.on('error', (error) => {
    console.error('WebSocket error:', error);
});
