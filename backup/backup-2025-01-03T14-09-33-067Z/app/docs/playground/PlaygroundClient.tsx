'use client';

import React, { useState } from 'react';
import { TemplateSelector } from '../../components/MoistureMappingSystem/TemplateSelector';
import { ComparisonView } from '../../components/MoistureMappingSystem/ComparisonView';
import { HistoryView } from '../../components/MoistureMappingSystem/HistoryView';
import { exportMeasurementHistory } from '../../components/MoistureMappingSystem/exportUtils';
import { MeasurementTemplate, MeasurementHistory, Point } from '../../components/MoistureMappingSystem/types';

interface PlaygroundClientProps {
  templates: MeasurementTemplate[];
  history: MeasurementHistory[];
}

export function PlaygroundClient({ templates, history }: PlaygroundClientProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>();
  const [selectedHistory, setSelectedHistory] = useState<MeasurementHistory>();
  const [activeTab, setActiveTab] = useState<'template' | 'comparison' | 'history'>('template');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('pdf');

  const handleExport = async (entry: MeasurementHistory) => {
    const template = templates.find(t => t.id === entry.templateId);
    if (!template) return;

    try {
      const result = exportMeasurementHistory(entry, template, exportFormat);
      if (exportFormat === 'pdf') {
        const url = URL.createObjectURL(result as Blob);
        window.open(url);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        const blob = new Blob([result as string], {
          type: exportFormat === 'csv' ? 'text/csv' : 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `moisture-readings.${exportFormat}`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handlePointClick = (pointId: string): void => {
    console.log('Point clicked:', pointId);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">MeasurementSystem Playground</h1>

      {/* Navigation */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 'template' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('template')}
        >
          Template Selection
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 'comparison' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('comparison')}
        >
          Comparison View
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 'history' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('history')}
        >
          History View
        </button>
      </div>

      {/* Export Format Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Export Format:</label>
        <select
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json' | 'pdf')}
          className="px-3 py-2 border rounded"
        >
          <option value="pdf">PDF</option>
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
        </select>
      </div>

      {/* Component Display */}
      <div className="border rounded-lg p-6 bg-white">
        {activeTab === 'template' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Template Selection</h2>
            <TemplateSelector
              templates={templates}
              selectedTemplate={selectedTemplate}
              onSelect={setSelectedTemplate}
            />
          </div>
        )}

        {activeTab === 'comparison' && selectedTemplate && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Comparison View</h2>
            <ComparisonView
              comparisons={history[0].comparisons}
              template={templates.find(t => t.id === selectedTemplate)!}
              onPointClick={handlePointClick}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">History View</h2>
            <HistoryView
              history={history}
              templates={templates}
              onSelectEntry={setSelectedHistory}
              onExport={handleExport}
            />
          </div>
        )}
      </div>

      {/* Component State */}
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="text-lg font-semibold mb-2">Current State</h3>
        <pre className="bg-white p-4 rounded overflow-auto">
          {JSON.stringify(
            {
              selectedTemplate,
              selectedHistory: selectedHistory?.sessionId,
              activeTab,
              exportFormat
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
