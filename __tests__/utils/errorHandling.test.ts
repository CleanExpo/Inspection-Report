import { 
    ApiError, 
    ValidationError, 
    DatabaseError,
    formatError,
    formatErrorResponse,
    isApiError
} from '../../app/utils/errorHandling';
import { jest, expect, describe, it } from '@jest/globals';

describe('Error Handling Utilities', () => {
    describe('ApiError', () => {
        it('should create API error with status code', () => {
            const error = new ApiError('Test error', 400);
            expect(error.message).toBe('Test error');
            expect(error.statusCode).toBe(400);
            expect(error.name).toBe('ApiError');
        });

        it('should default to 500 status code', () => {
            const error = new ApiError('Test error');
            expect(error.statusCode).toBe(500);
        });
    });

    describe('ValidationError', () => {
        it('should create validation error with field', () => {
            const error = new ValidationError('Invalid input', 'username');
            expect(error.message).toBe('Invalid input');
            expect(error.field).toBe('username');
            expect(error.statusCode).toBe(400);
            expect(error.name).toBe('ValidationError');
        });

        it('should handle multiple field errors', () => {
            const error = new ValidationError('Multiple errors', undefined, [
                { field: 'username', message: 'Required' },
                { field: 'email', message: 'Invalid format' }
            ]);
            expect(error.fieldErrors).toHaveLength(2);
            expect(error.statusCode).toBe(400);
        });
    });

    describe('DatabaseError', () => {
        it('should create database error with original error', () => {
            const originalError = new Error('DB connection failed');
            const error = new DatabaseError('Database error', originalError);
            expect(error.message).toBe('Database error');
            expect(error.originalError).toBe(originalError);
            expect(error.statusCode).toBe(500);
            expect(error.name).toBe('DatabaseError');
        });

        it('should handle error without original error', () => {
            const error = new DatabaseError('Database error');
            expect(error.message).toBe('Database error');
            expect(error.originalError).toBeUndefined();
            expect(error.statusCode).toBe(500);
        });
    });

    describe('formatError', () => {
        it('should format ApiError', () => {
            const error = new ApiError('Test error', 400);
            const formatted = formatError(error);
            expect(formatted).toEqual({
                message: 'Test error',
                statusCode: 400,
                type: 'ApiError'
            });
        });

        it('should format ValidationError with fields', () => {
            const error = new ValidationError('Invalid input', 'username');
            const formatted = formatError(error);
            expect(formatted).toEqual({
                message: 'Invalid input',
                statusCode: 400,
                type: 'ValidationError',
                field: 'username'
            });
        });

        it('should format DatabaseError', () => {
            const error = new DatabaseError('Database error');
            const formatted = formatError(error);
            expect(formatted).toEqual({
                message: 'Database error',
                statusCode: 500,
                type: 'DatabaseError'
            });
        });

        it('should format unknown error', () => {
            const error = new Error('Unknown error');
            const formatted = formatError(error);
            expect(formatted).toEqual({
                message: 'Unknown error',
                statusCode: 500,
                type: 'Error'
            });
        });
    });

    describe('formatErrorResponse', () => {
        it('should format API error response', () => {
            const error = new ApiError('Test error', 400);
            const response = formatErrorResponse(error);
            expect(response).toEqual({
                success: false,
                message: 'Test error',
                errors: [{
                    field: 'general',
                    message: 'Test error'
                }]
            });
        });

        it('should format validation error response with fields', () => {
            const error = new ValidationError('Multiple errors', undefined, [
                { field: 'username', message: 'Required' },
                { field: 'email', message: 'Invalid format' }
            ]);
            const response = formatErrorResponse(error);
            expect(response).toEqual({
                success: false,
                message: 'Multiple errors',
                errors: [
                    { field: 'username', message: 'Required' },
                    { field: 'email', message: 'Invalid format' }
                ]
            });
        });

        it('should format database error response', () => {
            const error = new DatabaseError('Database error');
            const response = formatErrorResponse(error);
            expect(response).toEqual({
                success: false,
                message: 'Database error',
                errors: [{
                    field: 'general',
                    message: 'Database error'
                }]
            });
        });
    });

    describe('isApiError', () => {
        it('should identify ApiError', () => {
            const error = new ApiError('Test error');
            expect(isApiError(error)).toBe(true);
        });

        it('should identify ValidationError as ApiError', () => {
            const error = new ValidationError('Test error', 'field');
            expect(isApiError(error)).toBe(true);
        });

        it('should identify DatabaseError as ApiError', () => {
            const error = new DatabaseError('Test error');
            expect(isApiError(error)).toBe(true);
        });

        it('should not identify regular Error as ApiError', () => {
            const error = new Error('Test error');
            expect(isApiError(error)).toBe(false);
        });
    });
});
