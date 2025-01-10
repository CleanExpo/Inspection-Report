import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { withAuth } from '../../../../../utils/auth';

export const GET = withAuth(async (request: Request, { params }: { params: { jobNumber: string } }) => {
  try {
    const job = await prisma.job.findUnique({
      where: { number: params.jobNumber }
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    const equipment = await prisma.equipment.findMany({
      where: { jobId: job.id },
      orderBy: {
        startTime: 'desc'
      }
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error fetching power readings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch power readings' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (request: Request, { params }: { params: { jobNumber: string } }) => {
  try {
    const job = await prisma.job.findUnique({
      where: { number: params.jobNumber }
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    const data = await request.json();
    const { type, serialNumber, status } = data;

    const equipment = await prisma.equipment.create({
      data: {
        jobId: job.id,
        type,
        serialNumber,
        status,
        startTime: new Date()
      }
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error creating power reading:', error);
    return NextResponse.json(
      { error: 'Failed to create power reading' },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (request: Request, { params }: { params: { jobNumber: string } }) => {
  try {
    const data = await request.json();
    const { id, status } = data;

    const equipment = await prisma.equipment.update({
      where: { id },
      data: {
        status,
        ...(status === 'REMOVED' && { endTime: new Date() })
      }
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error updating power reading:', error);
    return NextResponse.json(
      { error: 'Failed to update power reading' },
      { status: 500 }
    );
  }
});
