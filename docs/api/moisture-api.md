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
  "required": [
    "value"
  ]
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
#### Examples
##### Create Reading Example
###### Request
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs...",
  "Content-Type": "application/json"
}
```
```json
{
  "value": 45.5,
  "timestamp": "2024-01-15T12:00:00Z",
  "notes": "North wall reading"
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
## Additional Examples
### Curl Example
Example using curl to create a reading

```bash
curl -X POST https://api.example.com/v1/moisture/readings \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "value": 45.5,
    "timestamp": "2024-01-15T12:00:00Z",
    "notes": "North wall reading"
  }'
```
