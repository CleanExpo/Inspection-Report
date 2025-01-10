import { NextResponse } from 'next/server';
import { prisma } from '../../../app/lib/prisma';
import { validateEquipment } from '../../moisture/utils/equipmentValidation';

export async function GET() {
  try {
    const equipment = await prisma.equipment.findMany({
      orderBy: {
        lastUsed: 'desc'
      }
    });
    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Failed to fetch equipment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate equipment data
    const validationErrors = validateEquipment(data);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { errors: validationErrors },
        { status: 400 }
      );
    }

    // Check if serial number already exists
    const existing = await prisma.equipment.findUnique({
      where: { serialNumber: data.serialNumber }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Equipment with this serial number already exists' },
        { status: 409 }
      );
    }

    // Create new equipment
    const equipment = await prisma.equipment.create({
      data: {
        serialNumber: data.serialNumber,
        model: data.model,
        type: data.type,
        calibrationDate: new Date(data.calibrationDate),
        nextCalibrationDue: new Date(data.nextCalibrationDue),
        status: data.status
      }
    });

    return NextResponse.json(equipment, { status: 201 });
  } catch (error) {
    console.error('Failed to create equipment:', error);
    return NextResponse.json(
      { error: 'Failed to create equipment' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json(
        { error: 'Equipment ID is required' },
        { status: 400 }
      );
    }

    // Validate equipment data
    const validationErrors = validateEquipment(data);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { errors: validationErrors },
        { status: 400 }
      );
    }

    // Check if equipment exists
    const existing = await prisma.equipment.findUnique({
      where: { id: data.id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      );
    }

    // Update equipment
    const equipment = await prisma.equipment.update({
      where: { id: data.id },
      data: {
        serialNumber: data.serialNumber,
        model: data.model,
        type: data.type,
        calibrationDate: new Date(data.calibrationDate),
        nextCalibrationDue: new Date(data.nextCalibrationDue),
        status: data.status,
        lastUsed: data.lastUsed ? new Date(data.lastUsed) : undefined
      }
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Failed to update equipment:', error);
    return NextResponse.json(
      { error: 'Failed to update equipment' },
      { status: 500 }
    );
  }
}
