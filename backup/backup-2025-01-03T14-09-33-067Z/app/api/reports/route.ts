import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { BUSINESS_DETAILS } from '../../../utils/constants';

// Validation schemas
const AuthorityFormsSchema = z.object({
  authorityToWork: z.boolean(),
  authorityToDrill: z.boolean(),
  authorityToDispose: z.boolean(),
  workScope: z.string(),
  drillLocations: z.string().optional(),
  disposalDetails: z.string().optional(),
  clientSignature: z.string(),
  dateGranted: z.string(),
  specialConditions: z.string().optional()
});

const PowerDetailsSchema = z.object({
  circuits: z.number().min(1),
  amperage: z.number().min(0),
  totalUsage: z.number().optional()
});

const SanitisationSchema = z.object({
  chemicalsUsed: z.array(z.string()),
  areasSanitised: z.array(z.string()),
  validated: z.boolean()
});

const ExtractionSchema = z.object({
  occurred: z.boolean(),
  details: z.string()
});

const SafetyDocumentsSchema = z.object({
  JSA: z.string(),
  SWMS: z.string()
});

const ReportSchema = z.object({
  jobDetails: z.object({
    jobNumber: z.string(),
    claimDate: z.string(),
    jobSupplier: z.string(),
    timeReceived: z.string().optional(),
    orderNumber: z.string().optional(),
    timeContacted: z.string().optional()
  }),
  authorityForms: AuthorityFormsSchema,
  powerDetails: PowerDetailsSchema,
  sanitisation: SanitisationSchema,
  extraction: ExtractionSchema,
  safetyDocuments: SafetyDocumentsSchema,
  furtherWorks: z.string().optional(),
  clientInfo: z.object({
    clientName: z.string(),
    propertyAddress: z.string(),
    contactPhone: z.string(),
    emailAddress: z.string().email()
  }),
  businessInfo: z.object({
    name: z.literal(BUSINESS_DETAILS.name),
    address: z.literal(BUSINESS_DETAILS.address),
    phone: z.literal(BUSINESS_DETAILS.phone),
    email: z.literal(BUSINESS_DETAILS.email),
    abn: z.literal(BUSINESS_DETAILS.abn),
    iicrcNumber: z.literal(BUSINESS_DETAILS.iicrcNumber)
  }),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

type Report = z.infer<typeof ReportSchema>;

interface ValidationError {
  path: string;
  message: string;
}

const formatValidationErrors = (error: z.ZodError): ValidationError[] => {
  return error.errors.map(err => ({
    path: err.path.map(p => p.toString()).join('.'),
    message: err.message
  }));
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body against schema
    const validatedData = ReportSchema.parse({
      ...body,
      businessInfo: BUSINESS_DETAILS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Here you would typically:
    // 1. Save to database
    // 2. Generate PDF
    // 3. Send notifications
    // 4. Update CRM
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      message: 'Report saved successfully',
      data: {
        jobNumber: validatedData.jobDetails.jobNumber,
        timestamp: validatedData.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Report creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: formatValidationErrors(error)
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

interface QueryParams {
  jobNumber?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params: QueryParams = {
      jobNumber: searchParams.get('jobNumber'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate')
    };

    // Here you would typically:
    // 1. Query database based on parameters
    // 2. Apply filters
    // 3. Format response
    // For now, we'll return a mock response

    return NextResponse.json({
      success: true,
      message: 'Reports retrieved successfully',
      data: {
        filters: params,
        // Mock data - replace with actual database query
        reports: []
      }
    });

  } catch (error) {
    console.error('Report retrieval error:', error);

    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const jobNumber = searchParams.get('jobNumber');

    if (!jobNumber) {
      return NextResponse.json({
        success: false,
        message: 'Job number is required'
      }, { status: 400 });
    }

    // Validate request body against schema
    const validatedData = ReportSchema.parse({
      ...body,
      businessInfo: BUSINESS_DETAILS,
      updatedAt: new Date().toISOString()
    });

    // Here you would typically:
    // 1. Update database
    // 2. Regenerate PDF if needed
    // 3. Send notifications
    // 4. Update CRM
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      message: 'Report updated successfully',
      data: {
        jobNumber: validatedData.jobDetails.jobNumber,
        timestamp: validatedData.updatedAt
      }
    });

  } catch (error) {
    console.error('Report update error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: formatValidationErrors(error)
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobNumber = searchParams.get('jobNumber');

    if (!jobNumber) {
      return NextResponse.json({
        success: false,
        message: 'Job number is required'
      }, { status: 400 });
    }

    // Here you would typically:
    // 1. Delete from database
    // 2. Remove associated files
    // 3. Update CRM
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
      data: {
        jobNumber,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Report deletion error:', error);

    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
