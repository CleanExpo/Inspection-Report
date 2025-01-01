import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { Prisma } from '@prisma/client';
import { BatchRequestSchema, BatchOperationSchema, DataPointSchema } from '../types/schemas';
import type { z } from 'zod';
import { withErrorHandlingAndTiming } from '../middleware/errorHandler';
import { ErrorCode, createErrorResponse } from '../utils/errorCodes';
import { logger } from '../utils/logger';

// Infer types from Zod schemas
type BatchRequest = z.infer<typeof BatchRequestSchema>;
type BatchOperation = z.infer<typeof BatchOperationSchema>;
type DataPoint = z.infer<typeof DataPointSchema>;

// Response types
interface BatchResponse {
  results: BatchOperationResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

interface BatchOperationResult {
  success: boolean;
  id?: string;
  error?: string;
}

// Extended Prisma type with environmental data
type MoistureReadingWithEnv = Prisma.MoistureReadingGetPayload<{
  include: {
    dataPoints: true;
    equipment: true;
  };
}> & {
  temperature?: number | null;
  humidity?: number | null;
  pressure?: number | null;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BatchResponse>
) {
  if (req.method !== 'POST') {
    throw createErrorResponse(
      ErrorCode.INVALID_REQUEST,
      'Method not allowed',
      { allowedMethods: ['POST'] }
    );
  }

  const result = BatchRequestSchema.safeParse(req.body);
  
  if (!result.success) {
    throw result.error;
  }

  const operations = result.data;
  const results: BatchOperationResult[] = [];

  // Process operations in a transaction
    await prisma.$transaction(async (tx) => {
      for (const op of operations) {
        try {
          switch (op.operation) {
            case 'create': {
              const createData: Prisma.MoistureReadingCreateInput = {
                job: {
                  connect: { id: op.data.jobId }
                },
                locationX: op.data.locationX,
                locationY: op.data.locationY,
                room: op.data.room,
                floor: op.data.floor,
                equipment: {
                  connect: { id: op.data.equipmentId }
                },
                floorPlan: {
                  connect: { id: op.data.floorPlanId }
                },
                dataPoints: {
                  create: op.data.dataPoints
                },
                environmentalData: {
                  temperature: op.data.temperature,
                  humidity: op.data.humidity,
                  pressure: op.data.pressure
                }
              } as any; // Using any here since environmentalData is a JSON field

              const reading = await tx.moistureReading.create({
                data: createData,
                include: {
                  dataPoints: true,
                  equipment: true
                }
              });
              results.push({ success: true, id: reading.id });
              break;
            }

            case 'update': {
              const updateData: Prisma.MoistureReadingUpdateInput = {
                ...(op.data.locationX !== undefined && { locationX: op.data.locationX }),
                ...(op.data.locationY !== undefined && { locationY: op.data.locationY }),
                ...(op.data.room !== undefined && { room: op.data.room }),
                ...(op.data.floor !== undefined && { floor: op.data.floor }),
                ...(op.data.equipmentId !== undefined && {
                  equipment: {
                    connect: { id: op.data.equipmentId }
                  }
                }),
                ...(op.data.floorPlanId !== undefined && {
                  floorPlan: {
                    connect: { id: op.data.floorPlanId }
                  }
                }),
                ...(
                  op.data.temperature !== undefined ||
                  op.data.humidity !== undefined ||
                  op.data.pressure !== undefined
                ) && {
                  environmentalData: {
                    temperature: op.data.temperature,
                    humidity: op.data.humidity,
                    pressure: op.data.pressure
                  }
                },
                ...(op.data.dataPoints && {
                  dataPoints: {
                    deleteMany: {},
                    create: op.data.dataPoints
                  }
                })
              } as any; // Using any here since environmentalData is a JSON field

              const reading = await tx.moistureReading.update({
                where: { id: op.id },
                data: updateData,
                include: {
                  dataPoints: true,
                  equipment: true
                }
              });
              results.push({ success: true, id: reading.id });
              break;
            }

            case 'delete': {
              await tx.moistureReading.delete({
                where: { id: op.id }
              });
              results.push({ success: true, id: op.id });
              break;
            }
          }
        } catch (error) {
          logger.error('Operation failed', { 
            operation: op.operation, 
            id: 'id' in op ? op.id : undefined,
            error 
          });
          
          let errorMessage: string;
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
              case 'P2025':
                errorMessage = 'Record not found';
                break;
              case 'P2002':
                errorMessage = 'Duplicate entry conflict';
                break;
              case 'P2003':
                errorMessage = 'Invalid reference to related record';
                break;
              default:
                errorMessage = 'Database operation failed';
            }
          } else {
            errorMessage = error instanceof Error ? error.message : 'Unknown error';
          }
          
          results.push({
            success: false,
            error: errorMessage,
            id: 'id' in op ? op.id : undefined
          });
        }
      }
    });

    // If any operations failed, throw an error with details
    if (results.some(r => !r.success)) {
      throw createErrorResponse(
        ErrorCode.PARTIAL_FAILURE,
        'Some batch operations failed',
        { results }
      );
    }

    const response: BatchResponse = {
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    };
    
    return res.status(200).json(response);
}

export default withErrorHandlingAndTiming(handler);
