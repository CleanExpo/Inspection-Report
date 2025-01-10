export enum EquipmentType {
  MOISTURE_METER = 'MOISTURE_METER',
  THERMAL_CAMERA = 'THERMAL_CAMERA',
  AIR_QUALITY_MONITOR = 'AIR_QUALITY_MONITOR',
  HUMIDITY_SENSOR = 'HUMIDITY_SENSOR',
}

export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED',
}

export enum MaintenanceType {
  CALIBRATION = 'CALIBRATION',
  REPAIR = 'REPAIR',
  INSPECTION = 'INSPECTION',
  CLEANING = 'CLEANING',
}

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  model: string;
  serialNumber: string;
  calibrationDue: Date;
  status: EquipmentStatus;
  metadata?: EquipmentMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface EquipmentMetadata {
  manufacturer: string;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  accuracy?: number;
  range?: {
    min: number;
    max: number;
  };
  notes?: string;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  type: MaintenanceType;
  date: Date;
  notes: string;
  performedBy: string;
  cost?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEquipmentInput {
  name: string;
  type: EquipmentType;
  model: string;
  serialNumber: string;
  calibrationDue: Date | string;
  status?: EquipmentStatus;
  metadata?: EquipmentMetadata;
}

export interface UpdateEquipmentInput extends Partial<CreateEquipmentInput> {}

export interface CreateMaintenanceInput {
  type: MaintenanceType;
  date: Date | string;
  notes: string;
  performedBy: string;
  cost?: number;
}

export interface EquipmentFilters {
  type?: EquipmentType;
  status?: EquipmentStatus;
  calibrationDueBefore?: Date;
  search?: string;
}

export interface EquipmentStats {
  total: number;
  byType: {
    [key in EquipmentType]: number;
  };
  byStatus: {
    [key in EquipmentStatus]: number;
  };
  needingCalibration: number;
  maintenanceStats: {
    lastMonth: number;
    totalCost: number;
    averageCost: number;
  };
}

export interface EquipmentWithRelations extends Equipment {
  readings?: Array<{
    id: string;
    timestamp: Date;
    value: number;
  }>;
  maintenanceHistory?: MaintenanceRecord[];
}
