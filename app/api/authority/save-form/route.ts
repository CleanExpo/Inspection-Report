import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AuthorityFormData, validateAuthorityForm } from '@/types/authority';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data) {
      return NextResponse.json(
        { error: 'No data provided' },
        { status: 400 }
      );
    }

    // Validate form data
    const validation = validateAuthorityForm(data);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          errors: validation.errors
        },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Save the form data to your database
    // 2. Generate any necessary documents
    // 3. Send notifications if needed

    // For now, just log the data
    console.log('Authority form saved:', data);

    return NextResponse.json({
      success: true,
      message: 'Authority form saved successfully'
    });

  } catch (error) {
    console.error('Error saving authority form:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save authority form',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const jobNumber = searchParams.get('jobNumber');

  if (!jobNumber) {
    return NextResponse.json(
      { error: 'Job number is required' },
      { status: 400 }
    );
  }

  try {
    // Here you would typically:
    // 1. Query your database for the form data
    // 2. Transform the data if needed
    // 3. Handle any business logic

    // For now, return mock data
    const mockData: AuthorityFormData = {
      jobNumber,
      clientName: 'John Doe',
      propertyAddress: '123 Main St, City',
      authorizedBy: 'Jane Smith',
      authorizedDate: new Date().toISOString().split('T')[0],
      scope: 'Initial water damage restoration',
      conditions: 'Work to be completed during business hours'
    };

    return NextResponse.json({
      success: true,
      data: mockData
    });

  } catch (error) {
    console.error('Error fetching authority form:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch authority form',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
