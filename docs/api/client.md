# Client API Documentation

## Overview
The Client API provides endpoints for managing client information in the system. All endpoints require authentication and return responses in JSON format.

## Authentication
All endpoints require a valid authentication token in the Authorization header:
```
Authorization: Bearer {your-token}
```

## Endpoints

### List Clients
```http
GET /api/client
```

Retrieves a paginated list of clients.

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for filtering clients by name or email

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "client-id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "123-456-7890",
      "address": "123 Main St",
      "city": "Los Angeles",
      "state": "CA",
      "zipCode": "90001",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### Create Client
```http
POST /api/client
```

Creates a new client with the provided information.

#### Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "123-456-7890",
  "address": "123 Main St",
  "city": "Los Angeles",
  "state": "CA",
  "zipCode": "90001"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "client-id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "address": "123 Main St",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Get Client
```http
GET /api/client/{id}
```

Retrieves a specific client by ID.

#### Parameters
- `id`: Client ID (in URL path)

#### Response
```json
{
  "success": true,
  "data": {
    "id": "client-id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "address": "123 Main St",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Update Client
```http
PUT /api/client/{id}
```

Updates an existing client's information.

#### Parameters
- `id`: Client ID (in URL path)

#### Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "123-456-7890",
  "address": "123 Main St",
  "city": "Los Angeles",
  "state": "CA",
  "zipCode": "90001"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "client-id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "address": "123 Main St",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Delete Client
```http
DELETE /api/client/{id}
```

Deletes a client. Will fail if the client has associated jobs.

#### Parameters
- `id`: Client ID (in URL path)

#### Response
```json
{
  "success": true,
  "message": "Client deleted successfully"
}
```

### Validate Client Data
```http
POST /api/client/validate
```

Validates client data without creating a record.

#### Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "123-456-7890",
  "address": "123 Main St",
  "city": "Los Angeles",
  "state": "CA",
  "zipCode": "90001"
}
```

#### Response
```json
{
  "success": true,
  "message": "Client data is valid"
}
```

## Error Responses

### Validation Error
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": {
      "email": "Invalid email format",
      "phone": "Invalid phone number format"
    }
  }
}
```

### Not Found Error
```json
{
  "success": false,
  "error": {
    "message": "Client not found"
  }
}
```

### Business Logic Error
```json
{
  "success": false,
  "error": {
    "message": "Cannot delete client with existing jobs"
  }
}
```

## Data Validation Rules

### Required Fields
- name: String (1-100 characters)
- email: Valid email format
- phone: Format XXX-XXX-XXXX
- address: String (1-200 characters)
- city: String (1-100 characters)
- state: Valid US state code (2 characters)
- zipCode: Valid US ZIP code format

### Optional Fields
None - all fields are required for client records.

## Rate Limiting
- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user

## Notes
- All timestamps are in ISO 8601 format
- All responses include a `success` boolean indicating the operation status
- Pagination is available for list endpoints
- Search is case-insensitive and matches partial strings
