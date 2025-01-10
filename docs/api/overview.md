# API Documentation

## Overview

This document provides comprehensive documentation for the Inspection Report API. The API follows RESTful principles and uses JSON for request and response payloads.

## Base URL

```
https://api.inspection-report.com/v1
```

## Authentication

All API requests require authentication using a Bearer token in the Authorization header:

```http
Authorization: Bearer <your_api_token>
```

To obtain an API token, please contact the system administrator or use the authentication endpoints described in the Auth section.

## Rate Limiting

The API implements rate limiting to ensure fair usage and system stability:

- 1000 requests per hour per API token
- 10 concurrent requests per API token
- Bulk operations count as multiple requests based on the number of items

Rate limit information is included in response headers:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Response Format

All responses follow a standard format:

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "meta": {
    "timestamp": "2024-01-05T12:00:00Z",
    "requestId": "req_abc123"
  }
}
```

For errors:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-05T12:00:00Z",
    "requestId": "req_abc123"
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Invalid input data |
| AUTHENTICATION_ERROR | Invalid or missing authentication |
| AUTHORIZATION_ERROR | Insufficient permissions |
| RESOURCE_NOT_FOUND | Requested resource does not exist |
| RATE_LIMIT_EXCEEDED | Too many requests |
| INTERNAL_ERROR | Server error |

## API Versioning

The API uses URL versioning (v1, v2, etc.). Breaking changes will only be introduced in new versions. The current version will be maintained for at least 12 months after a new version is released.

## Endpoints

The API is organized into the following main sections:

### Authentication
- [Authentication Guide](./auth/README.md)
- Login, logout, and token management
- Role-based access control
- Multi-factor authentication

### Jobs
- [Jobs Guide](./jobs/README.md)
- Job creation and management
- Status updates
- Assignment and scheduling
- History tracking

### Clients
- [Clients Guide](./clients/README.md)
- Client information management
- Contact details
- Service history
- Communication preferences

### Equipment
- [Equipment Guide](./equipment/README.md)
- Equipment inventory
- Maintenance records
- Calibration tracking
- Status monitoring

### Readings
- [Readings Guide](./readings/README.md)
- Moisture readings
- Data collection
- Analysis and reporting
- Historical trends

### Reports
- [Reports Guide](./reports/README.md)
- Report generation
- Custom templates
- Export options
- Automated scheduling

### Analytics
- [Analytics Guide](./analytics/README.md)
- Data analysis
- Trend detection
- Predictive maintenance
- Custom insights

## Pagination

List endpoints support pagination using the following query parameters:

```
?page=1&limit=20
```

Pagination information is included in the response meta:

```json
{
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

## Filtering

List endpoints support filtering using query parameters:

```
?filter[status]=active&filter[type]=residential
```

## Sorting

List endpoints support sorting using the sort parameter:

```
?sort=createdAt:desc,name:asc
```

## Field Selection

Specify which fields to include in the response:

```
?fields=id,name,status
```

## Best Practices

1. **Rate Limiting**
   - Implement exponential backoff when rate limited
   - Cache responses when appropriate
   - Use bulk operations when possible

2. **Error Handling**
   - Always check the success field
   - Handle all error codes appropriately
   - Log the requestId for troubleshooting

3. **Security**
   - Store API tokens securely
   - Rotate tokens periodically
   - Use HTTPS for all requests
   - Implement proper CORS policies

4. **Performance**
   - Use pagination for large datasets
   - Request only needed fields
   - Cache responses when appropriate
   - Batch related requests

## Support

For API support:
- Email: api-support@inspection-report.com
- Documentation: https://docs.inspection-report.com
- Status Page: https://status.inspection-report.com

## Changelog

### v1.0.0 (2024-01-05)
- Initial API release
- Basic CRUD operations
- Authentication system
- Rate limiting implementation

### v1.1.0 (2024-01-20)
- Added analytics endpoints
- Enhanced error reporting
- Improved rate limiting
- New bulk operations
