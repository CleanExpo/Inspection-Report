import {
    sanitizeString,
    sanitizeNumber,
    SanitizationError
} from '../../app/utils/sanitization';
import { jest, expect, describe, it } from '@jest/globals';

describe('Data Sanitization Utilities', () => {
    describe('sanitizeString', () => {
        it('should trim whitespace', () => {
            expect(sanitizeString('  hello  ')).toBe('hello');
        });

        it('should remove multiple spaces', () => {
            expect(sanitizeString('hello    world')).toBe('hello world');
        });

        it('should handle empty string', () => {
            expect(sanitizeString('')).toBe('');
        });

        it('should handle null/undefined', () => {
            expect(sanitizeString(null)).toBe('');
            expect(sanitizeString(undefined)).toBe('');
        });

        it('should remove control characters', () => {
            expect(sanitizeString('hello\x00world')).toBe('helloworld');
            expect(sanitizeString('hello\nworld')).toBe('hello world');
            expect(sanitizeString('hello\tworld')).toBe('hello world');
        });

        it('should normalize unicode', () => {
            expect(sanitizeString('café')).toBe('café'); // Normalized form
        });

        it('should handle HTML entities', () => {
            expect(sanitizeString('&lt;script&gt;')).toBe('<script>');
            expect(sanitizeString('&amp;')).toBe('&');
        });

        it('should handle custom options', () => {
            expect(sanitizeString('  TEST  ', { lowercase: true })).toBe('test');
            expect(sanitizeString('test', { uppercase: true })).toBe('TEST');
            expect(sanitizeString('hello<script>', { stripHtml: true })).toBe('hello');
            expect(sanitizeString('hello.world', { alphanumeric: true })).toBe('helloworld');
        });

        it('should reject invalid input types', () => {
            expect(() => sanitizeString(123 as any)).toThrow(SanitizationError);
            expect(() => sanitizeString({} as any)).toThrow(SanitizationError);
    });

    describe('sanitizeDate', () => {
        it('should handle valid date strings', () => {
            expect(sanitizeDate('2024-01-15')).toBe('2024-01-15');
            expect(sanitizeDate('2024/01/15')).toBe('2024-01-15');
            expect(sanitizeDate('15-01-2024')).toBe('2024-01-15');
            expect(sanitizeDate('15/01/2024')).toBe('2024-01-15');
        });

        it('should handle Date objects', () => {
            const date = new Date('2024-01-15');
            expect(sanitizeDate(date)).toBe('2024-01-15');
        });

        it('should handle timestamps', () => {
            const timestamp = new Date('2024-01-15').getTime();
            expect(sanitizeDate(timestamp)).toBe('2024-01-15');
        });

        it('should handle custom formats', () => {
            const date = '2024-01-15';
            expect(sanitizeDate(date, { format: 'DD/MM/YYYY' })).toBe('15/01/2024');
            expect(sanitizeDate(date, { format: 'MM-DD-YYYY' })).toBe('01-15-2024');
            expect(sanitizeDate(date, { format: 'YYYY.MM.DD' })).toBe('2024.01.15');
        });

        it('should handle relative dates', () => {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            
            expect(sanitizeDate('today')).toBe(formatDate(today));
            expect(sanitizeDate('yesterday')).toBe(formatDate(yesterday));
        });

        it('should reject invalid dates', () => {
            expect(() => sanitizeDate('invalid')).toThrow(SanitizationError);
            expect(() => sanitizeDate('2024-13-45')).toThrow(SanitizationError);
            expect(() => sanitizeDate('')).toThrow(SanitizationError);
            expect(() => sanitizeDate(null as any)).toThrow(SanitizationError);
        });

        it('should handle date constraints', () => {
            const date = '2024-01-15';
            const minDate = '2024-01-01';
            const maxDate = '2024-01-31';

            expect(sanitizeDate(date, { min: minDate })).toBe(date);
            expect(sanitizeDate(date, { max: maxDate })).toBe(date);
            expect(sanitizeDate('2023-12-31', { min: minDate })).toBe(minDate);
            expect(sanitizeDate('2024-02-01', { max: maxDate })).toBe(maxDate);
        });
    });

    describe('validateWithRules', () => {
        const rules = {
            required: true,
            minLength: 3,
            maxLength: 10,
            pattern: /^[A-Z][a-z]+$/,
            custom: (value: string) => value.includes('a')
        };

        it('should validate against multiple rules', () => {
            expect(() => validateWithRules('Hello', rules)).not.toThrow();
        });

        it('should handle required validation', () => {
            expect(() => validateWithRules('', { required: true }))
                .toThrow(SanitizationError);
        });

        it('should handle length validation', () => {
            expect(() => validateWithRules('ab', { minLength: 3 }))
                .toThrow(SanitizationError);
            expect(() => validateWithRules('toolongstring', { maxLength: 10 }))
                .toThrow(SanitizationError);
        });

        it('should handle pattern validation', () => {
            expect(() => validateWithRules('invalid', { pattern: /^[A-Z]/ }))
                .toThrow(SanitizationError);
        });

        it('should handle custom validation', () => {
            expect(() => validateWithRules('xyz', { 
                custom: (value: string) => value.includes('a')
            })).toThrow(SanitizationError);
        });

        it('should handle multiple validation errors', () => {
            try {
                validateWithRules('x', rules);
                fail('Should have thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(SanitizationError);
                expect((error as SanitizationError).message)
                    .toContain('Multiple validation errors');
            }
        });
    });
});

    describe('sanitizeNumber', () => {
        it('should handle valid numbers', () => {
            expect(sanitizeNumber('123')).toBe(123);
            expect(sanitizeNumber('123.45')).toBe(123.45);
            expect(sanitizeNumber('-123')).toBe(-123);
        });

        it('should handle number input', () => {
            expect(sanitizeNumber(123)).toBe(123);
            expect(sanitizeNumber(123.45)).toBe(123.45);
        });

        it('should handle strings with whitespace', () => {
            expect(sanitizeNumber('  123  ')).toBe(123);
            expect(sanitizeNumber(' -123.45 ')).toBe(-123.45);
        });

        it('should handle strings with commas', () => {
            expect(sanitizeNumber('1,234')).toBe(1234);
            expect(sanitizeNumber('1,234.56')).toBe(1234.56);
        });

        it('should handle custom options', () => {
            expect(sanitizeNumber('123.456', { decimals: 2 })).toBe(123.46);
            expect(sanitizeNumber('-123', { unsigned: true })).toBe(123);
            expect(sanitizeNumber('123.45', { integer: true })).toBe(123);
            expect(sanitizeNumber('0.123', { min: 1 })).toBe(1);
            expect(sanitizeNumber('123', { max: 100 })).toBe(100);
        });

        it('should reject invalid input', () => {
            expect(() => sanitizeNumber('abc')).toThrow(SanitizationError);
            expect(() => sanitizeNumber('')).toThrow(SanitizationError);
            expect(() => sanitizeNumber('12.34.56')).toThrow(SanitizationError);
            expect(() => sanitizeNumber(null as any)).toThrow(SanitizationError);
            expect(() => sanitizeNumber(undefined as any)).toThrow(SanitizationError);
            expect(() => sanitizeNumber({} as any)).toThrow(SanitizationError);
        });

        it('should handle NaN and Infinity', () => {
            expect(() => sanitizeNumber(NaN)).toThrow(SanitizationError);
            expect(() => sanitizeNumber(Infinity)).toThrow(SanitizationError);
            expect(() => sanitizeNumber(-Infinity)).toThrow(SanitizationError);
        });
    });
});
