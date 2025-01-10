# Testing Guide

## Overview

This guide explains the testing strategy and practices for the Inspection Report System. Our testing approach ensures code quality, reliability, and maintainability through comprehensive test coverage.

## Testing Stack

### Core Testing Tools
- Jest (Test Runner)
- React Testing Library
- Cypress (E2E Testing)
- Jest Mock Extended
- MSW (API Mocking)

### Test Types
1. Unit Tests
2. Integration Tests
3. End-to-End Tests
4. Performance Tests
5. API Tests

## Test Structure

### Directory Organization
```
__tests__/
├── unit/                 # Unit tests
├── integration/         # Integration tests
├── e2e/                # End-to-end tests
├── api/                # API tests
├── performance/        # Performance tests
└── utils/              # Test utilities
```

### File Naming
- Unit tests: `*.test.ts`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.test.ts`
- API tests: `*.api.test.ts`
- Performance tests: `*.perf.test.ts`

## Writing Tests

### Unit Tests

#### Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MoistureReading } from '@app/components/MoistureReading';

describe('MoistureReading', () => {
  it('displays reading value', () => {
    render(<MoistureReading value={15.5} />);
    expect(screen.getByText('15.5')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const onChange = jest.fn();
    render(<MoistureReading value={15.5} onChange={onChange} />);
    
    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: '16.5' },
    });
    
    expect(onChange).toHaveBeenCalledWith(16.5);
  });
});
```

#### Service Testing
```typescript
import { MoistureService } from '@app/services/MoistureService';
import { prisma } from '@app/lib/prisma';
import { createMockReading } from '@tests/utils/testUtils';

jest.mock('@app/lib/prisma');

describe('MoistureService', () => {
  let service: MoistureService;

  beforeEach(() => {
    service = new MoistureService();
  });

  it('validates reading values', async () => {
    const reading = createMockReading();
    const result = await service.validateReading(reading);
    expect(result.isValid).toBe(true);
  });
});
```

### Integration Tests

#### API Integration
```typescript
import { setupTestServer } from '@tests/utils/testServer';
import { createMockReading } from '@tests/utils/testUtils';

describe('Moisture API', () => {
  const server = setupTestServer();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('creates new reading', async () => {
    const reading = createMockReading();
    const response = await fetch('/api/readings', {
      method: 'POST',
      body: JSON.stringify(reading),
    });
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.reading).toMatchObject(reading);
  });
});
```

#### Component Integration
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { JobDetails } from '@app/components/JobDetails';
import { useJobData } from '@app/hooks/useJobData';

jest.mock('@app/hooks/useJobData');

describe('JobDetails Integration', () => {
  it('loads and displays job data', async () => {
    const mockJob = {
      id: 'job-123',
      readings: [createMockReading()],
    };
    
    (useJobData as jest.Mock).mockReturnValue({
      data: mockJob,
      isLoading: false,
    });

    render(<JobDetails jobId="job-123" />);
    
    await waitFor(() => {
      expect(screen.getByText(mockJob.id)).toBeInTheDocument();
      expect(screen.getByText('15.5')).toBeInTheDocument();
    });
  });
});
```

### E2E Tests

```typescript
describe('Job Workflow', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/jobs');
  });

  it('completes job creation flow', () => {
    cy.get('[data-testid="create-job"]').click();
    cy.get('[data-testid="client-input"]').type('Test Client');
    cy.get('[data-testid="location-input"]').type('123 Test St');
    cy.get('[data-testid="submit-job"]').click();
    
    cy.url().should('include', '/jobs/');
    cy.contains('Job created successfully');
  });
});
```

## Test Utilities

### Mock Data Generation
```typescript
// __tests__/utils/testUtils.ts
export const createMockReading = (overrides = {}) => ({
  id: `reading-${Date.now()}`,
  value: 15.5,
  timestamp: new Date(),
  location: { x: 0, y: 0, z: 0 },
  ...overrides,
});

