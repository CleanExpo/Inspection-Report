# MeasurementSystem Development Setup Guide

This guide explains how to set up your development environment for working with the MeasurementSystem components.

## Environment Setup

### Requirements

- Node.js 16+
- npm 7+ or yarn
- Git
- Visual Studio Code (recommended)

### Recommended VS Code Extensions

1. ESLint
2. Prettier
3. TypeScript and JavaScript Language Features
4. Jest Runner
5. Tailwind CSS IntelliSense

## Project Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd your-project
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Install specific dependencies for MeasurementSystem:
```bash
npm install jspdf jspdf-autotable @testing-library/react @testing-library/jest-dom
```

## Development Workflow

### Directory Structure

```
components/
└── MoistureMappingSystem/
    └── MeasurementSystem/
        ├── types.ts                  # Type definitions
        ├── measurementUtils.ts       # Utility functions
        ├── TemplateSelector.tsx      # Template selection
        ├── ComparisonView.tsx        # Comparison visualization
        ├── HistoryView.tsx          # History management
        ├── exportUtils.ts           # Export functionality
        └── __tests__/               # Test files
            ├── measurementUtils.test.ts
            ├── TemplateSelector.test.tsx
            ├── ComparisonView.test.tsx
            ├── HistoryView.test.tsx
            └── exportUtils.test.ts
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- TemplateSelector.test.tsx

# Run tests in watch mode
npm test -- --watch
```

### Code Style

The project uses ESLint and Prettier for code formatting. Configuration files are provided in the root directory.

```bash
# Check code style
npm run lint

# Fix code style issues
npm run lint:fix
```

## Testing Guidelines

### Component Testing

1. Each component should have its own test file
2. Use React Testing Library for component tests
3. Test both success and error states
4. Mock external dependencies

Example test structure:
```typescript
import { render, fireEvent, screen } from '@testing-library/react';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('renders correctly', () => {
    // Test implementation
  });

  it('handles user interactions', () => {
    // Test implementation
  });

  it('handles errors gracefully', () => {
    // Test implementation
  });
});
```

### Utility Testing

1. Test each utility function independently
2. Cover edge cases and error conditions
3. Use meaningful test data

Example:
```typescript
import { utilityFunction } from '../utilities';

describe('utilityFunction', () => {
  it('processes valid input correctly', () => {
    // Test implementation
  });

  it('handles invalid input gracefully', () => {
    // Test implementation
  });

  it('returns expected error for edge cases', () => {
    // Test implementation
  });
});
```

## Type System

### Key Types

```typescript
// Template definition
interface MeasurementTemplate {
  id: string;
  name: string;
  description: string;
  points: Point[];
  gridSpacing: number;
  referenceValues: ReferenceValues;
  createdAt: Date;
  updatedAt: Date;
}

// Measurement data
interface MeasurementHistory {
  sessionId: string;
  templateId: string;
  timestamp: Date;
  readings: Reading[];
  comparisons: MeasurementComparison[];
  summary: MeasurementSummary;
}
```

### Type Checking

- Use TypeScript's strict mode
- Avoid using `any` type
- Document complex types with JSDoc comments

## Debugging

### VS Code Configuration

1. Create a `.vscode/launch.json` file:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Current File",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["${fileBasename}"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

2. Use the VS Code debugger to:
- Set breakpoints
- Step through code
- Inspect variables
- Debug tests

### Browser Debugging

1. Use React Developer Tools
2. Enable source maps in development
3. Use browser console for logging
4. Monitor network requests

## Performance Considerations

1. **Component Optimization**
   - Use React.memo for pure components
   - Implement useMemo and useCallback where appropriate
   - Avoid unnecessary re-renders

2. **Data Management**
   - Implement pagination for large datasets
   - Use efficient data structures
   - Cache frequently accessed data

3. **Export Operations**
   - Handle large exports asynchronously
   - Show progress indicators
   - Implement cleanup for temporary resources

## Common Issues and Solutions

1. **PDF Generation Issues**
   ```typescript
   // Ensure proper setup
   import jsPDF from 'jspdf';
   import 'jspdf-autotable';
   ```

2. **Type Errors**
   ```typescript
   // Use type guards
   function isValidTemplate(template: unknown): template is MeasurementTemplate {
     // Implementation
   }
   ```

3. **Memory Leaks**
   ```typescript
   // Clean up resources
   useEffect(() => {
     return () => {
       // Cleanup code
     };
   }, []);
   ```

## Next Steps

1. Review existing components
2. Run the test suite
3. Set up your development environment
4. Start with small improvements
5. Document your changes
