import {
  validateRegistration,
  validateStatusUpdate,
  validatePowerStatus,
  validateOperatingParameters,
  createReadingAssociation,
  generateAlerts,
  generateMaintenanceSchedule,
  EquipmentLinkingError
} from '../../app/utils/equipmentLinking';
import {
  Equipment,
  EquipmentType,
  EquipmentStatus,
  PowerSource,
  MaintenanceRecord
} from '../../app/types/equipment';
import { MaterialType } from '../../app/types/moisture';

describe('Equipment Linking Tests', () => {
  describe('validateRegistration', () => {
    it('should validate valid registration data', () => {
      expect(() => validateRegistration({
        serialNumber: 'MM12345678',
        type: EquipmentType.MOISTURE_METER,
        model: 'Pro2000',
        manufacturer: 'TechCorp',
        compatibleMaterials: [MaterialType.DRYWALL, MaterialType.WOOD],
        calibration: {
          date: new Date(),
          calibratedBy: 'John Doe'
        }
      })).not.toThrow();
    });

    it('should reject invalid serial number', () => {
      expect(() => validateRegistration({
        serialNumber: '123', // Too short
        type: EquipmentType.MOISTURE_METER,
        model: 'Pro2000',
        manufacturer: 'TechCorp',
        compatibleMaterials: [MaterialType.DRYWALL],
        calibration: {
          date: new Date(),
          calibratedBy: 'John Doe'
        }
      })).toThrow(EquipmentLinkingError);
    });

    it('should reject invalid equipment type', () => {
      expect(() => validateRegistration({
        serialNumber: 'MM12345678',
        type: 'INVALID_TYPE' as EquipmentType,
        model: 'Pro2000',
        manufacturer: 'TechCorp',
        compatibleMaterials: [MaterialType.DRYWALL],
        calibration: {
          date: new Date(),
          calibratedBy: 'John Doe'
        }
      })).toThrow(EquipmentLinkingError);
    });

    it('should reject future calibration date', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      expect(() => validateRegistration({
        serialNumber: 'MM12345678',
        type: EquipmentType.MOISTURE_METER,
        model: 'Pro2000',
        manufacturer: 'TechCorp',
        compatibleMaterials: [MaterialType.DRYWALL],
        calibration: {
          date: futureDate,
          calibratedBy: 'John Doe'
        }
      })).toThrow(EquipmentLinkingError);
    });
  });

  describe('validateStatusUpdate', () => {
    it('should validate valid status update', () => {
      expect(() => validateStatusUpdate({
        status: EquipmentStatus.ACTIVE,
        powerStatus: {
          level: 80,
          estimatedRuntime: 120
        },
        operatingParameters: {
          temperature: 25,
          humidity: 50
        },
        location: {
          x: 100,
          y: 200,
          floor: 2
        }
      })).not.toThrow();
    });

    it('should reject invalid status', () => {
      expect(() => validateStatusUpdate({
        status: 'INVALID_STATUS' as EquipmentStatus
      })).toThrow(EquipmentLinkingError);
    });

    it('should reject invalid power level', () => {
      expect(() => validateStatusUpdate({
        powerStatus: {
          level: 150 // Over 100%
        }
      })).toThrow(EquipmentLinkingError);
    });

    it('should reject invalid location', () => {
      expect(() => validateStatusUpdate({
        location: {
          x: 100,
          y: 200,
          floor: 2.5 // Must be integer
        }
      })).toThrow(EquipmentLinkingError);
    });
  });

  describe('createReadingAssociation', () => {
    const mockEquipment: Equipment = {
      id: 'equip-1',
      serialNumber: 'MM12345678',
      type: EquipmentType.MOISTURE_METER,
      model: 'Pro2000',
      manufacturer: 'TechCorp',
      compatibleMaterials: [MaterialType.DRYWALL],
      status: EquipmentStatus.ACTIVE,
      powerStatus: {
        source: PowerSource.BATTERY,
        level: 80,
        estimatedRuntime: 120
      },
      operatingParameters: {
        temperature: 25,
        humidity: 50
      },
      calibration: {
        lastCalibration: new Date(),
        nextCalibration: new Date(),
        calibratedBy: 'John Doe'
      },
      maintenanceHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should create association with high confidence for optimal conditions', () => {
      const association = createReadingAssociation('reading-1', mockEquipment, {
        temperature: 20,
        humidity: 50
      });

      expect(association.confidence).toBeGreaterThanOrEqual(0.8);
      expect(association.readingId).toBe('reading-1');
      expect(association.equipmentId).toBe('equip-1');
    });

    it('should reduce confidence for suboptimal conditions', () => {
      const association = createReadingAssociation('reading-1', {
        ...mockEquipment,
        powerStatus: {
          ...mockEquipment.powerStatus,
          level: 15 // Low battery
        }
      }, {
        temperature: 40, // High temperature
        humidity: 90 // High humidity
      });

      expect(association.confidence).toBeLessThan(0.8);
    });
  });

  describe('generateAlerts', () => {
    const baseEquipment: Equipment = {
      id: 'equip-1',
      serialNumber: 'MM12345678',
      type: EquipmentType.MOISTURE_METER,
      model: 'Pro2000',
      manufacturer: 'TechCorp',
      compatibleMaterials: [MaterialType.DRYWALL],
      status: EquipmentStatus.ACTIVE,
      powerStatus: {
        source: PowerSource.BATTERY,
        level: 80,
        estimatedRuntime: 120
      },
      operatingParameters: {
        temperature: 25,
        humidity: 50
      },
      calibration: {
        lastCalibration: new Date(),
        nextCalibration: new Date(),
        calibratedBy: 'John Doe'
      },
      maintenanceHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should generate low battery alert', () => {
      const equipment = {
        ...baseEquipment,
        powerStatus: {
          ...baseEquipment.powerStatus,
          level: 15
        }
      };

      const alerts = generateAlerts(equipment);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('LOW_BATTERY');
      expect(alerts[0].severity).toBe('MEDIUM');
    });

    it('should generate calibration due alert', () => {
      const nextCalibration = new Date();
      nextCalibration.setDate(nextCalibration.getDate() + 7); // Due in 7 days

      const equipment = {
        ...baseEquipment,
        calibration: {
          ...baseEquipment.calibration,
          nextCalibration
        }
      };

      const alerts = generateAlerts(equipment);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('CALIBRATION_DUE');
      expect(alerts[0].severity).toBe('HIGH');
    });

    it('should generate multiple alerts for multiple issues', () => {
      const equipment = {
        ...baseEquipment,
        status: EquipmentStatus.ERROR,
        powerStatus: {
          ...baseEquipment.powerStatus,
          level: 5
        }
      };

      const alerts = generateAlerts(equipment);
      expect(alerts).toHaveLength(2);
      expect(alerts.map(a => a.type)).toContain('LOW_BATTERY');
      expect(alerts.map(a => a.type)).toContain('ERROR');
    });
  });

  describe('generateMaintenanceSchedule', () => {
    const mockEquipment: Equipment = {
      id: 'equip-1',
      serialNumber: 'MM12345678',
      type: EquipmentType.MOISTURE_METER,
      model: 'Pro2000',
      manufacturer: 'TechCorp',
      compatibleMaterials: [MaterialType.DRYWALL],
      status: EquipmentStatus.ACTIVE,
      powerStatus: {
        source: PowerSource.BATTERY,
        level: 80,
        estimatedRuntime: 120
      },
      operatingParameters: {
        temperature: 25,
        humidity: 50
      },
      calibration: {
        lastCalibration: new Date(),
        nextCalibration: new Date(),
        calibratedBy: 'John Doe'
      },
      maintenanceHistory: [
        {
          date: new Date(),
          type: 'ROUTINE',
          description: 'Regular checkup',
          technician: 'John Smith'
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should generate schedule with all maintenance types', () => {
      const schedule = generateMaintenanceSchedule(mockEquipment);

      expect(schedule.equipmentId).toBe('equip-1');
      expect(schedule.routineMaintenanceDue).toBeDefined();
      expect(schedule.calibrationDue).toBeDefined();
      expect(schedule.batteryReplacementDue).toBeDefined();
      expect(schedule.notes).toContain('Regular checkup');
    });

    it('should not include battery replacement for AC powered equipment', () => {
      const acEquipment = {
        ...mockEquipment,
        powerStatus: {
          ...mockEquipment.powerStatus,
          source: PowerSource.AC_POWER
        }
      };

      const schedule = generateMaintenanceSchedule(acEquipment);
      expect(schedule.batteryReplacementDue).toBeUndefined();
    });

    it('should include status notes for non-active equipment', () => {
      const errorEquipment = {
        ...mockEquipment,
        status: EquipmentStatus.ERROR,
        operatingParameters: {
          temperature: 35,
          humidity: 90
        }
      };

      const schedule = generateMaintenanceSchedule(errorEquipment);
      expect(schedule.notes).toContain('ERROR');
      expect(schedule.notes).toContain('Temperature concern');
      expect(schedule.notes).toContain('High humidity concern');
    });
  });
});
