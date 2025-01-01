# API Response Types

## Common Response Envelope
```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}
```

## Endpoint-Specific Responses

### GET /readings
```typescript
interface MoistureReadingResponse {
  id: string;
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
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

type GetReadingsResponse = ApiResponse<{
  readings: MoistureReadingResponse[];
}>;
```

### POST /readings
```typescript
type CreateReadingResponse = ApiResponse<{
  reading: MoistureReadingResponse;
}>;
```

### GET /readings/:id
```typescript
interface DataPointResponse {
  id: string;
  value: number;
  unit: string;
  depth?: number;
  createdAt: string; // ISO date string
}

interface DetailedMoistureReadingResponse extends MoistureReadingResponse {
  dataPoints: DataPointResponse[];
}

type GetReadingDetailsResponse = ApiResponse<{
  reading: DetailedMoistureReadingResponse;
}>;
```

### POST /readings/:id/datapoints
```typescript
type CreateDataPointResponse = ApiResponse<{
  dataPoint: DataPointResponse;
}>;
```

### GET /analytics
```typescript
interface TrendAnalytics {
  type: 'trend';
  timePoints: Array<{
    timestamp: string;
    average: number;
    min: number;
    max: number;
  }>;
}

interface HotspotAnalytics {
  type: 'hotspot';
  areas: Array<{
    room: string;
    floor: string;
    locationX: number;
    locationY: number;
    severity: 'low' | 'medium' | 'high';
    value: number;
  }>;
}

interface SummaryAnalytics {
  type: 'summary';
  totalReadings: number;
  averageValue: number;
  criticalAreas: number;
  lastUpdated: string;
}

type AnalyticsResponse = ApiResponse<
  TrendAnalytics | HotspotAnalytics | SummaryAnalytics
>;
```

## Data Transformation Rules

### Date/Time Handling
- All timestamps in ISO 8601 format
- UTC timezone for storage
- Client timezone for display
- Include timezone offset in responses

### Numeric Values
- Round to 2 decimal places
- Use null for missing values
- Include units where applicable
- Handle unit conversions server-side

### String Fields
- Trim whitespace
- Sanitize HTML/special characters
- Normalize case for consistency
- Handle multi-language content

## Pagination

### Request Parameters
```typescript
interface PaginationParams {
  page?: number;    // 1-based
  limit?: number;   // items per page
  cursor?: string;  // for cursor-based pagination
}
```

### Response Metadata
```typescript
interface PaginationMeta {
  page: number;     // current page
  limit: number;    // items per page
  total: number;    // total items
  hasMore: boolean; // more pages available
  cursor?: string;  // next page cursor
}
```

## Caching

### Cache Headers
```typescript
{
  'Cache-Control': 'private, max-age=300',
  'ETag': 'W/"hash"',
  'Last-Modified': 'timestamp'
}
```

### Cacheable Endpoints
- GET /readings (5 minutes)
- GET /readings/:id (5 minutes)
- GET /analytics (1 minute)
