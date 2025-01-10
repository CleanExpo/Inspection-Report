# API Documentation

## Overview
This document provides comprehensive documentation for the Inspection Report API endpoints, authentication, and data models.

## Authentication
All API endpoints require authentication using JWT (JSON Web Tokens).

### Authentication Flow
1. Login using credentials to receive access and refresh tokens
2. Use access token in Authorization header: `Bearer {token}`
3. Refresh access token using refresh token when expired
4. Logout to invalidate tokens

### Endpoints

#### POST /api/auth/login
Authenticates user and returns tokens.

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": number
}
```

#### POST /api/auth/refresh
Refreshes access token using refresh token.

**Request:**
```json
{
  "refreshToken": "string"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": number
}
```

#### POST /api/auth/logout
Invalidates refresh token.

**Headers:**
- Authorization: `Bearer {refresh_token}`

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## Jobs API

### Endpoints

#### GET /api/jobs
Lists jobs with pagination and filtering.

**Query Parameters:**
- page (number, default: 1)
- limit (number, default: 10)
- filter (string, optional)

**Response:**
```json
{
  "success": true,
  "jobs": [
    {
      "id": "string",
      "jobNumber": "string",
      "clientId": "string",
      "status": "PENDING | IN_PROGRESS | COMPLETED",
      "priority": "LOW | MEDIUM | HIGH",
      "category": "string",
      "description": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "total": number
}
```

#### POST /api/jobs
Creates a new job.

**Request Body:**
```json
{
  "clientId": "string",
  "category": "string",
  "status": "PENDING | IN_PROGRESS | COMPLETED",
  "priority": "LOW | MEDIUM | HIGH",
  "description": "string"
}
```

**Response:**
```json
{
  "success": true,
  "jobNumber": "string"
}
```

#### PUT /api/jobs/{jobNumber}
Updates an existing job.

**URL Parameters:**
- jobNumber (string)

**Request Body:**
```json
{
  "status": "PENDING | IN_PROGRESS | COMPLETED",
  "priority": "LOW | MEDIUM | HIGH",
  "description": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job updated successfully"
}
```

#### DELETE /api/jobs/{jobNumber}
Deletes a job.

**URL Parameters:**
- jobNumber (string)

**Response:**
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "string",
  "errors": [
    {
      "field": "string",
      "message": "string"
    }
  ]
}
```

### HTTP Status Codes
- 200: Success
- 400: Bad Request (Validation Error)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

### Common Error Types
1. ValidationError: Field validation failures
2. AuthError: Authentication/authorization failures
3. DatabaseError: Database operation failures
4. ApiError: General API errors

## Rate Limiting
- 100 requests per minute per IP
- Rate limit headers included in response:
  * X-RateLimit-Limit
  * X-RateLimit-Remaining
  * X-RateLimit-Reset

## Data Models

### Job
```typescript
interface Job {
  id: string;
  jobNumber: string;
  clientId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### User
```typescript
interface User {
  userId: string;
  email: string;
  roles: string[];
}
```

## Best Practices
1. Always include Authorization header for authenticated endpoints
2. Handle rate limiting with exponential backoff
3. Implement proper error handling
4. Use pagination for large datasets
5. Cache responses when appropriate
