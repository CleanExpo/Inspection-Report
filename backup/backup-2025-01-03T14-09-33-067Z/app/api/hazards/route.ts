import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';
import { AuthService } from '../../../services/authService';
import { AuthError } from '../../../utils/errors';

const prisma = new PrismaClient();

export async function POST(request: Request) {
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
    
    // Verify token and get user info
    const user = await AuthService.verifyToken(token);
    
    // Validate user has permission to create hazard assessments
    const hasPermission = await AuthService.validateRole(user.userId, 'TECHNICIAN');
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create hazard assessment' },
        { status: 403 }
      );
    }

    const { jobNumber, materials, notes, recommendations } = await request.json();

    // First check if the job exists
    const job = await prisma.job.findUnique({
      where: { jobNumber }
    });

    if (!job) {
      return NextResponse.json(
        { error: `Job with number ${jobNumber} not found` },
        { status: 404 }
      );
    }

    // Create the assessment
    const assessment = await prisma.hazardAssessment.create({
      data: {
        job: {
          connect: {
            jobNumber
          }
        },
        materials: JSON.stringify(materials),
        assessmentDate: new Date().toISOString(),
        assessedBy: user.email, // Using authenticated user's email
        status: 'draft',
        notes: notes || '',
        recommendations: JSON.stringify(recommendations || []),
        photos: JSON.stringify([])
      }
    });

    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Error in hazard assessment route:', error);
    
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create hazard assessment' },
      { status: 500 }
    );
  }
}
