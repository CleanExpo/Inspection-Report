import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { 
  AdminDetails, 
  REQUIRED_FIELDS, 
  PHONE_REGEX, 
  SaveDetailsResponse 
} from '../../../types/admin';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const data: AdminDetails = await request.json();

    // Validate required fields
    const missingFields = REQUIRED_FIELDS.filter(field => !data[field]);
    if (missingFields.length > 0) {
      return NextResponse.json<SaveDetailsResponse>(
        { 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!PHONE_REGEX.test(data.phoneNumbers.primary)) {
      return NextResponse.json<SaveDetailsResponse>(
        { 
          error: 'Invalid primary phone number format' 
        },
        { status: 400 }
      );
    }
    if (data.phoneNumbers.other && !PHONE_REGEX.test(data.phoneNumbers.other)) {
      return NextResponse.json<SaveDetailsResponse>(
        { 
          error: 'Invalid other phone number format' 
        },
        { status: 400 }
      );
    }

    // Validate time sequence
    if (data.timeOnSite && data.timeOffSite) {
      const onSiteTime = new Date(`1970-01-01T${data.timeOnSite}`);
      const offSiteTime = new Date(`1970-01-01T${data.timeOffSite}`);
      if (offSiteTime < onSiteTime) {
        return NextResponse.json<SaveDetailsResponse>(
          { 
            error: 'Time off site must be after time on site' 
          },
          { status: 400 }
        );
      }
    }

    // Save to database using Prisma
    const savedDetails = await prisma.adminDetails.create({
      data: {
        contactName: data.contactName,
        email: data.email,
        address: data.address,
        primaryPhone: data.phoneNumbers.primary,
        otherPhone: data.phoneNumbers.other,
        timeOnSite: data.timeOnSite,
        timeOffSite: data.timeOffSite
      }
    });

    // Return success response
    return NextResponse.json<SaveDetailsResponse>({
      message: 'Details saved successfully',
      data: {
        id: savedDetails.id,
        contactName: savedDetails.contactName,
        email: savedDetails.email,
        address: savedDetails.address,
        phoneNumbers: {
          primary: savedDetails.primaryPhone,
          other: savedDetails.otherPhone || undefined
        },
        timeOnSite: savedDetails.timeOnSite || undefined,
        timeOffSite: savedDetails.timeOffSite || undefined
      }
    });

  } catch (error) {
    console.error('Error saving admin details:', error);
    
    // Handle unique constraint violations
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return NextResponse.json<SaveDetailsResponse>(
        {
          error: 'An admin details record with this email already exists'
        },
        { status: 409 }
      );
    }

    return NextResponse.json<SaveDetailsResponse>(
      {
        error: 'Failed to save details'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return method not allowed for GET requests
  return NextResponse.json<SaveDetailsResponse>(
    { 
      error: 'Method not allowed' 
    },
    { status: 405 }
  );
}
