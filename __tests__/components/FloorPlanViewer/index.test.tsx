import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import FloorPlanViewer from '../../../app/moisture/components/FloorPlanViewer/index';
import type { 
  FloorPlan, 
  MeasurementOverlay, 
  FloorPlanViewerProps 
} from '../../../app/moisture/components/FloorPlanViewer/types';

// Add test utilities
const renderFloorPlanViewer = (props: Partial<FloorPlanViewerProps> = {}) => {
  const defaultProps: FloorPlanViewerProps = {
    floorPlan: sampleFloorPlan,
    ...props
  };
  return render(<FloorPlanViewer {...defaultProps} />);
};

// Create a partial mock of CanvasRenderingContext2D
const createMockContext = () => {
  const context = {
    canvas: document.createElement('canvas'),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    fillRect: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    arc: jest.fn(),
    closePath: jest.fn(),
    drawImage: jest.fn(),
    getContextAttributes: jest.fn(() => ({
      alpha: true,
      colorSpace: 'srgb',
      desynchronized: false,
      willReadFrequently: false
    })),
    fillText: jest.fn(),
    setTransform: jest.fn(),
    getTransform: jest.fn(),
    resetTransform: jest.fn(),
    clearRect: jest.fn(),
    // Add other required properties as needed
  } as unknown as CanvasRenderingContext2D;

  return context;
};

// Mock canvas element
const mockContext = createMockContext();
HTMLCanvasElement.prototype.getContext = jest.fn().mockImplementation((contextId) => {
  if (contextId === '2d') return mockContext;
  return null;
});
HTMLCanvasElement.prototype.getBoundingClientRect = jest.fn(() => ({
  width: 800,
  height: 600,
  top: 0,
  left: 0,
  right: 800,
  bottom: 600,
  x: 0,
  y: 0,
  toJSON: () => ({})
}));

// Mock offsetWidth/Height since they're readonly
Object.defineProperties(HTMLCanvasElement.prototype, {
  offsetWidth: {
    get: () => 800,
  },
  offsetHeight: {
    get: () => 600,
  }
});

// Sample test data
const sampleFloorPlan: FloorPlan = {
  id: '1',
  imageUrl: '/test-image.jpg',
  width: 800,
  height: 600,
  scale: 1,
  readings: []
};

const sampleOverlay: MeasurementOverlay = {
  id: '1',
  type: 'point',
  coordinates: [{ x: 100, y: 100 }],
  value: 15.5,
  label: 'Test Point'
};

describe('FloorPlanViewer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderFloorPlanViewer();
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('shows loading state while image is loading', () => {
    const { container } = renderFloorPlanViewer();
    const loadingElement = container.querySelector('.animate-spin');
    expect(loadingElement).toBeInTheDocument();
  });

  it('handles measurement click', () => {
    const onMeasurementClick = jest.fn();
    const { container } = renderFloorPlanViewer({
      overlays: [sampleOverlay],
      onMeasurementClick
    });

    const canvas = container.querySelector('canvas');
    fireEvent.click(canvas!, { clientX: 100, clientY: 100 });
    
    expect(onMeasurementClick).toHaveBeenCalledWith(expect.objectContaining({
      id: sampleOverlay.id
    }));
  });

  it('handles measurement hover', () => {
    const onMeasurementHover = jest.fn();
    const { container } = renderFloorPlanViewer({
      overlays: [sampleOverlay],
      onMeasurementHover
    });

    const canvas = container.querySelector('canvas');
    fireEvent.mouseMove(canvas!, { clientX: 100, clientY: 100 });
    
    expect(onMeasurementHover).toHaveBeenCalledWith(expect.objectContaining({
      id: sampleOverlay.id
    }));
  });

  it('handles viewport changes', () => {
    const onViewportChange = jest.fn();
    const { container } = renderFloorPlanViewer({
      onViewportChange
    });

    const canvas = container.querySelector('canvas');
    fireEvent.wheel(canvas!, { deltaY: -100 });
    
    expect(onViewportChange).toHaveBeenCalled();
  });

  it('handles window resize', () => {
    const { container } = renderFloorPlanViewer();

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    const canvas = container.querySelector('canvas');
    expect(canvas?.width).toBe(canvas?.offsetWidth);
    expect(canvas?.height).toBe(canvas?.offsetHeight);
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = renderFloorPlanViewer();

    const removeEventListener = jest.spyOn(window, 'removeEventListener');
    unmount();
    expect(removeEventListener).toHaveBeenCalled();
  });
});
