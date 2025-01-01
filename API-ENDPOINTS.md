# Moisture Mapping API Documentation

## Job Management Endpoints

### Create Job with Moisture Data
Creates a new job with associated moisture data.

**Endpoint:** `POST /api/moisture`

**Request Body:**
```typescript
{
    jobNumber: string;      // Format: YYYY-MMDD-XXX
    floorPlan?: string;     // Optional: Base64 encoded image
    clientName?: string;    // Optional: Defaults to "Unknown Client"
    jobAddress?: string;    // Optional: Defaults to "Address Pending"
    priority?: JobPriority; // Optional: Defaults to MEDIUM
    category?: JobCategory; // Optional: Defaults to WATER_DAMAGE
}
```

**Enum Values:**
- JobPriority: LOW, MEDIUM, HIGH, URGENT
- JobCategory: WATER_DAMAGE, FLOOD, LEAK, STORM_DAMAGE, OTHER
- JobStatus: PENDING (default), ACTIVE, PAUSED, COMPLETED, CANCELLED

**Validation Rules:**
1. Job Number:
   - Must match format YYYY-MMDD-XXX
   - Year must be between 2000 and current year + 1
   - Month must be valid (01-12)
   - Day must be valid for the given month
   - Sequence (XXX) must be between 001-999

2. Enums:
   - Priority must be a valid JobPriority value
   - Category must be a valid JobCategory value
   - Status is automatically set to PENDING

**Success Response:**
```typescript
{
    data: {
        id: string;
        jobNumber: string;
        clientName: string;
        jobAddress: string;
        status: JobStatus;
        priority: JobPriority;
        category: JobCategory;
        totalEquipmentPower: number;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        moistureData: {
            id: string;
            jobId: string;
            floorPlan: string | null;
            readings: [];
            equipment: [];
            annotations: [];
            createdAt: Date;
            updatedAt: Date;
        }
    }
}
```

**Error Responses:**

1. Invalid Job Number Format:
```json
{
    "error": "JobValidationError",
    "message": "Invalid job number format. Expected: YYYY-MMDD-XXX"
}
```

2. Invalid Enum Value:
```json
{
    "error": "JobValidationError",
    "message": "Invalid job priority. Must be one of: LOW, MEDIUM, HIGH, URGENT"
}
```

3. Database Error:
```json
{
    "error": "DatabaseError",
    "message": "Failed to create moisture data"
}
```

### Get Job Auto-Fill Data
Retrieves suggested auto-fill data based on job number patterns.

**Endpoint:** `GET /api/moisture/auto-fill/:jobNumber`

**Parameters:**
- jobNumber: Partial or complete job number

**Success Response:**
```json
{
    "suggestions": {
        "clientInfo": {
            "clientName": "Example Client",
            "jobAddress": "123 Example St",
            "commonLocations": ["Kitchen", "Bathroom", "Basement"]
        },
        "equipmentDefaults": {
            "commonTypes": ["DEHUMIDIFIER", "AIR_MOVER"],
            "defaultSettings": {
                "targetHumidity": 45,
                "fanSpeed": "MEDIUM"
            }
        },
        "materialDefaults": {
            "commonMaterials": ["Carpet", "Drywall", "Wood"],
            "defaultReadingLocations": [
                {"x": 0.2, "y": 0.3, "description": "North Wall"},
                {"x": 0.5, "y": 0.5, "description": "Center"}
            ]
        }
    },
    "recentPatterns": {
        "readingPatterns": [
            {
                "pattern": "Grid",
                "spacing": 0.5,
                "points": [[0,0], [0.5,0], [1,0]]
            }
        ],
        "equipmentPatterns": [
            {
                "pattern": "Perimeter",
                "spacing": 1.0,
                "types": ["AIR_MOVER"]
            }
        ]
    }
}
```

**Error Response:**
```json
{
    "error": "AutoFillError",
    "message": "No matching patterns found for job number"
}
```

### Apply Auto-Fill Data
Applies auto-fill data to a job.

**Endpoint:** `POST /api/moisture/:jobNumber/apply-auto-fill`

