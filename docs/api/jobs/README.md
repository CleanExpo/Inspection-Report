# Jobs API

## Overview

The Jobs API provides endpoints for managing inspection jobs, including creation, scheduling, assignment, and status tracking. It supports both single job operations and bulk management features.

## Job Structure

```typescript
{
  "id": "2024-0105-001",
  "status": "IN_PROGRESS",
  "type": "MOISTURE_INSPECTION",
  "priority": "HIGH",
  "client": {
    "id": "client_123",
    "name": "Acme Corp"
  },
  "location": {
    "address": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zip": "62701",
    "coordinates": {
      "lat": 39.7817,
      "lng": -89.6501
    }
  },
  "schedule": {
    "startDate": "2024-01-05T09:00:00Z",
    "endDate": "2024-01-05T17:00:00Z",
    "estimatedDuration": 480
  },
  "assignedTo": {
    "id": "inspector_456",
    "name": "John Doe"
  },
  "equipment": [
    {
      "id": "equip_789",
      "type": "MOISTURE_METER",
      "model": "Pro X1000"
    }
  ],
  "metadata": {
    "propertyType": "COMMERCIAL",
    "squareFootage": 5000,
    "floors": 2
  },
  "createdAt": "2024-01-01T12:00:00Z",
  "updatedAt": "2024-01-05T15:30:00Z"
}
```

## Endpoints

### List Jobs

```http
GET /v1/jobs
```

Retrieves a list of jobs with optional filtering and pagination.

#### Query Parameters
- `status` - Filter by job status
- `type` - Filter by job type
- `priority` - Filter by priority
- `assignedTo` - Filter by assigned inspector
- `startDate` - Filter by start date range
- `endDate` - Filter by end date range
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

#### Response
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "2024-0105-001",
        "status": "IN_PROGRESS",
        // ... other job fields
      }
    ]
  },
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

### Create Job

```http
POST /v1/jobs
```

Creates a new job.

#### Request Body
```json
{
  "type": "MOISTURE_INSPECTION",
  "priority": "HIGH",
  "clientId": "client_123",
  "location": {
    "address": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zip": "62701"
  },
  "schedule": {
    "startDate": "2024-01-05T09:00:00Z",
    "estimatedDuration": 480
  },
  "assignedTo": "inspector_456",
  "equipment": ["equip_789"],
  "metadata": {
    "propertyType": "COMMERCIAL",
    "squareFootage": 5000,
    "floors": 2
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "2024-0105-001",
      // ... other job fields
    }
  }
}
```

### Get Job

```http
GET /v1/jobs/{jobId}
```

Retrieves details of a specific job.

#### Response
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "2024-0105-001",
      // ... other job fields
    }
  }
}
```

### Update Job

```http
PATCH /v1/jobs/{jobId}
```

Updates an existing job.

#### Request Body
```json
{
  "status": "COMPLETED",
  "schedule": {
    "endDate": "2024-01-05T16:30:00Z"
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "2024-0105-001",
      // ... updated job fields
    }
  }
}
```

### Delete Job

```http
DELETE /v1/jobs/{jobId}
```

Marks a job as deleted (soft delete).

#### Response
```json
{
  "success": true,
  "data": {
    "message": "Job successfully deleted"
  }
}
```

### Assign Job

```http
POST /v1/jobs/{jobId}/assign
```

Assigns a job to an inspector.

#### Request Body
```json
{
  "inspectorId": "inspector_456",
  "note": "Priority assignment for water damage"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "2024-0105-001",
      "assignedTo": {
        "id": "inspector_456",
        "name": "John Doe"
      }
      // ... other job fields
    }
  }
}
```

### Update Job Status

```http
POST /v1/jobs/{jobId}/status
```

Updates the job status.

#### Request Body
```json
{
  "status": "IN_PROGRESS",
  "note": "Started moisture readings"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "2024-0105-001",
      "status": "IN_PROGRESS"
      // ... other job fields
    }
  }
}
```

## Job Statuses

| Status | Description |
|--------|-------------|
| PENDING | Job created but not started |
| SCHEDULED | Job scheduled for future date |
| IN_PROGRESS | Job currently being performed |
| ON_HOLD | Job temporarily paused |
| COMPLETED | Job finished successfully |
| CANCELLED | Job cancelled before completion |

## Job Types

| Type | Description |
|------|-------------|
| MOISTURE_INSPECTION | Standard moisture inspection |
| MOLD_ASSESSMENT | Mold inspection and assessment |
| WATER_DAMAGE | Water damage inspection |
| THERMAL_IMAGING | Thermal imaging inspection |
| EQUIPMENT_CALIBRATION | Equipment calibration check |

## Priority Levels

| Priority | Description |
|----------|-------------|
| LOW | Regular scheduled inspection |
| MEDIUM | Time-sensitive inspection |
| HIGH | Urgent inspection needed |
| CRITICAL | Emergency response required |

## Error Handling

### Common Error Codes

| Code | Description |
|------|-------------|
| JOB_NOT_FOUND | Job ID does not exist |
| INVALID_STATUS | Invalid job status |
| SCHEDULING_CONFLICT | Time slot already booked |
| INSPECTOR_UNAVAILABLE | Assigned inspector not available |
| EQUIPMENT_UNAVAILABLE | Required equipment not available |

### Error Response Example

```json
{
  "success": false,
  "error": {
    "code": "SCHEDULING_CONFLICT",
    "message": "Inspector already assigned to another job at this time",
    "details": {
      "conflictingJobId": "2024-0105-002",
      "timeSlot": "2024-01-05T09:00:00Z"
    }
  }
}
```

## Webhooks

Jobs API supports webhooks for real-time updates:

```http
POST https://your-webhook-url.com
```

### Example Webhook Payload
```json
{
  "event": "job.status_updated",
  "jobId": "2024-0105-001",
  "timestamp": "2024-01-05T15:30:00Z",
  "data": {
    "oldStatus": "IN_PROGRESS",
    "newStatus": "COMPLETED",
    "updatedBy": "inspector_456"
  }
}
```

## Rate Limiting

Job management endpoints have the following rate limits:

- List: 60 requests per minute
- Create: 30 requests per minute
- Update: 60 requests per minute
- Delete: 30 requests per minute

## Best Practices

1. **Job Creation**
   - Validate all required fields
   - Check equipment availability
   - Verify inspector schedules
   - Include detailed metadata

2. **Status Updates**
   - Update status promptly
   - Include detailed notes
   - Trigger notifications
   - Log all changes

3. **Scheduling**
   - Check for conflicts
   - Consider travel time
   - Allow buffer time
   - Account for time zones

4. **Assignment**
   - Check inspector qualifications
   - Verify equipment certifications
   - Consider location proximity
   - Balance workload

## Support

For job management issues:
- Email: support@inspection-report.com
- Phone: +1 (555) 123-4567
- Documentation: https://docs.inspection-report.com/jobs
