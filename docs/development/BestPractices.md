# MeasurementSystem Best Practices

This guide outlines recommended patterns and approaches for working with the MeasurementSystem components.

## Component Architecture

### Component Organization

1. **Separation of Concerns**
```typescript
// ✅ Good: Separate logic into hooks
function useTemplateSelection(initialTemplate?: string) {
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate);
  // Selection logic
  return { selectedTemplate, setSelectedTemplate };
}

// ❌ Bad: Mixed concerns
function TemplateSelector({ templates }) {
  const [selected, setSelected] = useState();
  const [filter, setFilter] = useState();
  const [sort, setSort] = useState();
  // Too many responsibilities
}
```

2. **Prop Interface Design**
```typescript
// ✅ Good: Clear, focused props
interface ComparisonViewProps {
  comparisons: MeasurementComparison[];
  template: MeasurementTemplate;
  onPointClick?: (pointId: string) => void;
}

// ❌ Bad: Overly complex props
interface ComparisonViewProps {
  data: any; // Too generic
  config: {
    template: MeasurementTemplate;
    settings: unknown;
    callbacks: Record<string, Function>;
  };
}
```

3. **State Management**
```typescript
// ✅ Good: Controlled state with defaults
const [filter, setFilter] = useState<FilterOptions>({
  date: null,
  template: null,
  status: 'all'
});

// ❌ Bad: Multiple unrelated state variables
const [dateFilter, setDateFilter] = useState(null);
const [templateFilter, setTemplateFilter] = useState(null);
const [statusFilter, setStatusFilter] = useState('all');
```

## Performance Optimization

### Rendering Optimization

1. **Memoization**
```typescript
// ✅ Good: Memoize expensive calculations
const sortedTemplates = useMemo(() => {
  return templates.sort((a, b) => b.updatedAt - a.updatedAt);
}, [templates]);

// ❌ Bad: Recalculating every render
const sortedTemplates = templates.sort((a, b) => 
  b.updatedAt - a.updatedAt
);
```

2. **List Rendering**
```typescript
// ✅ Good: Virtualized list for large datasets
import { FixedSizeList } from 'react-window';

function HistoryList({ items }) {
  return (
    <FixedSizeList
      height={400}
      width="100%"
      itemCount={items.length}
      itemSize={50}
    >
      {({ index, style }) => (
        <HistoryItem
          item={items[index]}
          style={style}
        />
      )}
    </FixedSizeList>
  );
}

// ❌ Bad: Rendering all items at once
function HistoryList({ items }) {
  return items.map(item => (
    <HistoryItem key={item.id} item={item} />
  ));
}
```

3. **Event Handling**
```typescript
// ✅ Good: Debounced updates
const handleSearch = useCallback(
  debounce((value: string) => {
    setSearchTerm(value);
  }, 300),
  []
);

// ❌ Bad: Immediate updates
const handleSearch = (value: string) => {
  setSearchTerm(value);
};
```

## Data Management

### Template Management

1. **Template Validation**
```typescript
// ✅ Good: Comprehensive validation
function validateTemplate(template: unknown): template is MeasurementTemplate {
  if (!template || typeof template !== 'object') return false;
  
  return (
    'id' in template &&
    'name' in template &&
    'points' in template &&
    Array.isArray(template.points) &&
    template.points.every(isValidPoint)
  );
}

// ❌ Bad: Partial validation
function validateTemplate(template: any) {
  return template.id && template.name;
}
```

2. **Data Transformation**
```typescript
// ✅ Good: Centralized transformation
const transformMeasurements = (raw: RawMeasurement[]): MeasurementHistory => ({
  sessionId: generateId(),
  timestamp: new Date(),
  readings: raw,
  comparisons: calculateComparisons(raw),
  summary: generateSummary(raw)
});

// ❌ Bad: Inline transformation
const measurements = {
  sessionId: Date.now().toString(),
  readings: rawData,
  // Inconsistent transformation
};
```

