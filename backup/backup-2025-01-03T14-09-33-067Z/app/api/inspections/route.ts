import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface InsuranceData {
  selectedTypes: string[];
  policyNumbers: Record<string, string>;
}

interface JobDetails {
  propertyType: string;
  property: {
    address: {
      street: string;
      suburb: string;
      state: string;
      postcode: string;
    };
    buildingDetails: {
      yearBuilt: string;
      totalFloors?: number;
      totalUnits?: number;
      constructionType: string;
      lastInspectionDate: string;
    };
  };
  insurance: {
    policies: Array<{
      type: string;
      policyNumber: string;
      provider: string;
      expiryDate: string;
    }>;
  };
}

interface InspectionRequest {
  templateId: string;
  jobNumber: string;
  insuranceData: InsuranceData;
  jobDetails: JobDetails;
}

export async function POST(request: Request) {
  try {
    const body: InspectionRequest = await request.json();
    const { templateId, jobNumber, insuranceData, jobDetails } = body;

    // Create inspection with related records in a transaction
    const newInspection = await prisma.$transaction(async () => {
      // Create the inspection
      const inspection = await prisma.inspection.create({
        data: {
          jobNumber,
          templateId,
          status: 'draft',
          autoPopulatedFields: JSON.stringify({
            insurance: true,
            propertyDetails: Boolean(jobDetails?.property),
            buildingDetails: Boolean(jobDetails?.property?.buildingDetails)
          }),
          requiredInputFields: JSON.stringify([]),
          // Create property details
          propertyDetails: {
            create: {
              propertyType: jobDetails.propertyType,
              street: jobDetails.property.address.street,
              suburb: jobDetails.property.address.suburb,
              state: jobDetails.property.address.state,
              postcode: jobDetails.property.address.postcode,
              yearBuilt: jobDetails.property.buildingDetails.yearBuilt,
              totalFloors: jobDetails.property.buildingDetails.totalFloors || null,
              totalUnits: jobDetails.property.buildingDetails.totalUnits || null,
              constructionType: jobDetails.property.buildingDetails.constructionType,
              lastInspectionDate: jobDetails.property.buildingDetails.lastInspectionDate 
                ? new Date(jobDetails.property.buildingDetails.lastInspectionDate)
                : null
            }
          },
          // Create insurance policies
          insurancePolicies: {
            create: insuranceData.selectedTypes.map(type => {
              const policy = jobDetails.insurance.policies.find(p => p.type === type);
              if (!policy) {
                throw new Error(`Policy not found for type: ${type}`);
              }
              return {
                type: policy.type,
                policyNumber: insuranceData.policyNumbers[type],
                provider: policy.provider,
                expiryDate: new Date(policy.expiryDate),
                verified: true
              };
            })
          }
        },
        include: {
          propertyDetails: true,
          insurancePolicies: true
        }
      });

      // Get template sections
      const templateSections = await prisma.section.findMany({
        where: { templateId }
      });

      // Create inspection sections
      await prisma.inspectionSection.createMany({
        data: templateSections.map((section: { id: string }) => ({
          inspectionId: inspection.id,
          sectionId: section.id,
          completed: false,
          sectionData: JSON.stringify({})
        }))
      });

      // Fetch complete inspection with all relations
      const completeInspection = await prisma.inspection.findUnique({
        where: { id: inspection.id },
        include: {
          propertyDetails: true,
          insurancePolicies: true,
          sections: {
            include: {
              section: true
            }
          }
        }
      });

      if (!completeInspection) {
        throw new Error('Failed to create inspection');
      }

      return completeInspection;
    });

    return NextResponse.json(newInspection);
  } catch (error) {
    console.error('Error creating inspection:', error);
    return NextResponse.json(
      { error: 'Failed to create inspection' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const inspections = await prisma.inspection.findMany({
      include: {
        propertyDetails: true,
        insurancePolicies: true,
        sections: {
          include: {
            section: true
          }
        }
      }
    });

    return NextResponse.json(inspections);
  } catch (error) {
    console.error('Error fetching inspections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inspections' },
      { status: 500 }
    );
  }
}
