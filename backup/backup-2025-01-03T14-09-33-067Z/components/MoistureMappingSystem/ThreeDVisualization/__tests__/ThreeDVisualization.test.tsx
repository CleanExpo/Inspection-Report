import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { ThreeDVisualization } from '../ThreeDVisualization';
import { MoistureReading } from '../types';
import * as THREE from 'three';

// Mock Three.js classes and methods
jest.mock('three', () => {
  const actualThree = jest.requireActual('three');
  return {
    ...actualThree,
    Scene: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      remove: jest.fn(),
      children: [],
      clear: jest.fn(),
      background: null
    })),
    PerspectiveCamera: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn() },
      lookAt: jest.fn(),
      aspect: 1,
      updateProjectionMatrix: jest.fn()
    })),
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      setSize: jest.fn(),
      setPixelRatio: jest.fn(),
      render: jest.fn(),
      dispose: jest.fn(),
      domElement: document.createElement('canvas')
    })),
    Color: jest.fn(),
    Points: jest.fn(),
    BufferGeometry: jest.fn(),
    PointsMaterial: jest.fn(),
    Float32BufferAttribute: jest.fn(),
    Raycaster: jest.fn().mockImplementation(() => ({
      setFromCamera: jest.fn(),
      intersectObject: jest.fn().mockReturnValue([])
    })),
    Vector2: jest.fn()
  };
});

// Mock OrbitControls
jest.mock('three/examples/jsm/controls/OrbitControls', () => ({
  OrbitControls: jest.fn().mockImplementation(() => ({
    update: jest.fn()
  }))
}));

describe('ThreeDVisualization', () => {
  const mockReadings: MoistureReading[] = [
    {
      id: '1',
      jobId: 'job1',
      locationX: 0,
      locationY: 0,
      room: 'Room1',
      floor: 'Floor1',
      value: 50,
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
    render(<ThreeDVisualization readings={mockReadings} />);
  });

  it('initializes Three.js scene with correct dimensions', () => {
    const width = 800;
    const height = 600;

    render(
      <ThreeDVisualization
        readings={mockReadings}
        width={width}
        height={height}
      />
    );

    expect(THREE.WebGLRenderer).toHaveBeenCalled();
    const renderer = (THREE.WebGLRenderer as jest.Mock).mock.results[0].value;
    expect(renderer.setSize).toHaveBeenCalledWith(width, height);
  });

  it('calls onPointSelect when a point is clicked', () => {
    const onPointSelect = jest.fn();
    
    // Mock intersection
    (THREE.Raycaster as jest.Mock).mockImplementation(() => ({
      setFromCamera: jest.fn(),
      intersectObject: jest.fn().mockReturnValue([{ index: 0 }])
    }));

    render(
      <ThreeDVisualization
        readings={mockReadings}
        onPointSelect={onPointSelect}
      />
    );

    // Simulate click on canvas
    const canvas = document.querySelector('canvas');
    if (canvas) {
      fireEvent.click(canvas);
      expect(onPointSelect).toHaveBeenCalledWith(mockReadings[0]);
    }
  });

  it('updates points when readings change', () => {
    const { rerender } = render(
      <ThreeDVisualization readings={mockReadings} />
    );

    const newReadings = [
      ...mockReadings,
      {
        ...mockReadings[0],
        id: '2',
        locationX: 1,
        locationY: 1,
        value: 75
      }
    ];

    rerender(<ThreeDVisualization readings={newReadings} />);

    // Verify points were updated
    expect(THREE.Points).toHaveBeenCalled();
  });
});