## Error Handling

### Component Error Boundaries

1. **Error Boundary Implementation**
```typescript
// ✅ Good: Specific error boundary
class MeasurementErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} />;
    }
    return this.props.children;
  }
}

// ❌ Bad: No error handling
function MeasurementSystem() {
  // Unhandled errors will crash the app
}
```

2. **Error Recovery**
```typescript
// ✅ Good: Graceful degradation
function ComparisonView({ comparisons, template }) {
  if (!template) {
    return <TemplateError onRetry={handleRetry} />;
  }
  
  return (
    <ErrorBoundary fallback={ErrorDisplay}>
      {/* Component content */}
    </ErrorBoundary>
  );
}

// ❌ Bad: Abrupt failure
function ComparisonView({ comparisons, template }) {
  // Will throw if template is undefined
  return <div>{template.name}</div>;
}
```

## Testing

### Component Testing

1. **Test Organization**
```typescript
// ✅ Good: Structured tests
describe('TemplateSelector', () => {
  describe('rendering', () => {
    it('displays template list');
    it('shows empty state');
  });

  describe('interactions', () => {
    it('handles selection');
    it('filters templates');
  });
});

// ❌ Bad: Unstructured tests
describe('TemplateSelector', () => {
  it('test 1');
  it('test 2');
});
```

2. **Test Coverage**
```typescript
// ✅ Good: Comprehensive testing
describe('exportMeasurementHistory', () => {
  it('exports valid CSV format');
  it('handles special characters in CSV');
  it('includes headers in CSV');
  it('validates input data');
  it('handles empty datasets');
  it('throws on invalid format');
});

// ❌ Bad: Minimal testing
describe('exportMeasurementHistory', () => {
  it('exports data');
});
```

## Documentation

### Code Documentation

1. **Component Documentation**
```typescript
// ✅ Good: Clear documentation
/**
 * Displays and manages measurement templates.
 * 
 * @param templates - Array of available templates
 * @param selectedTemplate - Currently selected template ID
 * @param onSelect - Callback when template is selected
 * 
 * @example
 * <TemplateSelector
 *   templates={templates}
 *   selectedTemplate="template-1"
 *   onSelect={handleSelect}
 * />
 */
function TemplateSelector(props: Props) {
  // Implementation
}

// ❌ Bad: Missing or unclear documentation
// Shows templates
function TemplateSelector(props: Props) {
  // Implementation
}
```

2. **Type Documentation**
```typescript
// ✅ Good: Documented types
/**
 * Represents a measurement template.
 * Templates define measurement points and reference values.
 */
interface MeasurementTemplate {
  /** Unique identifier for the template */
  id: string;
  /** Display name */
  name: string;
  /** Measurement points */
  points: Point[];
  /** Grid spacing in meters */
  gridSpacing: number;
}

// ❌ Bad: Undocumented types
interface MeasurementTemplate {
  id: string;
  name: string;
  points: Point[];
  gridSpacing: number;
}
```

## Accessibility

### Component Accessibility

1. **ARIA Attributes**
```typescript
// ✅ Good: Proper ARIA usage
<button
  aria-label="Export measurement data"
  aria-pressed={isExporting}
  onClick={handleExport}
>
  {isExporting ? 'Exporting...' : 'Export'}
</button>

// ❌ Bad: Missing accessibility
<button onClick={handleExport}>
  Export
</button>
```

2. **Keyboard Navigation**
```typescript
// ✅ Good: Keyboard support
function TemplateList() {
  return (
    <div role="listbox" tabIndex={0}>
      {templates.map(template => (
        <div
          role="option"
          tabIndex={-1}
          aria-selected={template.id === selectedId}
        >
          {template.name}
        </div>
      ))}
    </div>
  );
}

// ❌ Bad: No keyboard support
function TemplateList() {
  return (
    <div>
      {templates.map(template => (
        <div>{template.name}</div>
      ))}
    </div>
  );
}
