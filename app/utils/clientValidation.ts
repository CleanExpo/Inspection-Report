/**
 * Client field types
 */
export type FieldType = 'string' | 'number' | 'boolean' | 'email' | 'url' | 'date';

/**
 * Client field definition
 */
/**
 * Field relationship rule
 */
export type RelationshipRule = 'before' | 'after' | 'lessThan' | 'greaterThan';

/**
 * Field relationship definition
 */
export interface FieldRelationship {
    field: string;
    rule: RelationshipRule;
    message: string;
}

/**
 * Business rule definition
 */
export interface BusinessRule {
    name: string;
    condition: (data: any) => boolean;
    message: string;
}

/**
 * Client field definition
 */
export interface ClientField {
    name: string;
    type: FieldType;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    relationships?: FieldRelationship[];
}

/**
 * Validation error
 */
export interface ValidationError {
    field: string;
    message: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

/**
 * Client validation error
 */
export class ClientValidationError extends Error {
    errors: ValidationError[];

    constructor(message: string, errors: ValidationError[]) {
        super(message);
        this.name = 'ClientValidationError';
        this.errors = errors;
    }
}

/**
 * Validates required fields in data
 */
export function validateRequiredFields(
    data: Record<string, any>,
    fields: ClientField[]
): ValidationResult {
    const errors: ValidationError[] = [];

    for (const field of fields) {
        const value = data[field.name];
        
        // Check if value exists and is not empty
        if (value == null || 
            (typeof value === 'string' && value.trim() === '') ||
            (Array.isArray(value) && value.length === 0)
        ) {
            errors.push({
                field: field.name,
                message: `${formatFieldName(field.name)} is required`
            });
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validates client fields against their definitions
 */
/**
 * Validates field relationships
 */
export function validateRelationships(
    data: Record<string, any>,
    fields: ClientField[]
): ValidationResult {
    const errors: ValidationError[] = [];

    for (const field of fields) {
        if (!field.relationships) continue;

        const value = data[field.name];
        if (value == null) continue;

        for (const rel of field.relationships) {
            const relatedValue = data[rel.field];
            if (relatedValue == null) continue;

            switch (rel.rule) {
                case 'before':
                    if (new Date(value) >= new Date(relatedValue)) {
                        errors.push({ field: field.name, message: rel.message });
                    }
                    break;
                case 'after':
                    if (new Date(value) <= new Date(relatedValue)) {
                        errors.push({ field: field.name, message: rel.message });
                    }
                    break;
                case 'lessThan':
                    if (Number(value) >= Number(relatedValue)) {
                        errors.push({ field: field.name, message: rel.message });
                    }
                    break;
                case 'greaterThan':
                    if (Number(value) <= Number(relatedValue)) {
                        errors.push({ field: field.name, message: rel.message });
                    }
                    break;
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validates business rules
 */
export function validateBusinessRules(
    data: Record<string, any>,
    rules: BusinessRule[]
): ValidationResult {
    const errors: ValidationError[] = [];

    for (const rule of rules) {
        try {
            if (!rule.condition(data)) {
                errors.push({
                    field: rule.name,
                    message: rule.message
                });
            }
        } catch (error) {
            errors.push({
                field: rule.name,
                message: 'Error evaluating business rule'
            });
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

export function validateClientFields(
    data: Record<string, any>,
    fields: ClientField[]
): ValidationResult {
    const errors: ValidationError[] = [];

    for (const field of fields) {
        const value = data[field.name];

        // Skip optional fields if not present
        if (!field.required && (value == null || value === '')) {
            continue;
        }

        // Validate based on type
        switch (field.type) {
            case 'string':
                validateString(value, field, errors);
                break;
            case 'number':
                validateNumber(value, field, errors);
                break;
            case 'email':
                validateEmail(value, field, errors);
                break;
            case 'url':
                validateUrl(value, field, errors);
                break;
            case 'date':
                validateDate(value, field, errors);
                break;
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Formats a field name for error messages
 */
function formatFieldName(name: string): string {
    return name
        .split(/(?=[A-Z])|_|-/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Validates a string value
 */
function validateString(
    value: any,
    field: ClientField,
    errors: ValidationError[]
): void {
    if (typeof value !== 'string') {
        errors.push({
            field: field.name,
            message: `${formatFieldName(field.name)} must be a string`
        });
        return;
    }

    if (field.minLength && value.length < field.minLength) {
        errors.push({
            field: field.name,
            message: `${formatFieldName(field.name)} must be at least ${field.minLength} characters`
        });
    }

    if (field.maxLength && value.length > field.maxLength) {
        errors.push({
            field: field.name,
            message: `${formatFieldName(field.name)} must be no more than ${field.maxLength} characters`
        });
    }

    if (field.pattern && !field.pattern.test(value)) {
        errors.push({
            field: field.name,
            message: `${formatFieldName(field.name)} has invalid format`
        });
    }
}

/**
 * Validates a number value
 */
function validateNumber(
    value: any,
    field: ClientField,
    errors: ValidationError[]
): void {
    const num = Number(value);
    if (isNaN(num)) {
        errors.push({
            field: field.name,
            message: `${formatFieldName(field.name)} must be a number`
        });
        return;
    }

    if (field.min != null && num < field.min) {
        errors.push({
            field: field.name,
            message: `${formatFieldName(field.name)} must be greater than or equal to ${field.min}`
        });
    }

    if (field.max != null && num > field.max) {
        errors.push({
            field: field.name,
            message: `${formatFieldName(field.name)} must be less than or equal to ${field.max}`
        });
    }
}

/**
 * Validates an email value
 */
function validateEmail(
    value: any,
    field: ClientField,
    errors: ValidationError[]
): void {
    if (typeof value !== 'string') {
        errors.push({
            field: field.name,
            message: `${formatFieldName(field.name)} must be a string`
        });
        return;
    }

    const emailPattern = field.pattern || /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
        errors.push({
            field: field.name,
            message: 'Invalid email format'
        });
    }
}

/**
 * Validates a URL value
 */
function validateUrl(
    value: any,
    field: ClientField,
    errors: ValidationError[]
): void {
    if (typeof value !== 'string') {
        errors.push({
            field: field.name,
            message: `${formatFieldName(field.name)} must be a string`
        });
        return;
    }

    try {
        new URL(value);
    } catch {
        errors.push({
            field: field.name,
            message: 'Invalid URL format'
        });
    }
}

/**
 * Validates a date value
 */
function validateDate(
    value: any,
    field: ClientField,
    errors: ValidationError[]
): void {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
        errors.push({
            field: field.name,
            message: 'Invalid date format'
        });
        return;
    }

    if (field.min) {
        const minDate = new Date(field.min);
        if (date < minDate) {
            errors.push({
                field: field.name,
                message: `Date must be after ${minDate.toLocaleDateString()}`
            });
        }
    }

    if (field.max) {
        const maxDate = new Date(field.max);
        if (date > maxDate) {
            errors.push({
                field: field.name,
                message: `Date must be before ${maxDate.toLocaleDateString()}`
            });
        }
    }
}

/**
 * Validates client data against all validation rules
 */
export function validateClientData(
    data: Record<string, any>,
    fields: ClientField[],
    businessRules: BusinessRule[] = []
): ValidationResult {
    // Get required fields
    const requiredFields = fields.filter(f => f.required);
    
    // Run all validations
    const requiredResult = validateRequiredFields(data, requiredFields);
    const fieldsResult = validateClientFields(data, fields);
    const relationshipsResult = validateRelationships(data, fields);
    const rulesResult = validateBusinessRules(data, businessRules);

    // Combine all errors
    const errors = [
        ...requiredResult.errors,
        ...fieldsResult.errors,
        ...relationshipsResult.errors,
        ...rulesResult.errors
    ];

    return {
        isValid: errors.length === 0,
        errors
    };
}
