export type EquipmentType = 'MOISTURE_METER' | 'THERMAL_CAMERA' | 'HYGROMETER';
export type EquipmentStatus = 'ACTIVE' | 'MAINTENANCE' | 'RETIRED';

export interface EquipmentData {
  id?: string;
  serialNumber: string;
  model: string;
  type: string;
  calibrationDate: Date | string;
  nextCalibrationDue: Date | string;
  status: string;
  lastUsed?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface EquipmentValidationError {
  field: string;
  message: string;
}

export function validateSerialNumber(serialNumber: string): boolean {
  // Serial number format: ABC-12345 (3 letters followed by 5 digits)
  const serialNumberRegex = /^[A-Z]{3}-\d{5}$/;
  return serialNumberRegex.test(serialNumber);
}

export function validateEquipmentType(type: string): type is EquipmentType {
  return ['MOISTURE_METER', 'THERMAL_CAMERA', 'HYGROMETER'].includes(type);
}

export function validateEquipmentStatus(status: string): status is EquipmentStatus {
  return ['ACTIVE', 'MAINTENANCE', 'RETIRED'].includes(status);
}

export function validateCalibrationDates(calibrationDate: Date, nextCalibrationDue: Date): boolean {
  const now = new Date();
  return (
    calibrationDate <= now && 
    nextCalibrationDue > now && 
    nextCalibrationDue > calibrationDate
  );
}

export function validateEquipment(equipment: Partial<EquipmentData>): EquipmentValidationError[] {
  const errors: EquipmentValidationError[] = [];

  // Required fields
  if (!equipment.serialNumber) {
    errors.push({ field: 'serialNumber', message: 'Serial number is required' });
  } else if (!validateSerialNumber(equipment.serialNumber)) {
    errors.push({ field: 'serialNumber', message: 'Invalid serial number format. Expected: ABC-12345' });
  }

  if (!equipment.model) {
    errors.push({ field: 'model', message: 'Model is required' });
  }

  if (!equipment.type) {
    errors.push({ field: 'type', message: 'Equipment type is required' });
  } else if (!validateEquipmentType(equipment.type)) {
    errors.push({ field: 'type', message: 'Invalid equipment type' });
  }

  if (!equipment.status) {
    errors.push({ field: 'status', message: 'Equipment status is required' });
  } else if (!validateEquipmentStatus(equipment.status)) {
    errors.push({ field: 'status', message: 'Invalid equipment status' });
  }

  // Calibration dates
  if (!equipment.calibrationDate) {
    errors.push({ field: 'calibrationDate', message: 'Calibration date is required' });
  }

  if (!equipment.nextCalibrationDue) {
    errors.push({ field: 'nextCalibrationDue', message: 'Next calibration due date is required' });
  }

  if (equipment.calibrationDate && equipment.nextCalibrationDue) {
    const calibDate = new Date(equipment.calibrationDate);
    const nextDueDate = new Date(equipment.nextCalibrationDue);
    
    if (!validateCalibrationDates(calibDate, nextDueDate)) {
      errors.push({ 
        field: 'calibrationDates', 
        message: 'Invalid calibration dates. Calibration date must be in the past and next calibration due must be in the future' 
      });
    }
  }

  return errors;
}

export function isEquipmentDueForCalibration(equipment: EquipmentData): boolean {
  const now = new Date();
  const nextCalibrationDue = new Date(equipment.nextCalibrationDue);
  // Equipment is due for calibration if next calibration is within 30 days or overdue
  const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
  return nextCalibrationDue <= thirtyDaysFromNow;
}
