import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { MapEditor } from '../../../app/components/MoistureMappingSystem/MapEditor';
import type { MapLayout, Point } from '../../../app/types/moisture';

// Mock child components
jest.mock('../../../app/components/MoistureMappingSystem/MapCanvas', () => ({
  MapCanvas: ({ layout, onLayoutChange }: { layout: MapLayout; onLayoutChange?: (layout: MapLayout) => void }) => (
    <div data-testid="mock-map-canvas">
      <button
        onClick={() => onLayoutChange?.({
          ...layout,
          walls: [...layout.walls, { start: { x: 0, y: 0 }, end: { x: 100, y: 100 } }],
        })}
      >
        Add Wall
      </button>
    </div>
  ),
}));

jest.mock('../../../app/components/MoistureMappingSystem/MapToolbar', () => ({
  MapToolbar: ({ mode, onModeChange, onUndo }: { mode: string; onModeChange: (mode: string) => void; onUndo?: () => void }) => (
    <div data-testid="mock-map-toolbar">
      <button onClick={() => onModeChange('door')}>Switch to Door</button>
      {onUndo && <button onClick={onUndo}>Undo</button>}
    </div>
  ),
}));

describe('MapEditor', () => {
  const mockOnChange = jest.fn();
  const initialLayout: MapLayout = {
    walls: [],
    doors: [],
    windows: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders MapCanvas and MapToolbar components', () => {
    render(
      <MapEditor
        layout={initialLayout}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByTestId('mock-map-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('mock-map-toolbar')).toBeInTheDocument();
  });

  it('maintains layout history and allows undo', () => {
    render(
      <MapEditor
        layout={initialLayout}
        onChange={mockOnChange}
      />
    );

    // Add a wall
    fireEvent.click(screen.getByText('Add Wall'));
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        walls: [expect.any(Object)],
      })
    );

    // Undo the change
    fireEvent.click(screen.getByText('Undo'));
    expect(mockOnChange).toHaveBeenCalledWith(initialLayout);
  });

  it('handles mode changes from toolbar', () => {
    render(
      <MapEditor
        layout={initialLayout}
        onChange={mockOnChange}
      />
    );

    fireEvent.click(screen.getByText('Switch to Door'));
    
    // Add a wall in door mode (should still work)
    fireEvent.click(screen.getByText('Add Wall'));
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('passes readOnly prop to child components', () => {
    const { rerender } = render(
      <MapEditor
        layout={initialLayout}
        onChange={mockOnChange}
        readOnly
      />
    );

    // Check that both components receive readOnly prop
    expect(screen.getByTestId('mock-map-canvas')).toHaveAttribute('data-readonly', 'true');
    expect(screen.getByTestId('mock-map-toolbar')).toHaveAttribute('data-readonly', 'true');

    // Rerender without readOnly
    rerender(
      <MapEditor
        layout={initialLayout}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByTestId('mock-map-canvas')).not.toHaveAttribute('data-readonly');
    expect(screen.getByTestId('mock-map-toolbar')).not.toHaveAttribute('data-readonly');
  });

  it('passes custom dimensions to MapCanvas', () => {
    const customWidth = 1000;
    const customHeight = 800;

    render(
      <MapEditor
        layout={initialLayout}
        onChange={mockOnChange}
        width={customWidth}
        height={customHeight}
      />
    );

    const canvas = screen.getByTestId('mock-map-canvas');
    expect(canvas).toHaveAttribute('data-width', customWidth.toString());
    expect(canvas).toHaveAttribute('data-height', customHeight.toString());
  });

  it('updates history when layout changes', () => {
    render(
      <MapEditor
        layout={initialLayout}
        onChange={mockOnChange}
      />
    );

    // Add multiple walls
    fireEvent.click(screen.getByText('Add Wall'));
    fireEvent.click(screen.getByText('Add Wall'));
    fireEvent.click(screen.getByText('Add Wall'));

    // Undo twice
    fireEvent.click(screen.getByText('Undo'));
    fireEvent.click(screen.getByText('Undo'));

    // Add another wall
    fireEvent.click(screen.getByText('Add Wall'));

    // Verify the final call has only two walls
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
    expect(lastCall.walls).toHaveLength(2);
  });

  it('clears future history when making new changes after undo', () => {
    render(
      <MapEditor
        layout={initialLayout}
        onChange={mockOnChange}
      />
    );

    // Add walls and undo
    fireEvent.click(screen.getByText('Add Wall'));
    fireEvent.click(screen.getByText('Add Wall'));
    fireEvent.click(screen.getByText('Undo'));

    // Add new wall
    fireEvent.click(screen.getByText('Add Wall'));

    // Try to redo (should not be possible)
    fireEvent.click(screen.getByText('Undo'));
    fireEvent.click(screen.getByText('Undo'));

    // Verify we can't undo past the initial state
    expect(mockOnChange).toHaveBeenLastCalledWith(initialLayout);
  });
});
