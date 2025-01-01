import { describe, expect, test, jest } from '@jest/globals';
import { PointsManager } from '../../../app/moisture/components/ThreeDVisualization/points';
import * as THREE from 'three';
import type { MoistureReading } from '../../../app/moisture/components/ThreeDVisualization/types';

// Mock Three.js classes and methods
const mockMaterial = {
  color: { set: jest.fn() },
  opacity: 1,
  transparent: true,
  dispose: jest.fn()
};

const mockMesh = {
  position: { copy: jest.fn() },
  scale: { setScalar: jest.fn() },
  geometry: { dispose: jest.fn() },
  material: mockMaterial
};

jest.mock('three', () => ({
  Scene: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    remove: jest.fn()
  })),
  Vector3: jest.fn().mockImplementation(() => ({
    copy: jest.fn(),
    set: jest.fn()
  })),
  SphereGeometry: jest.fn(),
  MeshStandardMaterial: jest.fn().mockImplementation(() => mockMaterial),
  Mesh: jest.fn().mockImplementation(() => mockMesh),
  Color: jest.fn().mockImplementation(() => ({
    setHSL: jest.fn().mockReturnThis()
  }))
}));

describe('PointsManager', () => {
  const scene = new THREE.Scene();
  const mockReading: MoistureReading = {
    locationX: 10,
    locationY: 20,
    dataPoints: [{ value: 50, unit: '%' }]
  };

  test('initializes with default config', () => {
    const manager = new PointsManager(scene);
    expect(manager.getPoints().size).toBe(0);
    expect(manager.getHoveredPoint()).toBeUndefined();
    expect(manager.getSelectedPoint()).toBeUndefined();
  });

  test('adds point correctly', () => {
    const manager = new PointsManager(scene);
    const point = manager.addPoint(mockReading, 1);

    expect(point.id).toBe('point-10-20-1');
    expect(point.value).toBe(50);
    expect(manager.getPoints().size).toBe(1);
    expect(scene.add).toHaveBeenCalled();
  });

  test('updates point correctly', () => {
    const manager = new PointsManager(scene);
    const point = manager.addPoint(mockReading, 1);
    
    const updatedReading = {
      ...mockReading,
      dataPoints: [{ value: 75, unit: '%' }]
    };
    
    manager.updatePoint(point.id, updatedReading);
    const updatedPoint = manager.getPoint(point.id);
    
    expect(updatedPoint?.value).toBe(75);
    expect(mockMaterial.color.set).toHaveBeenCalled();
  });

  test('handles hover state', () => {
    const manager = new PointsManager(scene);
    const point = manager.addPoint(mockReading, 1);
    
    manager.setHovered(point.id);
    expect(manager.getHoveredPoint()?.id).toBe(point.id);
    
    manager.setHovered(null);
    expect(manager.getHoveredPoint()).toBeUndefined();
  });

  test('handles selection state', () => {
    const manager = new PointsManager(scene);
    const point = manager.addPoint(mockReading, 1);
    
    manager.setSelected(point.id);
    expect(manager.getSelectedPoint()?.id).toBe(point.id);
    
    manager.setSelected(null);
    expect(manager.getSelectedPoint()).toBeUndefined();
  });

  test('removes point correctly', () => {
    const manager = new PointsManager(scene);
    const point = manager.addPoint(mockReading, 1);
    
    manager.setHovered(point.id);
    manager.setSelected(point.id);
    
    manager.removePoint(point.id);
    
    expect(manager.getPoints().size).toBe(0);
    expect(manager.getHoveredPoint()).toBeUndefined();
    expect(manager.getSelectedPoint()).toBeUndefined();
    expect(scene.remove).toHaveBeenCalled();
    expect(mockMesh.geometry.dispose).toHaveBeenCalled();
    expect(mockMaterial.dispose).toHaveBeenCalled();
  });

  test('clears all points', () => {
    const manager = new PointsManager(scene);
    manager.addPoint(mockReading, 1);
    manager.addPoint({ ...mockReading, locationX: 30 }, 1);
    
    manager.clear();
    
    expect(manager.getPoints().size).toBe(0);
    expect(manager.getHoveredPoint()).toBeUndefined();
    expect(manager.getSelectedPoint()).toBeUndefined();
    expect(scene.remove).toHaveBeenCalled();
    expect(mockMesh.geometry.dispose).toHaveBeenCalled();
    expect(mockMaterial.dispose).toHaveBeenCalled();
  });

  test('normalizes values correctly', () => {
    const manager = new PointsManager(scene, {
      valueRange: { min: 0, max: 100 }
    });
    
    const point1 = manager.addPoint({
      ...mockReading,
      dataPoints: [{ value: 0, unit: '%' }]
    }, 1);
    
    const point2 = manager.addPoint({
      ...mockReading,
      dataPoints: [{ value: 100, unit: '%' }]
    }, 1);
    
    expect(point1.value).toBe(0);
    expect(point2.value).toBe(100);
  });
});
