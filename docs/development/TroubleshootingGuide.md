# MeasurementSystem Troubleshooting Guide

This guide covers common issues you might encounter while working with the MeasurementSystem components and their solutions.

## Component Issues

### TemplateSelector

#### Template List Not Rendering
```
Issue: Template list appears empty despite valid data being passed.
```

**Possible Causes:**
1. Templates array is undefined or empty
2. Template data structure doesn't match expected format
3. React key prop missing in list rendering

**Solutions:**
```typescript
// 1. Add data validation
const TemplateSelector: React.FC<Props> = ({ templates = [] }) => {
  if (!templates.length) {
    return <div>No templates available</div>;
  }
  // ...
};

// 2. Verify template structure
const isValidTemplate = (template: unknown): template is MeasurementTemplate => {
  return (
    typeof template === 'object' &&
    template !== null &&
    'id' in template &&
    'name' in template
  );
};

// 3. Add proper key prop
{templates.map(template => (
  <div key={template.id}>
    {template.name}
  </div>
))}
```

### ComparisonView

#### Deviation Colors Not Showing
```
Issue: Deviation values don't show correct color coding.
```

**Possible Causes:**
1. Missing or invalid reference values
2. Incorrect deviation calculation
3. CSS styles not being applied

**Solutions:**
```typescript
// 1. Validate reference values
if (!template.referenceValues) {
  console.error('Missing reference values');
  return null;
}

// 2. Check deviation calculation
const calculateDeviation = (actual: number, expected: number): number => {
  return Number((actual - expected).toFixed(2));
};

// 3. Verify style application
const getDeviationColor = (deviation: number): string => {
  if (Math.abs(deviation) <= tolerance) return '#28a745';
  return deviation > 0 ? '#dc3545' : '#ffc107';
};
```

### HistoryView

#### Date Filtering Issues
```
Issue: Date filters not working correctly.
```

**Possible Causes:**
1. Timezone differences
2. Date format inconsistencies
3. Invalid date comparisons

**Solutions:**
```typescript
// 1. Normalize dates to UTC
const normalizeDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// 2. Consistent date formatting
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US').format(date);
};

// 3. Safe date comparison
const isSameDay = (date1: Date, date2: Date): boolean => {
  return normalizeDate(date1) === normalizeDate(date2);
};
```

## Export Issues

### PDF Generation

#### PDF Layout Problems
```
Issue: PDF content is misaligned or truncated.
```

**Possible Causes:**
1. Page margins not set
2. Content overflow
3. Font loading issues

**Solutions:**
```typescript
// 1. Set proper margins
const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  }
});

// 2. Handle content overflow
const addContentWithPagination = (doc: jsPDF, content: string) => {
  const pageHeight = doc.internal.pageSize.height;
  const lines = doc.splitTextToSize(content, 170);
  let cursorY = 20;

  lines.forEach(line => {
    if (cursorY > pageHeight - 20) {
      doc.addPage();
      cursorY = 20;
    }
    doc.text(line, 20, cursorY);
    cursorY += 7;
  });
};

// 3. Embed fonts
doc.setFont('helvetica', 'normal');
```

### CSV Export

#### Character Encoding Issues
```
Issue: Special characters appear corrupted in CSV.
```

**Possible Causes:**
1. Missing BOM for Excel compatibility
2. Incorrect character encoding
3. Special character handling

**Solutions:**
```typescript
// 1. Add BOM for Excel
const exportToCSV = (data: string): Blob => {
  const BOM = '\uFEFF';
  return new Blob([BOM + data], { 
    type: 'text/csv;charset=utf-8' 
  });
};

// 2. Handle special characters
const escapeCSV = (value: string): string => {
  if (value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

// 3. Proper line endings
const formatCSVLine = (values: string[]): string => {
  return values.map(escapeCSV).join(',') + '\r\n';
};
```

## Performance Issues

### Memory Leaks

#### Component Cleanup
```
Issue: Memory usage increases over time.
```

**Possible Causes:**
1. Uncleared intervals/timeouts
2. Uncleaned event listeners
3. Uncancelled subscriptions

**Solutions:**
```typescript
// 1. Clear timers
useEffect(() => {
  const timer = setInterval(() => {
    // Update logic
  }, 1000);

  return () => clearInterval(timer);
}, []);

// 2. Remove listeners
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

// 3. Cancel subscriptions
useEffect(() => {
  const subscription = observable.subscribe();
  return () => subscription.unsubscribe();
}, []);
```

### Rendering Performance

#### Slow Component Updates
```
Issue: UI becomes unresponsive during updates.
```

**Possible Causes:**
1. Unnecessary re-renders
2. Large data sets
3. Complex calculations

**Solutions:**
```typescript
// 1. Memoize expensive calculations
const memoizedValue = useMemo(() => {
  return expensiveCalculation(props.data);
}, [props.data]);

// 2. Virtualize large lists
import { FixedSizeList } from 'react-window';

const VirtualizedList = ({ items }) => (
  <FixedSizeList
    height={400}
    width={600}
    itemCount={items.length}
    itemSize={35}
  >
    {({ index, style }) => (
      <div style={style}>{items[index]}</div>
    )}
  </FixedSizeList>
);

// 3. Debounce frequent updates
const debouncedUpdate = useCallback(
  debounce((value) => {
    updateData(value);
  }, 300),
  []
);
```

## Network Issues

### Data Fetching

#### Failed API Requests
```
Issue: Data not loading or updates failing.
```

**Possible Causes:**
1. Network connectivity
2. CORS issues
3. Invalid request format

**Solutions:**
```typescript
// 1. Add retry logic
const fetchWithRetry = async (url: string, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
};

// 2. Handle CORS
const fetchData = async (url: string) => {
  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error(response.statusText);
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// 3. Validate request data
const validateRequestData = (data: unknown): boolean => {
  // Implement validation logic
  return true;
};
```

## Development Environment

### Build Issues

#### TypeScript Errors
```
Issue: TypeScript compilation fails.
```

**Solutions:**
1. Check tsconfig.json settings
2. Update type definitions
3. Clear TypeScript cache:
```bash
rm -rf node_modules/.cache/typescript/
```

#### Test Failures
```
Issue: Tests failing unexpectedly.
```

**Solutions:**
1. Update test snapshots:
```bash
npm test -- -u
```
2. Clear Jest cache:
```bash
npm test -- --clearCache
```
3. Check test environment setup
