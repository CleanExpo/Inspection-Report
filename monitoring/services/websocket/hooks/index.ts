import { useWebSocketClient, useWebSocketEvent } from './useWebSocketClient';
import type { UseWebSocketClientOptions, UseWebSocketClientResult } from './useWebSocketClient';

export {
  useWebSocketClient,
  useWebSocketEvent
};

export type {
  UseWebSocketClientOptions,
  UseWebSocketClientResult
};

// Example usage:
/*
import { useWebSocketClient } from '@monitoring/services/websocket/hooks';

function MetricsComponent() {
  const {
    connected,
    connecting,
    error,
    send,
    subscribe,
    unsubscribe
  } = useWebSocketClient({
    url: 'ws://localhost:3002/monitoring',
    subscription: {
      events: ['metric'],
      filters: {
        metricNames: ['cpu_usage', 'memory_usage'],
        tags: { environment: 'production' }
      }
    },
    onMessage: (message) => {
      if (message.event === 'metric') {
        // Handle metric update
        console.log('Received metric:', message.data);
      }
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    }
  });

  if (connecting) return <div>Connecting...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!connected) return <div>Disconnected</div>;

  return <div>Connected and receiving metrics...</div>;
}

// Or use the event-specific hook:
function MetricDisplay() {
  const [metrics, setMetrics] = useState([]);
  const client = useWebSocketClient({
    url: 'ws://localhost:3002/monitoring'
  });

  useWebSocketEvent(client, 'metric', (metric) => {
    setMetrics(prev => [...prev, metric]);
  });

  return (
    <div>
      {metrics.map((metric, index) => (
        <div key={index}>
          {metric.name}: {metric.value}
        </div>
      ))}
    </div>
  );
}
*/
