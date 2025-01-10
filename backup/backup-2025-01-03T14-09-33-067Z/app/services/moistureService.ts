import { prisma } from '../lib/prisma';
import type { MoistureMap as PrismaMap, MoistureReading as PrismaReading, Prisma, MaterialType } from '@prisma/client';
import type {
  MoistureMap,
  MoistureReading,
  CreateMapInput,
  UpdateMapInput,
  CreateReadingInput,
  UpdateReadingInput,
  Point,
  ReadingHistoryOptions,
} from '../types/moisture';

type DbMapWithReadings = PrismaMap & {
  readings: PrismaReading[];
};

class MoistureService {
  private validateLayout(layout: any): boolean {
    if (!layout || typeof layout !== 'object') return false;
    if (!Array.isArray(layout.walls)) return false;

    // Validate walls
    for (const wall of layout.walls) {
      if (!this.validatePoint(wall.start) || !this.validatePoint(wall.end)) {
        return false;
      }
    }

    // Validate doors
    if (layout.doors && Array.isArray(layout.doors)) {
      for (const door of layout.doors) {
        if (!this.validatePoint(door.position) || 
            typeof door.width !== 'number' || 
            typeof door.height !== 'number') {
          return false;
        }
      }
    }

    // Validate windows
    if (layout.windows && Array.isArray(layout.windows)) {
      for (const window of layout.windows) {
        if (!this.validatePoint(window.position) || 
            typeof window.width !== 'number' || 
            typeof window.height !== 'number') {
          return false;
        }
      }
    }

    return true;
  }

  private validatePoint(point: any): boolean {
    return point && 
           typeof point === 'object' && 
           typeof point.x === 'number' && 
           typeof point.y === 'number';
  }

  private validateReadingValue(value: number): boolean {
    return typeof value === 'number' && value >= 0 && value <= 100;
  }

  async createMap(input: CreateMapInput): Promise<MoistureMap> {
    if (!this.validateLayout(input.layout)) {
      throw new Error('Invalid layout data');
    }

    const map = await prisma.moistureMap.create({
      data: {
        jobId: input.jobId,
        name: input.name,
        layout: input.layout as Prisma.JsonObject,
      },
      include: {
        readings: true,
      },
    });

    return this.mapPrismaToModel(map);
  }

  async getMaps(jobId: string): Promise<MoistureMap[]> {
    const maps = await prisma.moistureMap.findMany({
      where: { jobId },
      include: {
        readings: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return maps.map(this.mapPrismaToModel);
  }

  async getMapById(id: string): Promise<MoistureMap | null> {
    const map = await prisma.moistureMap.findUnique({
      where: { id },
      include: {
        readings: {
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
    });

    return map ? this.mapPrismaToModel(map) : null;
  }

  async updateMap(id: string, input: UpdateMapInput): Promise<MoistureMap> {
    if (input.layout && !this.validateLayout(input.layout)) {
      throw new Error('Invalid layout data');
    }

    const map = await prisma.moistureMap.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.layout && { layout: input.layout as Prisma.JsonObject }),
      },
      include: {
        readings: true,
      },
    });

    return this.mapPrismaToModel(map);
  }

  async addReading(mapId: string, input: CreateReadingInput): Promise<MoistureMap> {
    if (!this.validateReadingValue(input.value)) {
      throw new Error('Invalid reading value');
    }

    if (!this.validatePoint(input.location)) {
      throw new Error('Invalid location coordinates');
    }

    const map = await prisma.moistureMap.update({
      where: { id: mapId },
      data: {
        readings: {
          create: {
            value: input.value,
            materialType: input.materialType as MaterialType,
            locationX: input.location.x,
            locationY: input.location.y,
            notes: input.notes,
            timestamp: new Date(),
          },
        },
      },
      include: {
        readings: true,
      },
    });

    return this.mapPrismaToModel(map);
  }

  async updateReading(id: string, input: UpdateReadingInput): Promise<MoistureReading> {
    if (input.value !== undefined && !this.validateReadingValue(input.value)) {
      throw new Error('Invalid reading value');
    }

    const reading = await prisma.moistureReading.update({
      where: { id },
      data: {
        ...(input.value !== undefined && { value: input.value }),
        ...(input.notes !== undefined && { notes: input.notes }),
      },
    });

    return this.mapPrismaReadingToModel(reading);
  }

  async deleteReading(id: string): Promise<MoistureReading> {
    const reading = await prisma.moistureReading.delete({
      where: { id },
    });

    return this.mapPrismaReadingToModel(reading);
  }

  async getReadingHistory(
    mapId: string,
    location: Point,
    options: ReadingHistoryOptions = {}
  ): Promise<MoistureReading[]> {
    const { radius = 10, startDate, endDate } = options;

    // Calculate bounding box for location search
    const minX = location.x - radius;
    const maxX = location.x + radius;
    const minY = location.y - radius;
    const maxY = location.y + radius;

    const readings = await prisma.moistureReading.findMany({
      where: {
        mapId,
        timestamp: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
        locationX: {
          gte: minX,
          lte: maxX,
        },
        locationY: {
          gte: minY,
          lte: maxY,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    return readings.map(this.mapPrismaReadingToModel);
  }

  private mapPrismaToModel(map: DbMapWithReadings): MoistureMap {
    return {
      id: map.id,
      jobId: map.jobId,
      name: map.name,
      layout: map.layout as any,
      readings: map.readings?.map(this.mapPrismaReadingToModel) || [],
      createdAt: map.createdAt,
      updatedAt: map.updatedAt,
    };
  }

  private mapPrismaReadingToModel(reading: PrismaReading): MoistureReading {
    return {
      id: reading.id,
      mapId: reading.mapId,
      value: reading.value,
      materialType: reading.materialType,
      location: {
        x: reading.locationX,
        y: reading.locationY,
      },
      notes: reading.notes || undefined,
      timestamp: reading.timestamp.toISOString(),
      createdAt: reading.createdAt,
      updatedAt: reading.updatedAt,
    };
  }
}

export const moistureService = new MoistureService();
