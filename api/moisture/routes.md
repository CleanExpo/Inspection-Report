# Moisture API Routes

## Base URL
`/api/moisture`

## Endpoints

### Get Readings
```
GET /readings
```
Parameters:
- jobId (required): string
- startDate (optional): ISO date string
- endDate (optional): ISO date string
- room (optional): string
- floor (optional): string

Authentication: Required
Response: Array of MoistureReading objects

### Create Reading
```
POST /readings
```
Body:
```typescript
{
  jobId: string;
  room: string;
  floor: string;
  locationX: number;
  locationY: number;
  equipmentId: string;
  floorPlanId: string;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  notes?: string;
}
```
Authentication: Required
Response: Created MoistureReading object

### Get Reading Details
```
GET /readings/:id
```
Parameters:
- id (required): string

Authentication: Required
Response: MoistureReading object with dataPoints

### Add Data Point
```
POST /readings/:id/datapoints
```
Parameters:
- id (required): string

Body:
```typescript
{
  value: number;
  unit: string;
  depth?: number;
}
```
Authentication: Required
Response: Created DataPoint object

### Get Analytics
```
GET /analytics
```
Parameters:
- jobId (required): string
- type (required): 'trend' | 'hotspot' | 'summary'
- startDate (optional): ISO date string
- endDate (optional): ISO date string

Authentication: Required
Response: Analytics object based on type

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Rate Limiting
- 100 requests per minute per IP
- 1000 requests per hour per user

## Versioning
Current version: v1
Version header: X-API-Version
