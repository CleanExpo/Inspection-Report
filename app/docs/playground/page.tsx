'use client';

import React, { useState } from 'react';
import type { MeasurementTemplate, MeasurementHistory, Point } from '../../moisture/types';

// Placeholder components until we implement the full versions
const TemplateSelector = ({ templates, selectedTemplate, onSelect }: any) => (
  <div className="grid gap-4">
    {templates.map((template: MeasurementTemplate) => (
      <div
        key={template.id}
        className={`p-4 border rounded cursor-pointer ${
          selectedTemplate === template.id ? 'border-blue-500' : 'border-gray-200'
        }`}
        onClick={() => onSelect(template.id)}
      >
        <h3 className="font-semibold">{template.name}</h3>
        <p className="text-sm text-gray-600">{template.description}</p>
      </div>
    ))}
  </div>
);

const ComparisonView = ({ comparisons, template, onPointClick }: any) => (
  <div className="space-y-4">
    {comparisons.map((comparison: any, index: number) => (
      <div key={index} className="p-4 border rounded">
        <h4 className="font-semibold">{comparison.point.label}</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Expected: {comparison.expectedValue}</div>
          <div>Actual: {comparison.actualValue}</div>
          <div>Deviation: {comparison.deviation}</div>
          <div>Status: {comparison.withinTolerance ? 'OK' : 'Warning'}</div>
        </div>
      </div>
    ))}
  </div>
);

const HistoryView = ({ history, templates, onSelectEntry, onExport }: any) => (
  <div className="space-y-4">
    {history.map((entry: MeasurementHistory) => (
      <div key={entry.sessionId} className="p-4 border rounded">
        <h4 className="font-semibold">
          Session: {entry.sessionId}
        </h4>
        <div className="text-sm text-gray-600">
          {new Date(entry.timestamp).toLocaleString()}
        </div>
        <div className="mt-2">
          <button
            onClick={() => onExport(entry)}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Export
          </button>
        </div>
      </div>
    ))}
  </div>
);

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
      }
    ],
    summary: {
      averageDeviation: 7,
      maxDeviation: 13,
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
      const data = JSON.stringify(entry, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `moisture-readings.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">MeasurementSystem Playground</h1>

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
              onPointClick={(id: string) => console.log('Point clicked:', id)}
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
