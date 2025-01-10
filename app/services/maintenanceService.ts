import { prisma } from '../lib/prisma';
import {
  MaintenanceType,
  MaintenancePriority,
  CalibrationStandard,
  MaintenanceSchedule,
  MaintenanceRecord,
  CalibrationRecord,
  MaintenanceAlert,
  MaintenanceResource,
  MaintenanceProcedure,
  CalibrationProcedure,
  MaintenanceScheduleOptions,
  MaintenanceStats
} from '../types/maintenance';
import { Equipment, EquipmentType } from '../types/equipment';
import { createHistoryEntry } from '../utils/historyTracking';
import { EntityType, ChangeType } from '../types/history';

export class MaintenanceServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MaintenanceServiceError';
  }
}

export class MaintenanceService {
  /**
   * Schedules maintenance for equipment
   */
  async scheduleMaintenance(
    equipmentId: string,
    type: MaintenanceType,
    dueDate: Date,
    options?: MaintenanceScheduleOptions
  ): Promise<MaintenanceSchedule> {
    try {
      const equipment = await prisma.equipment.findUnique({
        where: { id: equipmentId }
      });

      if (!equipment) {
        throw new MaintenanceServiceError('Equipment not found');
      }

      // Calculate priority based on various factors
      const priority = await this.calculateMaintenancePriority(
        equipment as Equipment,
        type,
        options?.priorityWeights
      );

      // Find suitable technician if skill matching is enabled
      let assignedTechnician: string | undefined;
      if (options?.skillMatching) {
        assignedTechnician = await this.findSuitableTechnician(
          equipment.type as EquipmentType,
          type,
          dueDate
        );
      }

      // Create maintenance schedule
      const schedule = await prisma.maintenanceSchedule.create({
        data: {
          equipmentId,
          type,
          priority,
          dueDate,
          estimatedDuration: await this.estimateMaintenanceDuration(
            equipment.type as EquipmentType,
            type
          ),
          assignedTechnician,
          status: 'PENDING'
        }
      });

      // Create alert for the scheduled maintenance
      await this.createMaintenanceAlert(schedule as MaintenanceSchedule);

      return schedule as MaintenanceSchedule;
    } catch (error) {
      throw new MaintenanceServiceError(`Failed to schedule maintenance: ${error.message}`);
    }
  }

