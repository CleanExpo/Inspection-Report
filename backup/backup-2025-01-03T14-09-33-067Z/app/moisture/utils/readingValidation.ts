import { EquipmentType, MoistureUnit } from '@prisma/client';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface ReadingDataPoint {
  value: number;
  unit: MoistureUnit;
  timestamp: string;
  depth?: number;
}

interface ReadingInput {
  jobId: string;
  locationX: number;
  locationY: number;
  room: string;
  floor: number;
  notes?: string;
  dataPoints: ReadingDataPoint[];
  equipmentId: string;
  temperature?: number;
  humidity?: number;
  pressure?: number;
}

// Equipment-specific validation ranges
const EQUIPMENT_RANGES = {
  [EquipmentType.MOISTURE_METER]: {
    WME: { min: 0, max: 100 },
    REL: { min: 0, max: 100 },
    PCT: { min: 0, max: 100 }
  },
  [EquipmentType.THERMAL_CAMERA]: {
    WME: { min: -20, max: 120 },
    REL: { min: 0, max: 100 },
    PCT: { min: 0, max: 100 }
  },
  [EquipmentType.HYGROMETER]: {
    WME: { min: 0, max: 100 },
    REL: { min: 0, max: 100 },
    PCT: { min: 0, max: 100 }
  }
};

// Environmental data validation ranges
const ENVIRONMENTAL_RANGES = {
  temperature: { min: -50, max: 100 }, // Celsius
  humidity: { min: 0, max: 100 }, // Percentage
  pressure: { min: 800, max: 1200 } // hPa
};

export function validateReading(
  reading: ReadingInput,
  equipmentType: EquipmentType
): ValidationResult {
  const errors: string[] = [];

  // Validate job ID
  if (!reading.jobId.match(/^\d{4}-\d{4}-\d{3}$/)) {
    errors.push('Invalid job ID format. Expected: YYYY-MMDD-XXX');
  }

  // Validate location coordinates
  if (reading.locationX < 0 || reading.locationX > 1000) {
    errors.push('X coordinate must be between 0 and 1000');
  }
  if (reading.locationY < 0 || reading.locationY > 1000) {
    errors.push('Y coordinate must be between 0 and 1000');
  }

  // Validate room and floor
  if (!reading.room.trim()) {
    errors.push('Room name is required');
  }
  if (reading.floor < -10 || reading.floor > 200) {
    errors.push('Floor number must be between -10 and 200');
  }

  // Validate data points
  if (!reading.dataPoints.length) {
    errors.push('At least one data point is required');
  }

  // Validate each data point
  reading.dataPoints.forEach((point, index) => {
    // Validate value range based on equipment type and unit
    const range = EQUIPMENT_RANGES[equipmentType][point.unit];
    if (point.value < range.min || point.value > range.max) {
      errors.push(
        `Data point ${index + 1}: Value must be between ${range.min} and ${range.max} for ${point.unit}`
      );
    }

    // Validate timestamp
    if (!isValidTimestamp(point.timestamp)) {
      errors.push(`Data point ${index + 1}: Invalid timestamp`);
    }

    // Validate depth if provided
    if (point.depth !== undefined) {
      if (point.depth < 0 || point.depth > 1000) {
        errors.push(`Data point ${index + 1}: Depth must be between 0 and 1000mm`);
      }
    }
  });

  // Validate timestamp sequence
  if (!areTimestampsSequential(reading.dataPoints)) {
    errors.push('Data points must be in chronological order');
  }

  // Validate environmental data if provided
  if (reading.temperature !== undefined) {
    const { min, max } = ENVIRONMENTAL_RANGES.temperature;
    if (reading.temperature < min || reading.temperature > max) {
      errors.push(`Temperature must be between ${min}°C and ${max}°C`);
    }
  }

  if (reading.humidity !== undefined) {
    const { min, max } = ENVIRONMENTAL_RANGES.humidity;
    if (reading.humidity < min || reading.humidity > max) {
      errors.push(`Humidity must be between ${min}% and ${max}%`);
    }
  }

  if (reading.pressure !== undefined) {
    const { min, max } = ENVIRONMENTAL_RANGES.pressure;
    if (reading.pressure < min || reading.pressure > max) {
      errors.push(`Pressure must be between ${min}hPa and ${max}hPa`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Helper function to validate timestamp format and value
function isValidTimestamp(timestamp: string): boolean {
  const date = new Date(timestamp);
  return date instanceof Date && !isNaN(date.getTime());
}

// Helper function to check if timestamps are in sequential order
function areTimestampsSequential(dataPoints: ReadingDataPoint[]): boolean {
  for (let i = 1; i < dataPoints.length; i++) {
    const prevTime = new Date(dataPoints[i - 1].timestamp).getTime();
    const currTime = new Date(dataPoints[i].timestamp).getTime();
    if (currTime < prevTime) {
      return false;
    }
  }
  return true;
}

// Helper function to validate unit consistency
export function validateUnitConsistency(dataPoints: ReadingDataPoint[]): ValidationResult {
  const errors: string[] = [];
  const units = new Set(dataPoints.map(point => point.unit));

  if (units.size > 1) {
    errors.push('All data points must use the same unit of measurement');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Helper function to validate equipment calibration status
export function validateEquipmentCalibration(
  calibrationDue: Date,
  allowExpired: boolean = false
): ValidationResult {
  const errors: string[] = [];
  const now = new Date();

  if (calibrationDue < now && !allowExpired) {
    errors.push('Equipment calibration is overdue');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
