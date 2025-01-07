import {
    ROLES,
    isValidRole,
    getRolePermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getCombinedPermissions,
    validateRoles,
    isAdmin,
    ensurePermissions,
    requirePermissions,
    AuthorizationError,
    type Permission
} from '../../app/utils/authorization';

describe('Authorization Utils', () => {
    describe('Role Validation', () => {
        it('should validate existing roles', () => {
            expect(isValidRole('ADMIN')).toBe(true);
            expect(isValidRole('MANAGER')).toBe(true);
            expect(isValidRole('USER')).toBe(true);
            expect(isValidRole('VIEWER')).toBe(true);
        });

        it('should reject invalid roles', () => {
            expect(isValidRole('INVALID_ROLE')).toBe(false);
            expect(isValidRole('')).toBe(false);
        });

        it('should get permissions for valid role', () => {
            const permissions = getRolePermissions('ADMIN');
            expect(permissions).toContain('read');
            expect(permissions).toContain('write');
            expect(permissions).toContain('delete');
            expect(permissions).toContain('admin');
        });

        it('should throw error for invalid role permissions', () => {
            expect(() => getRolePermissions('INVALID_ROLE')).toThrow();
        });
    });

    describe('Permission Checks', () => {
        it('should check single permission', () => {
            expect(hasPermission('ADMIN', 'admin')).toBe(true);
            expect(hasPermission('USER', 'admin')).toBe(false);
            expect(hasPermission('VIEWER', 'write')).toBe(false);
        });

        it('should check permission across multiple roles', () => {
            expect(hasAnyPermission(['USER', 'VIEWER'], 'read')).toBe(true);
            expect(hasAnyPermission(['USER', 'VIEWER'], 'delete')).toBe(false);
        });

        it('should verify all required permissions', () => {
            expect(hasAllPermissions(['ADMIN'], ['read', 'write', 'admin'])).toBe(true);
            expect(hasAllPermissions(['USER'], ['read', 'write', 'admin'])).toBe(false);
        });

        it('should handle invalid roles in permission checks', () => {
            expect(hasPermission('INVALID_ROLE', 'read')).toBe(false);
            expect(hasAnyPermission(['INVALID_ROLE'], 'read')).toBe(false);
            expect(hasAllPermissions(['INVALID_ROLE'], ['read'])).toBe(false);
        });
    });

    describe('Role Combinations', () => {
        it('should combine permissions from multiple roles', () => {
            const permissions = getCombinedPermissions(['USER', 'VIEWER']);
            expect(permissions).toContain('read');
            expect(permissions).toContain('write');
            expect(permissions).not.toContain('delete');
            expect(permissions).not.toContain('admin');
        });

        it('should handle duplicate permissions', () => {
            const permissions = getCombinedPermissions(['USER', 'USER', 'VIEWER']);
            const uniquePermissions = new Set(permissions);
            expect(permissions.length).toBe(uniquePermissions.size);
        });

        it('should ignore invalid roles in combination', () => {
            const permissions = getCombinedPermissions(['USER', 'INVALID_ROLE']);
            expect(permissions).toEqual(ROLES.USER.permissions);
        });
    });

    describe('Role Validation', () => {
        it('should validate required roles', () => {
            expect(validateRoles(['ADMIN'], ['ADMIN'])).toBe(true);
            expect(validateRoles(['USER'], ['ADMIN'])).toBe(false);
            expect(validateRoles(['USER', 'MANAGER'], ['ADMIN', 'MANAGER'])).toBe(true);
        });

        it('should identify admin role', () => {
            expect(isAdmin(['ADMIN'])).toBe(true);
            expect(isAdmin(['USER', 'MANAGER'])).toBe(false);
        });
    });

    describe('Permission Enforcement', () => {
        it('should ensure required permissions', () => {
            expect(() => ensurePermissions(['ADMIN'], ['read', 'write'])).not.toThrow();
            expect(() => ensurePermissions(['USER'], ['admin']))
                .toThrow(AuthorizationError);
        });

        it('should include permission details in error', () => {
            try {
                ensurePermissions(['USER'], ['admin']);
                fail('Should have thrown AuthorizationError');
            } catch (error) {
                expect(error).toBeInstanceOf(AuthorizationError);
                if (error instanceof AuthorizationError) {
                    expect(error.requiredPermissions).toContain('admin');
                    expect(error.userPermissions).toEqual(ROLES.USER.permissions);
                }
            }
        });

        it('should create permission checker', () => {
            const requireAdmin = requirePermissions(['admin']);
            expect(() => requireAdmin(['ADMIN'])).not.toThrow();
            expect(() => requireAdmin(['USER'])).toThrow(AuthorizationError);
        });
    });

    describe('Role Hierarchy', () => {
        it('should respect role hierarchy', () => {
            // ADMIN has all permissions
            expect(hasAllPermissions(['ADMIN'], ['read', 'write', 'delete', 'admin'])).toBe(true);
            
            // MANAGER has all except admin
            expect(hasAllPermissions(['MANAGER'], ['read', 'write', 'delete'])).toBe(true);
            expect(hasAllPermissions(['MANAGER'], ['admin'])).toBe(false);
            
            // USER has basic permissions
            expect(hasAllPermissions(['USER'], ['read', 'write'])).toBe(true);
            expect(hasAllPermissions(['USER'], ['delete'])).toBe(false);
            
            // VIEWER has minimal permissions
            expect(hasAllPermissions(['VIEWER'], ['read'])).toBe(true);
            expect(hasAllPermissions(['VIEWER'], ['write'])).toBe(false);
        });

        it('should combine permissions respecting hierarchy', () => {
            const userManagerPermissions = getCombinedPermissions(['USER', 'MANAGER']);
            expect(userManagerPermissions).toContain('read');
            expect(userManagerPermissions).toContain('write');
            expect(userManagerPermissions).toContain('delete');
            expect(userManagerPermissions).not.toContain('admin');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty roles array', () => {
            expect(getCombinedPermissions([])).toEqual([]);
            expect(hasAnyPermission([], 'read')).toBe(false);
            expect(hasAllPermissions([], ['read'])).toBe(false);
        });

        it('should handle empty required permissions', () => {
            expect(hasAllPermissions(['USER'], [])).toBe(true);
            expect(() => ensurePermissions(['USER'], [])).not.toThrow();
        });

        it('should handle case sensitivity', () => {
            expect(isValidRole('admin')).toBe(false);
            expect(isValidRole('ADMIN')).toBe(true);
        });

        it('should handle mixed valid and invalid roles', () => {
            const permissions = getCombinedPermissions(['USER', 'INVALID', 'VIEWER']);
            expect(permissions).toContain('read');
            expect(permissions).toContain('write');
            expect(permissions.length).toBe(2); // Only valid permissions included
        });
    });
});
