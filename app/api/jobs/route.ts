import { NextResponse } from 'next/server';
import { 
    JobCreateRequest, 
    JobCreateResponse, 
    JobListResponse,
    JobUpdateRequest,
    JobUpdateResponse,
    JobDeleteResponse
} from '../../types/api';
import { 
    generateJobNumber, 
    validateJobStatus, 
    validateJobPriority, 
    validateJobCategory,
    JobValidationError
} from '../../utils/jobValidation';
import { ClientService } from '../../services/clientService';
import { JobService, JobServiceError } from '../../services/jobService';

/**
 * POST /api/jobs
 * Creates a new job
 */
export async function POST(request: Request) {
    try {
        // Parse request body
        const body = await request.json() as JobCreateRequest;
        
        // Basic request validation
        if (!body.clientId || !body.category) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Missing required fields',
                    errors: [
                        { field: 'clientId', message: 'Client ID is required' },
                        { field: 'category', message: 'Job category is required' }
                    ]
                } as JobCreateResponse,
                { status: 400 }
            );
        }
        
        // Validate client exists
        try {
            const clientExists = await ClientService.exists(body.clientId);
            if (!clientExists) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Client not found',
                        errors: [{ field: 'clientId', message: 'Invalid client ID' }]
                    } as JobCreateResponse,
                    { status: 400 }
                );
            }
        } catch (error) {
            console.error('Client validation error:', error);
            return NextResponse.json(
                {
                    success: false,
                    message: 'Failed to validate client',
                    errors: [{ field: 'clientId', message: 'Client validation failed' }]
                } as JobCreateResponse,
                { status: 500 }
            );
        }

        // Validate job fields
        try {
            validateJobCategory(body.category);
            if (body.status) validateJobStatus(body.status);
            if (body.priority) validateJobPriority(body.priority);
        } catch (error) {
            if (error instanceof JobValidationError) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Validation failed',
                        errors: [{ field: 'general', message: error.message }]
                    } as JobCreateResponse,
                    { status: 400 }
                );
            }
            throw error;
        }

        // Generate job number
        const jobNumber = generateJobNumber(body.sequence);

        // Create job in database
        try {
            await JobService.createJob({
                jobNumber,
                clientId: body.clientId,
                status: body.status,
                priority: body.priority,
                category: body.category,
                description: body.description
            });

            return NextResponse.json({
                success: true,
                message: 'Job created successfully',
                jobNumber
            } as JobCreateResponse);
        } catch (error) {
            if (error instanceof JobServiceError) {
                return NextResponse.json(
                    {
                        success: false,
                        message: error.message,
                        errors: [{ field: 'general', message: error.message }]
                    } as JobCreateResponse,
                    { status: 400 }
                );
            }
            throw error;
        }

    } catch (error) {
        console.error('Job creation error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
                errors: [{ field: 'general', message: 'Failed to process request' }]
            } as JobCreateResponse,
            { status: 500 }
        );
    }
}

/**
 * GET /api/jobs
 * Lists jobs with pagination and optional client filtering
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const clientId = searchParams.get('clientId') || undefined;

        // Validate pagination params
        if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid pagination parameters',
                    errors: [{ field: 'pagination', message: 'Page and limit must be positive numbers' }]
                } as JobListResponse,
                { status: 400 }
            );
        }

        // Get jobs from database
        try {
            const { jobs, total } = await JobService.listJobs(page, limit, clientId);

            // Format response
            const formattedJobs = jobs.map(job => ({
                jobNumber: job.jobNumber,
                clientId: job.clientId,
                status: job.status,
                priority: job.priority,
                category: job.category,
                description: job.description,
                createdAt: job.createdAt.toISOString()
            }));

            return NextResponse.json({
                success: true,
                message: 'Jobs retrieved successfully',
                jobs: formattedJobs,
                total,
                page,
                limit
            } as JobListResponse);

        } catch (error) {
            if (error instanceof JobServiceError) {
                return NextResponse.json(
                    {
                        success: false,
                        message: error.message,
                        errors: [{ field: 'general', message: error.message }]
                    } as JobListResponse,
                    { status: 400 }
                );
            }
            throw error;
        }

    } catch (error) {
        console.error('Job listing error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
                errors: [{ field: 'general', message: 'Failed to process request' }]
            } as JobListResponse,
            { status: 500 }
        );
    }
}

/**
 * PUT /api/jobs/:jobNumber
 * Updates an existing job
 */
