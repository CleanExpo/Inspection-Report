# Role-Based Access Control (RBAC)

This guide demonstrates patterns for implementing Role-Based Access Control in React applications.

## Overview

RBAC enables fine-grained access control based on user roles and permissions. This pattern involves:
- Permission hooks for checking access rights
- Component-level access control
- Route-level permission enforcement

## Permission Hooks

### Basic Permission Hook

```tsx
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

interface Permission {
  resource: string;
  action: 'read' | 'write' | 'delete' | 'admin';
}

export const usePermissions = () => {
  const { user } = useContext(AuthContext);

  const hasPermission = (permission: Permission): boolean => {
    if (!user || !user.roles) return false;
    
    // Map roles to permissions
    const rolePermissions = {
      admin: ['read', 'write', 'delete', 'admin'],
      editor: ['read', 'write'],
      viewer: ['read']
    };

    return user.roles.some(role => 
      rolePermissions[role]?.includes(permission.action)
    );
  };

  return { hasPermission };
};
```

### Usage Example

```tsx
const DocumentViewer = ({ document }) => {
  const { hasPermission } = usePermissions();
  
  const canEdit = hasPermission({ 
    resource: 'documents', 
    action: 'write' 
  });

  return (
    <div>
      <h1>{document.title}</h1>
      {canEdit && (
        <button onClick={handleEdit}>Edit Document</button>
      )}
    </div>
  );
};
```

### Enhanced Permission Hook with Resource Types

```tsx
type ResourceType = 'documents' | 'users' | 'settings';
type ActionType = 'read' | 'write' | 'delete' | 'admin';

interface PermissionCheck {
  resource: ResourceType;
  action: ActionType;
}

export const useEnhancedPermissions = () => {
  const { user } = useContext(AuthContext);

  const permissionMatrix = {
    admin: {
      documents: ['read', 'write', 'delete', 'admin'],
      users: ['read', 'write', 'delete', 'admin'],
      settings: ['read', 'write', 'delete', 'admin']
    },
    editor: {
      documents: ['read', 'write'],
      users: ['read'],
      settings: ['read']
    },
    viewer: {
      documents: ['read'],
      users: [],
      settings: []
    }
  };

  const checkPermission = ({ resource, action }: PermissionCheck): boolean => {
    if (!user?.roles) return false;

    return user.roles.some(role => 
      permissionMatrix[role]?.[resource]?.includes(action)
    );
  };

  return { checkPermission };
};
```

### Composing Multiple Permissions

```tsx
export const useCompositePermissions = () => {
  const { checkPermission } = useEnhancedPermissions();

  const checkMultiplePermissions = (
    permissions: PermissionCheck[]
  ): boolean => {
    return permissions.every(permission => 
      checkPermission(permission)
    );
  };

  const checkAnyPermission = (
    permissions: PermissionCheck[]
  ): boolean => {
    return permissions.some(permission => 
      checkPermission(permission)
    );
  };

  return {
    checkPermission,
    checkMultiplePermissions,
    checkAnyPermission
  };
};
```

### Testing Permission Hooks

```tsx
import { renderHook } from '@testing-library/react-hooks';
import { AuthContext } from '@/context/AuthContext';
import { usePermissions } from './usePermissions';

describe('usePermissions', () => {
  const wrapper = ({ children, user }) => (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );

  it('returns false when user has no roles', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: ({ children }) => wrapper({ 
        children, 
        user: { roles: [] } 
      })
    });

    expect(result.current.hasPermission({
      resource: 'documents',
      action: 'read'
    })).toBe(false);
  });

  it('correctly checks admin permissions', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: ({ children }) => wrapper({ 
        children, 
        user: { roles: ['admin'] } 
      })
    });

    expect(result.current.hasPermission({
      resource: 'documents',
      action: 'admin'
    })).toBe(true);
  });
});
```

## Route-Level Permission Control

### Route Permission Configuration

```tsx
// types/permissions.ts
export interface RoutePermission {
  path: string;
  permissions: Permission[];
  matchMode?: 'exact' | 'startsWith';
}

// config/routePermissions.ts
export const routePermissions: RoutePermission[] = [
  {
    path: '/admin',
    permissions: [{ resource: 'admin', action: 'admin' }],
    matchMode: 'startsWith'
  },
  {
    path: '/settings',
    permissions: [{ resource: 'settings', action: 'read' }],
    matchMode: 'exact'
  }
];
```

### Permission-Based Router Guard

```tsx
import { useLocation, Navigate } from 'react-router-dom';
import { useCompositePermissions } from '@/hooks/usePermissions';
import { routePermissions } from '@/config/routePermissions';

interface PermissionRouterProps {
  children: React.ReactNode;
}

export const PermissionRouter: React.FC<PermissionRouterProps> = ({ 
  children 
}) => {
  const location = useLocation();
  const { checkMultiplePermissions } = useCompositePermissions();

  const checkRouteAccess = (path: string): boolean => {
    const matchingRoute = routePermissions.find(route => {
      if (route.matchMode === 'startsWith') {
        return path.startsWith(route.path);
      }
      return path === route.path;
    });

    if (!matchingRoute) return true; // No permissions required
    return checkMultiplePermissions(matchingRoute.permissions);
  };

  if (!checkRouteAccess(location.pathname)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

### Integration with React Router

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PermissionRouter } from './PermissionRouter';

export const App = () => {
  return (
    <BrowserRouter>
      <PermissionRouter>
        <Routes>
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          {/* Public routes */}
          <Route path="/" element={<Home />} />
        </Routes>
      </PermissionRouter>
    </BrowserRouter>
  );
};
```

