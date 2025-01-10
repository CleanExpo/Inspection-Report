export interface Reading {
  id: string;
  jobId: string;
  value: number;
  materialType: MaterialType;
  location: Location;
  metadata: ReadingMetadata;
  timestamp: Date;
  inspectorId: string;
  equipmentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum MaterialType {
  WOOD = 'WOOD',
  CONCRETE = 'CONCRETE',
  DRYWALL = 'DRYWALL',
  CARPET = 'CARPET',
  TILE = 'TILE',
}

export interface Location {
  x: number;
  y: number;
  z: number;
  floor: number;
  room: string;
  notes?: string;
}

export interface ReadingMetadata {
  temperature: number;
  humidity: number;
  pressure: number;
  depth?: number;
  surfaceType?: string;
}

export interface CreateReadingInput {
  jobId: string;
  value: number;
  materialType: MaterialType;
  location: Location;
  metadata: ReadingMetadata;
  equipmentId?: string;
}

export interface UpdateReadingInput extends Partial<CreateReadingInput> {}

export interface ReadingFilters {
  jobId?: string;
  materialType?: MaterialType;
  minValue?: number;
  maxValue?: number;
  startDate?: Date;
  endDate?: Date;
  inspectorId?: string;
  equipmentId?: string;
}

export interface ReadingStats {
  count: number;
  average: number;
  min: number;
  max: number;
  standardDeviation: number;
  byMaterial: {
    [key in MaterialType]?: {
      count: number;
      average: number;
    };
  };
}

export interface BatchCreateReadingsInput {
  readings: CreateReadingInput[];
}

export interface BatchCreateReadingsResponse {
  readings: Reading[];
  count: number;
  errors?: Array<{
    index: number;
    error: string;
  }>;
}
