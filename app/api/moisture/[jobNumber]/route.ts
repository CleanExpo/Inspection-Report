import { NextRequest, NextResponse } from 'next/server';
import { 
    getMoistureData, 
    createMoistureData, 
    updateMoistureData 
} from '../../../../services/moistureService';
import { 
    JobPriority, 
    JobCategory,
    ReadingConfidence,
    EquipmentOperationalStatus 
} from '../../../types/moisture';

const validateJobNumber = (jobNumber: string): boolean => {
    const jobNumberRegex = /^\d{4}-\d{4}-\d{3}$/;
    return jobNumberRegex.test(jobNumber);
};

const validateReading = (reading: any): boolean => {
    if (typeof reading.value !== 'number') return false;
    if (reading.location && (
        typeof reading.location.x !== 'number' ||
        typeof reading.location.y !== 'number'
    )) return false;
    if (reading.confidence && !['high', 'medium', 'low', 'uncertain'].includes(reading.confidence)) return false;
    return true;
};

const validateEquipment = (equipment: any): boolean => {
    if (!equipment.type || !['dehumidifier', 'fan', 'air_mover', 'heater'].includes(equipment.type)) return false;
    if (equipment.operationalStatus && 
        !['operational', 'maintenance_needed', 'under_maintenance', 'out_of_service'].includes(equipment.operationalStatus)) return false;
    return true;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { jobNumber: string } }
) {
  try {
    if (!params?.jobNumber) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }
    const data = await getMoistureData(params.jobNumber);

    if (!data) {
      return NextResponse.json(
        { error: 'Moisture data not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in GET:', error.message || String(error));
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { jobNumber: string } }
) {
    try {
        const { jobNumber } = params;
        if (!jobNumber || !validateJobNumber(jobNumber)) {
            return NextResponse.json(
                { error: 'Invalid job number format. Expected: YYYY-MMDD-XXX' },
                { status: 400 }
            );
        }

        const data = await request.json();
        
        // Validate priority and category if provided
        if (data.priority && !['low', 'medium', 'high', 'urgent'].includes(data.priority)) {
            return NextResponse.json(
                { error: 'Invalid priority value' },
                { status: 400 }
            );
        }
        
        if (data.category && !['water_damage', 'flood', 'leak', 'storm_damage', 'other'].includes(data.category)) {
            return NextResponse.json(
                { error: 'Invalid category value' },
                { status: 400 }
            );
        }

        // Check if moisture data already exists
        const existingData = await getMoistureData(jobNumber);
        if (existingData) {
            return NextResponse.json(
                { error: 'Moisture data already exists for this job' },
                { status: 409 }
            );
        }

        const result = await createMoistureData({
            jobNumber,
            ...data
        });

        return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST:', error.message || String(error));
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { jobNumber: string } }
) {
    try {
        const { jobNumber } = params;
        if (!jobNumber || !validateJobNumber(jobNumber)) {
            return NextResponse.json(
                { error: 'Invalid job number format' },
                { status: 400 }
            );
        }

        const data = await request.json();
        
        // Validate readings if provided
        if (data.readings?.length) {
            for (const reading of data.readings) {
                if (!validateReading(reading)) {
                    return NextResponse.json(
                        { error: 'Invalid reading data format' },
                        { status: 400 }
                    );
                }
            }
        }

        // Validate equipment if provided
        if (data.equipment?.length) {
            for (const equipment of data.equipment) {
                if (!validateEquipment(equipment)) {
                    return NextResponse.json(
                        { error: 'Invalid equipment data format' },
                        { status: 400 }
                    );
                }
            }
        }

        // Verify the moisture data exists before updating
        const existingData = await getMoistureData(jobNumber);
        if (!existingData) {
            return NextResponse.json(
                { error: 'Moisture data not found' },
                { status: 404 }
            );
        }

        const result = await updateMoistureData(jobNumber, data);
        return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in PATCH:', error.message || String(error));
    
    // Handle specific error cases
    if (error.message === 'Moisture data not found') {
      return NextResponse.json(
        { error: 'Moisture data not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
