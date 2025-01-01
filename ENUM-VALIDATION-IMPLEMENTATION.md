# Enum Validation Implementation

## Overview
This document details the implementation of enum validation for job-related fields in the moisture mapping system. This serves as a reference to prevent unwanted code changes and maintain consistency.

## Enum Definitions

### Job Status
```typescript
enum JobStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    PAUSED = 'PAUSED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}
```

### Job Priority
```typescript
enum JobPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
}
```

### Job Category
```typescript
enum JobCategory {
    WATER_DAMAGE = 'WATER_DAMAGE',
    FLOOD = 'FLOOD',
    LEAK = 'LEAK',
    STORM_DAMAGE = 'STORM_DAMAGE',
    OTHER = 'OTHER'
}
```

## Implementation Details

### Location of Implementations
- Enum definitions: `app/utils/jobValidation.ts`
- Validation functions: `app/utils/jobValidation.ts`
- Service integration: `services/moistureService.ts`
- Database schema: `prisma/schema.prisma`

### Validation Functions
Each enum has its own validation function that ensures values match the defined enum:
- `validateJobStatus(status: string)`
- `validateJobPriority(priority: string)`
- `validateJobCategory(category: string)`

### Default Values
When creating new jobs:
- Status: PENDING
- Priority: MEDIUM
- Category: WATER_DAMAGE

## Service Integration

### Type Safety
- Created `JobCreateData` type to ensure type safety with Prisma
- Removed duplicate enum imports from moisture types
- Using validation functions before database operations

### Validation Flow
1. Input validation in createMoistureData
2. Default value assignment
3. Enum validation
4. Database operation with validated data

## Important Notes

### Schema Alignment
- Enum values must match exactly between:
  - Prisma schema
  - Validation enums
  - Database enum types

### Type Handling
- Use the enums from jobValidation.ts
- Avoid duplicate enum definitions
- Cast string values to enum types when needed

### Error Handling
- All validation functions throw JobValidationError
- Error messages include list of valid values
- Service layer catches and logs validation errors

## Testing
- Test coverage includes:
  - Valid enum values
  - Invalid values
  - Case sensitivity
  - Empty/null handling

## Future Considerations
1. Keep enum definitions synchronized with Prisma schema
2. Maintain test coverage when adding new enum values
3. Update validation messages if enum values change
4. Consider adding validation at API layer
