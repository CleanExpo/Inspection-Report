import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { FloorPlanViewer } from '../FloorPlanViewer';
import { MoistureReading } from '../types';

// Mock canvas operations
const mockContext = {
  drawImage: jest.fn(),
  beginPath: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  fillText: jest.fn(),
  clearRect: jest.fn(),
  setTransform: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  createImageData: jest.fn().mockReturnValue({
    data: new Uint8ClampedArray(100 * 100 * 4)
  }),
  putImageData: jest.fn()
};

// Mock canvas creation
HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockContext);

describe('FloorPlanViewer', () => {
  const mockReadings: MoistureReading[] = [
    {
      id: '1',
      jobId: 'job1',
      locationX: 0,
      locationY: 0,
      value: 50,
      room: 'Room1',
      floor: 'Floor1',
      temperature: 20,
      humidity: 45,
      pressure: 1013,
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: null,
      equipmentId: 'equip1',
      floorPlanId: 'plan1'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <FloorPlanViewer
        floorPlanUrl="test.jpg"
        readings={mockReadings}
      />
    );
  });

  it('shows loading state while image loads', () => {
    const { getByText } = render(
      <FloorPlanViewer
        floorPlanUrl="test.jpg"
        readings={mockReadings}
      />
    );
    expect(getByText('Loading floor plan...')).toBeInTheDocument();
  });

  it('calls onPointSelect when clicking near a reading', () => {
    const onPointSelect = jest.fn();
    const { container } = render(
      <FloorPlanViewer
        floorPlanUrl="test.jpg"
        readings={mockReadings}
        onPointSelect={onPointSelect}
      />
    );

    // Simulate click near the reading point
    fireEvent.click(container.firstChild as Element, {
      clientX: 10,
      clientY: 10
    });

    expect(onPointSelect).toHaveBeenCalledWith(mockReadings[0]);
  });

  it('toggles between points and heatmap view', () => {
    const { getByText } = render(
      <FloorPlanViewer
        floorPlanUrl="test.jpg"
        readings={mockReadings}
      />
    );

    const toggleButton = getByText('Show Heatmap');
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveTextContent('Show Points');

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveTextContent('Show Heatmap');
  });

  it('handles pan interaction', () => {
    const { container } = render(
      <FloorPlanViewer
        floorPlanUrl="test.jpg"
        readings={mockReadings}
      />
    );

    fireEvent.mouseDown(container.firstChild as Element, {
      clientX: 0,
      clientY: 0
    });

    fireEvent.mouseMove(container.firstChild as Element, {
      clientX: 50,
      clientY: 50
    });

    fireEvent.mouseUp(container.firstChild as Element);

    // Verify canvas was redrawn (context methods were called)
    expect(mockContext.clearRect).toHaveBeenCalled();
    expect(mockContext.save).toHaveBeenCalled();
    expect(mockContext.restore).toHaveBeenCalled();
  });

  it('handles zoom interaction', () => {
    const { container } = render(
      <FloorPlanViewer
        floorPlanUrl="test.jpg"
        readings={mockReadings}
      />
    );

    fireEvent.wheel(container.firstChild as Element, {
      deltaY: -100 // Zoom in
    });

    // Verify canvas was redrawn
    expect(mockContext.clearRect).toHaveBeenCalled();
    expect(mockContext.save).toHaveBeenCalled();
    expect(mockContext.restore).toHaveBeenCalled();
  });
});
