export type RoomCategory = 'residential' | 'commercial' | 'industrial';

export interface MeasurementTemplate {
  id: string;
  name: string;
  category: RoomCategory;
  description: string;
  defaultArea?: number;
  defaultPerimeter?: number;
  tolerancePercent: number;
  suggestedPoints?: number;
  pointsPerSquareMeter?: number;
  notes?: string[];
}

export const ROOM_TEMPLATES: MeasurementTemplate[] = [
  {
    id: 'bathroom',
    name: 'Bathroom',
    category: 'residential',
    description: 'Standard residential bathroom',
    defaultArea: 5.5,
    defaultPerimeter: 9.4,
    tolerancePercent: 20,
    pointsPerSquareMeter: 2,
    notes: [
      'Take measurements near fixtures and corners',
      'Include shower/tub area',
      'Check for water damage around plumbing'
    ]
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    category: 'residential',
    description: 'Standard residential kitchen',
    defaultArea: 12,
    defaultPerimeter: 14,
    tolerancePercent: 20,
    pointsPerSquareMeter: 1.5,
    notes: [
      'Focus on areas near appliances',
      'Check under sink and dishwasher',
      'Include pantry if present'
    ]
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    category: 'residential',
    description: 'Standard residential bedroom',
    defaultArea: 14,
    defaultPerimeter: 15,
    tolerancePercent: 25,
    pointsPerSquareMeter: 1,
    notes: [
      'Check corners for condensation',
      'Include closet space',
      'Measure near windows and exterior walls'
    ]
  },
  {
    id: 'office',
    name: 'Office Space',
    category: 'commercial',
    description: 'Open office area',
    defaultArea: 50,
    defaultPerimeter: 28,
    tolerancePercent: 15,
    pointsPerSquareMeter: 0.75,
    notes: [
      'Focus on areas near HVAC vents',
      'Check around windows',
      'Include server room if present'
    ]
  },
  {
    id: 'warehouse',
    name: 'Warehouse',
    category: 'industrial',
    description: 'Storage warehouse space',
    defaultArea: 200,
    defaultPerimeter: 60,
    tolerancePercent: 30,
    pointsPerSquareMeter: 0.5,
    notes: [
      'Check loading dock areas',
      'Focus on corners and wall junctions',
      'Include drainage areas'
    ]
  }
];

interface ValidationResult {
  areaDeviation: number;
  perimeterDeviation: number;
  isWithinTolerance: boolean;
}

export function validateMeasurements(
  currentArea: number | undefined,
  currentPerimeter: number | undefined,
  template: MeasurementTemplate
): ValidationResult {
  const areaDeviation = currentArea !== undefined && template.defaultArea
    ? Math.abs((currentArea - template.defaultArea) / template.defaultArea * 100)
    : 0;

  const perimeterDeviation = currentPerimeter !== undefined && template.defaultPerimeter
    ? Math.abs((currentPerimeter - template.defaultPerimeter) / template.defaultPerimeter * 100)
    : 0;

  const isWithinTolerance = (areaDeviation === 0 || areaDeviation <= template.tolerancePercent) &&
    (perimeterDeviation === 0 || perimeterDeviation <= template.tolerancePercent);

  return {
    areaDeviation,
    perimeterDeviation,
    isWithinTolerance
  };
}

export function suggestMeasurementPoints(
  area: number,
  template: MeasurementTemplate
): number {
  if (template.suggestedPoints) {
    return template.suggestedPoints;
  }

  if (template.pointsPerSquareMeter) {
    return Math.ceil(area * template.pointsPerSquareMeter);
  }

  // Default calculation if no specific rules are defined
  return Math.max(4, Math.ceil(Math.sqrt(area) * 2));
}