  /**
   * Records completed maintenance
   */
  async recordMaintenance(record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceRecord> {
    try {
      // Validate maintenance record
      this.validateMaintenanceRecord(record);

      // Create maintenance record
      const maintenanceRecord = await prisma.maintenanceRecord.create({
        data: {
          ...record,
          cost: {
            ...record.cost,
            total: this.calculateTotalCost(record.cost)
          }
        }
      });

      // Update equipment status and next maintenance date
      await this.updateEquipmentAfterMaintenance(
        record.equipmentId,
        maintenanceRecord as MaintenanceRecord
      );

      // Update schedule status if this was scheduled maintenance
      if (record.scheduleId) {
        await prisma.maintenanceSchedule.update({
          where: { id: record.scheduleId },
          data: { status: 'COMPLETED' }
        });
      }

      // Create history entry
      await createHistoryEntry(
        record.equipmentId,
        EntityType.EQUIPMENT,
        ChangeType.UPDATE,
        record.technician,
        null,
        { maintenanceRecord: maintenanceRecord.id }
      );

      return maintenanceRecord as MaintenanceRecord;
    } catch (error) {
      throw new MaintenanceServiceError(`Failed to record maintenance: ${error.message}`);
    }
  }

  /**
   * Records calibration
   */
  async recordCalibration(record: Omit<CalibrationRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalibrationRecord> {
    try {
      // Validate calibration record
      this.validateCalibrationRecord(record);

      // Create calibration record
      const calibrationRecord = await prisma.calibrationRecord.create({
        data: {
          ...record,
          type: MaintenanceType.CALIBRATION,
          cost: {
            ...record.cost,
            total: this.calculateTotalCost(record.cost)
          }
        }
      });

      // Update equipment calibration status
      await this.updateEquipmentAfterCalibration(
        record.equipmentId,
        calibrationRecord as CalibrationRecord
      );

      // Create history entry
      await createHistoryEntry(
        record.equipmentId,
        EntityType.EQUIPMENT,
        ChangeType.UPDATE,
        record.technician,
        null,
        { calibrationRecord: calibrationRecord.id }
      );

      return calibrationRecord as CalibrationRecord;
    } catch (error) {
      throw new MaintenanceServiceError(`Failed to record calibration: ${error.message}`);
    }
  }

  /**
   * Gets maintenance statistics
   */
  async getMaintenanceStats(
    equipmentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MaintenanceStats> {
    try {
      // Get all maintenance records for the period
      const records = await prisma.maintenanceRecord.findMany({
        where: {
          equipmentId,
          startTime: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      // Calculate statistics
      const stats = this.calculateMaintenanceStats(
        records as MaintenanceRecord[],
        startDate,
        endDate
      );

      return {
        equipmentId,
        period: { start: startDate, end: endDate },
        ...stats
      };
    } catch (error) {
      throw new MaintenanceServiceError(`Failed to get maintenance stats: ${error.message}`);
    }
  }

  // Private helper methods

  private async calculateMaintenancePriority(
    equipment: Equipment,
    type: MaintenanceType,
    weights?: MaintenanceScheduleOptions['priorityWeights']
  ): Promise<MaintenancePriority> {
    // Implementation would calculate priority based on various factors
    return MaintenancePriority.MEDIUM;
  }

  private async findSuitableTechnician(
    equipmentType: EquipmentType,
    maintenanceType: MaintenanceType,
    date: Date
  ): Promise<string | undefined> {
    // Implementation would find available technician with matching skills
    return undefined;
  }

  private async estimateMaintenanceDuration(
    equipmentType: EquipmentType,
    maintenanceType: MaintenanceType
  ): Promise<number> {
    // Implementation would estimate duration based on equipment type and maintenance type
    return 60; // Default 1 hour
  }

  private validateMaintenanceRecord(record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>): void {
    if (!record.equipmentId) {
      throw new MaintenanceServiceError('Equipment ID is required');
    }
    if (!record.technician) {
      throw new MaintenanceServiceError('Technician is required');
    }
    if (!record.startTime || !record.endTime) {
      throw new MaintenanceServiceError('Start and end times are required');
    }
    if (record.endTime <= record.startTime) {
      throw new MaintenanceServiceError('End time must be after start time');
    }
  }

  private validateCalibrationRecord(record: Omit<CalibrationRecord, 'id' | 'createdAt' | 'updatedAt'>): void {
    this.validateMaintenanceRecord(record);
    
    if (!record.standard) {
      throw new MaintenanceServiceError('Calibration standard is required');
    }
    if (!record.measurements?.length) {
      throw new MaintenanceServiceError('Calibration measurements are required');
    }
    if (!record.certificate) {
      throw new MaintenanceServiceError('Calibration certificate is required');
    }
  }

  private calculateTotalCost(cost: MaintenanceRecord['cost']): number {
    return cost.parts + cost.labor + cost.other;
  }

  private async updateEquipmentAfterMaintenance(
    equipmentId: string,
    record: MaintenanceRecord
  ): Promise<void> {
    // Implementation would update equipment status and next maintenance date
  }

  private async updateEquipmentAfterCalibration(
    equipmentId: string,
    record: CalibrationRecord
  ): Promise<void> {
    // Implementation would update equipment calibration status
  }

  private async createMaintenanceAlert(
    schedule: MaintenanceSchedule
  ): Promise<MaintenanceAlert> {
    // Implementation would create alert for scheduled maintenance
    return {} as MaintenanceAlert;
  }

  private calculateMaintenanceStats(
    records: MaintenanceRecord[],
    startDate: Date,
    endDate: Date
  ): Omit<MaintenanceStats, 'equipmentId' | 'period'> {
    // Implementation would calculate maintenance statistics
    return {
      maintenanceCount: {} as Record<MaintenanceType, number>,
      totalCost: {
        parts: 0,
        labor: 0,
        other: 0,
        total: 0
      },
      meanTimeBetweenMaintenance: 0,
      meanTimeToRepair: 0,
      uptime: 0,
      compliance: {
        maintenanceSchedule: 0,
        calibrationSchedule: 0
      },
      issues: []
    };
  }
}

export const maintenanceService = new MaintenanceService();
