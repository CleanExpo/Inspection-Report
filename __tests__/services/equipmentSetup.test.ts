import { equipmentSetupService, EquipmentSetupError } from '../../app/services/equipmentSetupService';
import { prisma } from '../../app/lib/prisma';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import {
  EquipmentType,
  EquipmentStatus,
  PowerSource,
  PowerStatus,
  OperatingParameters
} from '../../app/types/equipment';
import { MaterialType } from '../../app/types/moisture';

// Mock Prisma
jest.mock('../../app/lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>()
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('Equipment Setup Service', () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  const mockModel = {
    type: EquipmentType.MOISTURE_METER,
    name: 'Pro2000',
    manufacturer: 'TechCorp',
    specifications: {
      accuracy: '±2%',
      range: '0-100%'
    },
    compatibleMaterials: [MaterialType.DRYWALL, MaterialType.WOOD],
    powerRequirements: {
      source: [PowerSource.BATTERY, PowerSource.AC_POWER],
      voltage: 12,
      current: 2
    },
    dimensions: {
      width: 10,
      height: 20,
      depth: 5,
      weight: 0.5
    },
    operatingConditions: {
      temperature: { min: 0, max: 50 },
      humidity: { min: 0, max: 90 }
    },
    calibrationInterval: 180,
    maintenanceInterval: 90,
    documentation: {
      manual: 'https://example.com/manual',
      specifications: 'https://example.com/specs'
    }
  };

  const mockEquipment = {
    id: 'equip-1',
    serialNumber: 'MM12345678',
    type: EquipmentType.MOISTURE_METER,
    status: EquipmentStatus.ACTIVE,
    location: { x: 100, y: 200, floor: 1 },
    powerStatus: {
      source: PowerSource.BATTERY,
      level: 80,
      estimatedRuntime: 120
    },
    operatingParameters: {
      temperature: 25,
      humidity: 50
    }
  };

  describe('registerModel', () => {
    it('should register a valid equipment model', async () => {
      prismaMock.equipmentModel.create.mockResolvedValue({
        id: 'model-1',
        ...mockModel
      });

      const result = await equipmentSetupService.registerModel(mockModel);

      expect(result.id).toBeDefined();
      expect(result.type).toBe(mockModel.type);
      expect(result.compatibleMaterials).toEqual(mockModel.compatibleMaterials);
      expect(prismaMock.equipmentModel.create).toHaveBeenCalledWith({
        data: expect.objectContaining(mockModel)
      });
    });

    it('should reject model without compatible materials', async () => {
      const invalidModel = {
        ...mockModel,
        compatibleMaterials: []
      };

      await expect(equipmentSetupService.registerModel(invalidModel))
        .rejects
        .toThrow(EquipmentSetupError);
    });

    it('should reject model without power sources', async () => {
      const invalidModel = {
        ...mockModel,
        powerRequirements: {
          ...mockModel.powerRequirements,
          source: []
        }
      };

      await expect(equipmentSetupService.registerModel(invalidModel))
        .rejects
        .toThrow(EquipmentSetupError);
    });
  });

  describe('updatePosition', () => {
    it('should update equipment position', async () => {
      prismaMock.equipment.findUnique.mockResolvedValue(mockEquipment);
      prismaMock.equipment.update.mockResolvedValue({
        ...mockEquipment,
        location: { x: 150, y: 250, floor: 1 }
      });

      const result = await equipmentSetupService.updatePosition(
        'equip-1',
        { x: 150, y: 250, floor: 1 },
        'user-1'
      );

      expect(result.location).toEqual({ x: 150, y: 250, floor: 1 });
      expect(prismaMock.equipment.update).toHaveBeenCalledWith({
        where: { id: 'equip-1' },
        data: expect.objectContaining({
          location: { x: 150, y: 250, floor: 1 }
        })
      });
    });

    it('should reject update for non-existent equipment', async () => {
      prismaMock.equipment.findUnique.mockResolvedValue(null);

      await expect(equipmentSetupService.updatePosition(
        'non-existent',
        { x: 150, y: 250, floor: 1 },
        'user-1'
      )).rejects.toThrow(EquipmentSetupError);
    });
  });

  describe('updateStatus', () => {
    it('should update equipment status', async () => {
      prismaMock.equipment.findUnique.mockResolvedValue(mockEquipment);
      prismaMock.equipment.update.mockResolvedValue({
        ...mockEquipment,
        status: EquipmentStatus.MAINTENANCE,
        operatingParameters: {
          temperature: 30,
          humidity: 60
        }
      });

      const result = await equipmentSetupService.updateStatus(
        'equip-1',
        EquipmentStatus.MAINTENANCE,
        {
          temperature: 30,
          humidity: 60
        },
        'user-1'
      );

      expect(result.status).toBe(EquipmentStatus.MAINTENANCE);
      expect(result.operatingParameters).toEqual({
        temperature: 30,
        humidity: 60
      });
    });

    it('should reject update for non-existent equipment', async () => {
      prismaMock.equipment.findUnique.mockResolvedValue(null);

      await expect(equipmentSetupService.updateStatus(
        'non-existent',
        EquipmentStatus.MAINTENANCE,
        {
          temperature: 30,
          humidity: 60
        },
        'user-1'
      )).rejects.toThrow(EquipmentSetupError);
    });
  });

  describe('updatePowerStatus', () => {
    it('should update power status', async () => {
      prismaMock.equipment.findUnique.mockResolvedValue(mockEquipment);
      prismaMock.equipment.update.mockResolvedValue({
        ...mockEquipment,
        powerStatus: {
          source: PowerSource.BATTERY,
          level: 20,
          estimatedRuntime: 30
        }
      });

      const result = await equipmentSetupService.updatePowerStatus(
        'equip-1',
        {
          source: PowerSource.BATTERY,
          level: 20,
          estimatedRuntime: 30
        },
        'user-1'
      );

      expect(result.powerStatus).toEqual({
        source: PowerSource.BATTERY,
        level: 20,
        estimatedRuntime: 30
      });
    });

    it('should reject update for non-existent equipment', async () => {
      prismaMock.equipment.findUnique.mockResolvedValue(null);

      await expect(equipmentSetupService.updatePowerStatus(
        'non-existent',
        {
          source: PowerSource.BATTERY,
          level: 20,
          estimatedRuntime: 30
        },
        'user-1'
      )).rejects.toThrow(EquipmentSetupError);
    });
  });

  describe('getCoverageMap', () => {
    it('should return coverage map for floor', async () => {
      prismaMock.equipment.findMany.mockResolvedValue([mockEquipment]);
      prismaMock.zone.findMany.mockResolvedValue([{
        id: 'zone-1',
        name: 'Zone 1',
        floor: 1,
        bounds: {
          minX: 0,
          maxX: 1000,
          minY: 0,
          maxY: 1000
        }
      }]);

      const result = await equipmentSetupService.getCoverageMap(1);

      expect(result.equipment).toHaveLength(1);
      expect(result.zones).toHaveLength(1);
      expect(result.coverage).toBeDefined();
    });

    it('should handle floor with no equipment', async () => {
      prismaMock.equipment.findMany.mockResolvedValue([]);
      prismaMock.zone.findMany.mockResolvedValue([]);

      const result = await equipmentSetupService.getCoverageMap(2);

      expect(result.equipment).toHaveLength(0);
      expect(result.zones).toHaveLength(0);
      expect(result.coverage).toEqual({});
    });
  });
});
