import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { ComparisonView } from '../ComparisonView';
import { MeasurementComparison, MeasurementTemplate } from '../types';

describe('ComparisonView', () => {
  const mockTemplate: MeasurementTemplate = {
    id: 'template1',
    name: 'Test Template',
    description: 'Test Description',
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
  };

  const mockComparisons: MeasurementComparison[] = [
    {
      point: mockTemplate.points[0],
      expectedValue: 15,
      actualValue: 14,
      deviation: -1,
      withinTolerance: true
    },
    {
      point: mockTemplate.points[1],
      expectedValue: 15,
      actualValue: 30,
      deviation: 15,
      withinTolerance: false
    }
  ];

  const mockOnPointClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders summary statistics correctly', () => {
    render(
      <ComparisonView
        comparisons={mockComparisons}
        template={mockTemplate}
      />
    );

    expect(screen.getByText('Total Points')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Total points
    expect(screen.getByText('1')).toBeInTheDocument(); // Out of tolerance
    expect(screen.getByText(/8.00%/)).toBeInTheDocument(); // Average deviation
  });

  it('renders comparison table with all points', () => {
    render(
      <ComparisonView
        comparisons={mockComparisons}
        template={mockTemplate}
      />
    );

    mockComparisons.forEach(comparison => {
      expect(screen.getByText(comparison.point.label)).toBeInTheDocument();
      expect(screen.getByText(`${comparison.expectedValue.toFixed(1)}%`)).toBeInTheDocument();
      expect(screen.getByText(`${comparison.actualValue.toFixed(1)}%`)).toBeInTheDocument();
    });
  });

  it('shows correct status badges', () => {
    render(
      <ComparisonView
        comparisons={mockComparisons}
        template={mockTemplate}
      />
    );

    const okBadges = screen.getAllByText('OK');
    const highBadges = screen.getAllByText('High');
    expect(okBadges).toHaveLength(1);
    expect(highBadges).toHaveLength(1);
  });

  it('calls onPointClick when row is clicked', () => {
    render(
      <ComparisonView
        comparisons={mockComparisons}
        template={mockTemplate}
        onPointClick={mockOnPointClick}
      />
    );

    fireEvent.click(screen.getByText('Point 1'));
    expect(mockOnPointClick).toHaveBeenCalledWith('p1');
  });

  it('displays reference values', () => {
    render(
      <ComparisonView
        comparisons={mockComparisons}
        template={mockTemplate}
      />
    );

    expect(screen.getByText('15%')).toBeInTheDocument(); // Dry value
    expect(screen.getByText('25%')).toBeInTheDocument(); // Warning value
    expect(screen.getByText('35%')).toBeInTheDocument(); // Critical value
  });

  it('handles empty comparisons array', () => {
    render(
      <ComparisonView
        comparisons={[]}
        template={mockTemplate}
      />
    );

    expect(screen.getByText('Total Points')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument(); // Average deviation
  });

  it('shows colored deviation values', () => {
    render(
      <ComparisonView
        comparisons={mockComparisons}
        template={mockTemplate}
      />
    );

    const deviations = screen.getAllByText(/[+-]?\d+\.\d+%/);
    expect(deviations).toHaveLength(4); // 2 expected values, 2 deviations
  });

  it('applies correct styling for within/out of tolerance', () => {
    render(
      <ComparisonView
        comparisons={mockComparisons}
        template={mockTemplate}
      />
    );

    const successBadge = screen.getByText('OK').closest('.status-badge');
    const errorBadge = screen.getByText('High').closest('.status-badge');

    expect(successBadge).toHaveClass('success');
    expect(errorBadge).toHaveClass('error');
  });
});