export const createMockJob = (overrides = {}) => ({
  id: `job-${Date.now()}`,
  status: 'PENDING',
  readings: [createMockReading()],
  ...overrides,
});
```

### Test Helpers
```typescript
// __tests__/utils/testHelpers.ts
export const waitForElement = async (
  callback: () => HTMLElement | null,
  timeout = 5000
) => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const element = callback();
    if (element) return element;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Element not found');
};
```

## Testing Best Practices

### General Guidelines
1. Test behavior, not implementation
2. Keep tests focused and isolated
3. Use meaningful test descriptions
4. Follow AAA pattern (Arrange, Act, Assert)
5. Maintain test independence

### Component Testing
- Test user interactions
- Verify rendered content
- Check state changes
- Test error states
- Validate accessibility

### API Testing
- Test success cases
- Validate error responses
- Check edge cases
- Test rate limiting
- Verify authentication

### Performance Testing
- Measure response times
- Check memory usage
- Test under load
- Verify caching
- Monitor resource usage

## Test Coverage

### Coverage Goals
- Statements: 80%
- Branches: 80%
- Functions: 90%
- Lines: 80%

### Running Coverage
```bash
# Full coverage report
npm run test:coverage

# Coverage for specific files
npm run test:coverage -- --collectCoverageFrom="src/**/*.{ts,tsx}"
```

### Coverage Report
```bash
# Example coverage output
--------------------------------|---------|----------|---------|---------|
File                            | % Stmts | % Branch | % Funcs | % Lines |
--------------------------------|---------|----------|---------|---------|
All files                       |   85.71 |    83.33 |   88.89 |   85.71 |
 components/MoistureReading.tsx |   90.91 |    85.71 |   88.89 |   90.91 |
 services/MoistureService.ts    |   83.33 |    81.82 |   88.89 |   83.33 |
--------------------------------|---------|----------|---------|---------|
```

## Continuous Integration

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Debugging Tests

### Common Issues
1. Async timing problems
2. State persistence between tests
3. Mock implementation issues
4. Environment variables
5. Database connections

### Solutions
- Use proper cleanup
- Implement better mocks
- Add debugging logs
- Check test isolation
- Verify environment

## Performance Testing

### Load Testing
```typescript
import { performance } from 'perf_hooks';

describe('API Performance', () => {
  it('handles multiple requests', async () => {
    const start = performance.now();
    const requests = Array(100).fill(null).map(() =>
      fetch('/api/readings')
    );
    
    await Promise.all(requests);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(5000);
  });
});
```

### Memory Testing
```typescript
import { MemoryMonitor } from '@tests/utils/MemoryMonitor';

describe('Memory Usage', () => {
  it('maintains stable memory', async () => {
    const monitor = new MemoryMonitor();
    monitor.start();
    
    // Perform operations
    
    const usage = monitor.stop();
    expect(usage.heapUsed).toBeLessThan(50 * 1024 * 1024); // 50MB
  });
});
```

## Test Documentation

### JSDoc Examples
```typescript
/**
 * Tests the moisture reading validation logic
 * @param {MoistureReading} reading - The reading to validate
 * @returns {Promise<boolean>} Whether the reading is valid
 */
async function testReadingValidation(reading: MoistureReading): Promise<boolean> {
  // Test implementation
}
```

### Test Description
```typescript
describe('MoistureService', () => {
  /**
   * Validates that readings within normal range are accepted
   * and those outside range are rejected
   */
  it('validates reading ranges correctly', () => {
    // Test implementation
  });
});
```

## Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Documentation](https://docs.cypress.io)

### Tools
- [Jest Mock Extended](https://github.com/marchaos/jest-mock-extended)
- [MSW (Mock Service Worker)](https://mswjs.io/)
- [Testing Playground](https://testing-playground.com/)

### Best Practices
- [Testing Trophy](https://kentcdodds.com/blog/write-tests)
- [Testing JavaScript](https://testingjavascript.com/)
- [React Testing Best Practices](https://reactjs.org/docs/testing.html)