export async function PUT(request: Request) {
    try {
        // Extract job number from URL
        const jobNumber = request.url.split('/').pop();
        if (!jobNumber) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Missing job number',
                    errors: [{ field: 'jobNumber', message: 'Job number is required' }]
                } as JobUpdateResponse,
                { status: 400 }
            );
        }

        // Parse request body
        const body = await request.json() as JobUpdateRequest;

        // Validate job exists
        try {
            const jobExists = await JobService.exists(jobNumber);
            if (!jobExists) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Job not found',
                        errors: [{ field: 'jobNumber', message: 'Invalid job number' }]
                    } as JobUpdateResponse,
                    { status: 404 }
                );
            }
        } catch (error) {
            console.error('Job validation error:', error);
            return NextResponse.json(
                {
                    success: false,
                    message: 'Failed to validate job',
                    errors: [{ field: 'jobNumber', message: 'Job validation failed' }]
                } as JobUpdateResponse,
                { status: 500 }
            );
        }

        // Validate job fields
        try {
            if (body.category) validateJobCategory(body.category);
            if (body.status) validateJobStatus(body.status);
            if (body.priority) validateJobPriority(body.priority);
        } catch (error) {
            if (error instanceof JobValidationError) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Validation failed',
                        errors: [{ field: 'general', message: error.message }]
                    } as JobUpdateResponse,
                    { status: 400 }
                );
            }
            throw error;
        }

        // Update job in database
        try {
            await JobService.updateJob(jobNumber, {
                status: body.status,
                priority: body.priority,
                category: body.category,
                description: body.description
            });

            return NextResponse.json({
                success: true,
                message: 'Job updated successfully',
                jobNumber
            } as JobUpdateResponse);
        } catch (error) {
            if (error instanceof JobServiceError) {
                return NextResponse.json(
                    {
                        success: false,
                        message: error.message,
                        errors: [{ field: 'general', message: error.message }]
                    } as JobUpdateResponse,
                    { status: 400 }
                );
            }
            throw error;
        }

    } catch (error) {
        console.error('Job update error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
                errors: [{ field: 'general', message: 'Failed to process request' }]
            } as JobUpdateResponse,
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/jobs/:jobNumber
 * Deletes a job
 */
export async function DELETE(request: Request) {
    try {
        // Extract job number from URL
        const jobNumber = request.url.split('/').pop();
        if (!jobNumber) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Missing job number',
                    errors: [{ field: 'jobNumber', message: 'Job number is required' }]
                } as JobDeleteResponse,
                { status: 400 }
            );
        }

        // Validate job exists
        try {
            const jobExists = await JobService.exists(jobNumber);
            if (!jobExists) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Job not found',
                        errors: [{ field: 'jobNumber', message: 'Invalid job number' }]
                    } as JobDeleteResponse,
                    { status: 404 }
                );
            }
        } catch (error) {
            console.error('Job validation error:', error);
            return NextResponse.json(
                {
                    success: false,
                    message: 'Failed to validate job',
                    errors: [{ field: 'general', message: 'Failed to process request' }]
                } as JobDeleteResponse,
                { status: 500 }
            );
        }

        // Delete job
        try {
            await JobService.deleteJob(jobNumber);

            return NextResponse.json({
                success: true,
                message: 'Job deleted successfully',
                jobNumber
            } as JobDeleteResponse);
        } catch (error) {
            console.error('Job deletion error:', error);
            return NextResponse.json(
                {
                    success: false,
                    message: 'Internal server error',
                    errors: [{ field: 'general', message: 'Failed to process request' }]
                } as JobDeleteResponse,
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Job deletion error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
                errors: [{ field: 'general', message: 'Failed to process request' }]
            } as JobDeleteResponse,
            { status: 500 }
        );
    }
}
