import prisma from '../lib/prisma';
import { NotFoundError } from '../utils/errors';

export interface MoistureData {
  id?: string;
  jobId: string;
  location: string;
  value: number;
  type: string;
  timestamp?: Date;
  notes?: string;
}

export async function getMoistureData(jobId: string) {
  const readings = await prisma.moistureReading.findMany({
    where: { jobId },
    orderBy: { timestamp: 'desc' }
  });

  if (!readings) {
    throw new NotFoundError(`No moisture readings found for job ${jobId}`);
  }

  return readings;
}

export async function createMoistureData(data: MoistureData) {
  const reading = await prisma.moistureReading.create({
    data: {
      jobId: data.jobId,
      location: data.location,
      value: data.value,
      type: data.type,
      notes: data.notes,
      timestamp: data.timestamp || new Date()
    }
  });

  return reading;
}

export async function updateMoistureData(id: string, data: Partial<MoistureData>) {
  const reading = await prisma.moistureReading.update({
    where: { id },
    data: {
      location: data.location,
      value: data.value,
      type: data.type,
      notes: data.notes,
      timestamp: data.timestamp
    }
  });

  return reading;
}

export async function deleteMoistureData(id: string) {
  await prisma.moistureReading.delete({
    where: { id }
  });
}
