# Integration Guide

## Overview
This guide provides detailed instructions for integrating our monitoring and performance optimization system into your application.

## Quick Start

### 1. Installation
```bash
npm install @monitoring/system

# or with yarn
yarn add @monitoring/system
```

### 2. Basic Setup
```typescript
import { 
  MonitoringSystem,
  MetricsCollector,
  PerformanceOptimizer
} from '@monitoring/system';

// Initialize the monitoring system
const monitoring = new MonitoringSystem({
  port: 3001,
  enableDashboard: true,
  logLevel: 'info'
});

// Start monitoring
await monitoring.start();
```

## Core Components

### 1. Metrics Collector
```typescript
import { metricsCollector } from '@monitoring/system';

// Record custom metrics
metricsCollector.recordMetric('cpu', cpuUsage);
metricsCollector.recordMetric('memory', memoryUsage);
metricsCollector.recordMetric('connections', activeConnections);

// Get current statistics
const stats = metricsCollector.getCurrentStats();
```

### 2. Performance Optimizer
```typescript
import { performanceOptimizer } from '@monitoring/system';

// Configure optimization profiles
performanceOptimizer.updateProfile('conservative', {
  responseTimeThreshold: 1000,
  memoryThreshold: 70,
  cpuThreshold: 60
});

// Run optimization cycle
await performanceOptimizer.optimize();
```

### 3. Resource Manager
```typescript
import { resourceManager } from '@monitoring/system';

// Update resource limits
await resourceManager.updateLimits({
  cpu: { threshold: 80 },
  memory: { threshold: 75 },
  connections: { max: 1000 }
});

// Check resource health
const health = resourceManager.checkHealth();
```

### 4. Cache Manager
```typescript
import { cacheManager } from '@monitoring/system';

// Configure cache
cacheManager.updateConfig({
  maxSize: 100 * 1024 * 1024, // 100MB
  maxAge: 5 * 60 * 1000,      // 5 minutes
  cleanupInterval: 60 * 1000   // 1 minute
});

// Use cache
await cacheManager.set('key', data, {
  type: 'response',
  ttl: 300000
});

const cachedData = await cacheManager.get('key', 'response');
```

### 5. Load Balancer
```typescript
import { loadBalancer } from '@monitoring/system';

// Register nodes
loadBalancer.registerNode('node1', 'http://localhost:3001');
loadBalancer.registerNode('node2', 'http://localhost:3002');

// Get next node for request
const node = loadBalancer.getNextNode('/api/endpoint');
```

## Dashboard Integration

### 1. WebSocket Connection
```typescript
import { connectDashboard } from '@monitoring/system';

const dashboard = await connectDashboard({
  url: 'ws://localhost:3001',
  reconnect: true
});

dashboard.on('metrics', (data) => {
  console.log('Received metrics:', data);
});
```

### 2. Custom Metrics
```typescript
import { broadcastMetrics } from '@monitoring/system';

// Send custom metrics to dashboard
broadcastMetrics({
  type: 'custom',
  timestamp: new Date().toISOString(),
  data: {
    metric: 'customValue',
    value: 42
  }
});
```

## Advanced Configuration

### 1. Performance Profiles
```typescript
const profiles = {
  conservative: {
    responseTimeThreshold: 1000,
    memoryThreshold: 70,
    cpuThreshold: 60,
    connectionLimit: 500,
    cacheLifetime: 300000
  },
  balanced: {
    responseTimeThreshold: 500,
    memoryThreshold: 80,
    cpuThreshold: 70,
    connectionLimit: 1000,
    cacheLifetime: 180000
  },
  aggressive: {
    responseTimeThreshold: 200,
    memoryThreshold: 90,
    cpuThreshold: 80,
    connectionLimit: 2000,
    cacheLifetime: 60000
  }
};

performanceOptimizer.setProfiles(profiles);
```

### 2. Alert Configuration
```typescript
monitoring.configureAlerts({
  thresholds: {
    cpu: { warning: 70, critical: 85 },
    memory: { warning: 75, critical: 90 },
    responseTime: { warning: 500, critical: 1000 }
  },
  handlers: {
    onWarning: (alert) => console.warn(alert),
    onCritical: (alert) => console.error(alert)
  }
});
```

### 3. Custom Metrics
```typescript
// Define custom metric
metricsCollector.defineMetric({
  name: 'customMetric',
  type: 'gauge',
  description: 'Custom metric description'
});

// Record values
metricsCollector.recordMetric('customMetric', value);
```

## Best Practices

### 1. Resource Management
```typescript
// Implement cleanup handlers
process.on('SIGINT', async () => {
  await monitoring.stop();
  process.exit(0);
});

// Regular health checks
setInterval(async () => {
  const health = await monitoring.checkHealth();
  if (!health.healthy) {
    console.error('Health check failed:', health.issues);
  }
}, 30000);
```

### 2. Error Handling
```typescript
monitoring.on('error', (error) => {
  console.error('Monitoring error:', error);
  // Implement error recovery logic
});

monitoring.on('warning', (warning) => {
  console.warn('Monitoring warning:', warning);
  // Handle warning conditions
});
```

### 3. Performance Optimization
```typescript
// Regular optimization cycles
setInterval(async () => {
  await performanceOptimizer.optimize();
  const state = performanceOptimizer.getState();
  console.log('Optimization state:', state);
}, 60000);
```

## Troubleshooting

### Common Issues

1. **Connection Issues**
```typescript
monitoring.on('disconnect', async () => {
  console.log('Disconnected from monitoring server');
  await monitoring.reconnect();
});
```

2. **Resource Exhaustion**
```typescript
monitoring.on('resource-warning', async (resource) => {
  console.warn(`${resource} usage high`);
  await resourceManager.optimizeResource(resource);
});
```

3. **Performance Degradation**
```typescript
monitoring.on('performance-degradation', async () => {
  console.warn('Performance degrading');
  await performanceOptimizer.forceOptimize();
});
```

## API Reference

### MonitoringSystem
```typescript
interface MonitoringConfig {
  port?: number;
  enableDashboard?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  metricsInterval?: number;
  optimizationInterval?: number;
}

class MonitoringSystem {
  constructor(config: MonitoringConfig);
  start(): Promise<void>;
  stop(): Promise<void>;
  checkHealth(): Promise<HealthStatus>;
}
```

### MetricsCollector
```typescript
interface MetricOptions {
  type: 'gauge' | 'counter' | 'histogram';
  description?: string;
}

class MetricsCollector {
  defineMetric(name: string, options: MetricOptions): void;
  recordMetric(name: string, value: number): void;
  getCurrentStats(): Stats;
}
```

### PerformanceOptimizer
```typescript
interface OptimizationProfile {
  responseTimeThreshold: number;
  memoryThreshold: number;
  cpuThreshold: number;
  connectionLimit: number;
  cacheLifetime: number;
}

class PerformanceOptimizer {
  setProfiles(profiles: Record<string, OptimizationProfile>): void;
  optimize(): Promise<void>;
  getState(): OptimizerState;
}
```

## Security Considerations

### 1. Authentication
```typescript
monitoring.configureAuth({
  type: 'token',
  token: process.env.MONITORING_TOKEN
});
```

### 2. Data Protection
```typescript
monitoring.configureSecurity({
  encryption: true,
  sensitiveFields: ['password', 'token'],
  allowedOrigins: ['https://your-domain.com']
});
```

### 3. Access Control
```typescript
monitoring.configureAccess({
  roles: {
    admin: ['write', 'read'],
    viewer: ['read']
  },
  defaultRole: 'viewer'
});
