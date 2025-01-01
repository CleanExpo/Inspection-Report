# MeasurementSystem Usage Examples

This guide provides practical examples of common implementation patterns and scenarios when working with the MeasurementSystem components.

## Basic Implementation

### Template Selection and Measurement

```tsx
// pages/measurements/new.tsx
import { useState } from 'react';
import { TemplateSelector } from '@/components/MoistureMappingSystem/MeasurementSystem/TemplateSelector';
import { ComparisonView } from '@/components/MoistureMappingSystem/MeasurementSystem/ComparisonView';

export default function NewMeasurement() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>();
  const [measurements, setMeasurements] = useState<MeasurementComparison[]>([]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    // Load template data and initialize measurements
  };

  const handlePointClick = (pointId: string) => {
    // Handle point selection, e.g., show details or highlight on floor plan
  };

  return (
    <div className="container mx-auto p-4">
      <h1>New Measurement</h1>
      
      {/* Template Selection */}
      <section className="mb-8">
        <h2>Select Template</h2>
        <TemplateSelector
          templates={availableTemplates}
          selectedTemplate={selectedTemplate}
          onSelect={handleTemplateSelect}
        />
      </section>

      {/* Measurement Comparison */}
      {selectedTemplate && measurements.length > 0 && (
        <section>
          <h2>Measurement Results</h2>
          <ComparisonView
            comparisons={measurements}
            template={selectedTemplate}
            onPointClick={handlePointClick}
          />
        </section>
      )}
    </div>
  );
}
```

### History View with Export

```tsx
// pages/measurements/history.tsx
import { useState } from 'react';
import { HistoryView } from '@/components/MoistureMappingSystem/MeasurementSystem/HistoryView';
import { exportMeasurementHistory } from '@/components/MoistureMappingSystem/MeasurementSystem/exportUtils';

export default function MeasurementHistory() {
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const handleExport = async (entry: MeasurementHistory) => {
    try {
      setExportStatus('loading');
      
      const template = await fetchTemplate(entry.templateId);
      if (!template) throw new Error('Template not found');

      const result = exportMeasurementHistory(entry, template, 'pdf');
      const url = URL.createObjectURL(result);
      
      // Open in new window
      window.open(url);
      
      // Cleanup
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setExportStatus('idle');
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1>Measurement History</h1>
      
      <HistoryView
        history={measurementHistory}
        templates={templates}
        onSelectEntry={(entry) => router.push(`/measurements/${entry.sessionId}`)}
        onExport={handleExport}
      />

      {/* Export Status */}
      {exportStatus === 'loading' && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded">
          Exporting...
        </div>
      )}
      {exportStatus === 'error' && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded">
          Export failed
        </div>
      )}
    </div>
  );
}
```

## Advanced Usage

### Custom Template Management

```tsx
// components/CustomTemplateManager.tsx
import { useState, useCallback } from 'react';
import { TemplateSelector } from '@/components/MoistureMappingSystem/MeasurementSystem/TemplateSelector';

export function CustomTemplateManager() {
  const [templates, setTemplates] = useState<MeasurementTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>();

  const handleTemplateCreate = useCallback(async (template: MeasurementTemplate) => {
    try {
      // Validate template
      if (!validateTemplate(template)) {
        throw new Error('Invalid template');
      }

      // Save template
      const savedTemplate = await saveTemplate(template);
      setTemplates(prev => [...prev, savedTemplate]);

      return savedTemplate;
    } catch (error) {
      console.error('Failed to create template:', error);
      throw error;
    }
  }, []);

  const handleTemplateUpdate = useCallback(async (
    templateId: string,
    updates: Partial<MeasurementTemplate>
  ) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) throw new Error('Template not found');

      const updatedTemplate = {
        ...template,
        ...updates,
        updatedAt: new Date()
      };

      // Validate updated template
      if (!validateTemplate(updatedTemplate)) {
        throw new Error('Invalid template');
      }

      // Save updates
      const savedTemplate = await updateTemplate(updatedTemplate);
      setTemplates(prev => 
        prev.map(t => t.id === templateId ? savedTemplate : t)
      );

      return savedTemplate;
    } catch (error) {
      console.error('Failed to update template:', error);
      throw error;
    }
  }, [templates]);

  return (
    <div>
      <h2>Template Management</h2>
      
      {/* Template Selection */}
      <TemplateSelector
        templates={templates}
        selectedTemplate={selectedTemplate}
        onSelect={setSelectedTemplate}
      />

      {/* Template Editor */}
      {selectedTemplate && (
        <TemplateEditor
          template={templates.find(t => t.id === selectedTemplate)}
          onSave={handleTemplateUpdate}
        />
      )}

      {/* Create New Template */}
      <button
        onClick={() => {
          const newTemplate = createEmptyTemplate();
          handleTemplateCreate(newTemplate);
        }}
      >
        Create New Template
      </button>
    </div>
  );
}
```

### Integrated Measurement Workflow

