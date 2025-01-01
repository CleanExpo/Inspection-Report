import type { Meta, StoryObj } from '@storybook/react';
import { ComparisonView } from '../ComparisonView';
import type { MeasurementTemplate, MeasurementComparison } from '../types';

const meta: Meta<typeof ComparisonView> = {
  title: 'MeasurementSystem/ComparisonView',
  component: ComparisonView,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ComparisonView>;

const sampleTemplate: MeasurementTemplate = {
  id: '1',
  name: 'Basic Room Template',
  description: 'Standard room measurement points',
  points: [
    { id: '1', label: 'Corner 114', x: 0, y: 0 },
    { id: '2', label: 'Corner 228', x: 1, y: 1 },
    { id: '3', label: 'Center Point', x: 0.5, y: 0.5 }
  ],
  gridSpacing: 1,
  referenceValues: {
    dry: 15,
    warning: 20,
    critical: 25
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

const sampleComparisons: MeasurementComparison[] = [
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
  },
  {
    point: { id: '3', label: 'Center Point', x: 0.5, y: 0.5 },
    actualValue: 18,
    expectedValue: 15,
    deviation: 3,
    withinTolerance: true
  }
];

export const Default: Story = {
  args: {
    comparisons: sampleComparisons,
    template: sampleTemplate,
    onPointClick: (pointId) => console.log('Point clicked:', pointId)
  },
};

export const NoDeviations: Story = {
  args: {
    comparisons: sampleComparisons.map(comp => ({
      ...comp,
      actualValue: comp.expectedValue,
      deviation: 0,
      withinTolerance: true
    })),
    template: sampleTemplate,
    onPointClick: (pointId) => console.log('Point clicked:', pointId)
  },
};

export const AllOutOfTolerance: Story = {
  args: {
    comparisons: sampleComparisons.map(comp => ({
      ...comp,
      actualValue: comp.expectedValue + 15,
      deviation: 15,
      withinTolerance: false
    })),
    template: sampleTemplate,
    onPointClick: (pointId) => console.log('Point clicked:', pointId)
  },
};
