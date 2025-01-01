// Prisma schema enums
export enum JobStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum JobPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum JobCategory {
  WATER_DAMAGE = 'WATER_DAMAGE',
  FLOOD = 'FLOOD',
  LEAK = 'LEAK',
  STORM_DAMAGE = 'STORM_DAMAGE',
  OTHER = 'OTHER'
}

export enum ReadingConfidence {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  UNCERTAIN = 'UNCERTAIN'
}

export enum EquipmentType {
  DEHUMIDIFIER = 'DEHUMIDIFIER',
  FAN = 'FAN',
  AIR_MOVER = 'AIR_MOVER',
  HEATER = 'HEATER'
}

export enum EquipmentOperationalStatus {
  OPERATIONAL = 'OPERATIONAL',
  MAINTENANCE_NEEDED = 'MAINTENANCE_NEEDED',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

export enum MaintenanceType {
  ROUTINE = 'ROUTINE',
  REPAIR = 'REPAIR',
  CALIBRATION = 'CALIBRATION'
}

// Base types matching Prisma schema
export interface Job {
  id: string;
  jobNumber: string;
  clientName: string;
  jobAddress: string;
  status: JobStatus;
  priority: JobPriority;
  category: JobCategory;
  totalEquipmentPower: number;
  notes?: string | null;
  moistureData?: MoistureData | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MoistureData {
  id: string;
  jobId: string;
  job: Job;
  floorPlan?: string | null;
  readings: MoistureReading[];
  equipment: Equipment[];
  annotations: Annotation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MoistureReading {
  id: string;
  moistureDataId: string;
  moistureData?: MoistureData;
  value: number;
  locationX: number;
  locationY: number;
  locationHeight?: number | null;
  locationDescription?: string | null;
  material: string;
  timestamp: Date;
  inspectionDay: number;
  confidence: ReadingConfidence;
  temperature: number;
  humidity: number;
  surfaceType?: string | null;
  pressure: number;
  equipmentUsed?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Equipment {
  id: string;
  moistureDataId: string;
  type: EquipmentType;
  model: string;
  serialNumber: string;
  positionX: number;
  positionY: number;
  rotation: number;
  operationalStatus: EquipmentOperationalStatus;
  power: number;
  mode: string;
  targetHumidity?: number | null;
  fanSpeed?: number | null;
  temperature?: number | null;
  currentPower: number;
  dailyPowerUsage: number;
  powerReadings: PowerReading[];
  maintenanceHistory: MaintenanceRecord[];
  lastCalibration?: Date | null;
  nextMaintenanceDue: Date;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PowerReading {
  id: string;
  equipmentId: string;
  equipment: Equipment;
  timestamp: Date;
  value: number;
  createdAt: Date;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  equipment: Equipment;
  type: MaintenanceType;
  description: string;
  technician: string;
  performedAt: Date;
  nextDueDate?: Date | null;
  createdAt: Date;
}

export interface Annotation {
  id: string;
  moistureDataId: string;
  moistureData: MoistureData;
  type: string;
  content: string;
  positionX: number;
  positionY: number;
  color?: string | null;
  size?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// Frontend helper types and mapping utilities
export interface ReadingLocation {
  x: number;
  y: number;
  description?: string;
  height?: number;
}

export interface ReadingConditions {
  temperature: number;
  humidity: number;
  surfaceType?: string;
  pressure: number;
}

export interface MoistureReadingWithGroups extends Omit<MoistureReading, 
  'locationX' | 'locationY' | 'locationHeight' | 'locationDescription' | 
  'temperature' | 'humidity' | 'surfaceType' | 'pressure'> {
  location: ReadingLocation;
  conditions: ReadingConditions;
}

export interface EquipmentWithGroups extends Omit<Equipment,
  'positionX' | 'positionY' | 'power' | 'mode' | 'targetHumidity' | 
  'fanSpeed' | 'temperature' | 'currentPower' | 'dailyPowerUsage'> {
  position: {
    x: number;
    y: number;
  };
  settings: {
    power: number;
    mode: string;
    targetHumidity?: number;
    fanSpeed?: number;
    temperature?: number;
  };
  powerConsumption: {
    current: number;
    daily: number;
    hourlyReadings: PowerReading[];
  };
}

export interface AnnotationWithStyle extends Omit<Annotation,
  'positionX' | 'positionY' | 'color' | 'size'> {
  position: {
    x: number;
    y: number;
  };
  style?: {
    color: string;
    size: number;
  };
}

// Mapping utilities
export function toMoistureReadingWithGroups(reading: MoistureReading): MoistureReadingWithGroups {
  return {
    ...reading,
    location: {
      x: reading.locationX,
      y: reading.locationY,
      description: reading.locationDescription ?? undefined,
      height: reading.locationHeight ?? undefined
    },
    conditions: {
      temperature: reading.temperature,
      humidity: reading.humidity,
      surfaceType: reading.surfaceType ?? undefined,
      pressure: reading.pressure
    }
  };
}

export function fromMoistureReadingWithGroups(reading: MoistureReadingWithGroups): Omit<MoistureReading, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    moistureDataId: reading.moistureDataId,
    value: reading.value,
    locationX: reading.location.x,
    locationY: reading.location.y,
    locationHeight: reading.location.height ?? null,
    locationDescription: reading.location.description ?? null,
    material: reading.material,
    timestamp: reading.timestamp,
    inspectionDay: reading.inspectionDay,
    confidence: reading.confidence,
    temperature: reading.conditions.temperature,
    humidity: reading.conditions.humidity,
    surfaceType: reading.conditions.surfaceType ?? null,
    pressure: reading.conditions.pressure,
    equipmentUsed: reading.equipmentUsed,
    notes: reading.notes
  };
}

export function toEquipmentWithGroups(equipment: Equipment): EquipmentWithGroups {
  return {
    ...equipment,
    position: {
      x: equipment.positionX,
      y: equipment.positionY
    },
    settings: {
      power: equipment.power,
      mode: equipment.mode,
      targetHumidity: equipment.targetHumidity ?? undefined,
      fanSpeed: equipment.fanSpeed ?? undefined,
      temperature: equipment.temperature ?? undefined
    },
    powerConsumption: {
      current: equipment.currentPower,
      daily: equipment.dailyPowerUsage,
      hourlyReadings: equipment.powerReadings
    }
  };
}

export function fromEquipmentWithGroups(equipment: EquipmentWithGroups): Omit<Equipment, 'id' | 'createdAt' | 'updatedAt' | 'powerReadings' | 'maintenanceHistory'> {
  return {
    moistureDataId: equipment.moistureDataId,
    type: equipment.type,
    model: equipment.model,
    serialNumber: equipment.serialNumber,
    positionX: equipment.position.x,
    positionY: equipment.position.y,
    rotation: equipment.rotation,
    operationalStatus: equipment.operationalStatus,
    power: equipment.settings.power,
    mode: equipment.settings.mode,
    targetHumidity: equipment.settings.targetHumidity ?? null,
    fanSpeed: equipment.settings.fanSpeed ?? null,
    temperature: equipment.settings.temperature ?? null,
    currentPower: equipment.powerConsumption.current,
    dailyPowerUsage: equipment.powerConsumption.daily,
    lastCalibration: equipment.lastCalibration,
    nextMaintenanceDue: equipment.nextMaintenanceDue,
    notes: equipment.notes
  };
}

export function toAnnotationWithStyle(annotation: Annotation): AnnotationWithStyle {
  return {
    ...annotation,
    position: {
      x: annotation.positionX,
      y: annotation.positionY
    },
    style: annotation.color && annotation.size ? {
      color: annotation.color,
      size: annotation.size
    } : undefined
  };
}

export function fromAnnotationWithStyle(annotation: AnnotationWithStyle): Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    moistureDataId: annotation.moistureDataId,
    moistureData: annotation.moistureData,
    type: annotation.type,
    content: annotation.content,
    positionX: annotation.position.x,
    positionY: annotation.position.y,
    color: annotation.style?.color ?? null,
    size: annotation.style?.size ?? null
  };
}

export interface DailyReadings {
  date: string;
  readings: MoistureReading[];
  averageValue: number;
  maxValue: number;
  minValue: number;
  dryLocations: number;
  totalLocations: number;
}

export interface SketchData {
  id: string;
  jobNumber: string;
  floorPlan: string; // Base64 image data
  moistureReadings: MoistureReading[];
  equipment: Equipment[];
  annotations: Annotation[];
  lastUpdated: string;
}

export interface MaterialType {
  id: string;
  name: string;
  dryThreshold: number;
  description: string;
}

export const MATERIAL_TYPES: MaterialType[] = [
  {
    id: 'drywall',
    name: 'Drywall',
    dryThreshold: 16,
    description: 'Gypsum wall board'
  },
  {
    id: 'wood',
    name: 'Wood',
    dryThreshold: 15,
    description: 'Timber and wooden structures'
  },
  {
    id: 'concrete',
    name: 'Concrete',
    dryThreshold: 18,
    description: 'Concrete floors and walls'
  },
  {
    id: 'carpet',
    name: 'Carpet',
    dryThreshold: 10,
    description: 'Carpet and underlay'
  },
  {
    id: 'insulation',
    name: 'Insulation',
    dryThreshold: 12,
    description: 'Wall and ceiling insulation'
  }
];

export interface DryingProgress {
  currentProgress: number;
  estimatedDaysRemaining: number;
  dryLocations: number;
  totalLocations: number;
  trend: 'improving' | 'stable' | 'concerning';
}

export interface MoistureZone {
  id: string;
  level: 'dry' | 'moderate' | 'wet' | 'saturated';
  area: number; // square meters/feet
  readings: MoistureReading[];
}

export const MOISTURE_LEVELS = {
  dry: {
    color: '#4caf50',
    range: [0, 15],
    label: 'Dry'
  },
  moderate: {
    color: '#ff9800',
    range: [16, 25],
    label: 'Moderate'
  },
  wet: {
    color: '#f44336',
    range: [26, 35],
    label: 'Wet'
  },
  saturated: {
    color: '#9c27b0',
    range: [36, 100],
    label: 'Saturated'
  }
} as const;