```tsx
// components/MeasurementWorkflow.tsx
import { useState, useEffect } from 'react';
import { TemplateSelector } from '@/components/MoistureMappingSystem/MeasurementSystem/TemplateSelector';
import { ComparisonView } from '@/components/MoistureMappingSystem/MeasurementSystem/ComparisonView';
import { HistoryView } from '@/components/MoistureMappingSystem/MeasurementSystem/HistoryView';

export function MeasurementWorkflow() {
  const [step, setStep] = useState<'select' | 'measure' | 'review'>('select');
  const [selectedTemplate, setSelectedTemplate] = useState<MeasurementTemplate>();
  const [measurements, setMeasurements] = useState<MeasurementComparison[]>([]);

  // Load saved state
  useEffect(() => {
    const savedState = loadSavedState();
    if (savedState) {
      setStep(savedState.step);
      setSelectedTemplate(savedState.template);
      setMeasurements(savedState.measurements);
    }
  }, []);

  // Save state changes
  useEffect(() => {
    saveState({
      step,
      template: selectedTemplate,
      measurements
    });
  }, [step, selectedTemplate, measurements]);

  const handleComplete = async () => {
    try {
      // Save final results
      const result = await saveMeasurements({
        templateId: selectedTemplate?.id,
        measurements,
        timestamp: new Date()
      });

      // Export results
      const exportResult = await exportMeasurementHistory(
        result,
        selectedTemplate!,
        'pdf'
      );

      // Show success and reset
      showSuccess('Measurement completed successfully');
      resetWorkflow();
    } catch (error) {
      console.error('Workflow failed:', error);
      showError('Failed to complete measurement');
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Progress Indicator */}
      <div className="flex justify-between mb-8">
        <Step
          number={1}
          title="Select Template"
          active={step === 'select'}
          completed={step !== 'select'}
        />
        <Step
          number={2}
          title="Take Measurements"
          active={step === 'measure'}
          completed={step === 'review'}
        />
        <Step
          number={3}
          title="Review & Export"
          active={step === 'review'}
          completed={false}
        />
      </div>

      {/* Step Content */}
      {step === 'select' && (
        <TemplateSelector
          templates={availableTemplates}
          selectedTemplate={selectedTemplate?.id}
          onSelect={(templateId) => {
            const template = availableTemplates.find(t => t.id === templateId);
            setSelectedTemplate(template);
            setStep('measure');
          }}
        />
      )}

      {step === 'measure' && selectedTemplate && (
        <div>
          <ComparisonView
            comparisons={measurements}
            template={selectedTemplate}
            onPointClick={handlePointClick}
          />
          <button
            onClick={() => setStep('review')}
            disabled={measurements.length === 0}
          >
            Continue to Review
          </button>
        </div>
      )}

      {step === 'review' && selectedTemplate && (
        <div>
          <h2>Review Measurements</h2>
          <ComparisonView
            comparisons={measurements}
            template={selectedTemplate}
            readonly
          />
          <button
            onClick={handleComplete}
            disabled={measurements.length === 0}
          >
            Complete & Export
          </button>
        </div>
      )}
    </div>
  );
}
```

## Error Handling Examples

### Template Validation

```tsx
// utils/validation.ts
export function validateTemplate(template: unknown): template is MeasurementTemplate {
  try {
    if (!template || typeof template !== 'object') {
      throw new Error('Template must be an object');
    }

    // Check required fields
    const requiredFields = ['id', 'name', 'points', 'gridSpacing', 'referenceValues'];
    for (const field of requiredFields) {
      if (!(field in template)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate points
    if (!Array.isArray(template.points) || template.points.length === 0) {
      throw new Error('Template must have at least one point');
    }

    // Validate reference values
    const { referenceValues } = template;
    if (
      typeof referenceValues !== 'object' ||
      !('dry' in referenceValues) ||
      !('warning' in referenceValues) ||
      !('critical' in referenceValues)
    ) {
      throw new Error('Invalid reference values');
    }

    return true;
  } catch (error) {
    console.error('Template validation failed:', error);
    return false;
  }
}
```

### Export Error Handling

```tsx
// components/ExportHandler.tsx
export function ExportHandler({ measurement, template }) {
  const [status, setStatus] = useState<{
    state: 'idle' | 'loading' | 'error' | 'success';
    error?: string;
  }>({ state: 'idle' });

  const handleExport = async (format: 'csv' | 'pdf' | 'json') => {
    try {
      setStatus({ state: 'loading' });

      // Validate inputs
      if (!measurement || !template) {
        throw new Error('Missing required data');
      }

      // Attempt export
      const result = await exportMeasurementHistory(measurement, template, format);

      // Handle different formats
      switch (format) {
        case 'csv':
        case 'json':
          downloadFile(result as string, `export.${format}`);
          break;
        case 'pdf':
          const url = URL.createObjectURL(result as Blob);
          window.open(url);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          break;
      }

      setStatus({ state: 'success' });
    } catch (error) {
      console.error('Export failed:', error);
      setStatus({
        state: 'error',
        error: error.message || 'Export failed'
      });
    }
  };

  return (
    <div>
      <div className="flex space-x-4">
        <button
          onClick={() => handleExport('csv')}
          disabled={status.state === 'loading'}
        >
          Export CSV
        </button>
        <button
          onClick={() => handleExport('pdf')}
          disabled={status.state === 'loading'}
        >
          Export PDF
        </button>
        <button
          onClick={() => handleExport('json')}
          disabled={status.state === 'loading'}
        >
          Export JSON
        </button>
      </div>

      {/* Status Display */}
      {status.state === 'loading' && (
        <div className="text-blue-500">Exporting...</div>
      )}
      {status.state === 'error' && (
        <div className="text-red-500">
          {status.error || 'Export failed'}
        </div>
      )}
      {status.state === 'success' && (
        <div className="text-green-500">
          Export completed successfully
        </div>
      )}
    </div>
  );
}
```

These examples demonstrate common implementation patterns and best practices when working with the MeasurementSystem components. They include error handling, state management, and user feedback to create a robust and user-friendly experience.
