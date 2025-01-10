import type { Job, Photo, EquipmentUsage, MoistureReading } from ".prisma/client";
import { prisma } from "../lib/prisma";

type JobWithRelations = Job & {
  photos: Photo[];
  equipmentUsed: EquipmentUsage[];
  moistureReadings: MoistureReading[];
};

type JobCreateData = Omit<Job, 'id' | 'createdAt' | 'updatedAt'> & {
  photos?: Omit<Photo, 'id' | 'jobId' | 'createdAt' | 'updatedAt'>[];
  equipmentUsed?: Omit<EquipmentUsage, 'id' | 'jobId' | 'createdAt' | 'updatedAt'>[];
  moistureReadings?: Omit<MoistureReading, 'id' | 'jobId' | 'createdAt' | 'updatedAt'>[];
};

type JobUpdateData = Partial<JobCreateData>;

export const getJobDetails = async (jobNumber: string): Promise<JobWithRelations | null> => {
  try {
    const job = await prisma.job.findUnique({
      where: { jobNumber },
      include: {
        photos: true,
        equipmentUsed: true,
        moistureReadings: true,
      },
    });
    return job;
  } catch (error) {
    console.error("Error fetching job details:", error);
    throw new Error("Failed to fetch job details");
  }
};

export const saveJobDetails = async (
  jobData: JobCreateData & { jobNumber: string }
): Promise<JobWithRelations> => {
  try {
    const { photos, equipmentUsed, moistureReadings, ...jobDetails } = jobData;

    const result = await prisma.job.upsert({
      where: { jobNumber: jobData.jobNumber },
      update: {
        ...jobDetails,
        updatedAt: new Date(),
        ...(photos && {
          photos: {
            deleteMany: {},
            create: photos,
          },
        }),
        ...(equipmentUsed && {
          equipmentUsed: {
            deleteMany: {},
            create: equipmentUsed,
          },
        }),
        ...(moistureReadings && {
          moistureReadings: {
            deleteMany: {},
            create: moistureReadings,
          },
        }),
      },
      create: {
        ...jobDetails,
        ...(photos && {
          photos: {
            create: photos,
          },
        }),
        ...(equipmentUsed && {
          equipmentUsed: {
            create: equipmentUsed,
          },
        }),
        ...(moistureReadings && {
          moistureReadings: {
            create: moistureReadings,
          },
        }),
      },
      include: {
        photos: true,
        equipmentUsed: true,
        moistureReadings: true,
      },
    });
    return result;
  } catch (error) {
    console.error("Error saving job details:", error);
    throw new Error("Failed to save job details");
  }
};

export const deleteJob = async (jobNumber: string): Promise<void> => {
  try {
    await prisma.job.delete({
      where: { jobNumber },
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    throw new Error("Failed to delete job");
  }
};

export const listJobs = async (filters?: {
  status?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<JobWithRelations[]> => {
  try {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        photos: true,
        equipmentUsed: true,
        moistureReadings: true,
      },
    });
    return jobs;
  } catch (error) {
    console.error("Error listing jobs:", error);
    throw new Error("Failed to list jobs");
  }
};

// Helper functions for related models

export const addPhotoToJob = async (
  jobId: string,
  photoData: Omit<Photo, 'id' | 'jobId' | 'createdAt' | 'updatedAt'>
): Promise<Photo> => {
  try {
    const photo = await prisma.photo.create({
      data: {
        ...photoData,
        job: { connect: { id: jobId } },
      },
    });
    return photo;
  } catch (error) {
    console.error("Error adding photo:", error);
    throw new Error("Failed to add photo");
  }
};

export const addEquipmentUsage = async (
  jobId: string,
  equipmentData: Omit<EquipmentUsage, 'id' | 'jobId' | 'createdAt' | 'updatedAt'>
): Promise<EquipmentUsage> => {
  try {
    const equipment = await prisma.equipmentUsage.create({
      data: {
        ...equipmentData,
        job: { connect: { id: jobId } },
      },
    });
    return equipment;
  } catch (error) {
    console.error("Error adding equipment usage:", error);
    throw new Error("Failed to add equipment usage");
  }
};

export const addMoistureReading = async (
  jobId: string,
  readingData: Omit<MoistureReading, 'id' | 'jobId' | 'createdAt' | 'updatedAt'>
): Promise<MoistureReading> => {
  try {
    const reading = await prisma.moistureReading.create({
      data: {
        ...readingData,
        job: { connect: { id: jobId } },
      },
    });
    return reading;
  } catch (error) {
    console.error("Error adding moisture reading:", error);
    throw new Error("Failed to add moisture reading");
  }
};
