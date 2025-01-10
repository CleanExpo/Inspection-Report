'use client';

import React, { Suspense } from 'react';
import { PlaygroundClient } from './PlaygroundClient';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { MeasurementTemplate, MeasurementHistory, Point } from '../../components/MoistureMappingSystem/types';

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
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
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
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const SAMPLE_HISTORY: MeasurementHistory[] = [
  {
    sessionId: 'session1',
    templateId: 'template1',
    timestamp: '2024-01-01T10:00:00Z',
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
    timestamp: '2024-01-02T14:30:00Z',
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

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <PlaygroundClient templates={SAMPLE_TEMPLATES} history={SAMPLE_HISTORY} />
      </Suspense>
    </ErrorBoundary>
  );
}
