import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// Configure the route options using the new metadata export
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { jobId, text, type } = await request.json();

    // Store the voice note
    const note = await prisma.moistureReading.create({
      data: {
        jobId,
        location: 'voice-note',
        type: 'VOICE',
        value: 0, // Not applicable for voice notes
        notes: text
      }
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error processing voice note:', error);
    return NextResponse.json(
      { error: 'Failed to process voice note' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Get voice notes for the job
    const notes = await prisma.moistureReading.findMany({
      where: {
        jobId,
        type: 'VOICE'
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching voice notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voice notes' },
      { status: 500 }
    );
  }
}
