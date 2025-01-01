import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';
import { AuthService } from '../../../../../services/authService';
import { AuthError } from '../../../../../utils/errors';
import { MoistureHistory } from '../../../../../types/moisture';

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
        { error: 'Insufficient permissions to update history' },
        { status: 403 }
      );
    }

    // Get the history data from request body
    const history: MoistureHistory = await request.json();

    if (!history || !history.readings || !history.timestamps) {
      return NextResponse.json(
        { error: 'Invalid history data format' },
        { status: 400 }
      );
    }

    // Start a transaction to handle multiple history entries
    await prisma.$transaction(async (tx) => {
      // Create a version record for the historical data
      await tx.moistureDataVersion.create({
        data: {
          jobNumber: params.jobNumber,
          data: JSON.stringify({
            readings: history.readings,
            timestamps: history.timestamps
          }),
          metadata: JSON.stringify({
            type: 'import',
            source: 'file_import',
            importedBy: user.email,
            importedAt: new Date().toISOString()
          })
        }
      });
    });

    return NextResponse.json({ message: 'History imported successfully' });
  } catch (error) {
    console.error('Error importing history:', error);
    
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to import history' },
      { status: 500 }
    );
  }
}
