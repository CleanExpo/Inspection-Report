# Input Validation Rules

## Common Validations

### Job ID
```typescript
{
  jobId: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 50,
    pattern: '^[A-Za-z0-9-]+$'
  }
}
```

### Date Range
```typescript
{
  startDate: {
    type: 'string',
    format: 'date-time',
    required: false
  },
  endDate: {
    type: 'string',
    format: 'date-time',
    required: false,
    rules: ['must be after startDate']
  }
}
```

## Endpoint-Specific Validations

### GET /readings
```typescript
{
  query: {
    jobId: 'common.jobId',
    startDate: 'common.startDate',
    endDate: 'common.endDate',
    room: {
      type: 'string',
      required: false,
      minLength: 1,
      maxLength: 100
    },
    floor: {
      type: 'string',
      required: false,
      minLength: 1,
      maxLength: 50
    }
  }
}
```

### POST /readings
```typescript
{
  body: {
    jobId: 'common.jobId',
    room: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 100
    },
    floor: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 50
    },
    locationX: {
      type: 'number',
      required: true,
      minimum: 0,
      maximum: 10000
    },
    locationY: {
      type: 'number',
      required: true,
      minimum: 0,
      maximum: 10000
    },
    equipmentId: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 50
    },
    floorPlanId: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 50
    },
    temperature: {
      type: 'number',
      required: false,
      minimum: -50,
      maximum: 100
    },
    humidity: {
      type: 'number',
      required: false,
      minimum: 0,
      maximum: 100
    },
    pressure: {
      type: 'number',
      required: false,
      minimum: 800,
      maximum: 1200
    },
    notes: {
      type: 'string',
      required: false,
      maxLength: 1000
    }
  }
}
```

### POST /readings/:id/datapoints
```typescript
{
  params: {
    id: {
      type: 'string',
      required: true,
      pattern: '^[A-Za-z0-9-]+$'
    }
  },
  body: {
    value: {
      type: 'number',
      required: true,
      minimum: 0,
      maximum: 100
    },
    unit: {
      type: 'string',
      required: true,
      enum: ['percentage', 'relative']
    },
    depth: {
      type: 'number',
      required: false,
      minimum: 0,
      maximum: 1000
    }
  }
}
```

### GET /analytics
```typescript
{
  query: {
    jobId: 'common.jobId',
    type: {
      type: 'string',
      required: true,
      enum: ['trend', 'hotspot', 'summary']
    },
    startDate: 'common.startDate',
    endDate: 'common.endDate'
  }
}
```

## Validation Implementation

1. Use Zod or Joi for schema validation
2. Validate at API route level before processing
3. Return 400 Bad Request for validation failures
4. Include detailed error messages in response
5. Log validation failures for monitoring

## Error Messages
- Provide clear, actionable error messages
- Include field name and validation rule that failed
- Suggest correct format where applicable
- Support i18n for error messages
