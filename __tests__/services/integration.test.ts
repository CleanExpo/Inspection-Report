import { integrationService, IntegrationError } from '../../app/services/integrationService';
import { prisma } from '../../app/lib/prisma';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import {
  PlacementMode,
  PositionStatus,
  InteractionMode,
  OverlayType,
  PlacementConfig
} from '../../app/types/integration';
import { AnnotationType } from '../../app/types/annotation';
import { EquipmentType } from '../../app/types/equipment';

// Mock Prisma
jest.mock('../../app/lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>()
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('Integration Service', () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  const mockConfig: PlacementConfig = {
    mode: PlacementMode.MANUAL,
    snapThreshold: 10,
    autoSpacing: 50,
    constraints: {
      minDistance: 20,
      maxDistance: 1000
    }
  };

  describe('placeReading', () => {
    it('should place reading at specified position', async () => {
      const position = { x: 100, y: 100 };

      const placement = await integrationService.placeReading(
        'reading-1',
        position,
        mockConfig
      );

      expect(placement.id).toBeDefined();
      expect(placement.readingId).toBe('reading-1');
      expect(placement.position).toEqual(position);
      expect(placement.status).toBe(PositionStatus.VALID);
    });

    it('should add reading to appropriate layer', async () => {
      const position = { x: 100, y: 100 };

      await integrationService.placeReading(
        'reading-1',
        position,
        mockConfig
      );

      const snapshot = integrationService.takeSnapshot();
      const layer = snapshot.layers.find(l => l.type === OverlayType.READING);

      expect(layer).toBeDefined();
      expect(layer?.elements.readings).toHaveLength(1);
    });
  });

  describe('positionEquipment', () => {
    const mockEquipment = {
      id: 'equip-1',
      type: EquipmentType.SENSOR
    };

    it('should position equipment on floor plan', async () => {
      prismaMock.equipment.findUnique.mockResolvedValue(mockEquipment as any);

      const position = { x: 200, y: 200 };

      const equipPos = await integrationService.positionEquipment(
        'equip-1',
        position,
        mockConfig
      );

      expect(equipPos.id).toBeDefined();
      expect(equipPos.equipmentId).toBe('equip-1');
      expect(equipPos.position).toEqual(position);
      expect(equipPos.status).toBe(PositionStatus.VALID);
    });

    it('should reject positioning for non-existent equipment', async () => {
      prismaMock.equipment.findUnique.mockResolvedValue(null);

      await expect(integrationService.positionEquipment(
        'non-existent',
        { x: 0, y: 0 },
        mockConfig
      )).rejects.toThrow(IntegrationError);
    });

    it('should create coverage zone', async () => {
      prismaMock.equipment.findUnique.mockResolvedValue(mockEquipment as any);

      const position = { x: 200, y: 200 };

      const equipPos = await integrationService.positionEquipment(
        'equip-1',
        position,
        mockConfig
      );

      expect(equipPos.coverageZone).toBeDefined();
      expect(equipPos.coverageZone?.type).toBe('CIRCLE');
      expect(equipPos.coverageZone?.points).toContainEqual(position);
    });
  });

  describe('createOverlay', () => {
    it('should create annotation overlay', async () => {
      const style = {
        color: '#000000',
        opacity: 1,
        lineWidth: 2
      };

      const overlay = await integrationService.createOverlay(
        'anno-1',
        AnnotationType.TEXT,
        style
      );

      expect(overlay.id).toBeDefined();
      expect(overlay.annotationId).toBe('anno-1');
      expect(overlay.type).toBe(AnnotationType.TEXT);
      expect(overlay.style).toEqual(style);
    });

    it('should initialize overlay with default properties', async () => {
      const overlay = await integrationService.createOverlay(
        'anno-1',
        AnnotationType.TEXT,
        { color: '#000000', opacity: 1 }
      );

      expect(overlay.visible).toBe(true);
      expect(overlay.interactive).toBe(true);
      expect(overlay.markers).toHaveLength(0);
    });
  });

  describe('makeInteractive', () => {
    it('should make element interactive', async () => {
      // First create an element to make interactive
      const placement = await integrationService.placeReading(
        'reading-1',
        { x: 100, y: 100 },
        mockConfig
      );

      const interactive = integrationService.makeInteractive(
        placement.id,
        OverlayType.READING,
        InteractionMode.SELECT
      );

      expect(interactive.id).toBeDefined();
      expect(interactive.targetId).toBe(placement.id);
      expect(interactive.type).toBe(OverlayType.READING);
      expect(interactive.mode).toBe(InteractionMode.SELECT);
    });

    it('should initialize interaction state', async () => {
      const placement = await integrationService.placeReading(
        'reading-1',
        { x: 100, y: 100 },
        mockConfig
      );

      const interactive = integrationService.makeInteractive(
        placement.id,
        OverlayType.READING,
        InteractionMode.SELECT
      );

      expect(interactive.selected).toBe(false);
      expect(interactive.hovered).toBe(false);
      expect(interactive.dragging).toBe(false);
    });

    it('should reject for non-existent element', () => {
      expect(() => integrationService.makeInteractive(
        'non-existent',
        OverlayType.READING,
        InteractionMode.SELECT
      )).toThrow(IntegrationError);
    });
  });

  describe('updatePositions', () => {
    it('should update element positions', async () => {
      // First create an element to update
      const placement = await integrationService.placeReading(
        'reading-1',
        { x: 100, y: 100 },
        mockConfig
      );

      const newPosition = { x: 200, y: 200 };

      await integrationService.updatePositions({
        type: 'MOVE',
        elements: [{
          id: placement.id,
          type: OverlayType.READING,
          changes: {
            position: newPosition
          }
        }],
        source: 'USER',
        timestamp: new Date()
      });

      const snapshot = integrationService.takeSnapshot();
      const layer = snapshot.layers.find(l => l.type === OverlayType.READING);
      const updated = layer?.elements.readings.find(r => r.id === placement.id);

      expect(updated?.position).toEqual(newPosition);
    });
  });

  describe('takeSnapshot', () => {
    it('should capture current integration state', async () => {
      // Add some elements first
      await integrationService.placeReading(
        'reading-1',
        { x: 100, y: 100 },
        mockConfig
      );

      const snapshot = integrationService.takeSnapshot();

      expect(snapshot.id).toBeDefined();
      expect(snapshot.timestamp).toBeDefined();
      expect(snapshot.space).toBeDefined();
      expect(snapshot.layers).toBeDefined();
      expect(snapshot.selection).toBeDefined();
      expect(snapshot.mode).toBeDefined();
    });
  });

  describe('getStats', () => {
    it('should return integration statistics', async () => {
      // Add some elements first
      await integrationService.placeReading(
        'reading-1',
        { x: 100, y: 100 },
        mockConfig
      );

      const stats = integrationService.getStats();

      expect(stats.elements.total).toBe(1);
      expect(stats.elements.byType[OverlayType.READING]).toBe(1);
      expect(stats.elements.visible).toBe(1);
      expect(stats.interactions).toBeDefined();
      expect(stats.performance).toBeDefined();
    });

    it('should handle empty state', () => {
      const stats = integrationService.getStats();

      expect(stats.elements.total).toBe(0);
      expect(stats.elements.selected).toBe(0);
      expect(stats.elements.visible).toBe(0);
    });
  });
});
