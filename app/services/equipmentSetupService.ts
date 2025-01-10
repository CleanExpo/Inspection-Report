import { prisma } from '../lib/prisma';
import {
  Equipment,
  EquipmentType,
  EquipmentStatus,
  PowerSource,
  PowerStatus,
  OperatingParameters,
  MaintenanceRecord,
  MaintenanceSchedule,
  EquipmentAlert
} from '../types/equipment';
import { MaterialType } from '../types/moisture';
import { createHistoryEntry, createVersionInfo } from '../utils/historyTracking';
import { EntityType, ChangeType } from '../types/history';

export class EquipmentSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EquipmentSetupError';
  }
}

interface EquipmentModel {
  id: string;
  type: EquipmentType;
  name: string;
  manufacturer: string;
  specifications: Record<string, any>;
  compatibleMaterials: MaterialType[];
  powerRequirements: {
    source: PowerSource[];
    voltage?: number;
    current?: number;
  };
  dimensions: {
    width: number;
    height: number;
    depth: number;
    weight: number;
  };
  operatingConditions: {
    temperature: { min: number; max: number };
    humidity: { min: number; max: number };
    pressure?: { min: number; max: number };
  };
  calibrationInterval: number; // Days
  maintenanceInterval: number; // Days
  documentation: {
    manual?: string;
    specifications?: string;
    calibration?: string;
  };
}

