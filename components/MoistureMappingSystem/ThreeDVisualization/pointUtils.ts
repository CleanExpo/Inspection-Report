import * as THREE from 'three';
import { MoistureReading } from '@prisma/client';
import { Point3D, PointMaterial } from './types';

const defaultMaterial: PointMaterial = {
  size: 0.2,
  color: 0x0000ff,
  opacity: 0.8,
  transparent: true
};

/**
 * Maps moisture value to a color using a gradient
 * Low (dry) -> Blue
 * Medium -> Green
 * High (wet) -> Red
 */
export const getMoistureColor = (value: number): number => {
  // Normalize value to 0-1 range assuming typical moisture range of 0-100
  const normalized = Math.min(Math.max(value / 100, 0), 1);
  
  if (normalized < 0.5) {
    // Blue to Green (0-50%)
    const ratio = normalized * 2;
    return new THREE.Color(
      0,
      ratio,
      1 - ratio
    ).getHex();
  } else {
    // Green to Red (50-100%)
    const ratio = (normalized - 0.5) * 2;
    return new THREE.Color(
      ratio,
      1 - ratio,
      0
    ).getHex();
  }
};

/**
 * Creates point geometry from moisture readings
 */
export const createPointGeometry = (readings: MoistureReading[]): THREE.BufferGeometry => {
  const positions: number[] = [];
  const colors: number[] = [];

  readings.forEach(reading => {
    // Convert reading to 3D point
    const point: Point3D = [
      reading.locationX,
      reading.locationY,
      0 // Using 2D coordinates for now, can add height/z later
    ];

    positions.push(...point);

    // Add color based on moisture value
    const color = new THREE.Color(getMoistureColor(reading.value));
    colors.push(color.r, color.g, color.b);
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  return geometry;
};

/**
 * Creates point material with custom settings
 */
export const createPointMaterial = (options: Partial<PointMaterial> = {}): THREE.PointsMaterial => {
  const material = new THREE.PointsMaterial({
    ...defaultMaterial,
    ...options,
    vertexColors: true
  });

  return material;
};

/**
 * Finds the nearest point in the readings to the given coordinates
 */
export const findNearestPoint = (
  x: number,
  y: number,
  readings: MoistureReading[],
  threshold: number = 0.5
): MoistureReading | null => {
  let nearest: MoistureReading | null = null;
  let minDistance = threshold;

  readings.forEach(reading => {
    const distance = Math.sqrt(
      Math.pow(reading.locationX - x, 2) + 
      Math.pow(reading.locationY - y, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = reading;
    }
  });

  return nearest;
};
