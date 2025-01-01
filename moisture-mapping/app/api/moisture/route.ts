import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { MoistureReading } from '../../../types/moisture';

// In-memory storage for development
let moistureReadings: MoistureReading[] = [];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(moistureReadings);
  } catch (error) {
    console.error('Error fetching moisture readings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch moisture readings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const reading = await request.json();
    
    // Validate reading
    if (!reading.id || !reading.value || !reading.location || !reading.materialType) {
      return NextResponse.json(
        { error: 'Invalid reading data' },
        { status: 400 }
      );
    }

    // Add reading
    moistureReadings.push(reading);

    return NextResponse.json(reading);
  } catch (error) {
    console.error('Error saving moisture reading:', error);
    return NextResponse.json(
      { error: 'Failed to save moisture reading' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Reading ID is required' },
        { status: 400 }
      );
    }

    // Remove reading
    moistureReadings = moistureReadings.filter(reading => reading.id !== id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting moisture reading:', error);
    return NextResponse.json(
      { error: 'Failed to delete moisture reading' },
      { status: 500 }
    );
  }
}
