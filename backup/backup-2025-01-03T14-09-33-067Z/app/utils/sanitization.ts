import { decode } from 'html-entities';
import { format, parse, isValid, isBefore, isAfter } from 'date-fns';

/**
 * Sanitization error
 */
export class SanitizationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SanitizationError';
    }
}

/**
 * String sanitization options
 */
export interface StringSanitizeOptions {
    lowercase?: boolean;
    uppercase?: boolean;
    stripHtml?: boolean;
    alphanumeric?: boolean;
}

/**
 * Number sanitization options
 */
export interface NumberSanitizeOptions {
    decimals?: number;
    unsigned?: boolean;
    integer?: boolean;
    min?: number;
    max?: number;
}

/**
 * Date sanitization options
 */
export interface DateSanitizeOptions {
    format?: string;
    min?: string | Date;
    max?: string | Date;
}

/**
 * Validation rules interface
 */
export interface ValidationRules {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => boolean;
}

/**
 * Sanitizes a string value
 * @param value String to sanitize
 * @param options Sanitization options
 * @returns Sanitized string
 */
export function sanitizeString(
    value: string | null | undefined,
    options: StringSanitizeOptions = {}
): string {
    // Handle null/undefined
    if (value == null) {
        return '';
    }

    // Validate input type
    if (typeof value !== 'string') {
        throw new SanitizationError('Input must be a string');
    }

    // Normalize string
    let result = value
        .normalize('NFC') // Unicode normalization
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

    // Decode HTML entities
    result = decode(result);

    // Apply options
    if (options.lowercase) {
        result = result.toLowerCase();
    }
    if (options.uppercase) {
        result = result.toUpperCase();
    }
    if (options.stripHtml) {
        result = result.replace(/<[^>]*>/g, '');
    }
    if (options.alphanumeric) {
        result = result.replace(/[^a-zA-Z0-9]/g, '');
    }

    return result;
}

/**
 * Sanitizes a number value
 * @param value Number to sanitize
 * @param options Sanitization options
 * @returns Sanitized number
 */
/**
 * Formats a date to string
 */
function formatDate(date: Date, formatStr: string = 'yyyy-MM-dd'): string {
    return format(date, formatStr);
}

/**
 * Parses a date string
 */
function parseDate(value: string | number | Date): Date {
    if (value instanceof Date) {
        return value;
    }

    if (typeof value === 'number') {
        const date = new Date(value);
        if (isValid(date)) {
            return date;
        }
    }

    if (typeof value === 'string') {
        // Handle relative dates
        if (value.toLowerCase() === 'today') {
            return new Date();
        }
        if (value.toLowerCase() === 'yesterday') {
            const date = new Date();
            date.setDate(date.getDate() - 1);
            return date;
        }

        // Try different date formats
        const formats = [
            'yyyy-MM-dd',
            'yyyy/MM/dd',
            'dd-MM-yyyy',
            'dd/MM/yyyy',
            'MM-dd-yyyy',
            'MM/dd/yyyy'
        ];

        for (const fmt of formats) {
            const date = parse(value, fmt, new Date());
            if (isValid(date)) {
                return date;
            }
        }
    }

    throw new SanitizationError('Invalid date format');
}

/**
 * Sanitizes a date value
 */
export function sanitizeDate(
    value: string | number | Date,
    options: DateSanitizeOptions = {}
): string {
    try {
        let date = parseDate(value);

        // Apply constraints
        if (options.min) {
            const minDate = parseDate(options.min);
            if (isBefore(date, minDate)) {
                date = minDate;
            }
        }
        if (options.max) {
            const maxDate = parseDate(options.max);
            if (isAfter(date, maxDate)) {
                date = maxDate;
            }
        }

        // Format date
        return formatDate(date, options.format);
    } catch (error) {
        throw new SanitizationError(
            error instanceof SanitizationError
                ? error.message
                : 'Invalid date'
        );
    }
}

/**
 * Validates a value against rules
 */
export function validateWithRules(value: string, rules: ValidationRules): void {
    const errors: string[] = [];

    if (rules.required && !value) {
        errors.push('Value is required');
    }

    if (rules.minLength && value.length < rules.minLength) {
        errors.push(`Minimum length is ${rules.minLength}`);
    }

    if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`Maximum length is ${rules.maxLength}`);
    }

    if (rules.pattern && !rules.pattern.test(value)) {
        errors.push('Value does not match required pattern');
    }

    if (rules.custom && !rules.custom(value)) {
        errors.push('Value does not meet custom validation');
    }

    if (errors.length > 0) {
        throw new SanitizationError(
            errors.length === 1
                ? errors[0]
                : `Multiple validation errors: ${errors.join(', ')}`
        );
    }
}

export function sanitizeNumber(
    value: number | string,
    options: NumberSanitizeOptions = {}
): number {
    // Handle string input
    if (typeof value === 'string') {
        value = value
            .trim()
            .replace(/,/g, ''); // Remove commas

        if (!value) {
            throw new SanitizationError('Empty string is not a valid number');
        }

        const parsed = parseFloat(value);
        if (isNaN(parsed)) {
            throw new SanitizationError('Invalid number format');
        }
        value = parsed;
    }

    // Validate number type
    if (typeof value !== 'number') {
        throw new SanitizationError('Input must be a number or numeric string');
    }

    // Check for invalid numbers
    if (!Number.isFinite(value)) {
        throw new SanitizationError('Number must be finite');
    }

    // Apply options
    if (options.unsigned) {
        value = Math.abs(value);
    }
    if (options.integer) {
        value = Math.floor(value);
    }
    if (typeof options.decimals === 'number') {
        value = Number(value.toFixed(options.decimals));
    }
    if (typeof options.min === 'number') {
        value = Math.max(value, options.min);
    }
    if (typeof options.max === 'number') {
        value = Math.min(value, options.max);
    }

    return value;
}
