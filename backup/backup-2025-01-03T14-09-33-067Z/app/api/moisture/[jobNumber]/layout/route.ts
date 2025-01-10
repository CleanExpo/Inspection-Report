import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';
import { AuthService } from '../../../../../services/authService';
import { AuthError } from '../../../../../utils/errors';
import { RoomLayout } from '../../../../../services/roomLayoutService';

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
        { error: 'Insufficient permissions to update layout' },
        { status: 403 }
      );
    }

    // Get the layout data from request body
    const layout: RoomLayout = await request.json();

    // Update the layout in the database
    await prisma.moistureData.update({
      where: {
        jobNumber: params.jobNumber
      },
      data: {
        floorPlan: JSON.stringify(layout)
      }
    });

    return NextResponse.json({ message: 'Layout updated successfully' });
  } catch (error) {
    console.error('Error updating layout:', error);
    
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update layout' },
      { status: 500 }
    );
  }
}
