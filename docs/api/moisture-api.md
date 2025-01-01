# Moisture Mapping API

API for managing moisture readings and locations in inspection reports.

## Base URL
`https://api.example.com/v1`

## Version
API Version: 1.0.0

## Authentication

Bearer token authentication is required for most endpoints. Include the JWT token in the Authorization header.

### Authentication Header Example
```bash
Authorization: Bearer <token>
```

## Endpoints

### POST /api/moisture/readings
Create a new moisture reading for a location.

**Requires Authentication**

#### Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| locationId | string | Yes | ID of the location to record reading for |

#### Request Body
Moisture reading data

```json
{
  "type": "object",
  "properties": {
    "value": {
      "type": "number",
      "description": "Moisture reading value (percentage)",
      "minimum": 0,
      "maximum": 100
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "Time of reading (ISO 8601)"
    },
    "notes": {
      "type": "string",
      "description": "Optional notes about the reading"
    }
  },
  "required": ["value"]
}
```

#### Responses

##### 200 Response
Reading created successfully

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique identifier for the reading"
    },
    "locationId": {
      "type": "string",
      "description": "Location ID"
    },
    "value": {
      "type": "number",
      "description": "Moisture reading value"
    },
    "timestamp": {
      "type": "string",
      "description": "Time of reading"
    },
    "notes": {
      "type": "string",
      "description": "Optional notes"
    }
  }
}
```

##### 400 Response
Invalid request

```json
{
  "type": "object",
  "properties": {
    "error": {
      "type": "string",
      "description": "Error message"
    },
    "details": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Detailed error messages"
    }
  }
}
```

##### 401 Response
Unauthorized

```json
{
  "type": "object",
  "properties": {
    "error": {
      "type": "string",
      "description": "Authentication error message"
    }
  }
}
```

#### Examples

##### Create Reading Example
###### Request
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs...",
    "Content-Type": "application/json"
  },
  "body": {
    "value": 45.5,
    "timestamp": "2024-01-15T12:00:00Z",
    "notes": "North wall reading"
  }
}
```

###### Response
```json
{
  "id": "read_123abc",
  "locationId": "loc_456def",
  "value": 45.5,
  "timestamp": "2024-01-15T12:00:00Z",
  "notes": "North wall reading"
}
```

### GET /api/moisture/readings/{locationId}
Get moisture readings for a specific location.

**Requires Authentication**

#### Parameters
| Name | Type | Required | Description |
| --- | --- | --- | --- |
| locationId | string | Yes | ID of the location |
| startDate | string | No | Filter readings from this date (ISO 8601) |
| endDate | string | No | Filter readings until this date (ISO 8601) |
| limit | number | No | Maximum number of readings to return (default: 100) |

#### Responses

##### 200 Response
List of readings

```json
{
  "type": "object",
  "properties": {
    "readings": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "value": {
            "type": "number"
          },
          "timestamp": {
            "type": "string"
          },
          "notes": {
            "type": "string"
          }
        }
      }
    },
    "pagination": {
      "type": "object",
      "properties": {
        "total": {
          "type": "number"
        },
        "hasMore": {
          "type": "boolean"
        }
      }
    }
  }
}
```

#### Examples

##### Get Readings Example
###### Request
```bash
GET /api/moisture/readings/loc_456def?startDate=2024-01-01T00:00:00Z&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

###### Response
```json
{
  "readings": [
    {
      "id": "read_123abc",
      "value": 45.5,
      "timestamp": "2024-01-15T12:00:00Z",
      "notes": "North wall reading"
    }
  ],
  "pagination": {
    "total": 1,
    "hasMore": false
  }
}
```

## Additional Examples

### Curl Example
Example using curl to create a reading:

```bash
curl -X POST https://api.example.com/v1/moisture/readings \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "value": 45.5,
    "timestamp": "2024-01-15T12:00:00Z",
    "notes": "North wall reading"
  }'
