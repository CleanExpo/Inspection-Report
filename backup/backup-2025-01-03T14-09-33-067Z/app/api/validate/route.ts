import { NextResponse } from 'next/server';
import { JobValidationRequest, JobValidationResponse } from '../../types/api';

/**
 * Validates a job number format: YYYY-MMDD-SSS
 * Where:
 * - YYYY is the current year
 * - MM is month (01-12)
 * - DD is day (01-31)
 * - SSS is sequence (001-999)
 */
function validateJobNumber(jobNumber: string): { isValid: boolean; error?: string } {
    // Basic format check
    const formatRegex = /^\d{4}-\d{4}-\d{3}$/;
    if (!formatRegex.test(jobNumber)) {
        return {
            isValid: false,
            error: 'Invalid job number format. Expected: YYYY-MMDD-SSS'
        };
    }

    // Extract components
    const [yearStr, dateStr, seqStr] = jobNumber.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(dateStr.substring(0, 2));
    const day = parseInt(dateStr.substring(2));
    const sequence = parseInt(seqStr);

    // Validate year
    const currentYear = new Date().getFullYear();
    if (year !== currentYear) {
        return {
            isValid: false,
            error: `Invalid year. Must be current year (${currentYear})`
        };
    }

    // Validate month
    if (month < 1 || month > 12) {
        return {
            isValid: false,
            error: 'Invalid month. Must be between 01 and 12'
        };
    }

    // Validate day
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) {
        return {
            isValid: false,
            error: `Invalid day. Must be between 01 and ${daysInMonth} for month ${month}`
        };
    }

    // Validate sequence
    if (sequence < 1 || sequence > 999) {
        return {
            isValid: false,
            error: 'Invalid sequence number. Must be between 001 and 999'
        };
    }

    return { isValid: true };
}

/**
 * POST /api/validate
 * Validates a job number format
 */
export async function POST(request: Request) {
    try {
        // Parse request body
        const body = await request.json() as JobValidationRequest;

        // Check for required field
        if (!body.jobNumber) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Missing job number',
                    isValid: false,
                    errors: [
                        { field: 'jobNumber', message: 'Job number is required' }
                    ]
                } as JobValidationResponse,
                { status: 400 }
            );
        }

        // Validate job number format
        const validation = validateJobNumber(body.jobNumber);

        if (!validation.isValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid job number',
                    isValid: false,
                    errors: [
                        { field: 'jobNumber', message: validation.error || 'Invalid format' }
                    ]
                } as JobValidationResponse,
                { status: 400 }
            );
        }

        // Return success response
        return NextResponse.json({
            success: true,
            message: 'Job number is valid',
            isValid: true
        } as JobValidationResponse);

    } catch (error) {
        console.error('Job validation error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to validate job number',
                isValid: false,
                errors: [
                    { field: 'general', message: 'Failed to process request' }
                ]
            } as JobValidationResponse,
            { status: 500 }
        );
    }
}
