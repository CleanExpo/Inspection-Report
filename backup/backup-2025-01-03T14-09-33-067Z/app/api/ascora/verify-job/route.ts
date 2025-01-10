import { NextRequest, NextResponse } from 'next/server';
import { ascoraService } from '../../../services/ascoraService';
import type { AscoraError, VerifyJobResponse } from '../../../types/ascora';

export async function POST(request: NextRequest) {
  try {
    const { jobId, bypassCache } = await request.json();

    if (!jobId?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_JOB_ID',
            message: 'Job ID is required',
          },
        } as VerifyJobResponse,
        { status: 400 }
      );
    }

    try {
      const { job, cached } = await ascoraService.verifyJob(jobId, bypassCache);
      
      return NextResponse.json({
        success: true,
        job,
        cached,
      } as VerifyJobResponse);
    } catch (error) {
      const ascoraError = error as AscoraError;
      
      // Handle specific ASCORA API errors
      if (ascoraError.code === 'JOB_NOT_FOUND') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'JOB_NOT_FOUND',
              message: 'The specified job was not found',
            },
          } as VerifyJobResponse,
          { status: 404 }
        );
      }

      if (ascoraError.code === 'INVALID_API_KEY') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'AUTH_ERROR',
              message: 'Failed to authenticate with ASCORA API',
            },
          } as VerifyJobResponse,
          { status: 401 }
        );
      }

      // Handle rate limiting
      if (ascoraError.code === 'RATE_LIMIT_EXCEEDED') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Too many requests. Please try again later.',
            },
          } as VerifyJobResponse,
          { status: 429 }
        );
      }

      // Generic error handling
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ascoraError.code || 'UNKNOWN_ERROR',
            message: ascoraError.message || 'An unexpected error occurred',
          },
        } as VerifyJobResponse,
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing verify-job request:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to process the request',
        },
      } as VerifyJobResponse,
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get('jobId');
  const bypassCache = request.nextUrl.searchParams.get('bypassCache') === 'true';

  if (!jobId?.trim()) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_JOB_ID',
          message: 'Job ID is required',
        },
      } as VerifyJobResponse,
      { status: 400 }
    );
  }

  try {
    const { job, cached } = await ascoraService.verifyJob(jobId, bypassCache);
    
    return NextResponse.json({
      success: true,
      job,
      cached,
    } as VerifyJobResponse);
  } catch (error) {
    const ascoraError = error as AscoraError;
    
    // Handle specific ASCORA API errors
    if (ascoraError.code === 'JOB_NOT_FOUND') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'JOB_NOT_FOUND',
            message: 'The specified job was not found',
          },
        } as VerifyJobResponse,
        { status: 404 }
      );
    }

    if (ascoraError.code === 'INVALID_API_KEY') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH_ERROR',
            message: 'Failed to authenticate with ASCORA API',
          },
        } as VerifyJobResponse,
        { status: 401 }
      );
    }

    // Handle rate limiting
    if (ascoraError.code === 'RATE_LIMIT_EXCEEDED') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
          },
        } as VerifyJobResponse,
        { status: 429 }
      );
    }

    // Generic error handling
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ascoraError.code || 'UNKNOWN_ERROR',
          message: ascoraError.message || 'An unexpected error occurred',
        },
      } as VerifyJobResponse,
      { status: 500 }
    );
  }
}
