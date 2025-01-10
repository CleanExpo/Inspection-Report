import { EquipmentType } from './equipment';
import { MaterialType } from './moisture';

export enum MaintenanceType {
  ROUTINE = 'ROUTINE',
  REPAIR = 'REPAIR',
  CALIBRATION = 'CALIBRATION',
  INSPECTION = 'INSPECTION',
  UPGRADE = 'UPGRADE'
}

export enum MaintenancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum CalibrationStandard {
  ISO_17025 = 'ISO_17025',
  NIST = 'NIST',
  ASTM = 'ASTM',
  CUSTOM = 'CUSTOM'
}

export interface MaintenanceSchedule {
  id: string;
  equipmentId: string;
  type: MaintenanceType;
  priority: MaintenancePriority;
  dueDate: Date;
  estimatedDuration: number; // Minutes
  assignedTechnician?: string;
  notes?: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  scheduleId?: string;
  type: MaintenanceType;
  technician: string;
  startTime: Date;
  endTime: Date;
  findings: string;
  actions: string;
  parts?: {
    partNumber: string;
    description: string;
    quantity: number;
    cost: number;
  }[];
  cost: {
    parts: number;
    labor: number;
    other: number;
    total: number;
  };
  nextMaintenanceDue?: Date;
  attachments?: {
    type: string;
    url: string;
    description?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CalibrationRecord extends MaintenanceRecord {
  standard: CalibrationStandard;
  procedure: string;
  measurements: {
    type: string;
    expected: number;
    actual: number;
    tolerance: number;
    unit: string;
    pass: boolean;
  }[];
  environmentalConditions: {
    temperature: number;
    humidity: number;
    pressure?: number;
  };
  referenceEquipment: {
    id: string;
    type: string;
    serialNumber: string;
    lastCalibration: Date;
  }[];
  certificate: {
    number: string;
    issueDate: Date;
    expiryDate: Date;
    issuedBy: string;
    url?: string;
  };
}

export interface MaintenanceAlert {
  id: string;
  equipmentId: string;
  type: 'MAINTENANCE_DUE' | 'CALIBRATION_DUE' | 'REPAIR_NEEDED' | 'PERFORMANCE_ISSUE';
  priority: MaintenancePriority;
  message: string;
  dueDate?: Date;
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface MaintenanceResource {
  id: string;
  type: 'TECHNICIAN' | 'TOOL' | 'PART' | 'FACILITY';
  name: string;
  specialization?: string[];
  availability: {
    startTime: Date;
    endTime: Date;
    status: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
  }[];
  certifications?: {
    type: string;
    issueDate: Date;
    expiryDate: Date;
    issuedBy: string;
  }[];
  equipmentTypes?: EquipmentType[];
  materialTypes?: MaterialType[];
}

export interface MaintenanceProcedure {
  id: string;
  equipmentType: EquipmentType;
  type: MaintenanceType;
  title: string;
  description: string;
  estimatedDuration: number;
  requiredResources: {
    type: 'TECHNICIAN' | 'TOOL' | 'PART' | 'FACILITY';
    quantity: number;
    specifications?: Record<string, any>;
  }[];
  steps: {
    order: number;
    title: string;
    description: string;
    duration: number;
    warnings?: string[];
    images?: string[];
  }[];
  safetyRequirements: string[];
  references?: string[];
  version: string;
  lastUpdated: Date;
}

export interface CalibrationProcedure extends MaintenanceProcedure {
  standard: CalibrationStandard;
  measurementPoints: {
    type: string;
    value: number;
    tolerance: number;
    unit: string;
    conditions?: Record<string, any>;
  }[];
  requiredStandards: {
    type: string;
    specifications: Record<string, any>;
    acceptableCertifications: string[];
  }[];
  environmentalRequirements: {
    temperature: { min: number; max: number };
    humidity: { min: number; max: number };
    pressure?: { min: number; max: number };
    lightLevel?: { min: number; max: number };
  };
  uncertaintyBudget: {
    factor: string;
    type: 'A' | 'B';
    distribution: 'NORMAL' | 'RECTANGULAR' | 'TRIANGULAR';
    value: number;
    unit: string;
  }[];
}

export interface MaintenanceScheduleOptions {
  priorityWeights?: {
    equipmentCriticality: number;
    maintenanceType: number;
    lastMaintenance: number;
    performanceMetrics: number;
  };
  workloadBalancing?: boolean;
  geographicOptimization?: boolean;
  skillMatching?: boolean;
}

export interface MaintenanceStats {
  equipmentId: string;
  period: {
    start: Date;
    end: Date;
  };
  maintenanceCount: Record<MaintenanceType, number>;
  totalCost: {
    parts: number;
    labor: number;
    other: number;
    total: number;
  };
  meanTimeBetweenMaintenance: number;
  meanTimeToRepair: number;
  uptime: number;
  compliance: {
    maintenanceSchedule: number;
    calibrationSchedule: number;
  };
  issues: {
    type: string;
    count: number;
    averageResolutionTime: number;
  }[];
}
