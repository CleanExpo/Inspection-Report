import { describe, expect, test, beforeEach, afterEach, jest } from '@jest/globals';
import { render, cleanup } from '@testing-library/react';
import ThreeDVisualization from '../../../app/moisture/components/ThreeDVisualization';
import type { FloorPlan } from '../../../app/moisture/components/ThreeDVisualization/types';

// Mock Three.js and OrbitControls
jest.mock('three', () => ({
  Scene: jest.fn().mockImplementation(() => ({
    background: null,
    add: jest.fn(),
    traverse: jest.fn(),
  })),
  PerspectiveCamera: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn() },
    aspect: 1,
    updateProjectionMatrix: jest.fn(),
  })),
  WebGLRenderer: jest.fn().mockImplementation(() => ({
    setSize: jest.fn(),
    domElement: document.createElement('canvas'),
    render: jest.fn(),
    dispose: jest.fn(),
  })),
  Color: jest.fn(),
  AmbientLight: jest.fn(),
  DirectionalLight: jest.fn(),
  GridHelper: jest.fn(),
  Vector2: jest.fn(),
}));

jest.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
  OrbitControls: jest.fn().mockImplementation(() => ({
    enableDamping: false,
    update: jest.fn(),
    dispose: jest.fn(),
  })),
}));

// Mock window methods
const originalRequestAnimationFrame = global.requestAnimationFrame;
const originalCancelAnimationFrame = global.cancelAnimationFrame;

// Mock floor plan data
const mockFloorPlan: FloorPlan = {
  id: '1',
  level: 1,
  scale: 1,
  width: 100,
  height: 100,
  readings: [
    {
      locationX: 50,
      locationY: 50,
      dataPoints: [
        {
          value: 15,
          unit: '%'
        }
      ]
    }
  ]
};

describe('ThreeDVisualization', () => {
  beforeEach(() => {
    // Mock requestAnimationFrame with proper type
    global.requestAnimationFrame = jest.fn().mockReturnValue(1) as jest.MockedFunction<typeof requestAnimationFrame>;
    // Mock cancelAnimationFrame
    global.cancelAnimationFrame = jest.fn() as jest.MockedFunction<typeof cancelAnimationFrame>;
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
    // Restore original methods
    global.requestAnimationFrame = originalRequestAnimationFrame;
    global.cancelAnimationFrame = originalCancelAnimationFrame;
  });

  test('renders without crashing', () => {
    const { container } = render(<ThreeDVisualization floorPlans={[]} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test('initializes with correct props', () => {
    const customProps = {
      backgroundColor: 0x000000,
      fov: 90,
      floorPlans: [mockFloorPlan]
    };

    render(<ThreeDVisualization {...customProps} />);
    
    // Verify the container was created with correct class names
    const container = document.querySelector('[data-testid="three-d-visualization"]');
    expect(container).toHaveClass('w-full', 'h-[600px]', 'rounded-lg', 'overflow-hidden');
  });

  test('starts animation loop on mount', () => {
    render(<ThreeDVisualization floorPlans={[]} />);
    expect(global.requestAnimationFrame).toHaveBeenCalled();
  });

  test('cleans up resources on unmount', () => {
    const { unmount } = render(<ThreeDVisualization floorPlans={[]} />);
    unmount();

    // Verify animation frame was cancelled
    expect(global.cancelAnimationFrame).toHaveBeenCalled();
  });

  test('handles window resize', () => {
    const { container } = render(<ThreeDVisualization floorPlans={[]} />);
    
    // Trigger resize event
    global.dispatchEvent(new Event('resize'));
    
    // Verify container exists
    expect(container.firstChild).toBeInTheDocument();
  });
});
