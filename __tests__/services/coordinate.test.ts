import { coordinateService, CoordinateError } from '../../app/services/coordinateService';
import { prisma } from '../../app/lib/prisma';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import {
  CoordinateUnit,
  GridType,
  SnapMode,
  Scale,
  Transform,
  CoordinateSpace,
  LevelCoordinates,
  Grid
} from '../../app/types/coordinate';
import { PlanLevel } from '../../app/types/plan';

// Mock Prisma
jest.mock('../../app/lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>()
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('Coordinate Service', () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  const mockScale: Scale = {
    pixelsPerUnit: 100,
    unit: CoordinateUnit.METERS,
    referencePoints: [
      {
        pixel: { x: 0, y: 0 },
        real: { x: 0, y: 0 }
      },
      {
        pixel: { x: 100, y: 0 },
        real: { x: 1, y: 0 }
      }
    ]
  };

  describe('createSpace', () => {
    it('should create a new coordinate space', async () => {
      const space = await coordinateService.createSpace(
        'Test Space',
        CoordinateUnit.METERS,
        { x: 0, y: 0 },
        mockScale
      );

      expect(space.id).toBeDefined();
      expect(space.name).toBe('Test Space');
      expect(space.unit).toBe(CoordinateUnit.METERS);
      expect(space.scale).toEqual(mockScale);
    });

    it('should initialize space with default transform', async () => {
      const space = await coordinateService.createSpace(
        'Test Space',
        CoordinateUnit.METERS,
        { x: 0, y: 0 },
        mockScale
      );

      expect(space.transform).toBeDefined();
      expect(space.transform.translate).toEqual({ x: 0, y: 0 });
      expect(space.transform.rotate).toBe(0);
      expect(space.transform.scale).toEqual({ x: 1, y: 1 });
    });
  });

  describe('createLevel', () => {
    it('should create a new level with coordinate space', async () => {
      const level = await coordinateService.createLevel(
        PlanLevel.GROUND,
        0,
        0
      );

      expect(level.id).toBeDefined();
      expect(level.level).toBe(PlanLevel.GROUND);
      expect(level.levelNumber).toBe(0);
      expect(level.elevation).toBe(0);
      expect(level.coordinateSpace).toBeDefined();
    });

    it('should initialize level with empty reference points', async () => {
      const level = await coordinateService.createLevel(
        PlanLevel.GROUND,
        0,
        0
      );

      expect(level.referencePoints).toHaveLength(0);
      expect(level.connections).toHaveLength(0);
    });
  });

  describe('createGrid', () => {
    it('should create a new grid', async () => {
      const grid = await coordinateService.createGrid(
        GridType.RECTANGULAR,
        {
          major: 100,
          minor: 20,
          subdivisions: 5
        },
        { x: 0, y: 0 }
      );

      expect(grid.id).toBeDefined();
      expect(grid.type).toBe(GridType.RECTANGULAR);
      expect(grid.spacing.major).toBe(100);
      expect(grid.spacing.minor).toBe(20);
    });

    it('should initialize grid with default style', async () => {
      const grid = await coordinateService.createGrid(
        GridType.RECTANGULAR,
        {
          major: 100,
          minor: 20,
          subdivisions: 5
        },
        { x: 0, y: 0 }
      );

      expect(grid.style).toBeDefined();
      expect(grid.style.majorColor).toBe('#666666');
      expect(grid.style.minorColor).toBe('#999999');
      expect(grid.style.opacity).toBe(0.5);
    });
  });

  describe('createMapping', () => {
    const mockTransform: Transform = {
      translate: { x: 0, y: 0 },
      rotate: 0,
      scale: { x: 1, y: 1 },
      origin: { x: 0, y: 0 }
    };

    it('should create a mapping between spaces', async () => {
      const mapping = await coordinateService.createMapping(
        'space-1',
        'space-2',
        mockTransform
      );

      expect(mapping.id).toBeDefined();
      expect(mapping.sourceSpace).toBe('space-1');
      expect(mapping.targetSpace).toBe('space-2');
      expect(mapping.transformations).toHaveLength(1);
      expect(mapping.transformations[0]).toEqual(mockTransform);
    });
  });

  describe('convertCoordinates', () => {
    it('should convert between units', () => {
      const result = coordinateService.convertCoordinates({
        source: {
          point: { x: 100, y: 100 },
          unit: CoordinateUnit.PIXELS
        },
        target: {
          unit: CoordinateUnit.METERS
        }
      });

      expect(result).toBeDefined();
      expect(typeof result.x).toBe('number');
      expect(typeof result.y).toBe('number');
    });

    it('should apply rounding when specified', () => {
      const result = coordinateService.convertCoordinates({
        source: {
          point: { x: 100.123, y: 100.456 },
          unit: CoordinateUnit.PIXELS
        },
        target: {
          unit: CoordinateUnit.METERS
        },
        options: {
          roundTo: 2
        }
      });

      expect(result.x.toString()).toMatch(/\.\d{2}$/);
      expect(result.y.toString()).toMatch(/\.\d{2}$/);
    });
  });

  describe('calibrate', () => {
    it('should calibrate coordinate space', async () => {
      const space = await coordinateService.createSpace(
        'Test Space',
        CoordinateUnit.METERS,
        { x: 0, y: 0 },
        mockScale
      );

      const newScale = await coordinateService.calibrate({
        spaceId: space.id,
        method: 'POINT_PAIR',
        referencePoints: [
          {
            measured: { x: 0, y: 0 },
            reference: { x: 0, y: 0 }
          },
          {
            measured: { x: 100, y: 0 },
            reference: { x: 1, y: 0 }
          }
        ]
      });

      expect(newScale).toBeDefined();
      expect(newScale.pixelsPerUnit).toBeGreaterThan(0);
    });

    it('should reject calibration for non-existent space', async () => {
      await expect(coordinateService.calibrate({
        spaceId: 'non-existent',
        method: 'POINT_PAIR',
        referencePoints: []
      })).rejects.toThrow(CoordinateError);
    });
  });

  describe('takeSnapshot', () => {
    it('should capture current system state', () => {
      const snapshot = coordinateService.takeSnapshot();

      expect(snapshot.id).toBeDefined();
      expect(snapshot.timestamp).toBeDefined();
      expect(snapshot.spaces).toBeDefined();
      expect(snapshot.transforms).toBeDefined();
    });
  });

  describe('getStats', () => {
    it('should return system statistics', () => {
      const stats = coordinateService.getStats();

      expect(stats.spaces).toBeDefined();
      expect(stats.levels).toBeDefined();
      expect(stats.mappings).toBeDefined();
      expect(stats.averageAccuracy).toBeDefined();
      expect(stats.calibrations).toBeDefined();
      expect(stats.usage).toBeDefined();
    });
  });
});
