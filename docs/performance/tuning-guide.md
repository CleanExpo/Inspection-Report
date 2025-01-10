# Performance Tuning Guide

## Overview

This guide provides best practices and strategies for optimizing performance when working with our API and caching system.

## Caching Strategy

### TTL Configuration

The system uses different TTL (Time To Live) values based on data type and update frequency:

```typescript
const cacheConfig = {
  maps: {
    ttl: 300,  // 5 minutes for maps
    varyByQuery: ['jobId', 'mapId']
  },
  readings: {
    ttl: 60,   // 1 minute for readings
    varyByQuery: ['mapId', 'x', 'y', 'startDate', 'endDate']
  }
};
```

#### Recommendations:
- Use shorter TTLs (30-60 seconds) for frequently updated data
- Use longer TTLs (5-15 minutes) for relatively static data
- Consider data consistency requirements when setting TTLs

### Cache Key Design

Cache keys are structured to enable efficient invalidation:

```typescript
`${prefix}:${method}:${path}:${queryParams}`
```

#### Best Practices:
- Include relevant query parameters in cache keys
- Sort query parameters for consistent key generation
- Use descriptive prefixes for easier debugging

### Cache Invalidation

The system supports pattern-based cache invalidation:

```typescript
// Invalidate all entries for a specific map
await invalidateCache(`moisture:*mapId=${mapId}*`);

// Invalidate all moisture-related cache entries
await invalidateCache('moisture:*');
```

#### Guidelines:
- Use targeted invalidation patterns
- Avoid wildcard-only patterns
- Consider cache dependencies when invalidating

## API Performance

### Request Optimization

1. Batch Operations
```typescript
// Instead of multiple single reading requests
const readings = await getReadingHistory(mapId, location, {
  radius: 10,
  startDate,
  endDate
});
```

2. Query Parameters
```typescript
// Include only necessary fields
?fields=id,value,timestamp

// Use pagination
?page=1&limit=20

// Use filters effectively
?startDate=2025-01-01&endDate=2025-01-31
```

### Response Optimization

1. Compression
- Responses are automatically compressed (gzip/brotli)
- Large responses (>1KB) benefit most from compression

2. Payload Size
```typescript
// Good: Return only necessary fields
return {
  id: reading.id,
  value: reading.value,
  timestamp: reading.timestamp
};

// Avoid: Returning entire objects
return reading;
```

## Memory Management

### Redis Memory Usage

1. Monitor Memory Usage
```bash
# Check Redis memory usage
redis-cli info memory

# Monitor memory usage over time
redis-cli monitor
```

2. Memory Optimization
```typescript
// Use appropriate data structures
const cacheData = {
  data: result,
  timestamp: Date.now()
};

// Compress large values if needed
const compressed = await compress(JSON.stringify(cacheData));
```

### Connection Management

1. Redis Connection Pool
```typescript
const config = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxReconnectAttempts: 10,
  reconnectInterval: 1000,
  // Connection pool settings
  poolSize: 10,
  idleTimeout: 30000
};
```

2. Error Handling
```typescript
redis.on('error', (error) => {
  console.error('Redis error:', error);
  performanceMonitor.recordMetric('redis_error', 1, {
    error: error.message
  });
});
```

## Performance Monitoring

### Metrics Collection

1. Response Times
```typescript
performanceMonitor.measureAsync('api_request', async () => {
  // API operation
});
```

2. Cache Statistics
```typescript
performanceMonitor.recordMetric('cache_hit', 1, {
  endpoint: 'moisture',
  type: 'map'
});
```

3. Error Rates
```typescript
performanceMonitor.recordMetric('api_error', 1, {
  type: error.name,
  endpoint: 'moisture'
});
```

### Monitoring Dashboard

Key metrics to monitor:

1. API Performance
- Request latency (p95, p99)
- Error rates
- Request volume

2. Cache Performance
- Hit/miss ratios
- Cache size
- Invalidation frequency

3. System Health
- Memory usage
- CPU utilization
- Network I/O

## Rate Limiting

### Configuration

```typescript
const rateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  headers: true, // Send rate limit headers
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests'
    });
  }
};
```

### Best Practices

1. Client-Side Implementation
```typescript
// Implement exponential backoff
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        await delay(retryAfter * 1000);
        continue;
      }
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(Math.pow(2, i) * 1000);
    }
  }
}
```

2. Rate Limit Headers
```typescript
// Monitor rate limit headers
const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
if (rateLimitRemaining < 10) {
  // Implement rate limiting warning
}
```

## Error Handling

### Best Practices

1. Graceful Degradation
```typescript
async function getDataWithFallback() {
  try {
    // Try cache first
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);

    // Fallback to database
    const data = await database.query();
    return data;
  } catch (error) {
    // Log error and return stale data if available
    console.error('Error:', error);
    return await getStaleData();
  }
}
```

2. Circuit Breaking
```typescript
const circuitBreaker = new CircuitBreaker(async () => {
  const result = await redis.get(key);
  return result;
}, {
  timeout: 1000,
  errorThreshold: 50,
  resetTimeout: 30000
});
```

## Testing

### Performance Testing

1. Load Testing
```bash
# Run k6 load test
k6 run load-test.js

# Artillery test
artillery run performance-test.yml
```

2. Cache Testing
```typescript
describe('Cache Performance', () => {
  it('should handle concurrent requests', async () => {
    const requests = Array(100).fill().map(() => 
      fetch('/api/moisture?mapId=123')
    );
    const responses = await Promise.all(requests);
    // Assert response times and cache hits
  });
});
```

## Deployment Considerations

1. Redis Configuration
```conf
maxmemory 2gb
maxmemory-policy allkeys-lru
```

2. Node.js Settings
```bash
NODE_ENV=production
NODE_OPTIONS="--max-old-space-size=4096"
```

3. Monitoring Setup
```bash
# Enable Redis monitoring
redis-cli CONFIG SET notify-keyspace-events KEA
```

Remember to regularly review and adjust these settings based on your application's specific needs and usage patterns.
