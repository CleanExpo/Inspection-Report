import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface ControlConfig {
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  enableDamping: boolean;
  dampingFactor: number;
  rotationSpeed: number;
  zoomSpeed: number;
}

export class ControlManager {
  private controls: OrbitControls;
  private config: ControlConfig;

  constructor(
    camera: THREE.PerspectiveCamera,
    domElement: HTMLElement,
    config: Partial<ControlConfig> = {}
  ) {
    this.config = {
      minDistance: 5,
      maxDistance: 100,
      minPolarAngle: 0,
      maxPolarAngle: Math.PI / 2,
      enableDamping: true,
      dampingFactor: 0.05,
      rotationSpeed: 1.0,
      zoomSpeed: 1.0,
      ...config
    };

    this.controls = this.initializeControls(camera, domElement);
  }

  private initializeControls(
    camera: THREE.PerspectiveCamera,
    domElement: HTMLElement
  ): OrbitControls {
    const controls = new OrbitControls(camera, domElement);

    // Set distance limits
    controls.minDistance = this.config.minDistance;
    controls.maxDistance = this.config.maxDistance;

    // Set angle limits
    controls.minPolarAngle = this.config.minPolarAngle;
    controls.maxPolarAngle = this.config.maxPolarAngle;

    // Enable smooth controls
    controls.enableDamping = this.config.enableDamping;
    controls.dampingFactor = this.config.dampingFactor;

    // Set speeds
    controls.rotateSpeed = this.config.rotationSpeed;
    controls.zoomSpeed = this.config.zoomSpeed;

    // Additional settings
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.keys = {
      LEFT: 'ArrowLeft',
      UP: 'ArrowUp',
      RIGHT: 'ArrowRight',
      BOTTOM: 'ArrowDown'
    };

    return controls;
  }

  public update(): void {
    this.controls.update();
  }

  public setTarget(position: THREE.Vector3): void {
    this.controls.target.copy(position);
    this.controls.update();
  }

  public setPosition(position: THREE.Vector3): void {
    this.controls.object.position.copy(position);
    this.controls.update();
  }

  public resetView(): void {
    this.controls.reset();
  }

  public enableRotate(enable: boolean): void {
    this.controls.enableRotate = enable;
  }

  public enableZoom(enable: boolean): void {
    this.controls.enableZoom = enable;
  }

  public enablePan(enable: boolean): void {
    this.controls.enablePan = enable;
  }

  public setRotationSpeed(speed: number): void {
    this.controls.rotateSpeed = speed;
  }

  public setZoomSpeed(speed: number): void {
    this.controls.zoomSpeed = speed;
  }

  public dispose(): void {
    this.controls.dispose();
  }

  public getControls(): OrbitControls {
    return this.controls;
  }
}
