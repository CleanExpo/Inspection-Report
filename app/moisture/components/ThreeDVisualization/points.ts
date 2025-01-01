import * as THREE from 'three';
import type { MoistureReading } from './types';

export interface PointMaterial {
  color: THREE.ColorRepresentation;
  opacity: number;
  size: number;
}

export interface PointConfig {
  defaultMaterial: PointMaterial;
  hoverMaterial: PointMaterial;
  selectedMaterial: PointMaterial;
  valueRange: {
    min: number;
    max: number;
  };
}

export interface Point {
  id: string;
  position: THREE.Vector3;
  value: number;
  mesh: THREE.Mesh;
  reading: MoistureReading;
}

export class PointsManager {
  private scene: THREE.Scene;
  private config: PointConfig;
  private points: Map<string, Point>;
  private hoveredPoint: string | null;
  private selectedPoint: string | null;

  constructor(scene: THREE.Scene, config: Partial<PointConfig> = {}) {
    this.scene = scene;
    this.config = {
      defaultMaterial: {
        color: 0x0088ff,
        opacity: 0.8,
        size: 0.1
      },
      hoverMaterial: {
        color: 0x00ff88,
        opacity: 1.0,
        size: 0.15
      },
      selectedMaterial: {
        color: 0xff8800,
        opacity: 1.0,
        size: 0.15
      },
      valueRange: {
        min: 0,
        max: 100
      },
      ...config
    };
    this.points = new Map();
    this.hoveredPoint = null;
    this.selectedPoint = null;
  }

  public addPoint(reading: MoistureReading, level: number): Point {
    const id = `point-${reading.locationX}-${reading.locationY}-${level}`;
    const position = new THREE.Vector3(
      reading.locationX,
      level,
      reading.locationY
    );

    const value = reading.dataPoints[0]?.value ?? 0;
    const normalizedValue = this.normalizeValue(value);
    const color = this.getColorForValue(normalizedValue);

    const geometry = new THREE.SphereGeometry(this.config.defaultMaterial.size);
    const material = new THREE.MeshStandardMaterial({
      color,
      opacity: this.config.defaultMaterial.opacity,
      transparent: true
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    this.scene.add(mesh);

    const point: Point = {
      id,
      position,
      value,
      mesh,
      reading
    };

    this.points.set(id, point);
    return point;
  }

  public updatePoint(id: string, reading: MoistureReading): void {
    const point = this.points.get(id);
    if (!point) return;

    const value = reading.dataPoints[0]?.value ?? 0;
    const normalizedValue = this.normalizeValue(value);
    const color = this.getColorForValue(normalizedValue);

    (point.mesh.material as THREE.MeshStandardMaterial).color.set(color);
    point.value = value;
    point.reading = reading;
  }

  public setHovered(id: string | null): void {
    if (this.hoveredPoint === id) return;

    // Reset previous hover
    if (this.hoveredPoint) {
      const prev = this.points.get(this.hoveredPoint);
      if (prev) {
        this.applyMaterial(prev.mesh, this.config.defaultMaterial);
      }
    }

    // Apply new hover
    if (id) {
      const point = this.points.get(id);
      if (point) {
        this.applyMaterial(point.mesh, this.config.hoverMaterial);
      }
    }

    this.hoveredPoint = id;
  }

  public setSelected(id: string | null): void {
    if (this.selectedPoint === id) return;

    // Reset previous selection
    if (this.selectedPoint) {
      const prev = this.points.get(this.selectedPoint);
      if (prev) {
        this.applyMaterial(prev.mesh, this.config.defaultMaterial);
      }
    }

    // Apply new selection
    if (id) {
      const point = this.points.get(id);
      if (point) {
        this.applyMaterial(point.mesh, this.config.selectedMaterial);
      }
    }

    this.selectedPoint = id;
  }

  public removePoint(id: string): void {
    const point = this.points.get(id);
    if (!point) return;

    this.scene.remove(point.mesh);
    point.mesh.geometry.dispose();
    (point.mesh.material as THREE.Material).dispose();
    this.points.delete(id);

    if (this.hoveredPoint === id) this.hoveredPoint = null;
    if (this.selectedPoint === id) this.selectedPoint = null;
  }

  public clear(): void {
    this.points.forEach(point => {
      this.scene.remove(point.mesh);
      point.mesh.geometry.dispose();
      (point.mesh.material as THREE.Material).dispose();
    });
    this.points.clear();
    this.hoveredPoint = null;
    this.selectedPoint = null;
  }

  private normalizeValue(value: number): number {
    const { min, max } = this.config.valueRange;
    return (value - min) / (max - min);
  }

  private getColorForValue(normalizedValue: number): THREE.Color {
    // Blue (low) to Red (high)
    return new THREE.Color().setHSL(
      0.6 * (1 - normalizedValue), // Hue
      0.8, // Saturation
      0.5  // Lightness
    );
  }

  private applyMaterial(mesh: THREE.Mesh, material: PointMaterial): void {
    const meshMaterial = mesh.material as THREE.MeshStandardMaterial;
    meshMaterial.color.set(material.color);
    meshMaterial.opacity = material.opacity;
    mesh.scale.setScalar(material.size * 20); // Scale factor for visibility
  }

  public getPoints(): Map<string, Point> {
    return this.points;
  }

  public getPoint(id: string): Point | undefined {
    return this.points.get(id);
  }

  public getHoveredPoint(): Point | undefined {
    return this.hoveredPoint ? this.points.get(this.hoveredPoint) : undefined;
  }

  public getSelectedPoint(): Point | undefined {
    return this.selectedPoint ? this.points.get(this.selectedPoint) : undefined;
  }
}
