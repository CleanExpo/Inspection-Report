import { describe, expect, test, beforeEach, afterEach, jest } from '@jest/globals';
import { SceneManager } from '../../../app/moisture/components/ThreeDVisualization/setup';
import * as THREE from 'three';

// Mock HTMLDivElement
const createMockContainer = () => ({
  clientWidth: 800,
  clientHeight: 600,
  appendChild: jest.fn(),
  contains: jest.fn().mockReturnValue(true),
  removeChild: jest.fn(),
});

describe('SceneManager', () => {
  let container: ReturnType<typeof createMockContainer>;

  beforeEach(() => {
    container = createMockContainer();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with default config', () => {
    const manager = new SceneManager(container as unknown as HTMLDivElement);
    const refs = manager.getRefs();

    expect(refs.scene).toBeInstanceOf(THREE.Scene);
    expect(refs.camera).toBeInstanceOf(THREE.PerspectiveCamera);
    expect(refs.renderer).toBeInstanceOf(THREE.WebGLRenderer);
  });

  test('applies custom config', () => {
    const customConfig = {
      backgroundColor: 0x000000,
      fov: 90,
      near: 0.5,
      far: 2000,
    };

    const manager = new SceneManager(
      container as unknown as HTMLDivElement,
      customConfig
    );
    const refs = manager.getRefs();

    expect(refs.scene.background).toEqual(new THREE.Color(customConfig.backgroundColor));
    expect(refs.camera.fov).toBe(customConfig.fov);
    expect(refs.camera.near).toBe(customConfig.near);
    expect(refs.camera.far).toBe(customConfig.far);
  });

  test('sets up lighting correctly', () => {
    const manager = new SceneManager(container as unknown as HTMLDivElement);
    manager.setupLighting();
    const refs = manager.getRefs();

    const lights = refs.scene.children.filter(
      child => child instanceof THREE.Light
    );
    expect(lights).toHaveLength(2); // Ambient and Directional lights

    const gridHelper = refs.scene.children.find(
      child => child instanceof THREE.GridHelper
    );
    expect(gridHelper).toBeTruthy();
  });

  test('handles resize correctly', () => {
    const manager = new SceneManager(container as unknown as HTMLDivElement);
    const refs = manager.getRefs();
    
    // Mock new dimensions
    container.clientWidth = 1024;
    container.clientHeight = 768;

    manager.handleResize();

    expect(refs.camera.aspect).toBe(1024 / 768);
    expect(refs.renderer.getSize(new THREE.Vector2()))
      .toEqual(new THREE.Vector2(1024, 768));
  });

  test('disposes resources correctly', () => {
    const manager = new SceneManager(container as unknown as HTMLDivElement);
    const refs = manager.getRefs();

    const rendererDisposeSpy = jest.spyOn(refs.renderer, 'dispose');
    
    manager.dispose();

    expect(rendererDisposeSpy).toHaveBeenCalled();
    expect(container.removeChild).toHaveBeenCalledWith(refs.renderer.domElement);
  });
});
