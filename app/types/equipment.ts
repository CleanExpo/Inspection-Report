import { MaterialType } from './moisture';

export enum EquipmentType {
  MOISTURE_METER = 'MOISTURE_METER',
  PIN_METER = 'PIN_METER',
  SURFACE_METER = 'SURFACE_METER',
  PROBE_METER = 'PROBE_METER',
  THERMAL_CAMERA = 'THERMAL_CAMERA',
  SENSOR = 'SENSOR'
}

export enum EquipmentStatus {
  ACTIVE = 'ACTIVE',
  IDLE = 'IDLE',
  MAINTENANCE = 'MAINTENANCE',
  ERROR = 'ERROR',
  OFFLINE = 'OFFLINE'
}

export enum PowerSource {
  BATTERY = 'BATTERY',
  AC_POWER = 'AC_POWER',
  SOLAR = 'SOLAR'
}

export interface PowerStatus {
  source: PowerSource;
  level: number; // Battery percentage or power draw in watts
  estimatedRuntime?: number; // Minutes remaining on battery
  charging?: boolean;
}

export interface OperatingParameters {
  temperature: number;
  humidity: number;
  pressure?: number;
  lightLevel?: number;
}

export interface CalibrationInfo {
  lastCalibration: Date;
  nextCalibration: Date;
  calibratedBy: string;
  calibrationCertificate?: string;
}

export interface MaintenanceRecord {
  date: Date;
  type: 'ROUTINE' | 'REPAIR' | 'CALIBRATION';
  description: string;
  technician: string;
  parts?: string[];
}

export interface Equipment {
  id: string;
  serialNumber: string;
  type: EquipmentType;
  model: string;
  manufacturer: string;
  compatibleMaterials: MaterialType[];
  status: EquipmentStatus;
  powerStatus: PowerStatus;
  operatingParameters: OperatingParameters;
  calibration: CalibrationInfo;
  maintenanceHistory: MaintenanceRecord[];
  location?: {
    x: number;
    y: number;
    floor?: number;
  };
  assignedTo?: string; // User ID
  lastReading?: {
    timestamp: Date;
    value: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface EquipmentAlert {
  id: string;
  equipmentId: string;
  type: 'LOW_BATTERY' | 'MAINTENANCE_DUE' | 'CALIBRATION_DUE' | 'ERROR' | 'OFFLINE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface ReadingAssociation {
  readingId: string;
  equipmentId: string;
  confidence: number;
  environmentalConditions: OperatingParameters;
  powerStatus: PowerStatus;
  calibrationAge: number; // Days since last calibration
}

export interface EquipmentRegistration {
  serialNumber: string;
  type: EquipmentType;
  model: string;
  manufacturer: string;
  compatibleMaterials: MaterialType[];
  calibration: {
    date: Date;
    calibratedBy: string;
    certificate?: string;
  };
}

export interface EquipmentUpdate {
  status?: EquipmentStatus;
  powerStatus?: Partial<PowerStatus>;
  operatingParameters?: Partial<OperatingParameters>;
  location?: {
    x: number;
    y: number;
    floor?: number;
  };
  assignedTo?: string;
}

export interface MaintenanceSchedule {
  equipmentId: string;
  routineMaintenanceDue: Date;
  calibrationDue: Date;
  batteryReplacementDue?: Date;
  notes?: string;
}
