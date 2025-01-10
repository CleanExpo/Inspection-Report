export type UserRole = 'developer' | 'manager' | 'admin' | 'technician';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

export interface TokenPair {
  token: string;
  refreshToken: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
  exp?: number;
}

export const ROLE_DESCRIPTIONS = {
  developer: 'Full system access with development capabilities',
  manager: 'Full access to manage users, templates, and system settings',
  admin: 'Administrative access to manage users and reports',
  technician: 'Access to create and manage inspection reports'
} as const;

export const ROLE_COLORS = {
  developer: '#9c27b0',
  manager: '#1976d2',
  admin: '#2e7d32',
  technician: '#ed6c02'
} as const;

export const PASSWORD_PROTECTED_ROLES: UserRole[] = ['developer', 'manager'];

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
}
