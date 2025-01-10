import { 
  MoistureUnit, 
  MoistureReading, 
  ReadingDataPoint,
  MoistureValidationResult 
} from '../types/moisture';

// Constants for validation
const VALID_RANGES: Record<MoistureUnit, { min: number; max: number }> = {
  [MoistureUnit.WME]: { min: 0, max: 100 },
  [MoistureUnit.REL]: { min: 0, max: 100 },
  [MoistureUnit.PCT]: { min: 0, max: 100 }
};

// Location validation constants
const LOCATION_LIMITS = {
  x: { min: 0, max: 1000 }, // Assuming max room width of 1000 units
  y: { min: 0, max: 1000 }, // Assuming max room length of 1000 units
  floor: { min: -5, max: 200 } // Allowing for basements and tall buildings
};

// Validate reading value based on unit
export const validateReadingValue = (
  value: number,
  unit: MoistureUnit
): MoistureValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const range = VALID_RANGES[unit];
  if (value < range.min || value > range.max) {
    errors.push(
      `Value ${value} is outside valid range for ${unit} (${range.min}-${range.max})`
    );
  }

  // Add warnings for values near limits
  if (value === range.max) {
    warnings.push(`Value is at maximum limit for ${unit}`);
  }

  if (value >= range.max * 0.9) {
    warnings.push(`Value is approaching maximum limit for ${unit}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Validate location data
export const validateLocation = (
  locationX: number,
  locationY: number,
  room: string,
  floor: number
): MoistureValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate x coordinate
  if (locationX < LOCATION_LIMITS.x.min || locationX > LOCATION_LIMITS.x.max) {
    errors.push(
      `X coordinate must be between ${LOCATION_LIMITS.x.min} and ${LOCATION_LIMITS.x.max}`
    );
  }

  // Validate y coordinate
  if (locationY < LOCATION_LIMITS.y.min || locationY > LOCATION_LIMITS.y.max) {
    errors.push(
      `Y coordinate must be between ${LOCATION_LIMITS.y.min} and ${LOCATION_LIMITS.y.max}`
    );
  }

  // Validate floor
  if (floor < LOCATION_LIMITS.floor.min || floor > LOCATION_LIMITS.floor.max) {
    errors.push(
      `Floor number must be between ${LOCATION_LIMITS.floor.min} and ${LOCATION_LIMITS.floor.max}`
    );
  }

  if (!room) {
    errors.push('Room identifier is required');
  } else if (room.length > 50) {
    errors.push('Room identifier cannot exceed 50 characters');
  }

  // Add warnings for edge cases
  if (floor === 0) {
    warnings.push('Ground floor detected - ensure correct floor numbering scheme');
  }

  if (floor < 0) {
    warnings.push('Basement level detected - verify negative floor number is intended');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Validate reading data point
export const validateReadingDataPoint = (
  reading: ReadingDataPoint
): MoistureValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate value and unit
  const valueValidation = validateReadingValue(reading.value, reading.unit);
  errors.push(...valueValidation.errors);
  warnings.push(...(valueValidation.warnings || []));

  // Validate timestamp
  const timestamp = new Date(reading.timestamp);
  if (isNaN(timestamp.getTime())) {
    errors.push('Invalid timestamp format');
  }

  // Validate depth if provided
  if (reading.depth !== undefined) {
    if (reading.depth < 0) {
      errors.push('Depth cannot be negative');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Validate complete moisture reading
export const validateMoistureReading = (reading: MoistureReading): MoistureValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate location
  const locationValidation = validateLocation(
    reading.locationX,
    reading.locationY,
    reading.room,
    reading.floor
  );
  errors.push(...locationValidation.errors);
  warnings.push(...(locationValidation.warnings || []));

  // Validate each data point
  reading.dataPoints.forEach((dataPoint, index) => {
    const dataPointValidation = validateReadingDataPoint(dataPoint);
    errors.push(...dataPointValidation.errors.map(error => `Reading ${index + 1}: ${error}`));
    warnings.push(...(dataPointValidation.warnings || []).map(warning => `Reading ${index + 1}: ${warning}`));
  });

  // Validate required fields
  if (!reading.jobId) errors.push('Job ID is required');
  if (reading.dataPoints.length === 0) errors.push('At least one reading is required');

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
