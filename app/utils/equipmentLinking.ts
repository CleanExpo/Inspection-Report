import {
  Equipment,
  EquipmentType,
  EquipmentStatus,
  PowerStatus,
  OperatingParameters,
  EquipmentRegistration,
  EquipmentUpdate,
  ReadingAssociation,
  EquipmentAlert,
  MaintenanceSchedule
} from '../types/equipment';
import { MaterialType } from '../types/moisture';

export class EquipmentLinkingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EquipmentLinkingError';
  }
}

/**
 * Validates equipment registration data
 */
export function validateRegistration(registration: EquipmentRegistration): void {
  // Validate serial number format
  if (!/^[A-Z0-9]{8,}$/.test(registration.serialNumber)) {
    throw new EquipmentLinkingError('Invalid serial number format');
  }

  // Validate equipment type
  if (!Object.values(EquipmentType).includes(registration.type)) {
    throw new EquipmentLinkingError('Invalid equipment type');
  }

  // Validate compatible materials
  for (const material of registration.compatibleMaterials) {
    if (!Object.values(MaterialType).includes(material)) {
      throw new EquipmentLinkingError(`Invalid material type: ${material}`);
    }
  }

  // Validate calibration date
  const calibrationDate = new Date(registration.calibration.date);
  if (isNaN(calibrationDate.getTime())) {
    throw new EquipmentLinkingError('Invalid calibration date');
  }

  if (calibrationDate > new Date()) {
    throw new EquipmentLinkingError('Calibration date cannot be in the future');
  }
}

/**
 * Validates equipment status update
 */
export function validateStatusUpdate(update: EquipmentUpdate): void {
  if (update.status && !Object.values(EquipmentStatus).includes(update.status)) {
    throw new EquipmentLinkingError('Invalid equipment status');
  }

  if (update.powerStatus) {
    validatePowerStatus(update.powerStatus);
  }

  if (update.operatingParameters) {
    validateOperatingParameters(update.operatingParameters);
  }

  if (update.location) {
    if (typeof update.location.x !== 'number' || typeof update.location.y !== 'number') {
      throw new EquipmentLinkingError('Invalid location coordinates');
    }
    if (update.location.floor !== undefined && !Number.isInteger(update.location.floor)) {
      throw new EquipmentLinkingError('Floor must be an integer');
    }
  }
}

/**
 * Validates power status
 */
export function validatePowerStatus(status: Partial<PowerStatus>): void {
  if (status.level !== undefined) {
    if (status.level < 0 || status.level > 100) {
      throw new EquipmentLinkingError('Power level must be between 0 and 100');
    }
  }

  if (status.estimatedRuntime !== undefined && status.estimatedRuntime < 0) {
    throw new EquipmentLinkingError('Estimated runtime cannot be negative');
  }
}

/**
 * Validates operating parameters
 */
export function validateOperatingParameters(params: Partial<OperatingParameters>): void {
  if (params.temperature !== undefined && (params.temperature < -50 || params.temperature > 100)) {
    throw new EquipmentLinkingError('Temperature out of valid range (-50°C to 100°C)');
  }

  if (params.humidity !== undefined && (params.humidity < 0 || params.humidity > 100)) {
    throw new EquipmentLinkingError('Humidity must be between 0 and 100');
  }

  if (params.pressure !== undefined && params.pressure < 0) {
    throw new EquipmentLinkingError('Pressure cannot be negative');
  }

  if (params.lightLevel !== undefined && params.lightLevel < 0) {
    throw new EquipmentLinkingError('Light level cannot be negative');
  }
}

/**
 * Creates a reading association
 */
