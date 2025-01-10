# Authentication API

## Overview

The Authentication API provides endpoints for user authentication, token management, and access control. It supports multiple authentication methods and implements role-based access control (RBAC).

## Authentication Methods

### Bearer Token

```http
Authorization: Bearer <token>
```

### API Key

```http
X-API-Key: <api_key>
```

## Endpoints

### Login

```http
POST /v1/auth/login
```

Authenticates a user and returns an access token.

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "mfaCode": "123456"  // Optional, required if MFA is enabled
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600,
    "tokenType": "Bearer",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "roles": ["INSPECTOR", "ADMIN"],
      "permissions": ["READ_REPORTS", "WRITE_REPORTS"]
    }
  }
}
```

### Refresh Token

```http
POST /v1/auth/refresh
```

Generates a new access token using a refresh token.

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
}
```

### Logout

```http
POST /v1/auth/logout
```

Invalidates the current access token.

#### Request Headers
```http
Authorization: Bearer <token>
```

#### Response
```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  }
}
```

### Enable MFA

```http
POST /v1/auth/mfa/enable
```

Enables multi-factor authentication for the user.

#### Response
```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,..."
  }
}
```

### Verify MFA

```http
POST /v1/auth/mfa/verify
```

Verifies the MFA code during setup.

#### Request Body
```json
{
  "code": "123456"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "verified": true,
    "backupCodes": [
      "12345-67890",
      "98765-43210"
    ]
  }
}
```

## Role-Based Access Control

The API implements role-based access control with the following roles:

### Roles

| Role | Description |
|------|-------------|
| ADMIN | Full system access |
| INSPECTOR | Can perform inspections and create reports |
| MANAGER | Can manage jobs and view reports |
| CLIENT | Can view their own reports |
| VIEWER | Read-only access to permitted resources |

### Permissions

| Permission | Description |
|------------|-------------|
| READ_REPORTS | Can view reports |
| WRITE_REPORTS | Can create and edit reports |
| MANAGE_USERS | Can manage user accounts |
| MANAGE_EQUIPMENT | Can manage equipment inventory |
| VIEW_ANALYTICS | Can access analytics data |

## Token Management

### Token Types

1. **Access Token**
   - Short-lived (1 hour)
   - Used for API requests
   - Contains user roles and permissions

2. **Refresh Token**
   - Long-lived (30 days)
   - Used to obtain new access tokens
   - Can be revoked

### Token Security

- Tokens are signed using RS256 algorithm
- Access tokens are short-lived to minimize risk
- Refresh tokens can be revoked at any time
- All token operations are logged for security

## Error Handling

### Common Error Codes

| Code | Description |
|------|-------------|
| INVALID_CREDENTIALS | Invalid email or password |
| INVALID_TOKEN | Token is invalid or expired |
| MFA_REQUIRED | Multi-factor authentication required |
| INSUFFICIENT_PERMISSIONS | User lacks required permissions |
| TOKEN_EXPIRED | Access token has expired |

### Error Response Example

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": {
      "remainingAttempts": 2
    }
  }
}
```

## Security Best Practices

1. **Token Storage**
   - Store tokens securely (e.g., HttpOnly cookies)
   - Never store in localStorage or sessionStorage
   - Clear tokens on logout

2. **Request Security**
   - Use HTTPS for all requests
   - Include CSRF protection
   - Implement rate limiting
   - Monitor for suspicious activity

3. **Password Requirements**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Check against common password lists
   - Regular password rotation

4. **MFA Security**
   - Support multiple MFA methods
   - Provide backup codes
   - Rate limit MFA attempts
   - Log all MFA events

## Rate Limiting

Authentication endpoints have stricter rate limits:

- Login: 5 attempts per minute
- MFA verification: 3 attempts per minute
- Token refresh: 10 attempts per minute

## Logging and Monitoring

All authentication events are logged:

- Login attempts (successful and failed)
- Token operations
- MFA operations
- Permission changes
- Role assignments

## Support

For authentication issues:
- Email: security@inspection-report.com
- Emergency: +1 (555) 123-4567
- Documentation: https://docs.inspection-report.com/auth
