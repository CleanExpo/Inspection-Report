export interface MoistureReading {
  id: string;
  value: number;
  location: string;
  materialType: string;
  timestamp: string;
  device: {
    id: string;
    name: string;
    model: string;
  };
  readingType: {
    id: string;
    name: string;
    unit: string;
  };
  readingMethod: {
    id: string;
    name: string;
  };
  inspectionDay: number;
  notes?: string;
}

export interface DryingProgress {
  date: string;
  averageReading: number;
  highestReading: number;
  lowestReading: number;
  dryLocationsCount: number;
  warningLocations: number;
  criticalLocations: number;
  totalLocations: number;
  readingsCount: number;
}

export interface MoistureGuidelines {
  dryStandard: number;
  warningThreshold: number;
  criticalThreshold: number;
  description: string;
  remediation: string;
}

// Constants
export const MOISTURE_DEVICES = [
  { id: 'protimeter', name: 'Protimeter', model: 'Surveymaster' },
  { id: 'tramex', name: 'Tramex', model: 'CMEX5' },
  { id: 'flir', name: 'FLIR', model: 'MR277' }
] as const;

export const READING_TYPES = [
  { id: 'wme', name: 'Wood Moisture Equivalent', unit: '%' },
  { id: 'ref', name: 'Reference Scale', unit: 'REF' },
  { id: 'temp', name: 'Temperature', unit: '°C' }
] as const;

export const READING_METHODS = [
  { id: 'pin', name: 'Pin Mode' },
  { id: 'pinless', name: 'Pinless Mode' },
  { id: 'surface', name: 'Surface Scan' }
] as const;

export const MATERIAL_TYPES = ['Wood', 'Drywall', 'Concrete', 'Plaster', 'Carpet'] as const;
export type MaterialType = typeof MATERIAL_TYPES[number];

export const MATERIAL_GUIDELINES: Record<string, MoistureGuidelines> = {
  Drywall: {
    dryStandard: 16,
    warningThreshold: 20,
    criticalThreshold: 25,
    description: 'Standard moisture content for drywall should be below 16%',
    remediation: 'Consider removal if sustained readings exceed 25%'
  },
  Wood: {
    dryStandard: 15,
    warningThreshold: 18,
    criticalThreshold: 22,
    description: 'Wood moisture content should be 15% or less',
    remediation: 'Assess for structural integrity if exceeded 22%'
  },
  Concrete: {
    dryStandard: 18,
    warningThreshold: 22,
    criticalThreshold: 25,
    description: 'Concrete should read below 18% before applying floor coverings',
    remediation: 'Extended drying needed above 25%'
  },
  Carpet: {
    dryStandard: 10,
    warningThreshold: 15,
    criticalThreshold: 20,
    description: 'Carpet and padding should be below 10% moisture content',
    remediation: 'Consider replacement if exceeded 20%'
  },
  Plaster: {
    dryStandard: 12,
    warningThreshold: 16,
    criticalThreshold: 20,
    description: 'Plaster walls should read 12% or less',
    remediation: 'Assess for deterioration above 20%'
  }
};

// Utility Functions
export function calculateDryingProgressData(readings: MoistureReading[]): DryingProgress[] {
  if (!readings?.length) return [];

  // Group readings by inspection day
  const readingsByDay = readings.reduce((acc, reading) => {
    const day = reading.inspectionDay;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(reading);
    return acc;
  }, {} as { [key: number]: MoistureReading[] });

  // Convert grouped readings to DryingProgress format
  return Object.entries(readingsByDay)
    .sort(([dayA], [dayB]) => Number(dayA) - Number(dayB))
    .map(([day, dayReadings]) => {
      const values = dayReadings.map(r => r.value);
      const avgReading = values.reduce((sum, val) => sum + val, 0) / values.length;
      const maxReading = Math.max(...values);
      const minReading = Math.min(...values);

      // Count locations by moisture status
      const locationCounts = dayReadings.reduce((acc, reading) => {
        const guidelines = MATERIAL_GUIDELINES[reading.materialType];
        if (!guidelines) return acc;

        if (reading.value <= guidelines.dryStandard) {
          acc.dry++;
        } else if (reading.value <= guidelines.warningThreshold) {
          acc.warning++;
        } else {
          acc.critical++;
        }
        return acc;
      }, { dry: 0, warning: 0, critical: 0 });

      return {
        date: dayReadings[0].timestamp,
        averageReading: avgReading,
        highestReading: maxReading,
        lowestReading: minReading,
        dryLocationsCount: locationCounts.dry,
        warningLocations: locationCounts.warning,
        criticalLocations: locationCounts.critical,
        totalLocations: dayReadings.length,
        readingsCount: dayReadings.length
      };
    });
}

export interface DryingTrendAnalysis {
  trend: 'improving' | 'stable' | 'deteriorating';
  dryingRate: number;
  estimatedDryingDays: number;
  problemAreas: string[];
}

export function analyzeDryingTrend(readings?: MoistureReading[]): DryingTrendAnalysis {
  const defaultAnalysis: DryingTrendAnalysis = {
    trend: 'stable',
    dryingRate: 0,
    estimatedDryingDays: 0,
    problemAreas: []
  };

  if (!readings?.length || readings.length < 2) {
    return defaultAnalysis;
  }

  const sortedReadings = [...readings].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const firstValue = sortedReadings[0].value;
  const lastValue = sortedReadings[sortedReadings.length - 1].value;
  const daysDiff = sortedReadings[sortedReadings.length - 1].inspectionDay - sortedReadings[0].inspectionDay;
  
  if (daysDiff === 0) return defaultAnalysis;

  const dryingRate = (firstValue - lastValue) / daysDiff;
  const estimatedDryingDays = dryingRate > 0 ? Math.ceil(lastValue / dryingRate) : 0;

  // Find problem areas (locations with increasing moisture)
  const problemAreas = readings
    .filter(reading => {
      const previousReading = readings.find(r => 
        r.location === reading.location && 
        r.inspectionDay === reading.inspectionDay - 1
      );
      return previousReading && reading.value > previousReading.value;
    })
    .map(reading => reading.location);

  return {
    trend: dryingRate > 0.1 ? 'improving' : dryingRate < -0.1 ? 'deteriorating' : 'stable',
    dryingRate: Math.max(0, dryingRate),
    estimatedDryingDays,
    problemAreas: [...new Set(problemAreas)] // Remove duplicates
  };
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function isValidReading(value: number): boolean {
  return value >= 0 && value <= 100;
}

export const getMoistureColor = (value: number, materialType: string): string => {
  const guidelines = MATERIAL_GUIDELINES[materialType];
  if (!guidelines) return '#757575';

  if (value > guidelines.criticalThreshold) return '#f44336';
  if (value > guidelines.warningThreshold) return '#ff9800';
  if (value > guidelines.dryStandard) return '#fdd835';
  return '#4caf50';
};

export const getMoistureStatus = (value: number, materialType: string): string => {
  const guidelines = MATERIAL_GUIDELINES[materialType];
  if (!guidelines) return 'unknown';

  if (value > guidelines.criticalThreshold) return 'critical';
  if (value > guidelines.warningThreshold) return 'warning';
  if (value > guidelines.dryStandard) return 'elevated';
  return 'dry';
};

// Function to determine if a color is light or dark
const isLightColor = (color: string): boolean => {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};

export const getMoistureTextColor = (value: number): string => {
  const bgColor = getMoistureColor(value, 'Wood'); // Use Wood as default material
  return isLightColor(bgColor) ? '#000000' : '#ffffff';
};
