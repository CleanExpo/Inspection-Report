# API Logging Strategy

## Request Logging

### Basic Request Log
```typescript
interface RequestLog {
  timestamp: string;
  requestId: string;
  method: string;
  path: string;
  query: Record<string, unknown>;
  headers: {
    userAgent: string;
    contentType?: string;
    authorization?: boolean; // just log presence
  };
  userId?: string;
  clientIp: string;
}
```

### Request Body Logging
```typescript
interface RequestBodyLog {
  requestId: string;
  body: unknown;
  sanitized: boolean; // indicates if sensitive data was removed
}
```

## Response Logging

### Basic Response Log
```typescript
interface ResponseLog {
  requestId: string;
  timestamp: string;
  statusCode: number;
  responseTime: number; // in milliseconds
  responseSize: number; // in bytes
  cached: boolean;
}
```

### Error Response Log
```typescript
interface ErrorLog extends ResponseLog {
  errorCode: string;
  errorMessage: string;
  stackTrace?: string; // only in development
  context?: unknown;
}
```

## Performance Metrics

### Request Timing
```typescript
interface RequestTiming {
  requestId: string;
  total: number;
  breakdown: {
    validation: number;
    authentication: number;
    database: number;
    business: number;
    serialization: number;
  };
}
```

### Resource Usage
```typescript
interface ResourceMetrics {
  requestId: string;
  memory: {
    heapUsed: number;
    heapTotal: number;
  };
  cpu: {
    user: number;
    system: number;
  };
}
```

## Debug Information

### Development Mode
```typescript
interface DebugLog {
  requestId: string;
  level: 'debug' | 'trace';
  message: string;
  context: unknown;
  timestamp: string;
}
```

## Implementation

### Middleware Chain
```typescript
app.use([
  requestIdMiddleware(),
  requestLoggerMiddleware(),
  performanceMiddleware(),
  errorLoggerMiddleware()
]);
```

### Log Levels
1. ERROR: System errors, API errors
2. WARN: Validation failures, rate limits
3. INFO: Standard requests/responses
4. DEBUG: Detailed timing, parameters
5. TRACE: Development debugging

### Storage Strategy
1. Short-term (7 days)
   - All request/response logs
   - Performance metrics
   - Debug information

2. Long-term (90 days)
   - Error logs
   - Aggregated metrics
   - Security events

### Monitoring Alerts

#### Performance Alerts
- Response time > 1000ms
- Memory usage > 80%
- Error rate > 1%
- Failed requests > 5%

#### Security Alerts
- Authentication failures
- Rate limit violations
- Invalid tokens
- Suspicious patterns

#### Business Alerts
- Critical operation failures
- Data validation patterns
- Usage thresholds
- API version usage

## Log Format

### Production Format
```json
{
  "timestamp": "2024-01-24T12:00:00.000Z",
  "requestId": "req_123",
  "level": "info",
  "event": "request",
  "method": "POST",
  "path": "/api/moisture/readings",
  "statusCode": 201,
  "responseTime": 150,
  "userId": "user_123",
  "clientIp": "1.2.3.4"
}
```

### Development Format
```json
{
  "timestamp": "2024-01-24T12:00:00.000Z",
  "requestId": "req_123",
  "level": "debug",
  "event": "request",
  "method": "POST",
  "path": "/api/moisture/readings",
  "body": {...},
  "query": {...},
  "headers": {...},
  "timing": {...},
  "memory": {...}
}
```

## Log Rotation
- Rotate logs daily
- Compress older logs
- Delete logs > retention period
- Archive important logs