**Request Body:**
```typescript
{
    applyTypes: string[];    // Array of data types to apply: ["clientInfo", "equipment", "materials"]
    patternTypes?: string[]; // Optional: Specific patterns to apply ["Grid", "Perimeter"]
    customization?: {        // Optional: Customizations to apply
        spacing?: number,    // Grid spacing for readings
        rotation?: number    // Pattern rotation in degrees
    }
}
```

**Success Response:**
```json
{
    "message": "Auto-fill data applied successfully",
    "applied": {
        "clientInfo": true,
        "equipment": true,
        "materials": true,
        "patterns": ["Grid", "Perimeter"]
    }
}
```

**Error Response:**
```json
{
    "error": "AutoFillError",
    "message": "Failed to apply auto-fill data",
    "details": {
        "failedTypes": ["equipment"],
        "reason": "Invalid equipment configuration"
    }
}
```

### Get Moisture Data
Retrieves moisture data for a specific job.

**Endpoint:** `GET /api/moisture/:jobNumber`

**Parameters:**
- jobNumber: Job number in YYYY-MMDD-XXX format

**Success Response:**
Same structure as create endpoint response

**Error Response:**
```json
{
    "error": "NotFoundError",
    "message": "Moisture data not found for job number: 2024-0101-001"
}
```

### Save Moisture Data
Manually saves the current state of moisture data.

**Endpoint:** `POST /api/moisture/:jobNumber/save`

**Request Body:**
```typescript
{
    saveType: 'MANUAL' | 'AUTO',  // Type of save operation
    timestamp?: Date,             // Optional: Save timestamp
    metadata?: {                  // Optional: Additional save metadata
        version?: string,
        notes?: string,
        userId?: string
    }
}
```

**Success Response:**
```json
{
    "message": "Save successful",
    "details": {
        "saveId": "uuid-v4",
        "timestamp": "2024-01-22T10:30:00Z",
        "type": "MANUAL"
    }
}
```

**Error Response:**
```json
{
    "error": "SaveError",
    "message": "Failed to save moisture data",
    "details": {
        "reason": "Database connection error"
    }
}
```

### Auto-Save Configuration
Configures auto-save settings for moisture data.

**Endpoint:** `PUT /api/moisture/:jobNumber/auto-save`

**Request Body:**
```typescript
{
    enabled: boolean,           // Enable/disable auto-save
    interval?: number,         // Auto-save interval in minutes (default: 5)
    maxVersions?: number,      // Maximum versions to keep (default: 10)
    includeDrafts?: boolean    // Whether to save draft states (default: true)
}
```

**Success Response:**
```json
{
    "message": "Auto-save configuration updated",
    "config": {
        "enabled": true,
        "interval": 5,
        "maxVersions": 10,
        "includeDrafts": true
    }
}
```

**Error Response:**
```json
{
    "error": "ConfigurationError",
    "message": "Invalid auto-save configuration",
    "details": {
        "field": "interval",
        "reason": "Must be between 1 and 60 minutes"
    }
}
```

### Update Moisture Data
Updates moisture readings and equipment data for a job.

**Endpoint:** `PUT /api/moisture/:jobNumber`

**Request Body:**
```typescript
{
    readings?: Array<{
        value: number;
        locationX: number;
        locationY: number;
        material: string;
        timestamp?: Date;
        inspectionDay?: number;
        notes?: string;
    }>;
    equipment?: Array<{
        type: string;
        positionX: number;
        positionY: number;
        rotation?: number;
        operationalStatus?: string;
        power?: number;
        mode?: string;
        targetHumidity?: number;
        fanSpeed?: number;
        temperature?: number;
    }>;
}
```

**Success Response:**
Same structure as create endpoint response

**Error Response:**
```json
{
    "error": "NotFoundError",
    "message": "Moisture data not found"
}
```

### Delete Moisture Data
Deletes a job and its associated moisture data.

**Endpoint:** `DELETE /api/moisture/:jobNumber`

**Parameters:**
- jobNumber: Job number in YYYY-MMDD-XXX format

**Success Response:**
```json
{
    "message": "Successfully deleted moisture data"
}
```

**Error Response:**
```json
{
    "error": "NotFoundError",
    "message": "Job not found"
}
```

