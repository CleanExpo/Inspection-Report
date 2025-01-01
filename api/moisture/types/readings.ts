export type MoistureUnit = 'WME' | 'REL' | 'PCT';

export interface MoistureReadingData {
  id: string;
  jobId: string;
  floorPlanId: string;
  equipmentId: string;
  locationX: number;
  locationY: number;
  room: string;
  floor: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataPointData {
  id: string;
  value: number;
  unit: MoistureUnit;
  depth?: number;
  createdAt: Date;
  moistureReadingId: string;
}