interface Zone {
  id: string;
  name: string;
  floor: number;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export class EquipmentSetupService {
  /**
   * Registers a new equipment model
   */
  async registerModel(model: Omit<EquipmentModel, 'id'>): Promise<EquipmentModel> {
    try {
      // Validate model specifications
      this.validateModelSpecifications(model);

      const newModel = await prisma.equipmentModel.create({
        data: {
          type: model.type,
          name: model.name,
          manufacturer: model.manufacturer,
          specifications: model.specifications,
          compatibleMaterials: model.compatibleMaterials,
          powerRequirements: model.powerRequirements,
          dimensions: model.dimensions,
          operatingConditions: model.operatingConditions,
          calibrationInterval: model.calibrationInterval,
          maintenanceInterval: model.maintenanceInterval,
          documentation: model.documentation
        }
      });

      return newModel as EquipmentModel;
    } catch (error) {
      throw new EquipmentSetupError(`Failed to register model: ${error.message}`);
    }
  }

  /**
   * Updates equipment position
   */
  async updatePosition(
    equipmentId: string,
    position: { x: number; y: number; floor: number },
    userId: string
  ): Promise<Equipment> {
    try {
      const equipment = await prisma.equipment.findUnique({
        where: { id: equipmentId }
      });

      if (!equipment) {
        throw new EquipmentSetupError('Equipment not found');
      }

      // Create history entry
      await createHistoryEntry(
        equipmentId,
        EntityType.EQUIPMENT,
        ChangeType.UPDATE,
        userId,
        { location: equipment.location },
        { location: position }
      );

      // Update equipment position
      const updated = await prisma.equipment.update({
        where: { id: equipmentId },
        data: {
          location: position
        }
      });

      // Log movement in history
      await this.logMovement(equipmentId, position);

      return updated as Equipment;
    } catch (error) {
      throw new EquipmentSetupError(`Failed to update position: ${error.message}`);
    }
  }

  /**
   * Updates equipment status
   */
  async updateStatus(
    equipmentId: string,
    status: EquipmentStatus,
    operatingParameters: OperatingParameters,
    userId: string
  ): Promise<Equipment> {
    try {
      const equipment = await prisma.equipment.findUnique({
        where: { id: equipmentId }
      });

      if (!equipment) {
        throw new EquipmentSetupError('Equipment not found');
      }

      // Validate operating parameters
      this.validateOperatingParameters(operatingParameters, equipment.type);

      // Create history entry
      await createHistoryEntry(
        equipmentId,
        EntityType.EQUIPMENT,
        ChangeType.UPDATE,
        userId,
        {
          status: equipment.status,
          operatingParameters: equipment.operatingParameters
        },
        {
          status,
          operatingParameters
        }
      );

      // Update equipment status
      const updated = await prisma.equipment.update({
        where: { id: equipmentId },
        data: {
          status,
          operatingParameters
        }
      });

      // Generate alerts if needed
      await this.checkAndGenerateAlerts(updated as Equipment);

      return updated as Equipment;
    } catch (error) {
      throw new EquipmentSetupError(`Failed to update status: ${error.message}`);
    }
  }

  /**
   * Updates power status
   */
  async updatePowerStatus(
    equipmentId: string,
    powerStatus: PowerStatus,
    userId: string
  ): Promise<Equipment> {
    try {
      const equipment = await prisma.equipment.findUnique({
        where: { id: equipmentId }
      });

      if (!equipment) {
        throw new EquipmentSetupError('Equipment not found');
      }

      // Validate power status
      this.validatePowerStatus(powerStatus, equipment.type);

      // Create history entry
      await createHistoryEntry(
        equipmentId,
        EntityType.EQUIPMENT,
        ChangeType.UPDATE,
        userId,
        { powerStatus: equipment.powerStatus },
        { powerStatus }
      );

      // Update power status
      const updated = await prisma.equipment.update({
        where: { id: equipmentId },
        data: {
          powerStatus
        }
      });

      // Update charging schedule if needed
      if (powerStatus.source === PowerSource.BATTERY) {
        await this.updateChargingSchedule(equipmentId, powerStatus.level);
      }

      return updated as Equipment;
    } catch (error) {
      throw new EquipmentSetupError(`Failed to update power status: ${error.message}`);
    }
  }

  /**
   * Gets equipment coverage map
   */
  async getCoverageMap(floor: number): Promise<{
    equipment: Equipment[];
    zones: Zone[];
    coverage: Record<string, number>;
  }> {
    try {
      // Get all equipment on the floor
      const equipment = await prisma.equipment.findMany({
        where: {
          'location.floor': floor
        }
      });

      // Get all zones on the floor
      const zones = await prisma.zone.findMany({
        where: { floor }
      });

      // Calculate coverage
      const coverage = this.calculateCoverage(equipment as Equipment[], zones as Zone[]);

      return {
        equipment: equipment as Equipment[],
        zones: zones as Zone[],
        coverage
      };
    } catch (error) {
      throw new EquipmentSetupError(`Failed to get coverage map: ${error.message}`);
    }
  }

  // Private helper methods

  private validateModelSpecifications(model: Omit<EquipmentModel, 'id'>): void {
    // Validate compatible materials
    if (!model.compatibleMaterials.length) {
      throw new EquipmentSetupError('At least one compatible material must be specified');
    }

    // Validate power requirements
    if (!model.powerRequirements.source.length) {
      throw new EquipmentSetupError('At least one power source must be specified');
    }

    // Validate intervals
    if (model.calibrationInterval <= 0) {
      throw new EquipmentSetupError('Calibration interval must be positive');
    }
    if (model.maintenanceInterval <= 0) {
      throw new EquipmentSetupError('Maintenance interval must be positive');
    }
  }

  private validateOperatingParameters(
    params: OperatingParameters,
    type: EquipmentType
  ): void {
    // Implementation would validate parameters against equipment type specifications
  }

  private validatePowerStatus(status: PowerStatus, type: EquipmentType): void {
    // Implementation would validate power status against equipment type specifications
  }

  private async logMovement(
    equipmentId: string,
    position: { x: number; y: number; floor: number }
  ): Promise<void> {
    // Implementation would log movement to movement history table
  }

  private async checkAndGenerateAlerts(equipment: Equipment): Promise<void> {
    // Implementation would check conditions and generate alerts if needed
  }

  private async updateChargingSchedule(
    equipmentId: string,
    batteryLevel: number
  ): Promise<void> {
    // Implementation would update charging schedule based on battery level
  }

  private calculateCoverage(
    equipment: Equipment[],
    zones: Zone[]
  ): Record<string, number> {
    // Implementation would calculate coverage percentage for each zone
    return {};
  }
}

export const equipmentSetupService = new EquipmentSetupService();
