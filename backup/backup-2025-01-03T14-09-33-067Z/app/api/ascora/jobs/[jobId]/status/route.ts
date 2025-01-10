import { NextResponse } from 'next/server';
import { updateJobStatus } from '../../../../../services/ascoraService';

export async function PUT(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const data = await request.json();
    const { status } = data;

    const updatedJob = await updateJobStatus(params.jobId, status);
    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('Error updating job status:', error);
    return NextResponse.json(
      { error: 'Failed to update job status' },
      { status: 500 }
    );
  }
}
