import type { Meta, StoryObj } from '@storybook/react';
import { TemplateSelector } from '../TemplateSelector';
import type { MeasurementTemplate } from '../types';

const meta: Meta<typeof TemplateSelector> = {
  title: 'MeasurementSystem/TemplateSelector',
  component: TemplateSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TemplateSelector>;

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
      { id: '4', label: 'Point B', x: 2, y: 2 },
      { id: '5', label: 'Point C', x: 1, y: 1 }
    ],
    gridSpacing: 0.5,
    referenceValues: {
      dry: 20,
      warning: 25,
      critical: 30
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    name: 'Wall Template',
    description: 'Vertical wall measurement points',
    points: [
      { id: '6', label: 'Top', x: 0, y: 2 },
      { id: '7', label: 'Middle', x: 0, y: 1 },
      { id: '8', label: 'Bottom', x: 0, y: 0 }
    ],
    gridSpacing: 1,
    referenceValues: {
      dry: 15,
      warning: 20,
      critical: 25
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const Default: Story = {
  args: {
    templates: sampleTemplates,
    onSelect: (templateId) => console.log('Selected template:', templateId)
  },
};

export const WithSelectedTemplate: Story = {
  args: {
    templates: sampleTemplates,
    selectedTemplate: '2',
    onSelect: (templateId) => console.log('Selected template:', templateId)
  },
};

export const SingleTemplate: Story = {
  args: {
    templates: [sampleTemplates[0]],
    onSelect: (templateId) => console.log('Selected template:', templateId)
  },
};

export const EmptyTemplates: Story = {
  args: {
    templates: [],
    onSelect: (templateId) => console.log('Selected template:', templateId)
  },
};