export function createReadingAssociation(
  readingId: string,
  equipment: Equipment,
  environmentalConditions: OperatingParameters
): ReadingAssociation {
  // Calculate calibration age in days
  const calibrationAge = Math.floor(
    (new Date().getTime() - equipment.calibration.lastCalibration.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate confidence based on various factors
  let confidence = 1.0;

  // Reduce confidence based on calibration age
  if (calibrationAge > 180) { // More than 6 months
    confidence *= 0.8;
  }

  // Reduce confidence based on power status
  if (equipment.powerStatus.level < 20) { // Low battery
    confidence *= 0.9;
  }

  // Reduce confidence based on environmental conditions
  if (environmentalConditions.humidity > 85) {
    confidence *= 0.9;
  }
  if (environmentalConditions.temperature > 35 || environmentalConditions.temperature < 5) {
    confidence *= 0.9;
  }

  return {
    readingId,
    equipmentId: equipment.id,
    confidence,
    environmentalConditions,
    powerStatus: equipment.powerStatus,
    calibrationAge
  };
}

/**
 * Generates equipment alerts based on current status
 */
export function generateAlerts(equipment: Equipment): EquipmentAlert[] {
  const alerts: EquipmentAlert[] = [];
  const now = new Date();

  // Check battery level
  if (equipment.powerStatus.source === 'BATTERY' && equipment.powerStatus.level < 20) {
    alerts.push({
      id: `${equipment.id}-battery-${now.getTime()}`,
      equipmentId: equipment.id,
      type: 'LOW_BATTERY',
      severity: equipment.powerStatus.level < 10 ? 'HIGH' : 'MEDIUM',
      message: `Low battery (${equipment.powerStatus.level}%)`,
      timestamp: now,
      acknowledged: false
    });
  }

  // Check calibration due date
  const daysUntilCalibration = Math.floor(
    (equipment.calibration.nextCalibration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysUntilCalibration <= 30) {
    alerts.push({
      id: `${equipment.id}-calibration-${now.getTime()}`,
      equipmentId: equipment.id,
      type: 'CALIBRATION_DUE',
      severity: daysUntilCalibration <= 7 ? 'HIGH' : 'MEDIUM',
      message: `Calibration due in ${daysUntilCalibration} days`,
      timestamp: now,
      acknowledged: false
    });
  }

  // Check equipment status
  if (equipment.status === 'ERROR') {
    alerts.push({
      id: `${equipment.id}-error-${now.getTime()}`,
      equipmentId: equipment.id,
      type: 'ERROR',
      severity: 'HIGH',
      message: 'Equipment reporting error status',
      timestamp: now,
      acknowledged: false
    });
  } else if (equipment.status === 'OFFLINE') {
    alerts.push({
      id: `${equipment.id}-offline-${now.getTime()}`,
      equipmentId: equipment.id,
      type: 'OFFLINE',
      severity: 'HIGH',
      message: 'Equipment is offline',
      timestamp: now,
      acknowledged: false
    });
  }

  return alerts;
}

/**
 * Generates maintenance schedule based on equipment type and usage
 */
export function generateMaintenanceSchedule(equipment: Equipment): MaintenanceSchedule {
  const now = new Date();
  
  // Calculate routine maintenance due date (every 3 months)
  const routineMaintenanceDue = new Date(now);
  routineMaintenanceDue.setMonth(routineMaintenanceDue.getMonth() + 3);

  // Calculate calibration due date (every year)
  const calibrationDue = new Date(equipment.calibration.lastCalibration);
  calibrationDue.setFullYear(calibrationDue.getFullYear() + 1);

  // Calculate battery replacement due date for battery-powered equipment
  let batteryReplacementDue: Date | undefined;
  if (equipment.powerStatus.source === 'BATTERY') {
    batteryReplacementDue = new Date(now);
    batteryReplacementDue.setMonth(batteryReplacementDue.getMonth() + 6);
  }

  return {
    equipmentId: equipment.id,
    routineMaintenanceDue,
    calibrationDue,
    batteryReplacementDue,
    notes: generateMaintenanceNotes(equipment)
  };
}

/**
 * Generates maintenance notes based on equipment history and status
 */
function generateMaintenanceNotes(equipment: Equipment): string {
  const notes: string[] = [];

  // Add notes about recent maintenance
  const recentMaintenance = equipment.maintenanceHistory
    .slice(-3)
    .map(record => `${record.date.toISOString().split('T')[0]}: ${record.type} - ${record.description}`)
    .join('\n');
  if (recentMaintenance) {
    notes.push('Recent maintenance:', recentMaintenance);
  }

  // Add notes about current status
  if (equipment.status !== 'ACTIVE' && equipment.status !== 'IDLE') {
    notes.push(`Current status: ${equipment.status}`);
  }

  // Add notes about operating conditions
  const params = equipment.operatingParameters;
  if (params.temperature > 30 || params.temperature < 10) {
    notes.push(`Temperature concern: ${params.temperature}°C`);
  }
  if (params.humidity > 80) {
    notes.push(`High humidity concern: ${params.humidity}%`);
  }

  return notes.join('\n');
}
