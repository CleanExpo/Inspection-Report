import {
    validateClientFields,
    validateRequiredFields,
    ClientValidationError,
    ClientField,
    ValidationResult
} from '../../app/utils/clientValidation';
import { jest, expect, describe, it } from '@jest/globals';

describe('Client Validation Utilities', () => {
    describe('validateRequiredFields', () => {
        const requiredFields: ClientField[] = [
            { name: 'name', type: 'string' },
            { name: 'email', type: 'email' },
            { name: 'age', type: 'number' },
            { name: 'active', type: 'boolean' }
        ];

        it('should validate when all required fields are present', () => {
            const data = {
                name: 'John Doe',
                email: 'john@example.com',
                age: 30,
                active: true
            };

            const result = validateRequiredFields(data, requiredFields);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should handle missing fields', () => {
            const data = {
                name: 'John Doe',
                age: 30
            };

            const result = validateRequiredFields(data, requiredFields);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'email',
                message: 'Email is required'
            });
            expect(result.errors).toContainEqual({
                field: 'active',
                message: 'Active status is required'
    });

    describe('validateRelationships', () => {
        const fields = [
            {
                name: 'startDate',
                type: 'date',
                relationships: [
                    {
                        field: 'endDate',
                        rule: 'before',
                        message: 'Start date must be before end date'
                    }
                ]
            },
            {
                name: 'endDate',
                type: 'date',
                relationships: [
                    {
                        field: 'startDate',
                        rule: 'after',
                        message: 'End date must be after start date'
                    }
                ]
            },
            {
                name: 'minAmount',
                type: 'number',
                relationships: [
                    {
                        field: 'maxAmount',
                        rule: 'lessThan',
                        message: 'Minimum amount must be less than maximum amount'
                    }
                ]
            },
            {
                name: 'maxAmount',
                type: 'number',
                relationships: [
                    {
                        field: 'minAmount',
                        rule: 'greaterThan',
                        message: 'Maximum amount must be greater than minimum amount'
                    }
                ]
            }
        ];

        it('should validate valid relationships', () => {
            const data = {
                startDate: '2024-01-01',
                endDate: '2024-12-31',
                minAmount: 100,
                maxAmount: 200
            };

            const result = validateRelationships(data, fields);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should handle invalid date relationships', () => {
            const data = {
                startDate: '2024-12-31',
                endDate: '2024-01-01'
            };

            const result = validateRelationships(data, fields);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'startDate',
                message: 'Start date must be before end date'
            });
        });

        it('should handle invalid number relationships', () => {
            const data = {
                minAmount: 200,
                maxAmount: 100
            };

            const result = validateRelationships(data, fields);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'minAmount',
                message: 'Minimum amount must be less than maximum amount'
            });
        });
    });

    describe('validateBusinessRules', () => {
        const rules = [
            {
                name: 'ageRestriction',
                condition: (data: any) => {
                    return data.age >= 18 || data.hasParentalConsent;
                },
                message: 'Must be 18 or have parental consent'
            },
            {
                name: 'creditLimit',
                condition: (data: any) => {
                    return data.creditScore >= 700 || data.income >= 50000;
                },
                message: 'Must have good credit score or sufficient income'
            },
            {
                name: 'orderLimit',
                condition: (data: any) => {
                    return data.orderTotal <= data.creditLimit;
                },
                message: 'Order total exceeds credit limit'
            }
        ];

        it('should validate when all rules pass', () => {
            const data = {
                age: 21,
                creditScore: 750,
                orderTotal: 1000,
                creditLimit: 2000
            };

            const result = validateBusinessRules(data, rules);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should handle alternative conditions', () => {
            const data = {
                age: 16,
                hasParentalConsent: true,
                creditScore: 650,
                income: 60000,
                orderTotal: 1000,
                creditLimit: 2000
            };

            const result = validateBusinessRules(data, rules);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should handle rule violations', () => {
            const data = {
                age: 16,
                hasParentalConsent: false,
                creditScore: 650,
                income: 40000,
                orderTotal: 3000,
                creditLimit: 2000
            };

            const result = validateBusinessRules(data, rules);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(3);
            expect(result.errors).toContainEqual({
                field: 'ageRestriction',
                message: 'Must be 18 or have parental consent'
            });
            expect(result.errors).toContainEqual({
                field: 'creditLimit',
                message: 'Must have good credit score or sufficient income'
            });
            expect(result.errors).toContainEqual({
                field: 'orderLimit',
                message: 'Order total exceeds credit limit'
            });
        });
    });
});

        it('should handle null/undefined values', () => {
            const data = {
                name: null,
                email: undefined,
                age: 30,
                active: true
            };

            const result = validateRequiredFields(data, requiredFields);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'name',
                message: 'Name is required'
            });
            expect(result.errors).toContainEqual({
                field: 'email',
                message: 'Email is required'
            });
        });

        it('should handle empty strings', () => {
            const data = {
                name: '',
                email: '   ',
                age: 30,
                active: true
            };

            const result = validateRequiredFields(data, requiredFields);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'name',
                message: 'Name is required'
            });
            expect(result.errors).toContainEqual({
                field: 'email',
                message: 'Email is required'
            });
        });
    });

    describe('validateClientFields', () => {
        const fields: ClientField[] = [
            { 
                name: 'name',
                type: 'string',
                minLength: 2,
                maxLength: 50
            },
            { 
                name: 'email',
                type: 'email',
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            },
            { 
                name: 'age',
                type: 'number',
                min: 0,
                max: 120
            },
            { 
                name: 'website',
                type: 'url',
                required: false
            }
        ];

        it('should validate valid data', () => {
            const data = {
                name: 'John Doe',
                email: 'john@example.com',
                age: 30,
                website: 'https://example.com'
            };

            const result = validateClientFields(data, fields);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate string constraints', () => {
            const data = {
                name: 'J',  // Too short
                email: 'john@example.com',
                age: 30
            };

            const result = validateClientFields(data, fields);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'name',
                message: 'Name must be at least 2 characters'
            });
        });

        it('should validate email format', () => {
            const data = {
                name: 'John Doe',
                email: 'invalid-email',
                age: 30
            };

            const result = validateClientFields(data, fields);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'email',
                message: 'Invalid email format'
            });
        });

        it('should validate number constraints', () => {
            const data = {
                name: 'John Doe',
                email: 'john@example.com',
                age: 150  // Too high
            };

            const result = validateClientFields(data, fields);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'age',
                message: 'Age must be less than or equal to 120'
            });
        });

        it('should validate URL format', () => {
            const data = {
                name: 'John Doe',
                email: 'john@example.com',
                age: 30,
                website: 'invalid-url'
            };

            const result = validateClientFields(data, fields);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'website',
                message: 'Invalid URL format'
            });
        });

        it('should handle optional fields', () => {
            const data = {
                name: 'John Doe',
                email: 'john@example.com',
                age: 30
                // website is optional
            };

            const result = validateClientFields(data, fields);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });
});
