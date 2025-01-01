# MeasurementSystem Integration Guide

This guide explains how to integrate the MeasurementSystem components into your application.

## Prerequisites

- Next.js 13+ with App Router
- TypeScript 4.5+
- Tailwind CSS (optional, for styling)

## Installation

1. Copy the MeasurementSystem components to your project:
```bash
cp -r components/MoistureMappingSystem/MeasurementSystem /your-project/components/
```

2. Install required dependencies:
```bash
npm install jspdf jspdf-autotable
```

## Basic Integration

### 1. Template Selection

```tsx
// app/measurements/page.tsx
import { TemplateSelector } from '@/components/MoistureMappingSystem/MeasurementSystem/TemplateSelector';
import { useState } from 'react';

export default function MeasurementsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>();

  return (
    <div className="container mx-auto p-4">
      <h1>Moisture Measurements</h1>
      
      <TemplateSelector
        templates={availableTemplates}
        selectedTemplate={selectedTemplate}
        onSelect={setSelectedTemplate}
      />
    </div>
  );
}
```

### 2. Comparison View

```tsx
// app/measurements/[id]/comparison/page.tsx
import { ComparisonView } from '@/components/MoistureMappingSystem/MeasurementSystem/ComparisonView';

export default function ComparisonPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  // Fetch measurements and template data
  const measurements = useMeasurements(params.id);
  const template = useTemplate(measurements?.templateId);

  const handlePointClick = (pointId: string) => {
    // Navigate to point details or highlight on floor plan
  };

  return (
    <div className="container mx-auto p-4">
      <h1>Measurement Comparison</h1>
      
      {measurements && template && (
        <ComparisonView
          comparisons={measurements.comparisons}
          template={template}
          onPointClick={handlePointClick}
        />
      )}
    </div>
  );
}
```

### 3. History View

```tsx
// app/measurements/history/page.tsx
import { HistoryView } from '@/components/MoistureMappingSystem/MeasurementSystem/HistoryView';
import { exportMeasurementHistory } from '@/components/MoistureMappingSystem/MeasurementSystem/exportUtils';

export default function HistoryPage() {
  const history = useMeasurementHistory();
  const templates = useTemplates();

  const handleExport = async (entry: MeasurementHistory) => {
    const template = templates.find(t => t.id === entry.templateId);
    if (!template) return;

    try {
      const pdfBlob = exportMeasurementHistory(entry, template, 'pdf');
      const url = URL.createObjectURL(pdfBlob);
      window.open(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1>Measurement History</h1>
      
      <HistoryView
        history={history}
        templates={templates}
        onSelectEntry={(entry) => router.push(`/measurements/${entry.sessionId}`)}
        onExport={handleExport}
      />
    </div>
  );
}
```

## Data Management

### Template Structure

Templates should follow this structure:

```typescript
const template: MeasurementTemplate = {
  id: 'unique-id',
  name: 'Room Template',
  description: 'Standard room measurement points',
  points: [
    { id: 'p1', label: 'Corner 1', x: 0, y: 0 },
    { id: 'p2', label: 'Corner 2', x: 1, y: 0 },
    { id: 'p3', label: 'Center', x: 0.5, y: 0.5 }
  ],
  gridSpacing: 1,
  referenceValues: {
    dry: 15,
    warning: 25,
    critical: 35
  },
  createdAt: new Date(),
  updatedAt: new Date()
};
```

### Measurement History

Organize measurement history data like this:

```typescript
const history: MeasurementHistory = {
  sessionId: 'session-id',
  templateId: 'template-id',
  timestamp: new Date(),
  readings: [], // Raw readings
  comparisons: [
    {
      point: template.points[0],
      expectedValue: 15,
      actualValue: 17,
      deviation: 2,
      withinTolerance: true
    }
  ],
  summary: {
    averageDeviation: 2,
    maxDeviation: 2,
    pointsOutOfTolerance: 0
  }
};
```

## Export Functionality

### CSV Export

```typescript
import { exportMeasurementHistory } from '@/components/MoistureMappingSystem/MeasurementSystem/exportUtils';

const handleCSVExport = (entry: MeasurementHistory, template: MeasurementTemplate) => {
  const csvData = exportMeasurementHistory(entry, template, 'csv');
  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `moisture-readings-${entry.sessionId}.csv`;
  link.click();
};
```

### PDF Export

```typescript
const handlePDFExport = (entry: MeasurementHistory, template: MeasurementTemplate) => {
  const pdfBlob = exportMeasurementHistory(entry, template, 'pdf');
  const url = URL.createObjectURL(pdfBlob);
  window.open(url);
};
```

### JSON Export

```typescript
const handleJSONExport = (entry: MeasurementHistory, template: MeasurementTemplate) => {
  const jsonData = exportMeasurementHistory(entry, template, 'json');
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `moisture-readings-${entry.sessionId}.json`;
  link.click();
};
```

## Best Practices

1. **Error Handling**: Always wrap export operations in try-catch blocks
2. **Loading States**: Show loading indicators during export operations
3. **Validation**: Validate template and measurement data before export
4. **Cleanup**: Remember to revoke object URLs after use
5. **Accessibility**: Ensure export buttons have proper ARIA labels

## Common Issues

1. **PDF Generation**: If PDF generation fails, ensure jspdf and jspdf-autotable are properly installed
2. **Date Formatting**: Use consistent date formatting across exports
3. **Memory Usage**: Large datasets might need pagination or chunking
4. **Browser Support**: Test export functionality across different browsers

## Next Steps

1. Implement data fetching hooks for templates and measurements
2. Add error boundaries around measurement components
3. Set up proper type validation
4. Add loading and error states
5. Implement proper cleanup for exported files
