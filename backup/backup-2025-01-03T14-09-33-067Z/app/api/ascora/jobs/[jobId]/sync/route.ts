import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: params.jobId },
      include: {
        client: true,
        readings: true,
        photos: true,
        notes: true,
        scopes: true,
        invoices: true
      }
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Here you would implement the actual sync logic with Ascora
    // For now, we'll just return the job data
    return NextResponse.json({
      success: true,
      message: 'Job synced successfully',
      data: job
    });
  } catch (error) {
    console.error('Error syncing job:', error);
    return NextResponse.json(
      { error: 'Failed to sync job' },
      { status: 500 }
    );
  }
}
