# Core API Endpoints Documentation

## Overview
This document covers the core API endpoints for the moisture mapping system. Each endpoint is documented with its request/response format and example usage.

## Base URL
```
/api/moisture
```

## Endpoints

### Floor Plan Management

#### GET /api/moisture/floorplan
Retrieves floor plan data for moisture mapping.

**Request**
```typescript
interface FloorPlanRequest {
  projectId: string;
  version?: string;
}
```

**Response**
```typescript
interface FloorPlanResponse {
  id: string;
  projectId: string;
  version: string;
  data: {
    dimensions: {
      width: number;
      height: number;
    };
    measurements: MeasurementPoint[];
  };
}
```

**Example**
```javascript
// Request
GET /api/moisture/floorplan?projectId=123&version=1.0

// Response
{
  "id": "fp_123",
  "projectId": "123",
  "version": "1.0",
  "data": {
    "dimensions": {
      "width": 1000,
      "height": 800
    },
    "measurements": [...]
  }
}
```

### Equipment Management

#### GET /api/moisture/equipment
Retrieves equipment data and calibration status.

**Request**
```typescript
interface EquipmentRequest {
  equipmentId: string;
}
```

**Response**
```typescript
interface EquipmentResponse {
  id: string;
  type: string;
  calibrationDate: string;
  status: 'active' | 'maintenance' | 'retired';
  readings: {
    accuracy: number;
    lastCalibration: string;
  };
}
```

**Example**
```javascript
// Request
GET /api/moisture/equipment?equipmentId=eq_456

// Response
{
  "id": "eq_456",
  "type": "moisture_meter",
  "calibrationDate": "2024-01-15",
  "status": "active",
  "readings": {
    "accuracy": 98.5,
    "lastCalibration": "2024-01-15T10:00:00Z"
  }
}
```

## Common Response Formats

### Success Response
```typescript
interface SuccessResponse<T> {
  status: 'success';
  data: T;
  timestamp: string;
}
```

### Error Response
```typescript
interface ErrorResponse {
  status: 'error';
  code: string;
  message: string;
  details?: any;
}
```

## Request Headers
```
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json
