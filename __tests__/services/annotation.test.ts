import { annotationService, AnnotationServiceError } from '../../app/services/annotationService';
import { prisma } from '../../app/lib/prisma';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import {
  AnnotationType,
  ShapeType,
  MeasurementType,
  TextStyle,
  Annotation,
  TextAnnotation,
  ShapeAnnotation,
  MeasurementAnnotation,
  ImageAnnotation
} from '../../app/types/annotation';

// Mock Prisma
jest.mock('../../app/lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>()
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('Annotation Service', () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  const mockBaseAnnotation = {
    mapId: 'map-1',
    position: { x: 100, y: 100 },
    style: {
      color: '#000000',
      opacity: 1
    },
    layer: 1,
    visible: true,
    locked: false,
    createdBy: 'user-1'
  };

  describe('createAnnotation', () => {
    it('should create text annotation', async () => {
      const textAnnotation: Omit<TextAnnotation, 'id' | 'createdAt' | 'updatedAt'> = {
        ...mockBaseAnnotation,
        type: AnnotationType.TEXT,
        content: 'Test annotation',
        dimensions: {
          width: 200,
          height: 50
        }
      };

      prismaMock.annotation.create.mockResolvedValue({
        id: 'anno-1',
        ...textAnnotation,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await annotationService.createAnnotation(
        'map-1',
        AnnotationType.TEXT,
        textAnnotation
      );

      expect(result.id).toBeDefined();
      expect(result.type).toBe(AnnotationType.TEXT);
      expect(result.content).toBe('Test annotation');
    });

    it('should create shape annotation', async () => {
      const shapeAnnotation: Omit<ShapeAnnotation, 'id' | 'createdAt' | 'updatedAt'> = {
        ...mockBaseAnnotation,
        type: AnnotationType.SHAPE,
        shapeType: ShapeType.RECTANGLE,
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 100 }
        ]
      };

      prismaMock.annotation.create.mockResolvedValue({
        id: 'anno-1',
        ...shapeAnnotation,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await annotationService.createAnnotation(
        'map-1',
        AnnotationType.SHAPE,
        shapeAnnotation
      );

      expect(result.id).toBeDefined();
      expect(result.type).toBe(AnnotationType.SHAPE);
      expect(result.shapeType).toBe(ShapeType.RECTANGLE);
    });

    it('should create measurement annotation', async () => {
      const measurementAnnotation: Omit<MeasurementAnnotation, 'id' | 'createdAt' | 'updatedAt'> = {
        ...mockBaseAnnotation,
        type: AnnotationType.MEASUREMENT,
        measurementType: MeasurementType.DISTANCE,
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 100 }
        ],
        value: 141.42,
        unit: 'px'
      };

      prismaMock.annotation.create.mockResolvedValue({
        id: 'anno-1',
        ...measurementAnnotation,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await annotationService.createAnnotation(
        'map-1',
        AnnotationType.MEASUREMENT,
        measurementAnnotation
      );

      expect(result.id).toBeDefined();
      expect(result.type).toBe(AnnotationType.MEASUREMENT);
      expect(result.value).toBe(141.42);
    });

    it('should reject invalid annotation data', async () => {
      const invalidAnnotation = {
        ...mockBaseAnnotation,
        type: AnnotationType.TEXT
        // Missing required content field
      };

      await expect(annotationService.createAnnotation(
        'map-1',
        AnnotationType.TEXT,
        invalidAnnotation
      )).rejects.toThrow(AnnotationServiceError);
    });
  });

  describe('updateAnnotation', () => {
    it('should update annotation', async () => {
      const currentAnnotation = {
        id: 'anno-1',
        ...mockBaseAnnotation,
        type: AnnotationType.TEXT,
        content: 'Original text',
        dimensions: {
          width: 200,
          height: 50
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.annotation.findUnique.mockResolvedValue(currentAnnotation);
      prismaMock.annotation.update.mockResolvedValue({
        ...currentAnnotation,
        content: 'Updated text',
        updatedAt: new Date()
      });

      const result = await annotationService.updateAnnotation<TextAnnotation>(
        'anno-1',
        { content: 'Updated text' },
        'user-1'
      );

      expect((result as TextAnnotation).content).toBe('Updated text');
    });

    it('should reject update for non-existent annotation', async () => {
      prismaMock.annotation.findUnique.mockResolvedValue(null);

      await expect(annotationService.updateAnnotation(
        'non-existent',
        { content: 'Updated text' },
        'user-1'
      )).rejects.toThrow(AnnotationServiceError);
    });
  });

  describe('upsertLayer', () => {
    it('should create new layer', async () => {
      const layer = {
        mapId: 'map-1',
        name: 'Layer 1',
        visible: true,
        locked: false,
        opacity: 1,
        zIndex: 1
      };

      prismaMock.annotationLayer.upsert.mockResolvedValue({
        id: 'layer-1',
        ...layer,
        annotations: []
      });

      const result = await annotationService.upsertLayer('map-1', layer);

      expect(result.id).toBeDefined();
      expect(result.name).toBe('Layer 1');
      expect(result.annotations).toHaveLength(0);
    });

    it('should update existing layer', async () => {
      const layer = {
        mapId: 'map-1',
        name: 'Layer 1',
        visible: false,
        locked: true,
        opacity: 0.5,
        zIndex: 2
      };

      prismaMock.annotationLayer.upsert.mockResolvedValue({
        id: 'layer-1',
        ...layer,
        annotations: ['anno-1']
      });

      const result = await annotationService.upsertLayer('map-1', layer);

      expect(result.visible).toBe(false);
      expect(result.locked).toBe(true);
      expect(result.opacity).toBe(0.5);
    });
  });

  describe('transformAnnotations', () => {
    it('should apply transform to annotations', async () => {
      const annotations = [
        {
          id: 'anno-1',
          ...mockBaseAnnotation,
          type: AnnotationType.SHAPE,
          shapeType: ShapeType.RECTANGLE,
          points: [
            { x: 0, y: 0 },
            { x: 100, y: 100 }
          ]
        }
      ];

      prismaMock.annotation.findMany.mockResolvedValue(annotations);
      prismaMock.annotation.update.mockImplementation(async ({ where, data }) => ({
        ...annotations.find(a => a.id === where.id)!,
        ...data,
        updatedAt: new Date()
      }));

      const transform = {
        translate: { x: 50, y: 50 },
        rotate: 45
      };

      const result = await annotationService.transformAnnotations(
        ['anno-1'],
        transform,
        'user-1'
      );

      expect(result).toHaveLength(1);
      expect(result[0].position.x).toBeGreaterThan(annotations[0].position.x);
      expect(result[0].position.y).toBeGreaterThan(annotations[0].position.y);
    });
  });

  describe('getStatistics', () => {
    it('should return annotation statistics', async () => {
      const annotations = [
        {
          id: 'anno-1',
          type: AnnotationType.TEXT,
          mapId: 'map-1',
          layer: 1
        },
        {
          id: 'anno-2',
          type: AnnotationType.SHAPE,
          mapId: 'map-1',
          layer: 2
        },
        {
          id: 'anno-3',
          type: AnnotationType.MEASUREMENT,
          mapId: 'map-1',
          layer: 1,
          measurementType: MeasurementType.DISTANCE,
          value: 100,
          unit: 'px'
        }
      ];

      prismaMock.annotation.findMany.mockResolvedValue(annotations);

      const stats = await annotationService.getStatistics('map-1');

      expect(stats.counts.total).toBe(3);
      expect(stats.counts.byType[AnnotationType.TEXT]).toBe(1);
      expect(stats.counts.byType[AnnotationType.SHAPE]).toBe(1);
      expect(stats.counts.byType[AnnotationType.MEASUREMENT]).toBe(1);
      expect(stats.measurements.total).toBe(1);
    });
  });
});
