import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { TemplateSelector } from '../TemplateSelector';
import { MeasurementTemplate } from '../types';

describe('TemplateSelector', () => {
  const mockTemplates: MeasurementTemplate[] = [
    {
      id: 'template1',
      name: 'Standard Room Template',
      description: 'Basic room measurement template',
      points: [
        { id: 'p1', label: 'Point 1', x: 0, y: 0 },
        { id: 'p2', label: 'Point 2', x: 1, y: 1 }
      ],
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
      description: 'Comprehensive floor measurement template',
      points: [
        { id: 'p1', label: 'Corner 1', x: 0, y: 0 },
        { id: 'p2', label: 'Corner 2', x: 2, y: 0 },
        { id: 'p3', label: 'Corner 3', x: 0, y: 2 }
      ],
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

  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all templates', () => {
    render(
      <TemplateSelector
        templates={mockTemplates}
        onSelect={mockOnSelect}
      />
    );

    mockTemplates.forEach(template => {
      expect(screen.getByText(template.name)).toBeInTheDocument();
      expect(screen.getByText(`${template.points.length} points`)).toBeInTheDocument();
    });
  });

  it('filters templates based on search term', () => {
    render(
      <TemplateSelector
        templates={mockTemplates}
        onSelect={mockOnSelect}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search templates...');
    fireEvent.change(searchInput, { target: { value: 'Detailed' } });

    expect(screen.getByText('Detailed Floor Template')).toBeInTheDocument();
    expect(screen.queryByText('Standard Room Template')).not.toBeInTheDocument();
  });

  it('shows template details when clicked', () => {
    render(
      <TemplateSelector
        templates={mockTemplates}
        onSelect={mockOnSelect}
      />
    );

    fireEvent.click(screen.getByText('Standard Room Template'));

    expect(screen.getByText('Basic room measurement template')).toBeInTheDocument();
    expect(screen.getByText('Dry: 15')).toBeInTheDocument();
    expect(screen.getByText('Warning: 25')).toBeInTheDocument();
    expect(screen.getByText('Critical: 35')).toBeInTheDocument();
    expect(screen.getByText('Grid Spacing: 1 meters')).toBeInTheDocument();
  });

  it('calls onSelect when Use Template button is clicked', () => {
    render(
      <TemplateSelector
        templates={mockTemplates}
        onSelect={mockOnSelect}
      />
    );

    // First click to show details
    fireEvent.click(screen.getByText('Standard Room Template'));
    // Then click Use Template button
    fireEvent.click(screen.getByText('Use Template'));

    expect(mockOnSelect).toHaveBeenCalledWith('template1');
  });

  it('highlights selected template', () => {
    render(
      <TemplateSelector
        templates={mockTemplates}
        selectedTemplate="template1"
        onSelect={mockOnSelect}
      />
    );

    const selectedTemplate = screen.getByText('Standard Room Template').closest('.template-item');
    expect(selectedTemplate).toHaveClass('selected');
  });

  it('handles empty template list', () => {
    render(
      <TemplateSelector
        templates={[]}
        onSelect={mockOnSelect}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search templates...');
    expect(searchInput).toBeInTheDocument();
    expect(screen.queryByText('points')).not.toBeInTheDocument();
  });

  it('handles search with no results', () => {
    render(
      <TemplateSelector
        templates={mockTemplates}
        onSelect={mockOnSelect}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search templates...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    mockTemplates.forEach(template => {
      expect(screen.queryByText(template.name)).not.toBeInTheDocument();
    });
  });
});
