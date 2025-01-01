import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { CustomPrismaClient } from '@/types/prisma';

const db = prisma as unknown as CustomPrismaClient;

// Type definitions
interface PowerReading {
  id?: string;
  jobNumber: string;
  equipmentId: string;
  equipmentName: string;
  watts: number;
  amps: number;
  voltage: number;
  timestamp: Date;
}

interface Job {
  id: string;
  jobNumber: string;
  totalEquipmentPower: number;
  status: 'pending' | 'in-progress' | 'completed';
  lastUpdated: Date;
}

// Validation schemas
const PowerReadingSchema = z.object({
  equipmentId: z.string().min(1, 'Equipment ID is required'),
  equipmentName: z.string().min(1, 'Equipment name is required'),
  watts: z.number().positive('Watts must be positive'),
  amps: z.number().positive('Amps must be positive'),
  voltage: z.number().positive('Voltage must be positive'),
  timestamp: z.string().datetime('Invalid timestamp')
});

const PowerReadingsRequestSchema = z.object({
  readings: z.array(PowerReadingSchema)
});

export async function GET(
  request: NextRequest,
  { params }: { params: { jobNumber: string } }
) {
  try {
    const { jobNumber } = params;

    // Validate job number format
    if (!/^\d{6}-\d{2}$/.test(jobNumber)) {
      return NextResponse.json(
        { error: 'Invalid job number format' },
        { status: 400 }
      );
    }

    // Fetch power readings from database
    const powerReadings = await db.powerReading.findMany({
      where: {
        jobNumber
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    // Fetch total equipment power for the job
    const job = await db.job.findUnique({
      where: {
        jobNumber
      }
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      readings: powerReadings,
      totalEquipmentPower: job.totalEquipmentPower
    });

  } catch (error) {
    console.error('Error fetching power readings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { jobNumber: string } }
) {
  try {
    const { jobNumber } = params;

    // Validate job number format
    if (!/^\d{6}-\d{2}$/.test(jobNumber)) {
      return NextResponse.json(
        { error: 'Invalid job number format' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = PowerReadingsRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { readings } = validationResult.data;

    // Validate power calculations (W = A × V)
    const invalidReadings = readings.filter(reading => {
      const calculatedWatts = reading.amps * reading.voltage;
      return Math.abs(calculatedWatts - reading.watts) >= 1;
    });

    if (invalidReadings.length > 0) {
      return NextResponse.json(
        { error: 'Invalid power calculations detected (W = A × V)' },
        { status: 400 }
      );
    }

    // Fetch job to check total power capacity
    const job = await db.job.findUnique({
      where: {
        jobNumber
      }
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Validate total power doesn't exceed capacity
    const totalPower = readings.reduce((sum, reading) => sum + reading.watts, 0);
    if (totalPower > job.totalEquipmentPower) {
      return NextResponse.json(
        { error: `Total power (${totalPower}W) exceeds equipment capacity (${job.totalEquipmentPower}W)` },
        { status: 400 }
      );
    }

    // Start a transaction to ensure data consistency
    await db.$transaction(async (tx) => {
      // Delete existing readings
      await tx.powerReading.deleteMany({
        where: { jobNumber }
      });

      // Insert new readings
      await tx.powerReading.createMany({
        data: readings.map(reading => ({
          ...reading,
          jobNumber,
          timestamp: new Date(reading.timestamp)
        }))
      });

      // Update job status
      await tx.job.update({
        where: { jobNumber },
        data: {
          lastUpdated: new Date(),
          status: 'in-progress'
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Power readings saved successfully'
    });

  } catch (error) {
    console.error('Error saving power readings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
