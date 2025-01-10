# Redis Features Implementation Guide

This guide explains how Redis is integrated into the inspection report application, providing caching, session management, real-time updates, and background job processing.

## Features Overview

1. **Caching** - Improve performance by caching API responses
2. **Session Management** - Handle user authentication and sessions
3. **Real-time Updates** - Push live updates to connected clients
4. **Background Jobs** - Process reports and notifications asynchronously

## Usage Examples

### 1. Caching API Responses

```typescript
// Use the cache middleware in your API routes
export default withCache(async function handler(req, res) {
    // Your API logic here
    const data = await fetchExpensiveData();
    res.json(data);
}, {
    duration: 3600, // Cache for 1 hour
    keyPrefix: 'api:inspections:'
});
```

### 2. Session Management

```typescript
// Protect routes with session middleware
export default withSession(async function handler(req, res) {
    // Access session data
    const { userId, role } = req.session || {};
    
    // Save session data
    await req.sessionHandler?.save({
        userId: '123',
        role: 'inspector'
    });
});
```

### 3. Real-time Updates

```typescript
// Publishing updates
await realtime.publish(
    RealtimeChannel.INSPECTION_UPDATES,
    'inspection:updated',
    {
        inspectionId: '123',
        status: 'completed'
    }
);

// Subscribing to updates (React component)
function InspectionStatus({ inspectionId }) {
    useEffect(() => {
        const unsubscribe = realtime.subscribe(
            RealtimeChannel.INSPECTION_UPDATES,
            (message) => {
                // Handle update
                console.log('Inspection updated:', message);
            }
        );
        return () => unsubscribe();
    }, []);
}
```

### 4. Background Jobs

```typescript
// Adding jobs to queue
const jobId = await queue.addJob(
    QueueName.REPORT_GENERATION,
    'generate-pdf',
    {
        inspectionId: '123',
        format: 'pdf'
    }
);

// Processing jobs
queue.registerProcessor(
    QueueName.REPORT_GENERATION,
    async (job) => {
        // Process the job
        await generateReport(job.data);
    },
    { interval: 5000, concurrency: 2 }
);
```

## Configuration

Redis connection settings are managed through environment variables:

```env
REDIS_HOST=your-redis-host
REDIS_PORT=your-redis-port
REDIS_PASSWORD=your-redis-password
```

## Best Practices

1. **Caching**
   - Set appropriate cache durations
   - Use specific cache keys
   - Implement cache invalidation when data changes

2. **Sessions**
   - Store minimal data in sessions
   - Set reasonable session timeouts
   - Implement secure session handling

3. **Real-time Updates**
   - Use specific channels for different types of updates
   - Handle reconnection scenarios
   - Clean up subscriptions when components unmount

4. **Background Jobs**
   - Set appropriate retry limits
   - Implement error handling
   - Monitor queue lengths
   - Set reasonable processing intervals

## Error Handling

All Redis features include built-in error handling:

```typescript
try {
    await redis.setCacheItem('key', data);
} catch (error) {
    console.error('Redis operation failed:', error);
    // Fallback behavior
}
```

## Monitoring

Monitor Redis performance using the built-in health checks:

```typescript
const isHealthy = await redis.ping();
const queueLength = await queue.getQueueLength(QueueName.REPORT_GENERATION);
```

## Integration Example

See `examples/redis-features.ts` for a complete example that demonstrates all Redis features working together in an inspection report endpoint.

## Common Issues and Solutions

1. **Connection Issues**
   - Verify Redis credentials
   - Check network connectivity
   - Ensure Redis server is running

2. **Performance Issues**
   - Monitor cache hit rates
   - Adjust cache durations
   - Scale queue processing

3. **Memory Usage**
   - Monitor Redis memory usage
   - Implement data expiration
   - Use appropriate data structures

## Security Considerations

1. **Data Protection**
   - All sensitive data is encrypted
   - Sessions are secure and HTTP-only
   - Redis password is required

2. **Access Control**
   - Session validation
   - Role-based access
   - Request validation

## Development Workflow

1. **Local Development**
   - Use Redis Desktop Manager for debugging
   - Monitor queue processing
   - Test real-time features

2. **Testing**
   - Unit tests for Redis operations
   - Integration tests for features
   - Load testing for performance

3. **Deployment**
   - Configure production Redis settings
   - Set up monitoring
   - Implement logging

## Support

For issues or assistance:
1. Check Redis logs
2. Review error messages
3. Consult Redis documentation
4. Contact the development team
