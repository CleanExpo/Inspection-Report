import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const floorPlans = await prisma.floorPlan.findMany({
      where: { jobId },
      include: {
        annotations: true,
        readings: {
          include: {
            dataPoints: true
          }
        }
      },
      orderBy: {
        level: 'asc'
      }
    });

    return NextResponse.json(floorPlans);
  } catch (error) {
    console.error('Error fetching floor plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch floor plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, name, level, imageUrl, width, height, scale } = body;

    if (!jobId || !name || level === undefined || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const floorPlan = await prisma.floorPlan.create({
      data: {
        jobId,
        name,
        level,
        imageUrl,
        width: width || 0,
        height: height || 0,
        scale: scale || 1,
      },
      include: {
        annotations: true,
        readings: {
          include: {
            dataPoints: true
          }
        }
      }
    });

    return NextResponse.json(floorPlan);
  } catch (error) {
    console.error('Error creating floor plan:', error);
    return NextResponse.json(
      { error: 'Failed to create floor plan' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Floor plan ID is required' },
        { status: 400 }
      );
    }

    const { name, level, imageUrl, width, height, scale } = body;

    const floorPlan = await prisma.floorPlan.update({
      where: { id },
      data: {
        name,
        level,
        imageUrl,
        width,
        height,
        scale,
      },
      include: {
        annotations: true,
        readings: {
          include: {
            dataPoints: true
          }
        }
      }
    });

    return NextResponse.json(floorPlan);
  } catch (error) {
    console.error('Error updating floor plan:', error);
    return NextResponse.json(
      { error: 'Failed to update floor plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Floor plan ID is required' },
        { status: 400 }
      );
    }

    await prisma.floorPlan.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting floor plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete floor plan' },
      { status: 500 }
    );
  }
}

// API endpoint for managing annotations and readings
export async function PATCH(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const body = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'add-annotation': {
        const { floorPlanId, type, content, x, y, width, height, rotation, color } = body;

        const annotation = await prisma.annotation.create({
          data: {
            floorPlanId,
            type,
            content,
            x,
            y,
            width,
            height,
            rotation,
            color
          }
        });

        return NextResponse.json(annotation);
      }

      case 'update-annotation': {
        const { id, ...updates } = body;

        const annotation = await prisma.annotation.update({
          where: { id },
          data: updates
        });

        return NextResponse.json(annotation);
      }

      case 'delete-annotation': {
        const { id } = body;

        await prisma.annotation.delete({
          where: { id }
        });

        return NextResponse.json({ success: true });
      }

      case 'add-reading': {
        const { jobId, floorPlanId, room, floor, equipment, locationX, locationY, dataPoints } = body;

        const reading = await prisma.moistureReading.create({
          data: {
            jobId,
            floorPlanId,
            room,
            floor,
            equipment,
            locationX,
            locationY,
            dataPoints: {
              create: dataPoints.map((dp: { value: number; unit: string }) => ({
                value: dp.value,
                unit: dp.unit
              }))
            }
          },
          include: {
            dataPoints: true
          }
        });

        return NextResponse.json(reading);
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
