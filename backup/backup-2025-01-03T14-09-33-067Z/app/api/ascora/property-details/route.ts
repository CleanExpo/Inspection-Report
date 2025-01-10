import { NextResponse } from 'next/server';

// This would be replaced with actual ASCORA API integration
const mockAscoraData = {
  propertyDetails: {
    insuranceInfo: {
      policies: [
        {
          type: 'Building Insurance',
          policyNumber: 'BLD-123456',
          provider: 'Insurance Co',
          expiryDate: '2024-12-31'
        },
        {
          type: 'Content Insurance',
          policyNumber: 'CNT-789012',
          provider: 'Insurance Co',
          expiryDate: '2024-12-31'
        },
        {
          type: 'Strata Insurance',
          policyNumber: 'STR-345678',
          provider: 'Insurance Co',
          expiryDate: '2024-12-31'
        }
      ]
    },
    propertyType: 'Commercial',
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
  }
};

export async function GET() {
  try {
    // In a real implementation, this would make a call to the ASCORA API
    // const response = await fetch('https://api.ascora.com/property-details', {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.ASCORA_API_KEY}`
    //   }
    // });
    // const data = await response.json();

    // For now, return mock data
    return NextResponse.json(mockAscoraData);
  } catch (error) {
    console.error('Error fetching ASCORA data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property details' },
      { status: 500 }
    );
  }
}