## Job Validation Endpoints

### Validate Job Number
Validates a job number format and components.

**Endpoint:** `POST /api/validate/job-number`

**Request Body:**
```typescript
{
    jobNumber: string;  // Format: YYYY-MMDD-XXX
}
```

**Validation Rules:**
1. Format must match: YYYY-MMDD-XXX
   - Must use hyphen (-) as separator
   - All components must be numeric
   - No empty strings allowed
2. Year (YYYY):
   - Must be between 2000 and current year + 1
   - Must be 4 digits
3. Month (MM):
   - Must be between 01 and 12
   - Must be 2 digits
4. Day (DD):
   - Must be valid for the given month
   - Must be 2 digits
   - Accounts for leap years (February 29th)
5. Sequence (XXX):
   - Must be between 001 and 999
   - Cannot be 000
   - Must be 3 digits, zero-padded

**Success Response:**
```json
{
    "valid": true,
    "message": "Job number is valid"
}
```

**Error Response:**
```json
{
    "error": "JobValidationError",
    "message": "Invalid job number format. Expected: YYYY-MMDD-XXX"
}
```

### Generate Job Number
Generates a new valid job number for the current date.

**Endpoint:** `POST /api/generate/job-number`

**Request Body:**
```typescript
{
    sequence?: number;  // Optional: Custom sequence number (1-999), will be zero-padded
}
```

**Notes:**
- If sequence is not provided, defaults to 001
- Generated number uses current system date
- Sequence is automatically padded with leading zeros (e.g., 5 becomes "005")

**Success Response:**
```json
{
    "jobNumber": "2024-0122-001"  // Example format
}
```

**Error Response:**
```json
{
    "error": "JobValidationError",
    "message": "Sequence number must be between 1 and 999"
}
```

### Validate Job Fields
Validates job-related enum values.

**Endpoint:** `POST /api/validate/job-fields`

**Request Body:**
```typescript
{
    status?: string;    // Optional: Job status to validate
    priority?: string;  // Optional: Job priority to validate
    category?: string;  // Optional: Job category to validate
}
```

**Valid Enum Values:**
```typescript
JobStatus: [
    'PENDING',
    'ACTIVE',
    'PAUSED',
    'COMPLETED',
    'CANCELLED'
]

JobPriority: [
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
]

JobCategory: [
    'WATER_DAMAGE',
    'FLOOD',
    'LEAK',
    'STORM_DAMAGE',
    'OTHER'
]
```

**Notes:**
- Enum values are case-sensitive
- Must match exactly as shown (e.g., 'PENDING', not 'pending' or 'Pending')
- Empty strings are not allowed
- Custom values are not supported

**Success Response:**
```json
{
    "valid": true,
    "message": "All fields are valid"
}
```

**Error Response:**
```json
{
    "error": "JobValidationError",
    "message": "Invalid job status. Must be one of: PENDING, ACTIVE, PAUSED, COMPLETED, CANCELLED"
}
```

## Implementation Notes

### Error Handling

#### Error Response Format
All API errors follow a consistent format:
```typescript
{
    error: string;     // Error type identifier
    message: string;   // Human-readable error description
    details?: object;  // Optional additional error context
}
```

#### Common Error Types

1. **JobValidationError**
   - Invalid job number format
   - Invalid enum values
   - Invalid date components
   - Invalid sequence numbers
   ```json
   {
       "error": "JobValidationError",
       "message": "Invalid job number format",
       "details": {
           "expected": "YYYY-MMDD-XXX",
           "received": "2024-101-001"
       }
   }
   ```

2. **NotFoundError**
   - Job not found
   - Moisture data not found
   - Resource not found
   ```json
   {
       "error": "NotFoundError",
       "message": "Job not found",
       "details": {
           "jobNumber": "2024-0101-001"
       }
   }
   ```

3. **DatabaseError**
   - Connection errors
   - Transaction failures
   - Constraint violations
   ```json
   {
       "error": "DatabaseError",
       "message": "Failed to create moisture data",
       "details": {
           "code": "P2002",
           "field": "jobNumber"
       }
   }
   ```

