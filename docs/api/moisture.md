# Moisture API Documentation

## Overview

The Moisture API provides endpoints for managing moisture maps and readings. It includes role-based access control and caching for optimal performance.

## Authentication

All endpoints require authentication using a JWT token.

```http
Authorization: Bearer <your_jwt_token>
```

### Role-Based Access

- **VIEWER**: Can read data (GET requests)
- **TECHNICIAN**: Can read, create, and update data (GET, POST, PUT requests)
- **ADMIN**: Full access including deletion (GET, POST, PUT, DELETE requests)

## Caching

GET requests are cached using Redis with the following configuration:
- Maps: 5-minute TTL
- Readings: 1-minute TTL
- Cache can be bypassed using the `x-bypass-cache: true` header

## Endpoints

### Get Moisture Map

```http
GET /api/moisture?mapId={mapId}
```

#### Parameters
- `mapId` (string, required): ID of the moisture map

#### Response
```json
{
  "id": "map_123",
  "name": "Floor 1 Moisture Map",
  "layout": {
    "width": 100,
    "height": 100
  },
  "readings": [...]
}
```

### Get Maps for Job

```http
GET /api/moisture?jobId={jobId}
```

#### Parameters
- `jobId` (string, required): ID of the job

#### Response
```json
[
  {
    "id": "map_123",
    "name": "Floor 1 Moisture Map",
    "layout": {...}
  },
  ...
]
```

### Get Reading History

```http
GET /api/moisture?mapId={mapId}&type=history&x={x}&y={y}
```

#### Parameters
- `mapId` (string, required): ID of the moisture map
- `type` (string, required): Must be "history"
- `x` (number, required): X coordinate
- `y` (number, required): Y coordinate
- `radius` (number, optional): Search radius
- `startDate` (string, optional): Start date in ISO format
- `endDate` (string, optional): End date in ISO format

#### Response
```json
[
  {
    "id": "reading_123",
    "value": 15.5,
    "materialType": "WOOD",
    "timestamp": "2025-01-05T23:43:31.691Z",
    "location": {
      "x": 10,
      "y": 20
    }
  },
  ...
]
```

### Create Moisture Map

```http
POST /api/moisture
```

#### Required Role
- TECHNICIAN or ADMIN

#### Request Body
```json
{
  "jobId": "job_123",
  "name": "Floor 1 Moisture Map",
  "layout": {
    "width": 100,
    "height": 100
  }
}
```

#### Response
```json
{
  "id": "map_123",
  "jobId": "job_123",
  "name": "Floor 1 Moisture Map",
  "layout": {
    "width": 100,
    "height": 100
  }
}
```

### Add Reading

```http
POST /api/moisture?mapId={mapId}&type=reading
```

#### Required Role
- TECHNICIAN or ADMIN

#### Parameters
- `mapId` (string, required): ID of the moisture map
- `type` (string, required): Must be "reading"

#### Request Body
```json
{
  "value": 15.5,
  "materialType": "WOOD",
  "location": {
    "x": 10,
    "y": 20
  },
  "notes": "Near window"
}
```

#### Response
```json
{
  "id": "reading_123",
  "value": 15.5,
  "materialType": "WOOD",
  "location": {
    "x": 10,
    "y": 20
  },
  "notes": "Near window",
  "timestamp": "2025-01-05T23:43:31.691Z"
}
```

### Update Map

```http
PUT /api/moisture?mapId={mapId}
```

#### Required Role
- TECHNICIAN or ADMIN

#### Parameters
- `mapId` (string, required): ID of the moisture map

#### Request Body
```json
{
  "name": "Updated Map Name",
  "layout": {
    "width": 200,
    "height": 200
  }
}
```

#### Response
```json
{
  "id": "map_123",
  "name": "Updated Map Name",
  "layout": {
    "width": 200,
    "height": 200
  }
}
```

### Update Reading

```http
PUT /api/moisture?mapId={mapId}&readingId={readingId}
```

#### Required Role
- TECHNICIAN or ADMIN

#### Parameters
- `mapId` (string, required): ID of the moisture map
- `readingId` (string, required): ID of the reading

#### Request Body
```json
{
  "value": 16.0,
  "notes": "Updated reading"
}
```

#### Response
```json
{
  "id": "reading_123",
  "value": 16.0,
  "notes": "Updated reading",
  "timestamp": "2025-01-05T23:43:31.691Z"
}
```

### Delete Reading

```http
DELETE /api/moisture?readingId={readingId}
```

#### Required Role
- ADMIN only

#### Parameters
- `readingId` (string, required): ID of the reading to delete

#### Response
```json
{
  "id": "reading_123",
  "deleted": true
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid input: [error details]"
}
```

### 401 Unauthorized
```json
{
  "error": "Missing or invalid authorization header"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Map not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Cache Headers

The API includes cache-related headers in responses:

- `X-Cache: HIT` - Response was served from cache
- `X-Cache: MISS` - Response was generated from the database

## Performance Considerations

1. Use appropriate cache TTLs:
   - Short-lived for frequently updated data
   - Longer TTLs for static data

2. Batch operations when possible:
   - Get multiple readings in one request using the history endpoint
   - Use the radius parameter to get nearby readings

3. Include only necessary fields:
   - Specify date ranges for history queries
   - Use appropriate page sizes for large datasets

4. Cache invalidation:
   - Cache is automatically invalidated on successful mutations
   - Use the bypass header only when necessary

## Rate Limiting

The API includes rate limiting to prevent abuse:
- 100 requests per minute per IP address
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`
