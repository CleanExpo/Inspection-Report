export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  INSPECTOR = 'INSPECTOR',
  USER = 'USER',
}

export interface UserPermission {
  id: string;
  userId: string;
  permission: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

export const Permissions = {
  READ_JOBS: 'READ_JOBS',
  CREATE_JOBS: 'CREATE_JOBS',
  UPDATE_JOBS: 'UPDATE_JOBS',
  DELETE_JOBS: 'DELETE_JOBS',
  READ_READINGS: 'READ_READINGS',
  CREATE_READINGS: 'CREATE_READINGS',
  UPDATE_READINGS: 'UPDATE_READINGS',
  DELETE_READINGS: 'DELETE_READINGS',
  MANAGE_USERS: 'MANAGE_USERS',
  MANAGE_EQUIPMENT: 'MANAGE_EQUIPMENT',
  VIEW_ANALYTICS: 'VIEW_ANALYTICS',
} as const;

export type Permission = typeof Permissions[keyof typeof Permissions];

export interface ResourceOwnership {
  userId: string;
  resourceId: string;
  resourceType: string;
  accessLevel: 'READ' | 'WRITE' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}