4. **ValidationError**
   - Invalid field values
   - Missing required fields
   - Type mismatches
   ```json
   {
       "error": "ValidationError",
       "message": "Invalid field values",
       "details": {
           "fields": ["priority", "category"],
           "errors": {
               "priority": "Must be one of: LOW, MEDIUM, HIGH, URGENT",
               "category": "Must be one of: WATER_DAMAGE, FLOOD, LEAK, STORM_DAMAGE, OTHER"
           }
       }
   }
   ```

#### Error Handling Best Practices
- All errors include descriptive messages
- Validation errors specify which fields failed and why
- Database errors are sanitized to remove sensitive information
- Stack traces are logged but not sent in responses
- Error responses use appropriate HTTP status codes

### Security

#### Authentication
All endpoints require authentication using JWT (JSON Web Token).

**Authentication Header:**
```
Authorization: Bearer <jwt_token>
```

**Token Requirements:**
- Must be valid JWT format
- Must not be expired
- Must be signed with application secret
- Must contain user identification claims

**Authentication Errors:**
```json
{
    "error": "AuthenticationError",
    "message": "Invalid or expired token",
    "details": {
        "code": "TOKEN_EXPIRED"
    }
}
```

#### Authorization
Access to endpoints is controlled by user roles and permissions.

**Required Roles:**
- `ADMIN`: Full access to all endpoints
- `TECHNICIAN`: Access to create, read, and update operations
- `VIEWER`: Read-only access to job and moisture data

**Authorization Errors:**
```json
{
    "error": "AuthorizationError",
    "message": "Insufficient permissions",
    "details": {
        "requiredRole": "TECHNICIAN",
        "currentRole": "VIEWER"
    }
}
```

#### Security Best Practices
1. **Input Validation**
   - All request parameters are validated
   - Strict type checking for all fields
   - Sanitization of user-provided data
   - Prevention of SQL injection via Prisma ORM

2. **Data Protection**
   - Sensitive data is never exposed in responses
   - Database credentials are securely managed
   - Error messages don't leak internal details

3. **API Security**
   - Rate limiting on all endpoints
   - CORS configuration for allowed origins
   - HTTP-only cookies for token storage
   - HTTPS required for all requests

4. **Monitoring**
   - Failed authentication attempts are logged
   - Suspicious activity patterns are monitored
   - Regular security audits are performed

### Performance
- Efficient database queries using Prisma
- Proper indexing on jobNumber field
- Transaction support for complex operations
- Optimized auto-save mechanism to prevent performance impact
- Version control for save history
- Efficient storage of incremental changes
- Caching of frequently used auto-fill patterns
- Background processing of pattern recognition

### Auto-Fill Features
- Smart pattern detection from historical data
- Customizable auto-fill rules
- Template-based data population
- Intelligent field mapping
- Pattern recognition for equipment placement
- Grid-based reading suggestions
- Location-aware defaults

## AI Capabilities

### Text Generation

**Endpoint:** `POST /api/ai/generate/text`

**Request Body:**
```typescript
{
    context: string;          // Job context or requirements
    type: 'REPORT' | 'NOTES' | 'RECOMMENDATIONS';
    parameters?: {
        length?: number;      // Desired length in words
        tone?: string;        // Professional, Technical, etc.
        format?: string;      // Markdown, Plain, HTML
    }
}
```

**Success Response:**
```json
{
    "generated": {
        "text": "Generated content...",
        "metadata": {
            "wordCount": 150,
            "tone": "Professional",
            "format": "Markdown"
        }
    }
}
```

### Vision Analysis

**Endpoint:** `POST /api/ai/analyze/image`

**Request Body:**
```typescript
{
    image: string;           // Base64 encoded image
    analysisTypes: string[]; // ["damage", "moisture", "mold"]
    requireAnnotations?: boolean;
}
```

**Success Response:**
```json
{
    "analysis": {
        "damageDetection": {
            "severity": "MODERATE",
            "affectedAreas": [
                {"x": 0.2, "y": 0.3, "type": "WATER_DAMAGE"}
            ]
        },
        "moistureAnalysis": {
            "levels": [
                {"location": "Wall A", "value": 85}
            ]
        },
        "recommendations": [
            "Install dehumidifier at coordinates (0.2, 0.3)"
        ]
    }
}
```

