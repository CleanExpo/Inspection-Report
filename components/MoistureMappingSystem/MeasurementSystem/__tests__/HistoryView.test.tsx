import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { HistoryView } from '../HistoryView';
import { MeasurementHistory, MeasurementTemplate } from '../types';

describe('HistoryView', () => {
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

  const mockHistory: MeasurementHistory[] = [
    {
      sessionId: 'session1',
      templateId: 'template1',
      timestamp: new Date('2024-01-01'),
      readings: [],
      comparisons: [
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
      ],
      summary: {
        averageDeviation: 8,
        maxDeviation: 15,
        pointsOutOfTolerance: 1
      }
    },
    {
      sessionId: 'session2',
      templateId: 'template1',
      timestamp: new Date('2024-01-02'),
      readings: [],
      comparisons: [
        {
          point: mockTemplate.points[0],
          expectedValue: 15,
          actualValue: 16,
          deviation: 1,
          withinTolerance: true
        }
      ],
      summary: {
        averageDeviation: 1,
        maxDeviation: 1,
        pointsOutOfTolerance: 0
      }
    }
  ];

  const mockOnSelectEntry = jest.fn();
  const mockOnExport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all history entries', () => {
    render(
      <HistoryView
        history={mockHistory}
        templates={[mockTemplate]}
        onSelectEntry={mockOnSelectEntry}
        onExport={mockOnExport}
      />
    );

    expect(screen.getAllByText(/Points/)).toHaveLength(mockHistory.length);
    mockHistory.forEach(entry => {
      expect(screen.getByText(entry.timestamp.toLocaleString())).toBeInTheDocument();
    });
  });

  it('filters entries by date', () => {
    render(
      <HistoryView
        history={mockHistory}
        templates={[mockTemplate]}
      />
    );

    const dateSelect = screen.getByLabelText('Date');
    fireEvent.change(dateSelect, { target: { value: '2024-01-01' } });

    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
    expect(screen.queryByText('2024-01-02')).not.toBeInTheDocument();
  });

  it('filters entries by template', () => {
    const anotherTemplate: MeasurementTemplate = {
      ...mockTemplate,
      id: 'template2',
      name: 'Another Template'
    };

    render(
      <HistoryView
        history={mockHistory}
        templates={[mockTemplate, anotherTemplate]}
      />
    );

    const templateSelect = screen.getByLabelText('Template');
    fireEvent.change(templateSelect, { target: { value: 'template1' } });

    expect(screen.getAllByText('Test Template')).not.toHaveLength(0);
    expect(screen.queryByText('Another Template')).not.toBeInTheDocument();
  });

  it('calls onSelectEntry when entry is clicked', () => {
    render(
      <HistoryView
        history={mockHistory}
        templates={[mockTemplate]}
        onSelectEntry={mockOnSelectEntry}
      />
    );

    fireEvent.click(screen.getByText(mockHistory[0].timestamp.toLocaleString()));
    expect(mockOnSelectEntry).toHaveBeenCalledWith(mockHistory[0]);
  });

  it('calls onExport when export button is clicked', () => {
    render(
      <HistoryView
        history={mockHistory}
        templates={[mockTemplate]}
        onExport={mockOnExport}
      />
    );

    const exportButtons = screen.getAllByText('Export');
    fireEvent.click(exportButtons[0]);
    expect(mockOnExport).toHaveBeenCalledWith(mockHistory[0]);
  });

  it('shows no results message when filters match nothing', () => {
    render(
      <HistoryView
        history={mockHistory}
        templates={[mockTemplate]}
      />
    );

    const dateSelect = screen.getByLabelText('Date');
    fireEvent.change(dateSelect, { target: { value: '2024-12-31' } });

    expect(screen.getByText(/No history entries found/)).toBeInTheDocument();
  });

  it('displays correct statistics for each entry', () => {
    render(
      <HistoryView
        history={mockHistory}
        templates={[mockTemplate]}
      />
    );

    mockHistory.forEach(entry => {
      expect(screen.getByText(entry.comparisons.length.toString())).toBeInTheDocument();
      expect(screen.getByText(entry.summary.pointsOutOfTolerance.toString())).toBeInTheDocument();
      expect(screen.getByText(`${entry.summary.averageDeviation.toFixed(1)}%`)).toBeInTheDocument();
    });
  });
});
