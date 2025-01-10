import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';
import { AuthService } from '../../../../../services/authService';
import { AuthError } from '../../../../../utils/errors';
import { MoistureReadingData } from '../../../../../types/moisture';

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { jobNumber: string } }
) {
  try {
    // Get the authorization header
    const headersList = await headers();
    const authHeader = headersList.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    // Extract and verify the token
    const token = authHeader.replace('Bearer ', '');
    const user = await AuthService.verifyToken(token);
    
    // Validate user has permission
    const hasPermission = await AuthService.validateRole(user.userId, 'TECHNICIAN');
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions to update readings' },
        { status: 403 }
      );
    }

    // Get the readings data from request body
    const readings: MoistureReadingData[] = await request.json();

    // Start a transaction to handle multiple reading updates
    await prisma.$transaction(async (tx) => {
      // First, delete existing readings for this job
      await tx.moistureReading.deleteMany({
        where: {
          jobNumber: params.jobNumber
        }
      });

      // Then insert the new readings
      for (const reading of readings) {
        const lastValue = reading.values[reading.values.length - 1];
        await tx.moistureReading.create({
          data: {
            jobNumber: params.jobNumber,
            value: lastValue.value,
            locationX: reading.position.x,
            locationY: reading.position.y,
            timestamp: new Date(lastValue.timestamp),
            material: reading.material
          }
        });
      }
    });

    return NextResponse.json({ message: 'Readings updated successfully' });
  } catch (error) {
    console.error('Error updating readings:', error);
    
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update readings' },
      { status: 500 }
    );
  }
}