### Audio Processing

**Endpoint:** `POST /api/ai/process/audio`

**Request Body:**
```typescript
{
    audio: string;          // Base64 encoded audio
    type: 'TRANSCRIPTION' | 'NOTES' | 'COMMANDS';
    language?: string;      // Default: 'en-US'
}
```

**Success Response:**
```json
{
    "processed": {
        "text": "Transcribed content...",
        "timestamps": [
            {"text": "water damage", "start": 0.0, "end": 1.2}
        ],
        "confidence": 0.95
    }
}
```

### Text-to-Speech

**Endpoint:** `POST /api/ai/synthesize/speech`

**Request Body:**
```typescript
{
    text: string;
    voice: string;         // Voice ID
    options?: {
        speed?: number;    // Speech rate
        pitch?: number;    // Voice pitch
        format?: string;   // Audio format
    }
}
```

**Success Response:**
```json
{
    "audio": {
        "data": "Base64 encoded audio",
        "format": "mp3",
        "duration": 30.5
    }
}
```

### Structured Prediction

**Endpoint:** `POST /api/ai/predict`

**Request Body:**
```typescript
{
    data: object;          // Input data
    modelType: string;     // Prediction model to use
    options?: {
        confidence?: number;  // Minimum confidence threshold
        format?: string;     // Output format
    }
}
```

**Success Response:**
```json
{
    "predictions": {
        "dryingTime": {
            "value": 72,
            "unit": "hours",
            "confidence": 0.85
        },
        "equipmentNeeded": [
            {
                "type": "DEHUMIDIFIER",
                "count": 2,
                "confidence": 0.92
            }
        ]
    }
}
```

### Moderation

**Endpoint:** `POST /api/ai/moderate`

**Request Body:**
```typescript
{
    content: string | object;  // Content to moderate
    type: 'TEXT' | 'IMAGE' | 'REPORT';
    rules?: string[];         // Specific rules to apply
}
```

**Success Response:**
```json
{
    "moderation": {
        "approved": true,
        "flags": [],
        "suggestions": []
    }
}
```

### Function Calling

**Endpoint:** `POST /api/ai/execute`

**Request Body:**
```typescript
{
    function: string;      // Function identifier
    parameters: object;    // Function parameters
    context?: object;     // Execution context
}
```

**Success Response:**
```json
{
    "execution": {
        "result": "Function result",
        "metadata": {
            "runtime": 0.5,
            "resources": "minimal"
        }
    }
}
```

### Save Management
- Auto-save runs in background without blocking user operations
- Manual saves create distinct versions with metadata
- Save history is maintained with version control
- Automatic cleanup of old versions based on configuration
- Conflict resolution for concurrent save operations

## Client Management Endpoints

### Update Client Information
Updates client data for an existing client.

**Endpoint:** `PUT /api/clients/:clientId`

**Request Body:**
```typescript
{
    clientId: string;      // Client identifier
    data: {
        name?: string;     // Optional: Client name
        email?: string;    // Optional: Client email
        phone?: string;    // Optional: Client phone
        company?: string;  // Optional: Company name
        address?: string;  // Optional: Client address
        status?: string;   // Optional: Client status
    }
}
```

**Validation:**
- All provided fields will be sanitized before validation
- Fields follow the same validation rules as job creation
- Partial updates are supported (only provide fields to update)
- All fields are optional but must be valid if provided

**Success Response:**
```json
{
    "success": true,
    "message": "Client updated successfully",
    "client": {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+61-1234-5678",
        "company": "Acme Pty Ltd",
        "address": "123 Main Street, Sydney, NSW, 2000",
        "status": "active"
    }
}
```

**Error Response:**
```json
{
    "success": false,
    "message": "Failed to update client",
    "errors": [
        {
            "field": "email",
            "message": "Invalid email format"
        }
    ]
}
```

**Notes:**
- All data is sanitized before processing
- Validation errors include specific field information
- Existing client data is preserved for unspecified fields
- Response includes complete updated client object
