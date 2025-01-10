import { NextResponse } from 'next/server';
import type { JobStatus, JobPriority } from '../../../types/client';

interface JobFieldsValidationRequest {
    status?: string;
    priority?: string;
    category?: string;
    description?: string;
}

interface JobFieldsValidationResponse {
    success: boolean;
    message: string;
    isValid: boolean;
    errors?: Array<{
        field: string;
        message: string;
    }>;
}

const VALID_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const;
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
const VALID_CATEGORIES = ['WATER_DAMAGE', 'FIRE_DAMAGE', 'MOLD', 'CLEANING'] as const;

function validateStatus(status: string): status is JobStatus {
    return VALID_STATUSES.includes(status as JobStatus);
}

function validatePriority(priority: string): priority is JobPriority {
    return VALID_PRIORITIES.includes(priority as JobPriority);
}

function validateCategory(category: string): boolean {
    return VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number]);
}

function validateDescription(description: string): boolean {
    return description.length <= 1000; // Max 1000 characters
}

/**
 * POST /api/validate/fields
 * Validates job fields
 */
export async function POST(request: Request) {
    try {
        // Parse request body
        const body = await request.json() as JobFieldsValidationRequest;
        const errors: Array<{ field: string; message: string }> = [];

        // Validate status if provided
        if (body.status !== undefined) {
            if (!validateStatus(body.status)) {
                errors.push({
                    field: 'status',
                    message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
                });
            }
        }

        // Validate priority if provided
        if (body.priority !== undefined) {
            if (!validatePriority(body.priority)) {
                errors.push({
                    field: 'priority',
                    message: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`
                });
            }
        }

        // Validate category if provided
        if (body.category !== undefined) {
            if (!validateCategory(body.category)) {
                errors.push({
                    field: 'category',
                    message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`
                });
            }
        }

        // Validate description if provided
        if (body.description !== undefined) {
            if (!validateDescription(body.description)) {
                errors.push({
                    field: 'description',
                    message: 'Description must not exceed 1000 characters'
                });
            }
        }

        // Return validation result
        if (errors.length > 0) {
            return NextResponse.json({
                success: false,
                message: 'Validation failed',
                isValid: false,
                errors
            } as JobFieldsValidationResponse, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: 'All fields are valid',
            isValid: true
        } as JobFieldsValidationResponse);

    } catch (error) {
        console.error('Job fields validation error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to validate job fields',
            isValid: false,
            errors: [{
                field: 'general',
                message: 'Failed to process request'
            }]
        } as JobFieldsValidationResponse, { status: 500 });
    }
}
