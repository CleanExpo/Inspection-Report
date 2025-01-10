import { maintenanceService, MaintenanceServiceError } from '../../app/services/maintenanceService';
import { prisma } from '../../app/lib/prisma';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import {
  MaintenanceType,
  MaintenancePriority,
  CalibrationStandard,
  MaintenanceSchedule,
  MaintenanceRecord,
  CalibrationRecord
} from '../../app/types/maintenance';
import { EquipmentType, EquipmentStatus } from '../../app/types/equipment';

// Mock Prisma
jest.mock('../../app/lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>()
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('Maintenance Service', () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  const mockEquipment = {
    id: 'equip-1',
    type: EquipmentType.MOISTURE_METER,
    status: EquipmentStatus.ACTIVE
  };

  describe('scheduleMaintenance', () => {
    it('should schedule maintenance for equipment', async () => {
      prismaMock.equipment.findUnique.mockResolvedValue(mockEquipment);
      prismaMock.maintenanceSchedule.create.mockResolvedValue({
        id: 'schedule-1',
        equipmentId: 'equip-1',
        type: MaintenanceType.ROUTINE,
        priority: MaintenancePriority.MEDIUM,
        dueDate: new Date('2024-02-01'),
        estimatedDuration: 60,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await maintenanceService.scheduleMaintenance(
        'equip-1',
        MaintenanceType.ROUTINE,
        new Date('2024-02-01')
      );

      expect(result.id).toBeDefined();
      expect(result.equipmentId).toBe('equip-1');
      expect(result.type).toBe(MaintenanceType.ROUTINE);
      expect(result.status).toBe('PENDING');
    });

    it('should reject scheduling for non-existent equipment', async () => {
      prismaMock.equipment.findUnique.mockResolvedValue(null);

      await expect(maintenanceService.scheduleMaintenance(
        'non-existent',
        MaintenanceType.ROUTINE,
        new Date('2024-02-01')
      )).rejects.toThrow(MaintenanceServiceError);
    });
  });

  const baseMockRecord = {
    equipmentId: 'equip-1',
    type: MaintenanceType.ROUTINE,
    technician: 'tech-1',
    startTime: new Date('2024-01-01T10:00:00Z'),
    endTime: new Date('2024-01-01T11:00:00Z'),
    findings: 'All good',
    actions: 'Regular maintenance performed',
    cost: {
      parts: 100,
      labor: 200,
      other: 50,
      total: 350
    }
  };

  describe('recordMaintenance', () => {
    const mockMaintenanceRecord: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'> = {
      ...baseMockRecord,
    };

    it('should record maintenance', async () => {
      prismaMock.maintenanceRecord.create.mockResolvedValue({
        id: 'record-1',
        ...mockMaintenanceRecord,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await maintenanceService.recordMaintenance(mockMaintenanceRecord);

      expect(result.id).toBeDefined();
      expect(result.equipmentId).toBe('equip-1');
      expect(result.cost.total).toBe(350);
    });

    it('should reject invalid maintenance record', async () => {
      const invalidRecord = {
        ...mockMaintenanceRecord,
        endTime: new Date('2024-01-01T09:00:00Z') // Before start time
      };

      await expect(maintenanceService.recordMaintenance(invalidRecord))
        .rejects
        .toThrow(MaintenanceServiceError);
    });
  });

  describe('recordCalibration', () => {
    const mockCalibrationRecord: Omit<CalibrationRecord, 'id' | 'createdAt' | 'updatedAt'> = {
      ...baseMockRecord,
      type: MaintenanceType.CALIBRATION,
      standard: CalibrationStandard.NIST,
      procedure: 'Standard calibration procedure',
      measurements: [
        {
          type: 'accuracy',
          expected: 50,
          actual: 49.5,
          tolerance: 1,
          unit: '%',
          pass: true
        }
      ],
      environmentalConditions: {
        temperature: 20,
        humidity: 50
      },
      referenceEquipment: [
        {
          id: 'ref-1',
          type: 'Reference Meter',
          serialNumber: 'REF123',
          lastCalibration: new Date('2023-12-01')
        }
      ],
      certificate: {
        number: 'CAL123',
        issueDate: new Date('2024-01-01'),
        expiryDate: new Date('2025-01-01'),
        issuedBy: 'Calibration Lab'
      }
    };

    it('should record calibration', async () => {
      prismaMock.calibrationRecord.create.mockResolvedValue({
        id: 'cal-1',
        ...mockCalibrationRecord,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await maintenanceService.recordCalibration(mockCalibrationRecord);

      expect(result.id).toBeDefined();
      expect(result.standard).toBe(CalibrationStandard.NIST);
      expect(result.measurements).toHaveLength(1);
      expect(result.certificate).toBeDefined();
    });

    it('should reject calibration record without measurements', async () => {
      const invalidRecord = {
        ...mockCalibrationRecord,
        measurements: []
      };

      await expect(maintenanceService.recordCalibration(invalidRecord))
        .rejects
        .toThrow(MaintenanceServiceError);
    });

    it('should reject calibration record without certificate', async () => {
      const invalidRecord = {
        ...mockCalibrationRecord,
        certificate: undefined
      } as unknown as Omit<CalibrationRecord, 'id' | 'createdAt' | 'updatedAt'>;

      await expect(maintenanceService.recordCalibration(invalidRecord))
        .rejects
        .toThrow(MaintenanceServiceError);
    });
  });

  describe('getMaintenanceStats', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');

    it('should return maintenance statistics', async () => {
      prismaMock.maintenanceRecord.findMany.mockResolvedValue([
        {
          id: 'record-1',
          equipmentId: 'equip-1',
          type: MaintenanceType.ROUTINE,
          startTime: new Date('2024-01-15'),
          endTime: new Date('2024-01-15'),
          cost: {
            parts: 100,
            labor: 200,
            other: 50,
            total: 350
          }
        }
      ]);

      const stats = await maintenanceService.getMaintenanceStats(
        'equip-1',
        startDate,
        endDate
      );

      expect(stats.equipmentId).toBe('equip-1');
      expect(stats.period.start).toEqual(startDate);
      expect(stats.period.end).toEqual(endDate);
      expect(stats.totalCost).toBeDefined();
      expect(stats.compliance).toBeDefined();
    });

    it('should handle period with no maintenance records', async () => {
      prismaMock.maintenanceRecord.findMany.mockResolvedValue([]);

      const stats = await maintenanceService.getMaintenanceStats(
        'equip-1',
        startDate,
        endDate
      );

      expect(stats.maintenanceCount).toEqual({});
      expect(stats.totalCost.total).toBe(0);
    });
  });
});
