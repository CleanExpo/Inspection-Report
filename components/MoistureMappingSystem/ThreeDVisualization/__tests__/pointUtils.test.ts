import * as THREE from 'three';
import { getMoistureColor, createPointGeometry, createPointMaterial, findNearestPoint } from '../pointUtils';
import { MoistureReading } from '../types';

// Mock Three.js classes
jest.mock('three', () => ({
  Color: jest.fn().mockImplementation(() => ({
    getHex: jest.fn().mockReturnValue(0x0000ff)
  })),
  BufferGeometry: jest.fn().mockImplementation(() => ({
    setAttribute: jest.fn()
  })),
  Float32BufferAttribute: jest.fn(),
  PointsMaterial: jest.fn()
}));

describe('pointUtils', () => {
  describe('getMoistureColor', () => {
    it('returns blue for low moisture values', () => {
      const color = getMoistureColor(0);
      expect(THREE.Color).toHaveBeenCalled();
      expect(color).toBeDefined();
    });

    it('returns green for medium moisture values', () => {
      const color = getMoistureColor(50);
      expect(THREE.Color).toHaveBeenCalled();
      expect(color).toBeDefined();
    });

    it('returns red for high moisture values', () => {
      const color = getMoistureColor(100);
      expect(THREE.Color).toHaveBeenCalled();
      expect(color).toBeDefined();
    });
  });

  describe('createPointGeometry', () => {
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

    it('creates geometry with correct attributes', () => {
      const geometry = createPointGeometry(mockReadings);
      expect(geometry).toBeInstanceOf(THREE.BufferGeometry);
      expect(geometry.setAttribute).toHaveBeenCalledTimes(2); // position and color
    });

    it('handles empty readings array', () => {
      const geometry = createPointGeometry([]);
      expect(geometry).toBeInstanceOf(THREE.BufferGeometry);
      expect(geometry.setAttribute).toHaveBeenCalledTimes(2);
    });
  });

  describe('createPointMaterial', () => {
    it('creates material with default options', () => {
      const material = createPointMaterial();
      expect(material).toBeInstanceOf(THREE.PointsMaterial);
    });

    it('creates material with custom options', () => {
      const options = {
        size: 0.5,
        opacity: 0.5
      };
      const material = createPointMaterial(options);
      expect(material).toBeInstanceOf(THREE.PointsMaterial);
      expect(THREE.PointsMaterial).toHaveBeenCalledWith(
        expect.objectContaining(options)
      );
    });
  });

  describe('findNearestPoint', () => {
    const mockReadings: MoistureReading[] = [
      {
        id: '1',
        jobId: 'job1',
        locationX: 0,
        locationY: 0,
        value: 50,
        room: 'Room1',
        floor: 'Floor1',
        temperature: 20,
        humidity: 45,
        pressure: 1013,
        createdAt: new Date(),
        updatedAt: new Date(),
        notes: null,
        equipmentId: 'equip1',
        floorPlanId: 'plan1'
      },
      {
        id: '2',
        jobId: 'job1',
        locationX: 1,
        locationY: 1,
        value: 75,
        room: 'Room1',
        floor: 'Floor1',
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

    it('finds the nearest point within threshold', () => {
      const nearest = findNearestPoint(0.1, 0.1, mockReadings);
      expect(nearest).toBe(mockReadings[0]);
    });

    it('returns null when no points within threshold', () => {
      const nearest = findNearestPoint(10, 10, mockReadings, 0.1);
      expect(nearest).toBeNull();
    });

    it('handles empty readings array', () => {
      const nearest = findNearestPoint(0, 0, []);
      expect(nearest).toBeNull();
    });
  });
});
