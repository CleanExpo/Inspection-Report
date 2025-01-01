# MeasurementSystem API Documentation

## Components

### TemplateSelector

A component for selecting and previewing measurement templates.

#### Props

```typescript
interface TemplateSelectorProps {
  templates: MeasurementTemplate[];
  selectedTemplate?: string;
  onSelect: (templateId: string) => void;
}
```

- `templates`: Array of available measurement templates
- `selectedTemplate`: Optional ID of currently selected template
- `onSelect`: Callback function when a template is selected

#### Usage Example

```tsx
import { TemplateSelector } from '@/components/MoistureMappingSystem/MeasurementSystem/TemplateSelector';

function MeasurementPage() {
  const [selectedId, setSelectedId] = useState<string>();
  
  return (
    <TemplateSelector
      templates={availableTemplates}
      selectedTemplate={selectedId}
      onSelect={setSelectedId}
    />
  );
}
```

### ComparisonView

A component for visualizing measurement comparisons between expected and actual values.

#### Props

```typescript
interface ComparisonViewProps {
  comparisons: MeasurementComparison[];
  template: MeasurementTemplate;
  onPointClick?: (pointId: string) => void;
}
```

- `comparisons`: Array of measurement comparisons
- `template`: The template used for measurements
- `onPointClick`: Optional callback when a point is clicked

#### Usage Example

```tsx
import { ComparisonView } from '@/components/MoistureMappingSystem/MeasurementSystem/ComparisonView';

function ResultsPage() {
  const handlePointClick = (pointId: string) => {
    // Handle point selection
  };

  return (
    <ComparisonView
      comparisons={measurementResults}
      template={currentTemplate}
      onPointClick={handlePointClick}
    />
  );
}
```

### HistoryView

A component for viewing and managing measurement history.

#### Props

```typescript
interface HistoryViewProps {
  history: MeasurementHistory[];
  templates: MeasurementTemplate[];
  onSelectEntry?: (entry: MeasurementHistory) => void;
  onExport?: (entry: MeasurementHistory) => void;
}
```

- `history`: Array of measurement history entries
- `templates`: Array of available templates
- `onSelectEntry`: Optional callback when an entry is selected
- `onExport`: Optional callback to handle entry export

#### Usage Example

```tsx
import { HistoryView } from '@/components/MoistureMappingSystem/MeasurementSystem/HistoryView';

function HistoryPage() {
  const handleExport = async (entry: MeasurementHistory) => {
    const template = templates.find(t => t.id === entry.templateId);
    if (!template) return;
    
    const result = exportMeasurementHistory(entry, template, 'pdf');
    // Handle the exported data
  };

  return (
    <HistoryView
      history={measurementHistory}
      templates={availableTemplates}
      onSelectEntry={setSelectedEntry}
      onExport={handleExport}
    />
  );
}
```

## Utilities

### exportUtils

Utilities for exporting measurement data in various formats.

#### Functions

```typescript
exportMeasurementHistory(
  history: MeasurementHistory,
  template: MeasurementTemplate,
  format: 'csv' | 'json' | 'pdf'
): string | Blob
```

Exports measurement history in the specified format:
- CSV: Returns a string with comma-separated values
- JSON: Returns a formatted JSON string
- PDF: Returns a Blob containing the PDF document

#### Usage Example

```typescript
import { exportMeasurementHistory } from '@/components/MoistureMappingSystem/MeasurementSystem/exportUtils';

// Export as CSV
const csvData = exportMeasurementHistory(entry, template, 'csv');
downloadFile(csvData, 'measurements.csv', 'text/csv');

// Export as JSON
const jsonData = exportMeasurementHistory(entry, template, 'json');
downloadFile(jsonData, 'measurements.json', 'application/json');

// Export as PDF
const pdfBlob = exportMeasurementHistory(entry, template, 'pdf');
const url = URL.createObjectURL(pdfBlob);
window.open(url);
```

## Types

### MeasurementTemplate

```typescript
interface MeasurementTemplate {
  id: string;
  name: string;
  description: string;
  points: {
    id: string;
    label: string;
    x: number;
    y: number;
  }[];
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

### MeasurementHistory

```typescript
interface MeasurementHistory {
  sessionId: string;
  templateId: string;
  timestamp: Date;
  readings: any[]; // Actual readings data
  comparisons: MeasurementComparison[];
  summary: {
    averageDeviation: number;
    maxDeviation: number;
    pointsOutOfTolerance: number;
  };
}
```

### MeasurementComparison

```typescript
interface MeasurementComparison {
  point: {
    id: string;
    label: string;
    x: number;
    y: number;
  };
  expectedValue: number;
  actualValue: number;
  deviation: number;
  withinTolerance: boolean;
}
