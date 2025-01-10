# Readings API

## Overview

The Readings API provides endpoints for managing moisture readings, including data collection, analysis, and historical tracking. It supports both individual readings and batch operations.

## Reading Structure

```typescript
{
  "id": "read_123456",
  "jobId": "2024-0105-001",
  "equipmentId": "equip_789",
  "value": 15.7,
  "materialType": "WOOD",
  "location": {
    "x": 123.45,
    "y": 67.89,
    "z": 0,
    "floor": 1,
    "room": "Living Room",
    "notes": "North wall"
  },
  "metadata": {
    "temperature": 22.5,
    "humidity": 45.8,
    "pressure": 1013.2,
    "depth": 0.5,
    "surfaceType": "PAINTED"
  },
  "confidence": 0.95,
  "calibration": {
    "lastCalibrated": "2024-01-01T00:00:00Z",
    "calibrationFactor": 1.02,
    "referenceValue": 15.0
  },
  "timestamp": "2024-01-05T14:30:00Z",
  "inspector": {
    "id": "inspector_456",
    "name": "John Doe"
  }
}
```

## Endpoints

### List Readings

```http
GET /v1/readings
```

Retrieves a list of readings with optional filtering and pagination.

#### Query Parameters
- `jobId` - Filter by job ID
- `materialType` - Filter by material type
- `minValue` - Filter by minimum value
- `maxValue` - Filter by maximum value
- `startDate` - Filter by start date
- `endDate` - Filter by end date
- `equipmentId` - Filter by equipment
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

#### Response
```json
{
  "success": true,
  "data": {
    "readings": [
      {
        "id": "read_123456",
        // ... other reading fields
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "pages": 3
    },
    "statistics": {
      "average": 15.2,
      "min": 10.5,
      "max": 22.3,
      "standardDeviation": 2.1
    }
  }
}
```

### Create Reading

```http
POST /v1/readings
```

Creates a new moisture reading.

#### Request Body
```json
{
  "jobId": "2024-0105-001",
  "equipmentId": "equip_789",
  "value": 15.7,
  "materialType": "WOOD",
  "location": {
    "x": 123.45,
    "y": 67.89,
    "z": 0,
    "floor": 1,
    "room": "Living Room"
  },
  "metadata": {
    "temperature": 22.5,
    "humidity": 45.8,
    "depth": 0.5
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "reading": {
      "id": "read_123456",
      // ... other reading fields
    }
  }
}
```

### Batch Create Readings

```http
POST /v1/readings/batch
```

Creates multiple readings in a single request.

#### Request Body
```json
{
  "readings": [
    {
      "jobId": "2024-0105-001",
      "equipmentId": "equip_789",
      "value": 15.7,
      "materialType": "WOOD",
      // ... other reading fields
    }
  ],
  "options": {
    "validateAll": true,
    "skipDuplicates": true
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "created": 10,
    "failed": 0,
    "readings": [
      {
        "id": "read_123456",
        // ... other reading fields
      }
    ]
  }
}
```

### Get Reading

```http
GET /v1/readings/{readingId}
```

Retrieves details of a specific reading.

#### Response
```json
{
  "success": true,
  "data": {
    "reading": {
      "id": "read_123456",
      // ... other reading fields
    }
  }
}
```

### Update Reading

```http
PATCH /v1/readings/{readingId}
```

Updates an existing reading.

#### Request Body
```json
{
  "value": 16.2,
  "metadata": {
    "notes": "Updated after recalibration"
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "reading": {
      "id": "read_123456",
      // ... updated reading fields
    }
  }
}
```

### Delete Reading

```http
DELETE /v1/readings/{readingId}
```

Marks a reading as deleted (soft delete).

#### Response
```json
{
  "success": true,
  "data": {
    "message": "Reading successfully deleted"
  }
}
```

### Get Reading Statistics

```http
GET /v1/readings/stats
```

Retrieves statistical analysis of readings.

#### Query Parameters
- `jobId` - Filter by job ID
- `materialType` - Filter by material type
- `startDate` - Start of analysis period
- `endDate` - End of analysis period

#### Response
```json
{
  "success": true,
  "data": {
    "statistics": {
      "count": 150,
      "average": 15.2,
      "median": 15.0,
      "min": 10.5,
      "max": 22.3,
      "standardDeviation": 2.1,
      "byMaterial": {
        "WOOD": {
          "count": 100,
          "average": 15.5
        },
        "CONCRETE": {
          "count": 50,
          "average": 14.6
        }
      },
      "trends": {
        "overall": "STABLE",
        "changeRate": 0.1,
        "volatility": 0.05
      }
    }
  }
}
```

## Material Types

| Type | Description | Normal Range |
|------|-------------|--------------|
| WOOD | Wood materials | 6-15% |
| CONCRETE | Concrete surfaces | 2-5% |
| DRYWALL | Gypsum wallboard | 0.5-1% |
| CARPET | Carpet and padding | 2-8% |
| TILE | Tile and grout | 0-2% |

## Reading Validation

### Value Ranges
- Each material type has specific valid ranges
- Values outside ranges require confirmation
- Extreme values trigger alerts

### Required Metadata
- Temperature
- Humidity
- Equipment calibration status
- Location coordinates

### Quality Checks
- Equipment calibration current
- Environmental conditions valid
- Location within bounds
- Timestamp reasonable

## Error Handling

### Common Error Codes

| Code | Description |
|------|-------------|
| READING_NOT_FOUND | Reading ID does not exist |
| INVALID_VALUE | Reading value out of range |
| CALIBRATION_EXPIRED | Equipment needs calibration |
| INVALID_LOCATION | Location coordinates invalid |
| MISSING_METADATA | Required metadata missing |

### Error Response Example

```json
{
  "success": false,
  "error": {
    "code": "INVALID_VALUE",
    "message": "Reading value outside valid range for material type",
    "details": {
      "value": 45.2,
      "materialType": "WOOD",
      "validRange": {
        "min": 6,
        "max": 15
      }
    }
  }
}
```

## Webhooks

Readings API supports webhooks for real-time updates:

```http
POST https://your-webhook-url.com
```

### Example Webhook Payload
```json
{
  "event": "reading.created",
  "readingId": "read_123456",
  "timestamp": "2024-01-05T14:30:00Z",
  "data": {
    "value": 15.7,
    "materialType": "WOOD",
    "location": {
      "room": "Living Room"
    }
  }
}
```

## Rate Limiting

Reading endpoints have the following rate limits:

- List: 120 requests per minute
- Create: 60 requests per minute
- Batch Create: 30 requests per minute
- Update: 60 requests per minute
- Delete: 30 requests per minute

## Best Practices

1. **Data Collection**
   - Verify equipment calibration
   - Record environmental conditions
   - Include detailed location info
   - Note surface conditions

2. **Batch Operations**
   - Use batch endpoints for multiple readings
   - Include validation options
   - Handle partial failures
   - Maintain order consistency

3. **Quality Control**
   - Validate against normal ranges
   - Check for anomalies
   - Record confidence levels
   - Document unusual conditions

4. **Performance**
   - Use pagination for large datasets
   - Cache frequent queries
   - Batch related readings
   - Compress large payloads

## Support

For readings management issues:
- Email: support@inspection-report.com
- Phone: +1 (555) 123-4567
- Documentation: https://docs.inspection-report.com/readings
