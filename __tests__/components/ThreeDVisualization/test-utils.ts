import * as THREE from 'three';
import type { MoistureReading, FloorPlan } from '../../../app/moisture/components/ThreeDVisualization/types';

// Mock Three.js objects
export const mockMaterial = {
  color: { set: jest.fn() },
  opacity: 1,
  transparent: true,
  dispose: jest.fn()
};

export const mockMesh = {
  position: { copy: jest.fn() },
  scale: { setScalar: jest.fn() },
  geometry: { dispose: jest.fn() },
  material: mockMaterial
};

export const mockScene = {
  add: jest.fn(),
  remove: jest.fn(),
  children: [],
  traverse: jest.fn(),
  background: null
};

export const mockCamera = {
  position: { set: jest.fn(), copy: jest.fn() },
  aspect: 1,
  updateProjectionMatrix: jest.fn(),
  fov: 75,
  near: 0.1,
  far: 1000
};

export const mockRenderer = {
  setSize: jest.fn(),
  render: jest.fn(),
  dispose: jest.fn(),
  domElement: document.createElement('canvas'),
  getSize: jest.fn().mockReturnValue(new THREE.Vector2(800, 600))
};

// Mock data generators
export const createMockReading = (
  x: number,
  y: number,
  value: number
): MoistureReading => ({
  locationX: x,
  locationY: y,
  dataPoints: [{ value, unit: '%' }]
});

export const createMockFloorPlan = (
  level: number,
  readings: MoistureReading[] = []
): FloorPlan => ({
  id: `floor-${level}`,
  level,
  scale: 1,
  width: 100,
  height: 100,
  readings
});

// Test helpers
export const createMouseEvent = (
  type: 'mousemove' | 'click',
  x: number,
  y: number
): MouseEvent => {
  return new MouseEvent(type, {
    clientX: x,
    clientY: y,
    bubbles: true,
    cancelable: true
  });
};

export const createResizeEvent = (): Event => {
  return new Event('resize', {
    bubbles: true,
    cancelable: true
  });
};

// Animation frame mock helpers
export const mockRequestAnimationFrame = () => {
  const original = window.requestAnimationFrame;
  window.requestAnimationFrame = jest.fn().mockReturnValue(1);
  return () => {
    window.requestAnimationFrame = original;
  };
};

export const mockCancelAnimationFrame = () => {
  const original = window.cancelAnimationFrame;
  window.cancelAnimationFrame = jest.fn();
  return () => {
    window.cancelAnimationFrame = original;
  };
};

// DOM element mock helpers
export const createMockContainer = () => {
  const container = document.createElement('div');
  container.getBoundingClientRect = () => ({
    width: 800,
    height: 600,
    top: 0,
    left: 0,
    right: 800,
    bottom: 600,
    x: 0,
    y: 0,
    toJSON: () => {}
  });
  return container;
};

// Test assertion helpers
export const expectPointProperties = (
  point: any,
  expected: {
    id: string;
    value: number;
    position: { x: number; y: number; z: number };
  }
) => {
  expect(point.id).toBe(expected.id);
  expect(point.value).toBe(expected.value);
  expect(point.position).toEqual(
    new THREE.Vector3(
      expected.position.x,
      expected.position.y,
      expected.position.z
    )
  );
};

export const expectMaterialProperties = (
  material: any,
  expected: {
    color?: THREE.ColorRepresentation;
    opacity?: number;
    transparent?: boolean;
  }
) => {
  if (expected.color !== undefined) {
    expect(material.color.set).toHaveBeenCalledWith(expected.color);
  }
  if (expected.opacity !== undefined) {
    expect(material.opacity).toBe(expected.opacity);
  }
  if (expected.transparent !== undefined) {
    expect(material.transparent).toBe(expected.transparent);
  }
};
