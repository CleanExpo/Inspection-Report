import { MaterialType } from '../types/moisture';

export interface CoordinateValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface MetadataValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface EquipmentValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ReadingConfidenceResult {
  confidence: number;
  factors: string[];
}

interface CoordinateBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  gridSize?: number;
}

interface Point {
  x: number;
  y: number;
}

interface EnvironmentalConditions {
  temperature: number;
  humidity: number;
}

interface ReadingConfidenceInput {
  value: number;
  materialType: MaterialType;
  equipmentType: string;
  calibrationAge: number;
  environmentalConditions: EnvironmentalConditions;
}

/**
 * Validates coordinates against bounds and grid alignment
 */
export function validateCoordinates(point: Point, bounds: CoordinateBounds): CoordinateValidationResult {
  const errors: string[] = [];

  // Check bounds
  if (point.x < bounds.minX || point.x > bounds.maxX) {
    errors.push(`x coordinate (${point.x}) is outside valid range (${bounds.minX}-${bounds.maxX})`);
  }
  if (point.y < bounds.minY || point.y > bounds.maxY) {
    errors.push(`y coordinate (${point.y}) is outside valid range (${bounds.minY}-${bounds.maxY})`);
  }

  // Check grid alignment if gridSize is specified
  if (bounds.gridSize) {
    if (point.x % bounds.gridSize !== 0) {
      errors.push(`x coordinate (${point.x}) is not aligned with grid size ${bounds.gridSize}`);
    }
    if (point.y % bounds.gridSize !== 0) {
      errors.push(`y coordinate (${point.y}) is not aligned with grid size ${bounds.gridSize}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates reading metadata
 */
export function validateMetadata(reading: {
  materialType: MaterialType;
  value: number;
  timestamp: string;
}): MetadataValidationResult {
  const errors: string[] = [];

  // Validate material type
  if (!Object.values(MaterialType).includes(reading.materialType)) {
    errors.push(`Invalid material type: ${reading.materialType}`);
  }

  // Validate reading value (0-100 scale)
  if (reading.value < 0 || reading.value > 100) {
    errors.push(`Reading value must be between 0 and 100, got: ${reading.value}`);
  }

  // Validate timestamp
  const timestamp = new Date(reading.timestamp);
  if (isNaN(timestamp.getTime())) {
    errors.push(`Invalid timestamp format: ${reading.timestamp}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates equipment compatibility and calibration
 */
export function validateEquipment(equipment: {
  type: string;
  materialType: MaterialType;
  calibrationDate: string;
}): EquipmentValidationResult {
  const errors: string[] = [];

  // Check equipment type compatibility
  const compatibleEquipment: Record<MaterialType, string[]> = {
    [MaterialType.DRYWALL]: ['MOISTURE_METER', 'THERMAL_CAMERA'],
    [MaterialType.WOOD]: ['MOISTURE_METER', 'PIN_METER'],
    [MaterialType.CONCRETE]: ['MOISTURE_METER', 'SURFACE_METER'],
    [MaterialType.CARPET]: ['MOISTURE_METER', 'PROBE_METER'],
    [MaterialType.OTHER]: ['MOISTURE_METER']
  };

  if (!compatibleEquipment[equipment.materialType]?.includes(equipment.type)) {
    errors.push(`Equipment type ${equipment.type} is not compatible with material ${equipment.materialType}`);
  }

  // Check calibration date
  const calibrationDate = new Date(equipment.calibrationDate);
  if (isNaN(calibrationDate.getTime())) {
    errors.push(`Invalid calibration date: ${equipment.calibrationDate}`);
  } else {
    const calibrationAge = (new Date().getTime() - calibrationDate.getTime()) / (1000 * 60 * 60 * 24);
    if (calibrationAge > 365) { // More than 1 year
      errors.push('Equipment calibration is expired');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculates reading confidence based on various factors
 */
export function validateReadingConfidence(input: ReadingConfidenceInput): ReadingConfidenceResult {
  const factors: string[] = [];
  let confidence = 1.0;

  // Check reading value
  if (input.value > 90) {
    factors.push('extreme reading');
    confidence *= 0.8;
  }

  // Check environmental conditions
  if (input.environmentalConditions.humidity > 85) {
    factors.push('high humidity');
    confidence *= 0.7;
  }
  if (input.environmentalConditions.temperature > 30) {
    factors.push('high temperature');
    confidence *= 0.9;
  }

  // Check calibration age
  if (input.calibrationAge > 180) { // More than 6 months
    factors.push('calibration age');
    confidence *= 0.85;
  }

  // Check equipment type compatibility
  const optimalEquipment: Record<MaterialType, string[]> = {
    [MaterialType.DRYWALL]: ['MOISTURE_METER'],
    [MaterialType.WOOD]: ['PIN_METER'],
    [MaterialType.CONCRETE]: ['SURFACE_METER'],
    [MaterialType.CARPET]: ['PROBE_METER'],
    [MaterialType.OTHER]: ['MOISTURE_METER']
  };

  if (!optimalEquipment[input.materialType]?.includes(input.equipmentType)) {
    factors.push('non-optimal equipment');
    confidence *= 0.75;
  }

  return {
    confidence,
    factors
  };
}
