'use client';

import React, { useState } from 'react';
import { TemplateSelector } from '@/components/MoistureMappingSystem/MeasurementSystem/TemplateSelector';
import { ComparisonView } from '@/components/MoistureMappingSystem/MeasurementSystem/ComparisonView';
import { HistoryView } from '@/components/MoistureMappingSystem/MeasurementSystem/HistoryView';
import { exportMeasurementHistory } from '@/components/MoistureMappingSystem/MeasurementSystem/exportUtils';
import { MeasurementTemplate, MeasurementHistory, Point } from '@/components/MoistureMappingSystem/MeasurementSystem/types';

const SAMPLE_TEMPLATES: MeasurementTemplate[] = [
  {
    id: 'template1',
    name: 'Basic Room Template',
    description: 'Standard room measurement points',
    points: [
      { id: 'p1', label: 'Corner 1', x: 0, y: 0 },
      { id: 'p2', label: 'Corner 2', x: 1, y: 0 },
      { id: 'p3', label: 'Corner 3', x: 0, y: 1 },
      { id: 'p4', label: 'Corner 4', x: 1, y: 1 },
      { id: 'p5', label: 'Center', x: 0.5, y: 0.5 }
    ] as Point[],
    gridSpacing: 1,
    referenceValues: {
      dry: 15,
      warning: 25,
      critical: 35
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'template2',
    name: 'Detailed Floor Template',
    description: 'Comprehensive floor measurement points',
    points: [
      { id: 'p1', label: 'North Wall', x: 0.5, y: 0 },
      { id: 'p2', label: 'East Wall', x: 1, y: 0.5 },
      { id: 'p3', label: 'South Wall', x: 0.5, y: 1 },
      { id: 'p4', label: 'West Wall', x: 0, y: 0.5 },
      { id: 'p5', label: 'NE Corner', x: 1, y: 0 },
      { id: 'p6', label: 'SE Corner', x: 1, y: 1 },
      { id: 'p7', label: 'SW Corner', x: 0, y: 1 },
      { id: 'p8', label: 'NW Corner', x: 0, y: 0 },
      { id: 'p9', label: 'Center', x: 0.5, y: 0.5 }
    ] as Point[],
    gridSpacing: 0.5,
    referenceValues: {
      dry: 10,
      warning: 20,
      critical: 30
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const SAMPLE_HISTORY: MeasurementHistory[] = [
  {
    sessionId: 'session1',
    templateId: 'template1',
    timestamp: new Date('2024-01-01T10:00:00'),
    readings: [],
    comparisons: [
      {
        point: SAMPLE_TEMPLATES[0].points[0],
        expectedValue: 15,
        actualValue: 14,
        deviation: -1,
        withinTolerance: true
      },
      {
        point: SAMPLE_TEMPLATES[0].points[1],
        expectedValue: 15,
        actualValue: 28,
        deviation: 13,
        withinTolerance: false
      }
    ],
    summary: {
      averageDeviation: 7,
      maxDeviation: 13,
      pointsOutOfTolerance: 1
    }
  },
  {
    sessionId: 'session2',
    templateId: 'template2',
    timestamp: new Date('2024-01-02T14:30:00'),
    readings: [],
    comparisons: [
      {
        point: SAMPLE_TEMPLATES[1].points[0],
        expectedValue: 10,
        actualValue: 12,
        deviation: 2,
        withinTolerance: true
      },
      {
        point: SAMPLE_TEMPLATES[1].points[4],
        expectedValue: 10,
        actualValue: 25,
        deviation: 15,
        withinTolerance: false
      }
    ],
    summary: {
      averageDeviation: 8.5,
      maxDeviation: 15,
      pointsOutOfTolerance: 1
    }
  }
];

export default function Playground() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>();
  const [selectedHistory, setSelectedHistory] = useState<MeasurementHistory>();
  const [activeTab, setActiveTab] = useState<'template' | 'comparison' | 'history'>('template');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('pdf');

  const handleExport = async (entry: MeasurementHistory) => {
    const template = SAMPLE_TEMPLATES.find(t => t.id === entry.templateId);
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
              templates={SAMPLE_TEMPLATES}
              selectedTemplate={selectedTemplate}
              onSelect={setSelectedTemplate}
            />
          </div>
        )}

        {activeTab === 'comparison' && selectedTemplate && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Comparison View</h2>
            <ComparisonView
              comparisons={SAMPLE_HISTORY[0].comparisons}
              template={SAMPLE_TEMPLATES.find(t => t.id === selectedTemplate)!}
              onPointClick={handlePointClick}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">History View</h2>
            <HistoryView
              history={SAMPLE_HISTORY}
              templates={SAMPLE_TEMPLATES}
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
