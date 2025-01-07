import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { MapCanvas } from '../../../app/components/MoistureMappingSystem/MapCanvas';
import type { MapLayout } from '../../../app/types/moisture';

const mockLayout: MapLayout = {
  walls: [],
  doors: [],
  windows: [],
};

describe('MapCanvas', () => {
  const mockOnLayoutChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders canvas element', () => {
    render(<MapCanvas layout={mockLayout} />);
    const canvas = screen.getByRole('img'); // Canvas elements have an implicit img role
    expect(canvas).toBeInTheDocument();
  });

  it('applies custom dimensions when provided', () => {
    const customWidth = 1000;
    const customHeight = 800;

    render(
      <MapCanvas
        layout={mockLayout}
        width={customWidth}
        height={customHeight}
      />
    );

    const canvas = screen.getByRole('img');
    expect(canvas).toHaveAttribute('width', customWidth.toString());
    expect(canvas).toHaveAttribute('height', customHeight.toString());
  });

  it('applies correct styles based on readOnly prop', () => {
    const { rerender } = render(<MapCanvas layout={mockLayout} />);
    let canvas = screen.getByRole('img');
    expect(canvas).toHaveStyle({ cursor: 'crosshair' });

    rerender(<MapCanvas layout={mockLayout} readOnly />);
    canvas = screen.getByRole('img');
    expect(canvas).toHaveStyle({ cursor: 'default' });
  });

  it('handles wall drawing interaction', () => {
    render(
      <MapCanvas
        layout={mockLayout}
        onLayoutChange={mockOnLayoutChange}
      />
    );

    const canvas = screen.getByRole('img');

    // Simulate drawing a wall
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(canvas, { clientX: 200, clientY: 200 });
    fireEvent.mouseUp(canvas, { clientX: 200, clientY: 200 });

    expect(mockOnLayoutChange).toHaveBeenCalledWith(
      expect.objectContaining({
        walls: [
          expect.objectContaining({
            start: expect.objectContaining({ x: 100, y: 100 }),
            end: expect.objectContaining({ x: 200, y: 200 }),
          }),
        ],
      })
    );
  });

  it('does not trigger layout change when readOnly', () => {
    render(
      <MapCanvas
        layout={mockLayout}
        onLayoutChange={mockOnLayoutChange}
        readOnly
      />
    );

    const canvas = screen.getByRole('img');

    // Attempt to draw a wall
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(canvas, { clientX: 200, clientY: 200 });
    fireEvent.mouseUp(canvas, { clientX: 200, clientY: 200 });

    expect(mockOnLayoutChange).not.toHaveBeenCalled();
  });

  it('snaps points to grid', () => {
    render(
      <MapCanvas
        layout={mockLayout}
        onLayoutChange={mockOnLayoutChange}
      />
    );

    const canvas = screen.getByRole('img');

    // Draw a wall with non-grid-aligned coordinates
    fireEvent.mouseDown(canvas, { clientX: 123, clientY: 456 });
    fireEvent.mouseUp(canvas, { clientX: 789, clientY: 321 });

    expect(mockOnLayoutChange).toHaveBeenCalledWith(
      expect.objectContaining({
        walls: [
          expect.objectContaining({
            start: expect.objectContaining({
              x: expect.any(Number),
              y: expect.any(Number),
            }),
            end: expect.objectContaining({
              x: expect.any(Number),
              y: expect.any(Number),
            }),
          }),
        ],
      })
    );

    // Get the actual values passed to onLayoutChange
    const newLayout = mockOnLayoutChange.mock.calls[0][0];
    const wall = newLayout.walls[0];

    // Check that coordinates are multiples of the grid size (20)
    expect(wall.start.x % 20).toBe(0);
    expect(wall.start.y % 20).toBe(0);
    expect(wall.end.x % 20).toBe(0);
    expect(wall.end.y % 20).toBe(0);
  });

  it('draws preview while dragging', () => {
    // Mock canvas context methods
    const mockBeginPath = jest.fn();
    const mockMoveTo = jest.fn();
    const mockLineTo = jest.fn();
    const mockStroke = jest.fn();
    const mockClearRect = jest.fn();

    // Mock getContext
    HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
      beginPath: mockBeginPath,
      moveTo: mockMoveTo,
      lineTo: mockLineTo,
      stroke: mockStroke,
      clearRect: mockClearRect,
    });

    render(
      <MapCanvas
        layout={mockLayout}
        onLayoutChange={mockOnLayoutChange}
      />
    );

    const canvas = screen.getByRole('img');

    // Start dragging
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(canvas, { clientX: 200, clientY: 200 });

    // Verify preview drawing methods were called
    expect(mockBeginPath).toHaveBeenCalled();
    expect(mockMoveTo).toHaveBeenCalled();
    expect(mockLineTo).toHaveBeenCalled();
    expect(mockStroke).toHaveBeenCalled();
  });
});
