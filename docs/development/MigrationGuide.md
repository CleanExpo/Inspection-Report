# MeasurementSystem Migration Guide

This guide provides instructions for migrating between different versions of the MeasurementSystem components.

## Version 2.0.0

### Breaking Changes

1. **Template Structure Changes**
```typescript
// Before (1.x)
interface Template {
  id: string;
  points: Point[];
  settings: {
    gridSize: number;
    dryValue: number;
    warningValue: number;
    criticalValue: number;
  };
}

// After (2.0)
interface MeasurementTemplate {
  id: string;
  name: string;
  description: string;
  points: Point[];
  gridSpacing: number;
  referenceValues: {
    dry: number;
    warning: number;
    critical: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

Migration steps:
```typescript
function migrateTemplate(oldTemplate: any): MeasurementTemplate {
  return {
    id: oldTemplate.id,
    name: oldTemplate.id, // Use ID as name if not available
    description: '', // Add empty description
    points: oldTemplate.points,
    gridSpacing: oldTemplate.settings.gridSize,
    referenceValues: {
      dry: oldTemplate.settings.dryValue,
      warning: oldTemplate.settings.warningValue,
      critical: oldTemplate.settings.criticalValue
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
```

2. **Component Props Updates**

```typescript
// Before (1.x)
<TemplateSelector
  data={templates}
  onTemplateSelect={handleSelect}
  config={{ /* ... */ }}
/>

// After (2.0)
<TemplateSelector
  templates={templates}
  selectedTemplate={selectedId}
  onSelect={handleSelect}
/>
```

Migration steps:
```typescript
// Update component usage
function MigratedComponent() {
  // Before
  const [selected, setSelected] = useState();
  const handleSelect = (template, config) => {
    setSelected(template);
    // Handle config
  };

  // After
  const [selectedId, setSelectedId] = useState();
  const handleSelect = (templateId) => {
    setSelectedId(templateId);
  };

  return (
    <TemplateSelector
      templates={templates}
      selectedTemplate={selectedId}
      onSelect={handleSelect}
    />
  );
}
```

3. **Export Format Changes**

```typescript
// Before (1.x)
const exportData = (data, type) => {
  switch (type) {
    case 'csv':
      return exportCSV(data);
    case 'pdf':
      return exportPDF(data);
    default:
      return null;
  }
};

// After (2.0)
import { exportMeasurementHistory } from './exportUtils';

const exportData = async (history, template, format) => {
  return exportMeasurementHistory(history, template, format);
};
```

Migration steps:
```typescript
// Update export handling
async function migrateExport(oldExport: any) {
  const history = {
    sessionId: generateId(),
    templateId: oldExport.templateId,
    timestamp: new Date(oldExport.date),
    readings: oldExport.readings,
    comparisons: oldExport.comparisons.map(c => ({
      point: c.point,
      expectedValue: c.expected,
      actualValue: c.actual,
      deviation: c.actual - c.expected,
      withinTolerance: Math.abs(c.actual - c.expected) <= c.tolerance
    })),
    summary: calculateSummary(oldExport.comparisons)
  };

  return history;
}
```

### New Features

1. **History View Component**

```typescript
// Add history tracking
const [history, setHistory] = useState<MeasurementHistory[]>([]);

// Store measurements in history
const saveMeasurement = (measurement: MeasurementHistory) => {
  setHistory(prev => [...prev, measurement]);
};

// Render history view
<HistoryView
  history={history}
  templates={templates}
  onSelectEntry={handleSelect}
  onExport={handleExport}
/>
```

2. **Comparison View Enhancements**

```typescript
// Add new comparison features
<ComparisonView
  comparisons={measurements}
  template={selectedTemplate}
  onPointClick={handlePointClick}
  showDeviation={true}  // New in 2.0
  highlightOutOfTolerance={true}  // New in 2.0
/>
```

### Deprecated Features

1. **Legacy Export Functions**
```typescript
// Deprecated in 2.0
export function exportToCSV(data: any): string;
export function exportToPDF(data: any): Blob;

// Use instead
export function exportMeasurementHistory(
  history: MeasurementHistory,
  template: MeasurementTemplate,
  format: 'csv' | 'pdf' | 'json'
): string | Blob;
```

2. **Legacy Configuration Options**
```typescript
// Deprecated in 2.0
interface Config {
  gridSize: number;
  tolerance: number;
  export: {
    format: string;
    options: any;
  };
}

// Use instead
interface MeasurementTemplate {
  gridSpacing: number;
  referenceValues: {
    dry: number;
    warning: number;
    critical: number;
  };
}
```

## Version 1.5.0

### Breaking Changes

1. **Point Structure Updates**
```typescript
// Before (1.4.x)
interface Point {
  x: number;
  y: number;
  value: number;
}

// After (1.5)
interface Point {
  id: string;
  label: string;
  x: number;
  y: number;
}
```

Migration steps:
```typescript
function migratePoints(oldPoints: any[]): Point[] {
  return oldPoints.map((point, index) => ({
    id: `p${index + 1}`,
    label: `Point ${index + 1}`,
    x: point.x,
    y: point.y
  }));
}
```

### Deprecation Notices

The following features are deprecated in 1.5.0 and will be removed in 2.0.0:

1. **Direct Value Assignment**
```typescript
// Deprecated
point.value = measurement;

// Use instead
measurement.point = point;
measurement.value = value;
```

2. **Simple Export Format**
```typescript
// Deprecated
exportData(points);

// Use instead
exportData({
  template,
  points,
  measurements
});
```

## Migration Scripts

### 2.0.0 Migration Script

```typescript
// migration-2.0.0.ts
import { readFileSync, writeFileSync } from 'fs';

async function migrateToV2() {
  try {
    // Read old data
    const oldData = JSON.parse(
      readFileSync('./data/templates.json', 'utf-8')
    );

    // Migrate templates
    const migratedTemplates = oldData.templates.map(migrateTemplate);

    // Migrate measurements
    const migratedMeasurements = oldData.measurements.map(
      migrateMeasurement
    );

    // Save migrated data
    writeFileSync(
      './data/templates-v2.json',
      JSON.stringify(migratedTemplates, null, 2)
    );
    writeFileSync(
      './data/measurements-v2.json',
      JSON.stringify(migratedMeasurements, null, 2)
    );

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run migration
migrateToV2().catch(console.error);
```

### 1.5.0 Migration Script

```typescript
// migration-1.5.0.ts
import { readFileSync, writeFileSync } from 'fs';

async function migrateToV1_5() {
  try {
    // Read old data
    const oldData = JSON.parse(
      readFileSync('./data/points.json', 'utf-8')
    );

    // Migrate points
    const migratedPoints = migratePoints(oldData.points);

    // Save migrated data
    writeFileSync(
      './data/points-v1.5.json',
      JSON.stringify(migratedPoints, null, 2)
    );

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run migration
migrateToV1_5().catch(console.error);
```

## Troubleshooting

### Common Migration Issues

1. **Missing Template Properties**
```typescript
// Problem: Undefined properties after migration
const template = migrateTemplate(oldTemplate);
console.log(template.name); // undefined

// Solution: Add default values
function migrateTemplate(oldTemplate: any): MeasurementTemplate {
  return {
    ...oldTemplate,
    name: oldTemplate.name || `Template ${oldTemplate.id}`,
    description: oldTemplate.description || '',
    // ... other properties
  };
}
```

2. **Data Type Mismatches**
```typescript
// Problem: Type conversion issues
const measurement = migrateMeasurement(oldMeasurement);
// Error: Cannot convert undefined to number

// Solution: Add type checking and conversion
function migrateMeasurement(old: any) {
  return {
    ...old,
    value: Number(old.value) || 0,
    timestamp: new Date(old.timestamp || Date.now())
  };
}
```

### Version Compatibility

| Feature | 1.4.x | 1.5.x | 2.0.x |
|---------|-------|-------|-------|
| Basic Templates | ✓ | ✓ | ✓ |
| Point Values | ✓ | Deprecated | Removed |
| Simple Export | ✓ | Deprecated | Removed |
| History View | - | - | ✓ |
| Advanced Export | - | - | ✓ |

## Post-Migration Steps

1. Update all component imports to use new paths
2. Update component props to match new interfaces
3. Test migrated data with new components
4. Update any custom implementations using deprecated features
5. Run the test suite to verify functionality
6. Update documentation references
7. Remove any unused legacy code

## Support

For additional migration support:
1. Check the troubleshooting guide
2. Review the API documentation
3. Submit issues on GitHub
4. Contact the development team
