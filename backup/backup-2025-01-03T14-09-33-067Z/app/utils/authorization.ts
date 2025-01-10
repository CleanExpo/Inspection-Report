import { AuthError } from './auth';

export type Permission = 'read' | 'write' | 'delete' | 'admin';

export interface Role {
    name: string;
    permissions: Permission[];
}

// Define available roles and their permissions
export const ROLES: Record<string, Role> = {
    ADMIN: {
        name: 'ADMIN',
        permissions: ['read', 'write', 'delete', 'admin']
    },
    MANAGER: {
        name: 'MANAGER',
        permissions: ['read', 'write', 'delete']
    },
    USER: {
        name: 'USER',
        permissions: ['read', 'write']
    },
    VIEWER: {
        name: 'VIEWER',
        permissions: ['read']
    }
};

/**
 * Checks if a role exists
 * @param role Role name to check
 */
export function isValidRole(role: string): boolean {
    return role in ROLES;
}

/**
 * Gets permissions for a role
 * @param role Role name
 */
export function getRolePermissions(role: string): Permission[] {
    if (!isValidRole(role)) {
        throw new AuthError(`Invalid role: ${role}`);
    }
    return ROLES[role].permissions;
}

/**
 * Checks if a role has a specific permission
 * @param role Role name
 * @param permission Permission to check
 */
export function hasPermission(role: string, permission: Permission): boolean {
    if (!isValidRole(role)) {
        return false;
    }
    return ROLES[role].permissions.includes(permission);
}

/**
 * Checks if any of the roles has a specific permission
 * @param roles Array of role names
 * @param permission Permission to check
 */
export function hasAnyPermission(roles: string[], permission: Permission): boolean {
    return roles.some(role => hasPermission(role, permission));
}

/**
 * Checks if all required permissions are present in roles
 * @param roles Array of role names
 * @param requiredPermissions Array of required permissions
 */
export function hasAllPermissions(roles: string[], requiredPermissions: Permission[]): boolean {
    return requiredPermissions.every(permission => hasAnyPermission(roles, permission));
}

/**
 * Gets combined permissions for multiple roles
 * @param roles Array of role names
 */
export function getCombinedPermissions(roles: string[]): Permission[] {
    const uniquePermissions = new Set<Permission>();
    roles.forEach(role => {
        if (isValidRole(role)) {
            ROLES[role].permissions.forEach(permission => uniquePermissions.add(permission));
        }
    });
    return Array.from(uniquePermissions);
}

/**
 * Validates if a user has required roles
 * @param userRoles User's roles
 * @param requiredRoles Required roles
 */
export function validateRoles(userRoles: string[], requiredRoles: string[]): boolean {
    return requiredRoles.some(required => userRoles.includes(required));
}

/**
 * Checks if a user has admin access
 * @param roles User's roles
 */
export function isAdmin(roles: string[]): boolean {
    return roles.includes(ROLES.ADMIN.name);
}

/**
 * Authorization error with specific details
 */
export class AuthorizationError extends AuthError {
    constructor(
        message: string,
        public readonly requiredPermissions?: Permission[],
        public readonly userPermissions?: Permission[]
    ) {
        super(message, 403);
        this.name = 'AuthorizationError';
    }
}

/**
 * Ensures user has required permissions
 * @param userRoles User's roles
 * @param requiredPermissions Required permissions
 * @throws {AuthorizationError} If user lacks required permissions
 */
export function ensurePermissions(userRoles: string[], requiredPermissions: Permission[]): void {
    const userPermissions = getCombinedPermissions(userRoles);
    
    if (!hasAllPermissions(userRoles, requiredPermissions)) {
        throw new AuthorizationError(
            'Insufficient permissions',
            requiredPermissions,
            userPermissions
        );
    }
}

/**
 * Creates a permission checker function
 * @param requiredPermissions Permissions to check for
 */
export function requirePermissions(requiredPermissions: Permission[]) {
    return (userRoles: string[]) => {
        ensurePermissions(userRoles, requiredPermissions);
    };
}
