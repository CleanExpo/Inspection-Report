import type { Meta, StoryObj } from '@storybook/react';
import { HistoryView } from '../HistoryView';
import type { MeasurementTemplate, MeasurementHistory } from '../types';

const meta: Meta<typeof HistoryView> = {
  title: 'MeasurementSystem/HistoryView',
  component: HistoryView,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HistoryView>;

// Sample data for stories
const sampleTemplates: MeasurementTemplate[] = [
  {
    id: '1',
    name: 'Basic Room Template',
    description: 'Standard room measurement points',
    points: [
      { id: '1', label: 'Corner 114', x: 0, y: 0 },
      { id: '2', label: 'Corner 228', x: 1, y: 1 }
    ],
    gridSpacing: 1,
    referenceValues: {
      dry: 15,
      warning: 20,
      critical: 25
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Detailed Floor Template',
    description: 'Comprehensive floor measurement points',
    points: [
      { id: '3', label: 'Point A', x: 0, y: 0 },
      { id: '4', label: 'Point B', x: 2, y: 2 }
    ],
    gridSpacing: 0.5,
    referenceValues: {
      dry: 20,
      warning: 25,
      critical: 30
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

const sampleHistory: MeasurementHistory[] = [
  {
    sessionId: '1',
    templateId: '1',
    timestamp: new Date('2024-01-01T10:00:00'),
    readings: [14, 28],
    comparisons: [
      {
        point: { id: '1', label: 'Corner 114', x: 0, y: 0 },
        actualValue: 14,
        expectedValue: 15,
        deviation: -1,
        withinTolerance: true
      },
      {
        point: { id: '2', label: 'Corner 228', x: 1, y: 1 },
        actualValue: 28,
        expectedValue: 15,
        deviation: 13,
        withinTolerance: false
      }
    ],
    summary: {
      averageDeviation: 6,
      maxDeviation: 13.0,
      pointsOutOfTolerance: 1
    }
  }
];

export const Default: Story = {
  args: {
    history: sampleHistory,
    templates: sampleTemplates,
    onSelectEntry: (entry) => console.log('Selected entry:', entry),
    onExport: (entry) => console.log('Export entry:', entry)
  },
};

export const EmptyHistory: Story = {
  args: {
    history: [],
    templates: sampleTemplates,
    onSelectEntry: (entry) => console.log('Selected entry:', entry),
    onExport: (entry) => console.log('Export entry:', entry)
  },
};

export const MultipleEntries: Story = {
  args: {
    history: [
      ...sampleHistory,
      {
        sessionId: '2',
        templateId: '2',
        timestamp: new Date('2024-01-02T15:30:00'),
        readings: [20, 25],
        comparisons: [
          {
            point: { id: '3', label: 'Point A', x: 0, y: 0 },
            actualValue: 20,
            expectedValue: 20,
            deviation: 0,
            withinTolerance: true
          },
          {
            point: { id: '4', label: 'Point B', x: 2, y: 2 },
            actualValue: 25,
            expectedValue: 20,
            deviation: 5,
            withinTolerance: true
          }
        ],
        summary: {
          averageDeviation: 2.5,
          maxDeviation: 5.0,
          pointsOutOfTolerance: 0
        }
      }
    ],
    templates: sampleTemplates,
    onSelectEntry: (entry) => console.log('Selected entry:', entry),
    onExport: (entry) => console.log('Export entry:', entry)
  },
};
