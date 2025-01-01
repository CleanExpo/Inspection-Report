# Client Information Implementation Segment

## Current Segment Focus: Client Data Structure & Validation

### Phase 1: Core Data Structure
- [x] Define client information schema
  - [x] Basic contact details (name, email, phone)
  - [x] Property information (address, city, state, zipCode)
  - [x] Contact preferences (contactPerson, notes)
- [x] Define job relationship schema
  - [x] Job status and priority enums
  - [x] Core job fields
  - [x] Client-Job relationship
- [x] Update TypeScript types
  - [x] Client interface
  - [x] Job interface
  - [x] Form data types

### Phase 2: Validation Layer
- [x] Create validation utilities
  - [x] Phone number format (regex validation)
  - [x] Email format (regex validation)
  - [x] Address verification (with formatting)
  - [x] Required fields validation
  - [x] State and ZIP code validation
  - [x] City validation
  - [x] Contact person validation
  - [x] Notes length validation
- [x] Update job validation
  - [x] Simplified status enum
  - [x] Simplified priority enum
  - [x] Category validation

### Phase 3: API Integration
- [x] Design API endpoints
  - [x] GET /api/client (list with pagination)
  - [x] POST /api/client (create)
  - [x] GET /api/client/[id] (get single)
  - [x] PUT /api/client/[id] (update)
  - [x] DELETE /api/client/[id] (delete)
  - [x] POST /api/client/validate (validation)
- [x] Implement CRUD operations
  - [x] Client creation with validation
  - [x] Client retrieval with job relations
  - [x] Client update with validation
  - [x] Client deletion with job checks
- [x] Add error handling
  - [x] Validation errors
  - [x] Not found errors
  - [x] Database errors
  - [x] Business logic errors (e.g., cannot delete client with jobs)

### Phase 4: Testing & Documentation
- [x] Unit tests for validation
  - [x] Email validation tests
  - [x] Phone validation tests
  - [x] State/ZIP validation tests
  - [x] Client data validation tests
- [x] API endpoint tests
  - [x] GET /api/client (list) tests
  - [x] POST /api/client (create) tests
  - [x] GET /api/client/[id] tests
  - [x] PUT /api/client/[id] tests
  - [x] DELETE /api/client/[id] tests
  - [x] POST /api/client/validate tests
- [x] Update API documentation
  - [x] Endpoint descriptions and usage
  - [x] Request/response examples
  - [x] Error handling guide
  - [x] Authentication requirements

## Implementation Steps (Current Focus: Integration)
1. Update implementation guides:
   - Client data structure overview
   - Validation rules documentation
   - Integration examples
2. Review and finalize documentation:
   - Verify all endpoints are documented
   - Ensure examples are up to date
   - Check for completeness

## Dependencies
- Existing job number validation
- Current job creation API
- Prisma schema modifications

## Next Segment
Once this segment is complete, we'll move on to:
1. API endpoint implementation
2. Error handling
3. Documentation updates
