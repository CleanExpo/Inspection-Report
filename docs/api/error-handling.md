# API Error Handling Documentation

## Error Response Format

All API errors follow a consistent format:

```typescript
interface ErrorResponse {
  status: 'error';
  code: string;        // Unique error code
  message: string;     // Human-readable message
  details?: any;       // Additional error details
  timestamp: string;   // ISO timestamp
  requestId?: string;  // Request tracking ID
}
```

## HTTP Status Codes

### Common Status Codes
- `400` Bad Request - Invalid input parameters
- `401` Unauthorized - Missing or invalid authentication
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource doesn't exist
- `409` Conflict - Resource state conflict
- `422` Unprocessable Entity - Validation failed
- `429` Too Many Requests - Rate limit exceeded
- `500` Internal Server Error - Server-side error
- `503` Service Unavailable - System maintenance

## Error Categories

### Validation Errors (400)
```typescript
interface ValidationError extends ErrorResponse {
  code: 'VALIDATION_ERROR';
  details: {
    field: string;
    message: string;
    value?: any;
  }[];
}

// Example
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "details": [
    {
      "field": "projectId",
      "message": "Project ID is required",
      "value": null
    }
  ],
  "timestamp": "2024-01-20T10:30:00Z"
}
```

### Authentication Errors (401)
```typescript
interface AuthError extends ErrorResponse {
  code: 'AUTH_ERROR';
  details?: {
    reason: string;
  };
}

// Example
{
  "status": "error",
  "code": "AUTH_ERROR",
  "message": "Invalid authentication token",
  "details": {
    "reason": "Token expired"
  },
  "timestamp": "2024-01-20T10:30:00Z"
}
```

### Permission Errors (403)
```typescript
interface PermissionError extends ErrorResponse {
  code: 'PERMISSION_ERROR';
  details: {
    requiredScope: string;
    userScope: string[];
  };
}

// Example
{
  "status": "error",
  "code": "PERMISSION_ERROR",
  "message": "Insufficient permissions",
  "details": {
    "requiredScope": "floorplan:write",
    "userScope": ["floorplan:read"]
  },
  "timestamp": "2024-01-20T10:30:00Z"
}
```

### Resource Errors (404)
```typescript
interface ResourceError extends ErrorResponse {
  code: 'RESOURCE_ERROR';
  details: {
    resourceType: string;
    resourceId: string;
  };
}

// Example
{
  "status": "error",
  "code": "RESOURCE_ERROR",
  "message": "Resource not found",
  "details": {
    "resourceType": "floorplan",
    "resourceId": "fp_123"
  },
  "timestamp": "2024-01-20T10:30:00Z"
}
```

## Error Handling Best Practices

### Client-Side Handling
```typescript
async function handleApiError(error: any) {
  if (error.response) {
    const { code, message, details } = error.response.data;
    
    switch (code) {
      case 'AUTH_ERROR':
        // Handle authentication errors
        await refreshToken();
        break;
        
      case 'PERMISSION_ERROR':
        // Handle permission errors
        showPermissionDenied(message);
        break;
        
      case 'VALIDATION_ERROR':
        // Handle validation errors
        showFieldErrors(details);
        break;
        
      default:
        // Handle other errors
        showErrorMessage(message);
    }
  }
}
```

### Rate Limiting
```typescript
interface RateLimitError extends ErrorResponse {
  code: 'RATE_LIMIT_ERROR';
  details: {
    limit: number;
    remaining: number;
    reset: string;
  };
}

// Example
{
  "status": "error",
  "code": "RATE_LIMIT_ERROR",
  "message": "Rate limit exceeded",
  "details": {
    "limit": 100,
    "remaining": 0,
    "reset": "2024-01-20T11:00:00Z"
  },
  "timestamp": "2024-01-20T10:30:00Z"
}
```

## Error Prevention Guidelines

1. Input Validation
   - Validate all request parameters
   - Use strong typing
   - Sanitize user inputs

2. Error Recovery
   - Implement retry mechanisms
   - Handle token refresh
   - Provide clear error messages

3. Logging & Monitoring
   - Log all errors with context
   - Monitor error rates
   - Set up alerts for critical errors

4. Documentation
   - Document all error codes
   - Provide example responses
   - Include recovery steps