### Nested Route Protection

```tsx
// Nested admin routes with additional permission checks
export const AdminRoutes = () => {
  return (
    <Routes>
      <Route 
        path="users"
        element={
          <PermissionGuard 
            permission={{ resource: 'users', action: 'read' }}
          >
            <UserManagement />
          </PermissionGuard>
        }
      />
      <Route 
        path="settings"
        element={
          <MultiPermissionGuard
            permissions={[
              { resource: 'admin', action: 'admin' },
              { resource: 'settings', action: 'write' }
            ]}
            mode="every"
          >
            <AdminSettings />
          </MultiPermissionGuard>
        }
      />
    </Routes>
  );
};
```

### Dynamic Route Generation

```tsx
interface ProtectedRoute {
  path: string;
  element: React.ReactNode;
  permissions: Permission[];
}

const protectedRoutes: ProtectedRoute[] = [
  {
    path: '/admin/users',
    element: <UserManagement />,
    permissions: [{ resource: 'users', action: 'read' }]
  },
  {
    path: '/admin/settings',
    element: <AdminSettings />,
    permissions: [
      { resource: 'admin', action: 'admin' },
      { resource: 'settings', action: 'write' }
    ]
  }
];

export const DynamicRoutes = () => {
  return (
    <Routes>
      {protectedRoutes.map(({ path, element, permissions }) => (
        <Route
          key={path}
          path={path}
          element={
            <MultiPermissionGuard permissions={permissions}>
              {element}
            </MultiPermissionGuard>
          }
        />
      ))}
    </Routes>
  );
};
```

### Testing Route Protection

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { PermissionRouter } from './PermissionRouter';

describe('PermissionRouter', () => {
  const renderWithRouter = (
    ui: React.ReactNode,
    { route = '/', user = null } = {}
  ) => {
    return render(
      <AuthContext.Provider value={{ user }}>
        <MemoryRouter initialEntries={[route]}>
          {ui}
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  it('allows access to public routes', () => {
    renderWithRouter(
      <PermissionRouter>
        <div>Public Content</div>
      </PermissionRouter>
    );

    expect(screen.getByText('Public Content')).toBeInTheDocument();
  });

  it('redirects on protected routes without permission', () => {
    const { container } = renderWithRouter(
      <PermissionRouter>
        <div>Admin Content</div>
      </PermissionRouter>,
      { route: '/admin', user: { roles: ['viewer'] } }
    );

    expect(container).not.toHaveTextContent('Admin Content');
  });
});
```

This section covers the foundation of RBAC with permission hooks. The next sections will build upon this to implement component-level and route-level access control.

## Component-Level Access Control

### Protected Component HOC

```tsx
import { ComponentType } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface WithPermissionProps {
  requiredPermission: Permission;
  fallback?: React.ReactNode;
}

export function withPermission<P extends object>(
  WrappedComponent: ComponentType<P>,
  { requiredPermission, fallback = null }: WithPermissionProps
) {
  return function PermissionWrapper(props: P) {
    const { hasPermission } = usePermissions();
    
    if (!hasPermission(requiredPermission)) {
      return <>{fallback}</>;
    }

    return <WrappedComponent {...props} />;
  };
}
```

### Permission Guard Component

```tsx
interface PermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback = null
}) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
```

### Usage Examples

```tsx
// Using HOC
const AdminPanel = withPermission(
  BaseAdminPanel,
  {
    requiredPermission: { 
      resource: 'admin', 
      action: 'admin' 
    },
    fallback: <AccessDenied />
  }
);

// Using Guard Component
const SettingsPage = () => {
  return (
    <div>
      <h1>Settings</h1>
      
      <PermissionGuard 
        permission={{ resource: 'settings', action: 'read' }}
        fallback={<p>You cannot view settings</p>}
      >
        <SettingsContent />
      </PermissionGuard>

      <PermissionGuard 
        permission={{ resource: 'settings', action: 'write' }}
        fallback={<p>You cannot modify settings</p>}
      >
        <SettingsForm />
      </PermissionGuard>
    </div>
  );
};
```

### Multiple Permission Check Component

```tsx
interface MultiPermissionGuardProps {
  permissions: Permission[];
  mode: 'every' | 'some';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const MultiPermissionGuard: React.FC<MultiPermissionGuardProps> = ({
  permissions,
  mode = 'every',
  children,
  fallback = null
}) => {
  const { checkMultiplePermissions, checkAnyPermission } = useCompositePermissions();
  
  const hasAccess = mode === 'every' 
    ? checkMultiplePermissions(permissions)
    : checkAnyPermission(permissions);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
```

### Testing Components with Permissions

```tsx
import { render, screen } from '@testing-library/react';
import { AuthContext } from '@/context/AuthContext';
import { PermissionGuard } from './PermissionGuard';

describe('PermissionGuard', () => {
  const renderWithAuth = (ui: React.ReactNode, user: any) => {
    return render(
      <AuthContext.Provider value={{ user }}>
        {ui}
      </AuthContext.Provider>
    );
  };

  it('renders children when user has permission', () => {
    renderWithAuth(
      <PermissionGuard 
        permission={{ resource: 'test', action: 'read' }}
      >
        <div>Protected Content</div>
      </PermissionGuard>,
      { roles: ['admin'] }
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders fallback when user lacks permission', () => {
    renderWithAuth(
      <PermissionGuard 
        permission={{ resource: 'test', action: 'admin' }}
        fallback={<div>Access Denied</div>}
      >
        <div>Protected Content</div>
      </PermissionGuard>,
      { roles: ['viewer'] }
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
```
