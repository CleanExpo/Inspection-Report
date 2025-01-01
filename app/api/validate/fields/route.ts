import { NextResponse } from 'next/server';
import { JobFieldsValidationRequest, JobFieldsValidationResponse } from '../../../types/api';
import { JobStatus, JobPriority, JOB_STATUSES, JOB_PRIORITIES } from '../../../types/client';
import { validateJobCategory } from '../../../utils/jobValidation';

const MAX_DESCRIPTION_LENGTH = 1000;

/**
 * Validates job status enum
 */
function validateStatus(status: any): { isValid: boolean; error?: string } {
    if (!status) return { isValid: true };
    if (typeof status !== 'string') {
        return { isValid: false, error: 'Status must be a string' };
    }
    if (!JOB_STATUSES.includes(status as JobStatus)) {
        return { isValid: false, error: 'Invalid status value' };
    }
    return { isValid: true };
}

/**
 * Validates job priority enum
 */
function validatePriority(priority: any): { isValid: boolean; error?: string } {
    if (!priority) return { isValid: true };
    if (typeof priority !== 'string') {
        return { isValid: false, error: 'Priority must be a string' };
    }
    if (!JOB_PRIORITIES.includes(priority as JobPriority)) {
        return { isValid: false, error: 'Invalid priority value' };
    }
    return { isValid: true };
}

/**
 * Validates job description
 */
function validateDescription(description: any): { isValid: boolean; error?: string } {
    if (!description) return { isValid: true };
    if (typeof description !== 'string') {
        return { isValid: false, error: 'Description must be a string' };
    }
    if (description.trim().length === 0) {
        return { isValid: false, error: 'Description cannot be empty' };
    }
    if (description.length > MAX_DESCRIPTION_LENGTH) {
        return { isValid: false, error: `Description too long (max ${MAX_DESCRIPTION_LENGTH} characters)` };
    }
    return { isValid: true };
}

/**
 * POST /api/validate/fields
 * Validates job fields
 */
export async function POST(request: Request) {
    try {
        // Parse request body
        const body = await request.json() as JobFieldsValidationRequest;

        // Check if any fields to validate
        if (Object.keys(body).length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'No fields to validate',
                    isValid: false,
                    errors: [
                        { field: 'general', message: 'No fields to validate' }
                    ]
                } as JobFieldsValidationResponse,
                { status: 400 }
            );
        }

        // Validate each field
        const errors: { field: string; message: string }[] = [];
        const validatedFields: { [key: string]: boolean } = {};

        // Status validation
        if ('status' in body) {
            const statusValidation = validateStatus(body.status);
            validatedFields.status = statusValidation.isValid;
            if (!statusValidation.isValid) {
                errors.push({ field: 'status', message: statusValidation.error! });
            }
        }

        // Priority validation
        if ('priority' in body) {
            const priorityValidation = validatePriority(body.priority);
            validatedFields.priority = priorityValidation.isValid;
            if (!priorityValidation.isValid) {
                errors.push({ field: 'priority', message: priorityValidation.error! });
            }
        }

        // Category validation
        if ('category' in body) {
            try {
                if (body.category) {
                    validateJobCategory(body.category);
                }
                validatedFields.category = true;
            } catch (error) {
                validatedFields.category = false;
                errors.push({ field: 'category', message: error instanceof Error ? error.message : 'Invalid category' });
            }
        }

        // Description validation
        if ('description' in body) {
            const descValidation = validateDescription(body.description);
            validatedFields.description = descValidation.isValid;
            if (!descValidation.isValid) {
                errors.push({ field: 'description', message: descValidation.error! });
            }
        }

        // Return validation result
        if (errors.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation failed',
                    isValid: false,
                    validatedFields,
                    errors
                } as JobFieldsValidationResponse,
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'All fields are valid',
            isValid: true,
            validatedFields
        } as JobFieldsValidationResponse);

    } catch (error) {
        console.error('Job fields validation error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to validate fields',
                isValid: false,
                errors: [
                    { field: 'general', message: 'Failed to process request' }
                ]
            } as JobFieldsValidationResponse,
            { status: 500 }
        );
    }
}
