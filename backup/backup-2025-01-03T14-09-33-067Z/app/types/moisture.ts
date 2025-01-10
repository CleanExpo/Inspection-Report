import { MaterialType } from '@prisma/client';

export type Point = {
  x: number;
  y: number;
};

export type Wall = {
  start: Point;
  end: Point;
};

export type Door = {
  position: Point;
  width: number;
  height: number;
};

export type Window = {
  position: Point;
  width: number;
  height: number;
};

export type MapLayout = {
  walls: Wall[];
  doors: Door[];
  windows: Window[];
};

export type MoistureReading = {
  id: string;
  mapId: string;
  value: number;
  materialType: MaterialType;
  location: Point;
  notes?: string;
  timestamp: string;
  createdAt: Date;
  updatedAt: Date;
};

export type MoistureMap = {
  id: string;
  jobId: string;
  name: string;
  layout: MapLayout;
  readings: MoistureReading[];
  createdAt: Date;
  updatedAt: Date;
};

export type CreateMapInput = {
  jobId: string;
  name: string;
  layout: MapLayout;
};

export type UpdateMapInput = {
  layout?: MapLayout;
  name?: string;
};

export type CreateReadingInput = {
  value: number;
  materialType: MaterialType;
  location: Point;
  notes?: string;
};

export type UpdateReadingInput = {
  value?: number;
  notes?: string;
};

export type ReadingHistoryOptions = {
  radius?: number;
  startDate?: Date;
  endDate?: Date;
};
