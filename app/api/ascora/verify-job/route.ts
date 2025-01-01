import { NextRequest, NextResponse } from 'next/server';

// Mock ASCORA job data - in real implementation, this would come from ASCORA API
const mockJobs = {
  'ASC-2024-001': {
    jobNumber: 'ASC-2024-001',
    status: 'active',
    propertyType: 'Commercial',
    client: {
      name: 'ABC Corporation',
      contact: 'John Smith',
      phone: '0412 345 678',
      email: 'john.smith@abc.com'
    },
    property: {
      address: {
        street: '123 Business St',
        suburb: 'Melbourne',
        state: 'VIC',
        postcode: '3000'
      },
      buildingDetails: {
        yearBuilt: '2010',
        totalFloors: 5,
        totalUnits: 20,
        constructionType: 'Concrete',
        lastInspectionDate: '2023-06-15'
      }
    },
    insurance: {
      policies: [
        {
          type: 'Strata Insurance',
          policyNumber: 'STR-345678',
          provider: 'Insurance Co',
          expiryDate: '2024-12-31'
        },
        {
          type: 'Content Insurance',
          policyNumber: 'CNT-789012',
          provider: 'Insurance Co',
          expiryDate: '2024-12-31'
        }
      ]
    }
  },
  'ASC-2024-002': {
    jobNumber: 'ASC-2024-002',
    status: 'active',
    propertyType: 'Residential',
    client: {
      name: 'Jane Doe',
      phone: '0423 456 789',
      email: 'jane.doe@email.com'
    },
    property: {
      address: {
        street: '45 Residential Ave',
        suburb: 'Richmond',
        state: 'VIC',
        postcode: '3121'
      },
      buildingDetails: {
        yearBuilt: '2015',
        constructionType: 'Brick Veneer',
        lastInspectionDate: '2023-09-20'
      }
    },
    insurance: {
      policies: [
        {
          type: 'Building Insurance',
          policyNumber: 'BLD-123456',
          provider: 'Insurance Co',
          expiryDate: '2024-12-31'
        },
        {
          type: 'Content Insurance',
          policyNumber: 'CNT-654321',
          provider: 'Insurance Co',
          expiryDate: '2024-12-31'
        }
      ]
    }
  }
};

export async function GET(request: NextRequest) {
  try {
    const jobNumber = request.nextUrl.searchParams.get('number');

    if (!jobNumber) {
      return NextResponse.json(
        { error: 'Job number is required' },
        { status: 400 }
      );
    }

    // Add artificial delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real implementation, this would verify the job number with ASCORA API
    // const response = await fetch(`https://api.ascora.com/jobs/${jobNumber}`);
    // const data = await response.json();

    // For now, check against mock data
    const jobDetails = mockJobs[jobNumber as keyof typeof mockJobs];

    if (!jobDetails) {
      return NextResponse.json(
        { error: 'Invalid job number' },
        { status: 404 }
      );
    }

    if (jobDetails.status !== 'active') {
      return NextResponse.json(
        { error: 'Job is not active' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      verified: true,
      jobDetails
    });
  } catch (error) {
    console.error('Error verifying job:', error);
    return NextResponse.json(
      { error: 'Failed to verify job number' },
      { status: 500 }
    );
  }
}
