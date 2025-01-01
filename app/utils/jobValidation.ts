/**
 * Job validation utilities including number format and enum validations
 * Format: YYYY-MMDD-XXX where:
 * - YYYY: Year (4 digits)
 * - MM: Month (2 digits)
 * - DD: Day (2 digits)
 * - XXX: Sequential number (3 digits)
 */

import { JobStatus, JobPriority } from '../types/client';

export class JobValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'JobValidationError';
    }
}

/**
 * Validates a job number format
 * @param jobNumber The job number to validate
 * @throws {JobValidationError} If the job number format is invalid
 */
export function validateJobNumber(jobNumber: string): void {
    // Basic format check
    const formatRegex = /^\d{4}-\d{4}-\d{3}$/;
    if (!formatRegex.test(jobNumber)) {
        throw new JobValidationError(
            'Invalid job number format. Expected: YYYY-MMDD-XXX'
        );
    }

    // Extract components
    const [year, monthDay, sequence] = jobNumber.split('-');
    const month = monthDay.substring(0, 2);
    const day = monthDay.substring(2, 4);

    // Validate year
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(year);
    if (yearNum < 2000 || yearNum > currentYear + 1) {
        throw new JobValidationError(
            `Invalid year. Must be between 2000 and ${currentYear + 1}`
        );
    }

    // Validate month
    const monthNum = parseInt(month);
    if (monthNum < 1 || monthNum > 12) {
        throw new JobValidationError(
            'Invalid month. Must be between 01 and 12'
        );
    }

    // Validate day
    const dayNum = parseInt(day);
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    if (dayNum < 1 || dayNum > daysInMonth) {
        throw new JobValidationError(
            `Invalid day. Must be between 01 and ${daysInMonth} for month ${monthNum}`
        );
    }

    // Validate sequence number
    const sequenceNum = parseInt(sequence);
    if (sequenceNum < 1 || sequenceNum > 999) {
        throw new JobValidationError(
            'Invalid sequence number. Must be between 001 and 999'
        );
    }
}

/**
 * Generates a new job number for the current date
 * @param sequence Optional sequence number (1-999)
 * @returns A valid job number string
 */
export function generateJobNumber(sequence: number = 1): string {
    if (sequence < 1 || sequence > 999) {
        throw new JobValidationError(
            'Sequence number must be between 1 and 999'
        );
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const seq = String(sequence).padStart(3, '0');

    const jobNumber = `${year}-${month}${day}-${seq}`;
    
    // Validate the generated number
    validateJobNumber(jobNumber);
    
    return jobNumber;
}

/**
 * Validates a job status value
 * @param status The status to validate
 * @throws {JobValidationError} If the status is invalid
 */
export function validateJobStatus(status: string): void {
    const validStatuses: JobStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
    if (!validStatuses.includes(status as JobStatus)) {
        throw new JobValidationError(
            `Invalid job status. Must be one of: ${validStatuses.join(', ')}`
        );
    }
}

/**
 * Validates a job priority value
 * @param priority The priority to validate
 * @throws {JobValidationError} If the priority is invalid
 */
export function validateJobPriority(priority: string): void {
    const validPriorities: JobPriority[] = ['LOW', 'MEDIUM', 'HIGH'];
    if (!validPriorities.includes(priority as JobPriority)) {
        throw new JobValidationError(
            `Invalid job priority. Must be one of: ${validPriorities.join(', ')}`
        );
    }
}

/**
 * Validates a job category value
 * @param category The category to validate
 * @throws {JobValidationError} If the category is invalid or empty
 */
export function validateJobCategory(category: string): void {
    if (!category || category.trim().length === 0) {
        throw new JobValidationError('Job category is required');
    }
    if (category.length > 50) {
        throw new JobValidationError('Job category must not exceed 50 characters');
    }
}
