import { describe, expect, test, jest } from '@jest/globals';
import { ControlManager } from '../../../app/moisture/components/ThreeDVisualization/controls';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Mock Three.js
jest.mock('three', () => ({
  PerspectiveCamera: jest.fn().mockImplementation(() => ({
    position: { copy: jest.fn() }
  })),
  Vector3: jest.fn().mockImplementation(() => ({
    copy: jest.fn()
  }))
}));

// Mock OrbitControls
const mockOrbitControls = {
  minDistance: 0,
  maxDistance: 0,
  minPolarAngle: 0,
  maxPolarAngle: 0,
  enableDamping: false,
  dampingFactor: 0,
  rotateSpeed: 1,
  zoomSpeed: 1,
  enablePan: true,
  screenSpacePanning: false,
  enabled: true,
  enableRotate: true,
  enableZoom: true,
  target: { copy: jest.fn() },
  object: { position: { copy: jest.fn() } },
  update: jest.fn(),
  reset: jest.fn(),
  dispose: jest.fn(),
  keys: {}
};

jest.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
  OrbitControls: jest.fn().mockImplementation(() => mockOrbitControls)
}));

describe('ControlManager', () => {
  const camera = new THREE.PerspectiveCamera();
  const domElement = document.createElement('div');

  test('initializes with default config', () => {
    const manager = new ControlManager(camera, domElement);
    const controls = manager.getControls();

    expect(controls.minDistance).toBe(5);
    expect(controls.maxDistance).toBe(100);
    expect(controls.minPolarAngle).toBe(0);
    expect(controls.maxPolarAngle).toBe(Math.PI / 2);
    expect(controls.enableDamping).toBe(true);
    expect(controls.dampingFactor).toBe(0.05);
    expect(controls.rotateSpeed).toBe(1.0);
    expect(controls.zoomSpeed).toBe(1.0);
  });

  test('initializes with custom config', () => {
    const customConfig = {
      minDistance: 10,
      maxDistance: 200,
      minPolarAngle: Math.PI / 4,
      maxPolarAngle: Math.PI / 3,
      enableDamping: false,
      dampingFactor: 0.1,
      rotationSpeed: 2.0,
      zoomSpeed: 0.5
    };

    const manager = new ControlManager(camera, domElement, customConfig);
    const controls = manager.getControls();

    expect(controls.minDistance).toBe(customConfig.minDistance);
    expect(controls.maxDistance).toBe(customConfig.maxDistance);
    expect(controls.minPolarAngle).toBe(customConfig.minPolarAngle);
    expect(controls.maxPolarAngle).toBe(customConfig.maxPolarAngle);
    expect(controls.enableDamping).toBe(customConfig.enableDamping);
    expect(controls.dampingFactor).toBe(customConfig.dampingFactor);
    expect(controls.rotateSpeed).toBe(customConfig.rotationSpeed);
    expect(controls.zoomSpeed).toBe(customConfig.zoomSpeed);
  });

  test('updates controls', () => {
    const manager = new ControlManager(camera, domElement);
    manager.update();
    expect(mockOrbitControls.update).toHaveBeenCalled();
  });

  test('sets target position', () => {
    const manager = new ControlManager(camera, domElement);
    const position = new THREE.Vector3();
    manager.setTarget(position);
    expect(mockOrbitControls.target.copy).toHaveBeenCalledWith(position);
    expect(mockOrbitControls.update).toHaveBeenCalled();
  });

  test('sets camera position', () => {
    const manager = new ControlManager(camera, domElement);
    const position = new THREE.Vector3();
    manager.setPosition(position);
    expect(mockOrbitControls.object.position.copy).toHaveBeenCalledWith(position);
    expect(mockOrbitControls.update).toHaveBeenCalled();
  });

  test('resets view', () => {
    const manager = new ControlManager(camera, domElement);
    manager.resetView();
    expect(mockOrbitControls.reset).toHaveBeenCalled();
  });

  test('enables/disables rotation', () => {
    const manager = new ControlManager(camera, domElement);
    manager.enableRotate(false);
    expect(mockOrbitControls.enableRotate).toBe(false);
    manager.enableRotate(true);
    expect(mockOrbitControls.enableRotate).toBe(true);
  });

  test('enables/disables zoom', () => {
    const manager = new ControlManager(camera, domElement);
    manager.enableZoom(false);
    expect(mockOrbitControls.enableZoom).toBe(false);
    manager.enableZoom(true);
    expect(mockOrbitControls.enableZoom).toBe(true);
  });

  test('enables/disables pan', () => {
    const manager = new ControlManager(camera, domElement);
    manager.enablePan(false);
    expect(mockOrbitControls.enablePan).toBe(false);
    manager.enablePan(true);
    expect(mockOrbitControls.enablePan).toBe(true);
  });

  test('sets rotation speed', () => {
    const manager = new ControlManager(camera, domElement);
    manager.setRotationSpeed(2.0);
    expect(mockOrbitControls.rotateSpeed).toBe(2.0);
  });

  test('sets zoom speed', () => {
    const manager = new ControlManager(camera, domElement);
    manager.setZoomSpeed(0.5);
    expect(mockOrbitControls.zoomSpeed).toBe(0.5);
  });

  test('disposes controls', () => {
    const manager = new ControlManager(camera, domElement);
    manager.dispose();
    expect(mockOrbitControls.dispose).toHaveBeenCalled();
  });
});
