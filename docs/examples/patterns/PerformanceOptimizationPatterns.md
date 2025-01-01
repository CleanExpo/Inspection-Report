# Performance Optimization Patterns

This document outlines key patterns and best practices for optimizing performance in the inspection report application.

## Table of Contents
1. [Memoization Patterns](#memoization-patterns)
2. [Code Splitting Patterns](#code-splitting-patterns)
3. [Lazy Loading Implementation](#lazy-loading-implementation) (Coming Soon)
4. [Bundle Optimization](#bundle-optimization) (Coming Soon)

## Memoization Patterns

### React Component Memoization

Use `React.memo()` for components that receive the same props frequently but don't need to re-render:

```tsx
// Before optimization
const InspectionCard = ({ data, onSelect }) => {
  return (
    <div className="card">
      <h3>{data.title}</h3>
      <p>{data.description}</p>
      <button onClick={() => onSelect(data.id)}>Select</button>
    </div>
  );
};

// After optimization
const InspectionCard = React.memo(({ data, onSelect }) => {
  return (
    <div className="card">
      <h3>{data.title}</h3>
      <p>{data.description}</p>
      <button onClick={() => onSelect(data.id)}>Select</button>
    </div>
  );
});
```

### Callback Memoization

Use `useCallback` for function props to prevent unnecessary re-renders:

```tsx
// Before optimization
const MoistureReadings = ({ readings }) => {
  const handleReadingUpdate = (id, value) => {
    // Update logic
  };

  return <ReadingsList readings={readings} onUpdate={handleReadingUpdate} />;
};

// After optimization
const MoistureReadings = ({ readings }) => {
  const handleReadingUpdate = useCallback((id, value) => {
    // Update logic
  }, []); // Empty deps array if no dependencies

  return <ReadingsList readings={readings} onUpdate={handleReadingUpdate} />;
};
```

### Value Memoization

Use `useMemo` for expensive computations or when maintaining referential equality is important:

```tsx
const MoistureAnalysis = ({ readings }) => {
  // Before optimization
  const statistics = {
    average: readings.reduce((sum, r) => sum + r.value, 0) / readings.length,
    max: Math.max(...readings.map(r => r.value)),
    min: Math.min(...readings.map(r => r.value))
  };

  // After optimization
  const statistics = useMemo(() => ({
    average: readings.reduce((sum, r) => sum + r.value, 0) / readings.length,
    max: Math.max(...readings.map(r => r.value)),
    min: Math.min(...readings.map(r => r.value))
  }), [readings]);

  return (
    <div>
      <StatisticsDisplay stats={statistics} />
    </div>
  );
};
```

### Best Practices for Memoization

1. **Don't Memoize Everything**
   - Only memoize components that receive the same props frequently
   - Focus on components that perform expensive calculations
   - Consider memoization when dealing with large lists or complex data structures

2. **Proper Dependency Arrays**
   ```tsx
   // Good: Specific dependencies
   const memoizedValue = useMemo(() => computeValue(prop1, prop2), [prop1, prop2]);
   
   // Bad: Missing dependencies
   const memoizedValue = useMemo(() => computeValue(prop1, prop2), [prop1]);
   ```

3. **Avoid Inline Object Creation**
   ```tsx
   // Bad: New object created every render
   <MemoizedComponent style={{ margin: 10 }} />
   
   // Good: Stable object reference
   const styles = useMemo(() => ({ margin: 10 }), []);
   <MemoizedComponent style={styles} />
   ```

4. **Profile Before Optimizing**
   - Use React DevTools Performance tab to identify unnecessary re-renders
   - Measure performance impact before and after memoization
   - Document performance improvements in code comments

### When Not to Use Memoization

1. Simple components with minimal props
2. Components that always need to re-render
3. When the memoization overhead exceeds the performance benefit

```tsx
// Don't memoize simple components
const SimpleLabel = ({ text }) => <span>{text}</span>;

// Do memoize complex components
const ComplexChart = React.memo(({ data, config }) => {
  // Complex rendering logic
});
```

## Code Splitting Patterns

### Route-Based Code Splitting

Implement route-based code splitting using Next.js's built-in features:

```tsx
// pages/index.tsx - Automatically code-split by Next.js
export default function HomePage() {
  return <MainDashboard />;
}

// pages/inspection/[id].tsx - Separate bundle
export default function InspectionPage() {
  return <InspectionDetails />;
}
```

### Component-Based Code Splitting

Use dynamic imports for component-level code splitting:

```tsx
// Before: Direct import
import { ComplexChart } from '@/components/ComplexChart';

// After: Dynamic import
const ComplexChart = dynamic(() => import('@/components/ComplexChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false // Disable SSR if component uses browser-only APIs
});
```

### Library Splitting

Split large third-party libraries into separate chunks:

```tsx
// Before: Direct import of large library
import { massive } from 'massive-library';

// After: Dynamic import when needed
const MassiveComponent = () => {
  const [MassiveLib, setMassiveLib] = useState(null);

  useEffect(() => {
    import('massive-library').then(module => {
      setMassiveLib(module.massive);
    });
  }, []);

  if (!MassiveLib) return <LoadingSpinner />;
  return <MassiveLib {...props} />;
};
```

### Best Practices for Code Splitting

1. **Strategic Split Points**
   ```tsx
   // Good: Split at route level
   const InspectionRoutes = {
     list: dynamic(() => import('./routes/InspectionList')),
     details: dynamic(() => import('./routes/InspectionDetails')),
     edit: dynamic(() => import('./routes/InspectionEdit'))
   };

   // Good: Split large features
   const AdvancedAnalytics = dynamic(() => 
     import('./features/Analytics').then(mod => mod.AdvancedAnalytics)
   );
   ```

2. **Preloading Critical Chunks**
   ```tsx
   // Preload on hover/focus for better UX
   const PreloadableChart = dynamic(() => import('./Chart'), {
     loading: () => <ChartSkeleton />,
     ssr: false
   });

   const ChartContainer = () => {
     const handleMouseEnter = () => {
       // Preload on hover
       const preload = () => import('./Chart');
       preload();
     };

     return (
       <div onMouseEnter={handleMouseEnter}>
         <PreloadableChart />
       </div>
     );
   };
   ```

3. **Error Boundaries for Split Components**
   ```tsx
   class DynamicComponentError extends React.Component {
     state = { hasError: false };

     static getDerivedStateFromError() {
       return { hasError: true };
     }

     render() {
       if (this.state.hasError) {
         return <ErrorFallback retry={() => this.setState({ hasError: false })} />;
       }
       return this.props.children;
     }
   }

   // Usage
   const SafeDynamicComponent = () => (
     <DynamicComponentError>
       <DynamicFeature />
     </DynamicComponentError>
   );
   ```

### Common Pitfalls to Avoid

1. **Over-splitting**
   ```tsx
   // Bad: Too granular splitting
   const Button = dynamic(() => import('./Button')); // Small component
   const Label = dynamic(() => import('./Label')); // Small component

   // Good: Group related small components
   const UIComponents = dynamic(() => import('./UIComponents')); // Bundle of small UI components
   ```

2. **Inconsistent Loading States**
   ```tsx
   // Bad: Inconsistent loading experience
   const Component1 = dynamic(() => import('./Component1'));
   const Component2 = dynamic(() => import('./Component2'));

   // Good: Consistent loading experience
   const LoadingState = () => <div className="skeleton-loader" />;
   const Component1 = dynamic(() => import('./Component1'), { loading: LoadingState });
   const Component2 = dynamic(() => import('./Component2'), { loading: LoadingState });
   ```

3. **Missing Error Handling**
   ```tsx
   // Bad: No error handling
   const RiskyComponent = dynamic(() => import('./RiskyComponent'));

   // Good: With error handling
   const SafeComponent = dynamic(() => import('./RiskyComponent'), {
     loading: LoadingState,
     error: ({ error, retry }) => (
       <ErrorBoundary error={error} retry={retry} />
     )
   });
   ```

## Lazy Loading Implementation
(Coming in next update)

## Bundle Optimization
(Coming in next update)
