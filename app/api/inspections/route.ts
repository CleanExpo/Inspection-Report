import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { withAuth } from '../../../utils/auth';

export const GET = withAuth(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    const where = jobId ? { jobId } : {};

    const inspections = await prisma.moistureReading.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      }
    });

    return NextResponse.json(inspections);
  } catch (error) {
    console.error('Error fetching inspections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inspections' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (request: Request) => {
  try {
    const data = await request.json();
    const { jobId, location, value, type, notes } = data;

    const reading = await prisma.moistureReading.create({
      data: {
        jobId,
        location,
        value,
        type,
        notes
      }
    });

    return NextResponse.json(reading);
  } catch (error) {
    console.error('Error creating inspection:', error);
    return NextResponse.json(
      { error: 'Failed to create inspection' },
      { status: 500 }
    );
  }
});
