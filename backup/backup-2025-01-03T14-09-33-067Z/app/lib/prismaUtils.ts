import { Prisma } from '@prisma/client';

/**
 * Safely converts a value to a Prisma InputJsonValue
 * @param value Any value to be stored as JSON
 * @returns A value safe to use with Prisma's JSON fields
 */
export function toPrismaJson(value: unknown): Prisma.InputJsonValue {
  if (value === undefined || value === null) {
    return [];
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(toPrismaJson);
  }
  if (typeof value === 'object') {
    const result: Record<string, Prisma.InputJsonValue> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = toPrismaJson(val);
    }
    return result;
  }
  return JSON.stringify(value);
}

/**
 * Safely converts a validation rule value to a string for storage
 * @param value The validation rule value
 * @returns A string representation of the value
 */
export function toValidationRuleValue(value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  return JSON.stringify(value);
}

/**
 * Creates a template field data object with proper JSON handling
 */
export function createTemplateFieldData(field: {
  label: string;
  type: string;
  description: string | null;
  placeholder: string | null;
  order: number;
  isRequired: boolean;
  options?: unknown;
  validationRules?: Array<{
    type: string;
    value: unknown;
    message?: string;
  }>;
}): Prisma.TemplateFieldCreateWithoutSectionInput {
  const fieldData: Prisma.TemplateFieldCreateWithoutSectionInput = {
    label: field.label,
    type: field.type,
    description: field.description,
    placeholder: field.placeholder,
    order: field.order,
    isRequired: field.isRequired,
    options: toPrismaJson(field.options || []),
  };

  if (field.validationRules?.length) {
    fieldData.validationRules = {
      create: field.validationRules.map(rule => ({
        type: rule.type,
        value: toValidationRuleValue(rule.value),
        message: rule.message || '',
      }))
    };
  }

  return fieldData;
}

/**
 * Type guard to check if a value is a valid Prisma InputJsonValue
 */
export function isInputJsonValue(value: unknown): value is Prisma.InputJsonValue {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return true;
  }
  if (Array.isArray(value)) {
    return value.every(isInputJsonValue);
  }
  if (typeof value === 'object') {
    return Object.values(value).every(isInputJsonValue);
  }
  return false;
}
