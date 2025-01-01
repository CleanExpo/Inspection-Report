# Authentication & Security Documentation

## Authentication

### Bearer Token Authentication
All API endpoints require authentication using Bearer tokens in the Authorization header.

```
Authorization: Bearer <your_token>
```

### Token Management

#### Token Format
Tokens are JWT (JSON Web Tokens) with the following structure:
```typescript
interface Token {
  sub: string;      // Subject (user ID)
  exp: number;      // Expiration timestamp
  iat: number;      // Issued at timestamp
  scope: string[];  // Permission scopes
}
```

#### Token Lifecycle
- Tokens expire after 24 hours
- Refresh tokens can be used to obtain new access tokens
- Invalid tokens return 401 Unauthorized response

### Security Best Practices

#### API Key Protection
- Store API keys securely
- Never expose keys in client-side code
- Rotate keys periodically
- Use environment variables for key storage

#### Request Security
```typescript
// Required Headers
interface SecurityHeaders {
  'Authorization': string;        // Bearer token
  'Content-Type': string;        // application/json
  'X-Request-ID': string;        // Unique request identifier
  'X-API-Version': string;       // API version being used
}
```

#### CORS Configuration
```typescript
// Allowed Origins
const allowedOrigins = [
  'https://app.example.com',
  'https://api.example.com'
];

// CORS Options
const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};
```

### Access Control

#### Permission Scopes
```typescript
enum PermissionScope {
  READ_FLOORPLAN = 'floorplan:read',
  WRITE_FLOORPLAN = 'floorplan:write',
  READ_EQUIPMENT = 'equipment:read',
  WRITE_EQUIPMENT = 'equipment:write',
  ADMIN = 'admin'
}
```

#### Role-Based Access
```typescript
interface Role {
  name: string;
  scopes: PermissionScope[];
  restrictions?: {
    maxProjects?: number;
    maxEquipment?: number;
  };
}

const roles: Record<string, Role> = {
  admin: {
    name: 'Administrator',
    scopes: [PermissionScope.ADMIN]
  },
  technician: {
    name: 'Technician',
    scopes: [
      PermissionScope.READ_FLOORPLAN,
      PermissionScope.WRITE_FLOORPLAN,
      PermissionScope.READ_EQUIPMENT
    ]
  },
  viewer: {
    name: 'Viewer',
    scopes: [
      PermissionScope.READ_FLOORPLAN,
      PermissionScope.READ_EQUIPMENT
    ]
  }
};
```

### Error Handling

#### Authentication Errors
```typescript
interface AuthError {
  code: string;
  message: string;
  details?: any;
}

const authErrors = {
  invalidToken: {
    code: 'AUTH001',
    message: 'Invalid authentication token'
  },
  expiredToken: {
    code: 'AUTH002',
    message: 'Token has expired'
  },
  insufficientScope: {
    code: 'AUTH003',
    message: 'Insufficient permissions'
  }
};
```

### Security Recommendations

1. Token Management
   - Implement token refresh mechanism
   - Handle token expiration gracefully
   - Clear tokens on logout

2. Request Validation
   - Validate all input data
   - Sanitize user inputs
   - Use request rate limiting

3. Error Handling
   - Don't expose sensitive info in errors
   - Log security events
   - Monitor for suspicious activity

4. General Security
   - Use HTTPS only
   - Implement rate limiting
   - Regular security audits
