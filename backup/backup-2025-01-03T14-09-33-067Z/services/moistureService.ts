import { PrismaClient } from '@prisma/client';
import { DatabaseError, NotFoundError } from '../utils/errors';
import { MoistureData } from '../types/moisture';

const prisma = new PrismaClient();

const includeRelations = {
  readings: true,
  equipment: true,
  annotations: true,
} as const;

export class MoistureService {
  static async getMoistureData(jobNumber: string): Promise<MoistureData> {
    try {
      const data = await prisma.$queryRawUnsafe(`
        SELECT m.*, 
               array_agg(DISTINCT r.*) as readings,
               array_agg(DISTINCT e.*) as equipment,
               array_agg(DISTINCT a.*) as annotations
        FROM "MoistureData" m
        LEFT JOIN "MoistureReading" r ON m."jobNumber" = r."jobNumber"
        LEFT JOIN "Equipment" e ON m."jobNumber" = e."jobNumber"
        LEFT JOIN "Annotation" a ON m."jobNumber" = a."jobNumber"
        WHERE m."jobNumber" = $1
        GROUP BY m.id, m."jobNumber"
      `, jobNumber);

      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new NotFoundError(`Moisture data not found for job number: ${jobNumber}`);
      }

      return data[0] as MoistureData;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Failed to retrieve moisture data', (error as any).code);
    }
  }

  static async createMoistureData(data: MoistureData): Promise<MoistureData> {
    try {
      const { readings = [], equipment = [], annotations = [], ...moistureData } = data;

      return await prisma.$transaction(async (tx) => {
        // Create the main moisture data record
        const created = await tx.$executeRaw`
          INSERT INTO "MoistureData" (
            "id", "jobNumber", "clientId", "clientName", "jobAddress", "status",
            "priority", "category", "floorPlan", "totalEquipmentPower",
            "notes", "createdAt", "updatedAt"
          ) VALUES (
            ${moistureData.id || undefined},
            ${moistureData.jobNumber},
            ${moistureData.clientId},
            ${moistureData.clientName || null},
            ${moistureData.jobAddress || null},
            ${moistureData.status || 'PENDING'},
            ${moistureData.priority || null},
            ${moistureData.category || null},
            ${moistureData.floorPlan || null},
            ${moistureData.totalEquipmentPower || null},
            ${moistureData.notes || null},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `;

        // Create readings
        if (readings.length > 0) {
          for (const reading of readings) {
            await tx.$executeRaw`
              INSERT INTO "MoistureReading" (
                "jobNumber", "value", "locationX", "locationY",
                "material", "inspectionDay", "notes"
              ) VALUES (
                ${moistureData.jobNumber},
                ${reading.value},
                ${reading.locationX},
                ${reading.locationY},
                ${reading.material || null},
                ${reading.inspectionDay || null},
                ${reading.notes || null}
              )
            `;
          }
        }

        // Create equipment
        if (equipment.length > 0) {
          for (const eq of equipment) {
            await tx.$executeRaw`
              INSERT INTO "Equipment" (
                "jobNumber", "type", "positionX", "positionY",
                "rotation", "operationalStatus", "power", "mode",
                "targetHumidity", "fanSpeed", "temperature"
              ) VALUES (
                ${moistureData.jobNumber},
                ${eq.type},
                ${eq.positionX},
                ${eq.positionY},
                ${eq.rotation || null},
                ${eq.operationalStatus || null},
                ${eq.power || null},
                ${eq.mode || null},
                ${eq.targetHumidity || null},
                ${eq.fanSpeed || null},
                ${eq.temperature || null}
              )
            `;
          }
        }

        // Create annotations
        if (annotations.length > 0) {
          for (const ann of annotations) {
            await tx.$executeRaw`
              INSERT INTO "Annotation" (
                "jobNumber", "type", "content", "locationX",
                "locationY", "author"
              ) VALUES (
                ${moistureData.jobNumber},
                ${ann.type},
                ${ann.content},
                ${ann.locationX},
                ${ann.locationY},
                ${ann.author || null}
              )
            `;
          }
        }

        return this.getMoistureData(moistureData.jobNumber);
      });
    } catch (error) {
      throw new DatabaseError('Failed to create moisture data', (error as any).code);
    }
  }

  static async updateMoistureData(
    jobNumber: string,
    data: Partial<MoistureData>
  ): Promise<MoistureData> {
    try {
      const { readings, equipment, annotations, ...updateData } = data;

      return await prisma.$transaction(async (tx) => {
        // Delete existing related records if new ones are provided
        if (readings) {
          await tx.$executeRaw`
            DELETE FROM "MoistureReading"
            WHERE "jobNumber" = ${jobNumber}
          `;
        }
        if (equipment) {
          await tx.$executeRaw`
            DELETE FROM "Equipment"
            WHERE "jobNumber" = ${jobNumber}
          `;
        }
        if (annotations) {
          await tx.$executeRaw`
            DELETE FROM "Annotation"
            WHERE "jobNumber" = ${jobNumber}
          `;
        }

        // Update main record
        if (Object.keys(updateData).length > 0) {
          const setClause = Object.entries(updateData)
            .filter(([_, value]) => value !== undefined)
            .map(([key], index) => `"${key}" = $${index + 2}`)
            .join(', ');

          if (setClause) {
            const values = Object.entries(updateData)
              .filter(([_, value]) => value !== undefined)
              .map(([_, value]) => value === null ? null : value);

            await tx.$executeRaw`
              UPDATE "MoistureData"
              SET ${setClause}, "updatedAt" = CURRENT_TIMESTAMP
              WHERE "jobNumber" = ${jobNumber}
            `;
          }
        }

        // Create new related records
        if (readings) {
          for (const reading of readings) {
            await tx.$executeRaw`
              INSERT INTO "MoistureReading" (
                "jobNumber", "value", "locationX", "locationY",
                "material", "inspectionDay", "notes"
              ) VALUES (
                ${jobNumber},
                ${reading.value},
                ${reading.locationX},
                ${reading.locationY},
                ${reading.material || null},
                ${reading.inspectionDay || null},
                ${reading.notes || null}
              )
            `;
          }
        }

        if (equipment) {
          for (const eq of equipment) {
            await tx.$executeRaw`
              INSERT INTO "Equipment" (
                "jobNumber", "type", "positionX", "positionY",
                "rotation", "operationalStatus", "power", "mode",
                "targetHumidity", "fanSpeed", "temperature"
              ) VALUES (
                ${jobNumber},
                ${eq.type},
                ${eq.positionX},
                ${eq.positionY},
                ${eq.rotation || null},
                ${eq.operationalStatus || null},
                ${eq.power || null},
                ${eq.mode || null},
                ${eq.targetHumidity || null},
                ${eq.fanSpeed || null},
                ${eq.temperature || null}
              )
            `;
          }
        }

        if (annotations) {
          for (const ann of annotations) {
            await tx.$executeRaw`
              INSERT INTO "Annotation" (
                "jobNumber", "type", "content", "locationX",
                "locationY", "author"
              ) VALUES (
                ${jobNumber},
                ${ann.type},
                ${ann.content},
                ${ann.locationX},
                ${ann.locationY},
                ${ann.author || null}
              )
            `;
          }
        }

        return this.getMoistureData(jobNumber);
      });
    } catch (error) {
      if ((error as any).code === 'P2025') {
        throw new NotFoundError(`Moisture data not found for job number: ${jobNumber}`);
      }
      throw new DatabaseError('Failed to update moisture data', (error as any).code);
    }
  }

  static async deleteMoistureData(jobNumber: string): Promise<void> {
    try {
      await prisma.$executeRaw`
        DELETE FROM "MoistureData"
        WHERE "jobNumber" = ${jobNumber}
      `;
    } catch (error) {
      if ((error as any).code === 'P2025') {
        throw new NotFoundError(`Moisture data not found for job number: ${jobNumber}`);
      }
      throw new DatabaseError('Failed to delete moisture data', (error as any).code);
    }
  }

  static async moistureDataExists(jobNumber: string): Promise<boolean> {
    try {
      const result = await prisma.$queryRaw<[{ count: number }]>`
        SELECT COUNT(*) as count
        FROM "MoistureData"
        WHERE "jobNumber" = ${jobNumber}
      `;
      return result[0].count > 0;
    } catch (error) {
      throw new DatabaseError('Failed to check moisture data existence', (error as any).code);
    }
  }
}
