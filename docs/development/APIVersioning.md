# MeasurementSystem API Versioning Guide

This guide outlines our approach to API versioning and how we manage changes across different versions of the MeasurementSystem.

## Versioning Strategy

We follow Semantic Versioning (SemVer) for our API:

- **MAJOR** version (x.0.0) - Breaking changes
- **MINOR** version (0.x.0) - New features (backwards-compatible)
- **PATCH** version (0.0.x) - Bug fixes (backwards-compatible)

## Version Support Policy

- We maintain support for the last two major versions
- Security updates are provided for all supported versions
- Bug fixes are typically only applied to the latest version
- Each major version is supported for at least 12 months

## API Changes

### Breaking Changes

Breaking changes that warrant a major version increment:

1. **Component Props**
   ```typescript
   // Breaking: Removing or renaming props
   interface Props {
     - data: any;           // Removed
     + items: ItemType[];   // Replacement
   }

   // Breaking: Changing prop types
   interface Props {
     value: string;   // Changed from number
   }
   ```

2. **Type Definitions**
   ```typescript
   // Breaking: Structure changes
   interface Template {
     - settings: {
       gridSize: number;
     }
     + gridSpacing: number;  // Moved to top level
   }

   // Breaking: Enum changes
   enum Status {
     - ACTIVE
     + ENABLED    // Renamed
   }
   ```

3. **Function Signatures**
   ```typescript
   // Breaking: Parameter changes
   - function process(data: any): void;
   + function process(data: DataType, options: Options): void;

   // Breaking: Return type changes
   - async function fetch(): Promise<Data>;
   + async function fetch(): Promise<Data[]>;
   ```

### Non-Breaking Changes

Changes that warrant a minor version increment:

1. **Adding Optional Props**
   ```typescript
   interface Props {
     existing: string;
     + optional?: boolean;    // New optional prop
   }
   ```

2. **Extending Types**
   ```typescript
   interface Template {
     id: string;
     + metadata?: {          // New optional field
       created: Date;
       author: string;
     };
   }
   ```

3. **New Features**
   ```typescript
   // New utility function
   export function validateTemplate(template: Template): boolean;

   // New component
   export function TemplatePreview(props: PreviewProps);
   ```

## Version Management

### File Structure

```
src/
├── v2/                     # Latest major version
│   ├── components/
│   ├── types/
│   └── index.ts
├── v1/                     # Previous major version
│   ├── components/
│   ├── types/
│   └── index.ts
└── index.ts               # Version exports
```

### Version Exports

```typescript
// src/index.ts
export * from './v2';  // Latest version
export * as v1 from './v1';  // Previous version
```

### Version-Specific Code

```typescript
// src/v2/components/TemplateSelector.tsx
import { Template } from '../types';

export function TemplateSelector(props: Props) {
  // Latest implementation
}

// src/v1/components/TemplateSelector.tsx
import { Template } from '../types';

export function TemplateSelector(props: LegacyProps) {
  // Legacy implementation
}
```

## Migration Support

### Version Bridges

```typescript
// src/bridges/v1-to-v2.ts
import { Template as V1Template } from '../v1/types';
import { Template as V2Template } from '../v2/types';

export function migrateTemplate(v1: V1Template): V2Template {
  return {
    id: v1.id,
    name: v1.name || v1.id,
    gridSpacing: v1.settings.gridSize,
    // ... other migrations
  };
}
```

### Compatibility Layers

```typescript
// src/compat/v1.ts
import { Template as V2Template } from '../v2/types';
import { Template as V1Template } from '../v1/types';

export function createV1Wrapper(v2Component: any) {
  return function V1CompatWrapper(props: any) {
    const v2Props = migrateProps(props);
    return v2Component(v2Props);
  };
}
```

## Documentation

### Version Headers

```typescript
/**
 * @since 2.0.0
 * @deprecated 3.0.0
 */
export function legacyFunction(): void;

/**
 * @since 1.5.0
 * @modified 2.0.0 - Added options parameter
 */
export function currentFunction(options?: Options): void;
```

### Change Documentation

```typescript
// BREAKING CHANGE: Template structure
interface Template {
  /**
   * @breaking-change 2.0.0
   * Moved from settings.gridSize to top-level gridSpacing
   */
  gridSpacing: number;
}
```

## Testing

### Version-Specific Tests

```typescript
// __tests__/v2/TemplateSelector.test.tsx
import { TemplateSelector } from '../../v2/components';

describe('TemplateSelector v2', () => {
  it('supports new features', () => {
    // Test v2 specific features
  });
});

// __tests__/v1/TemplateSelector.test.tsx
import { TemplateSelector } from '../../v1/components';

describe('TemplateSelector v1', () => {
  it('maintains legacy behavior', () => {
    // Test v1 compatibility
  });
});
```

### Migration Tests

```typescript
// __tests__/bridges/v1-to-v2.test.ts
import { migrateTemplate } from '../../bridges/v1-to-v2';

describe('v1 to v2 migration', () => {
  it('correctly migrates templates', () => {
    const v1Template = {
      id: 'test',
      settings: { gridSize: 1 }
    };

    const v2Template = migrateTemplate(v1Template);
    expect(v2Template.gridSpacing).toBe(1);
  });
});
```

## Deprecation Process

1. **Mark as Deprecated**
   ```typescript
   /**
    * @deprecated Since version 2.0.0
    * Use newFunction() instead
    */
   export function oldFunction(): void;
   ```

2. **Runtime Warnings**
   ```typescript
   export function oldFunction(): void {
     console.warn(
       'Warning: oldFunction() is deprecated. ' +
       'Use newFunction() instead.'
     );
     // Implementation
   }
   ```

3. **Migration Path**
   ```typescript
   // Provide clear migration examples
   // Old way
   oldFunction();

   // New way
   newFunction({
     // New options
   });
   ```

## Release Process

1. **Version Bump**
   ```json
   {
     "name": "measurement-system",
     "version": "2.0.0",
     "engines": {
       "node": ">=14"
     }
   }
   ```

2. **Change Log**
   ```markdown
   # 2.0.0 (2024-01-15)

   ## Breaking Changes
   - Restructured Template interface
   - Removed deprecated exports

   ## New Features
   - Added TemplatePreview component
   - Enhanced export options

   ## Bug Fixes
   - Fixed measurement calculation
   ```

3. **Release Tags**
   ```bash
   git tag -a v2.0.0 -m "Version 2.0.0"
   git push origin v2.0.0
   ```

## Support Timeline

| Version | Released | Support Ends | Status |
|---------|----------|--------------|--------|
| 3.0.0   | TBD      | -            | Planned |
| 2.0.0   | 2024-01  | 2025-01      | Active |
| 1.5.0   | 2023-07  | 2024-07      | Maintenance |
| 1.0.0   | 2023-01  | 2024-01      | End of Life |

## Best Practices

1. **Planning Changes**
   - Document breaking changes early
   - Provide migration paths
   - Consider backward compatibility

2. **Implementation**
   - Use TypeScript for type safety
   - Add runtime warnings
   - Include comprehensive tests

3. **Documentation**
   - Keep change logs updated
   - Document migration steps
   - Provide usage examples

4. **Release Management**
   - Follow semantic versioning
   - Tag releases properly
   - Update support timelines
