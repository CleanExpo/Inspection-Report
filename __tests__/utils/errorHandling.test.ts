import {
    ApiError,
    ValidationError,
    DatabaseError,
    isApiError,
    formatError,
    formatErrorResponse,
    type FieldError
} from '../../app/utils/errorHandling';

describe('Error Handling', () => {
    describe('ApiError', () => {
        it('should create with default status code', () => {
            const error = new ApiError('Test error');
            expect(error.message).toBe('Test error');
            expect(error.statusCode).toBe(500);
            expect(error.name).toBe('ApiError');
        });

        it('should create with custom status code', () => {
            const error = new ApiError('Test error', 400);
            expect(error.statusCode).toBe(400);
        });

        it('should be instanceof Error', () => {
            const error = new ApiError('Test error');
            expect(error).toBeInstanceOf(Error);
        });
    });

    describe('ValidationError', () => {
        it('should create with message only', () => {
            const error = new ValidationError('Invalid input');
            expect(error.message).toBe('Invalid input');
            expect(error.statusCode).toBe(400);
            expect(error.name).toBe('ValidationError');
            expect(error.field).toBeUndefined();
            expect(error.fieldErrors).toBeUndefined();
        });

        it('should create with field', () => {
            const error = new ValidationError('Invalid input', 'username');
            expect(error.field).toBe('username');
        });

        it('should create with field errors', () => {
            const fieldErrors: FieldError[] = [
                { field: 'username', message: 'Required' }
            ];
            const error = new ValidationError('Invalid input', undefined, fieldErrors);
            expect(error.fieldErrors).toEqual(fieldErrors);
        });

        it('should be instanceof ApiError', () => {
            const error = new ValidationError('Invalid input');
            expect(error).toBeInstanceOf(ApiError);
        });
    });

    describe('DatabaseError', () => {
        it('should create with message only', () => {
            const error = new DatabaseError('Database connection failed');
            expect(error.message).toBe('Database connection failed');
            expect(error.statusCode).toBe(500);
            expect(error.name).toBe('DatabaseError');
            expect(error.originalError).toBeUndefined();
        });

        it('should create with original error', () => {
            const originalError = new Error('Connection timeout');
            const error = new DatabaseError('Database connection failed', originalError);
            expect(error.originalError).toBe(originalError);
        });

        it('should be instanceof ApiError', () => {
            const error = new DatabaseError('Database error');
            expect(error).toBeInstanceOf(ApiError);
        });
    });

    describe('isApiError', () => {
        it('should return true for ApiError', () => {
            expect(isApiError(new ApiError('Test'))).toBe(true);
        });

        it('should return true for ValidationError', () => {
            expect(isApiError(new ValidationError('Test'))).toBe(true);
        });

        it('should return true for DatabaseError', () => {
            expect(isApiError(new DatabaseError('Test'))).toBe(true);
        });

        it('should return false for standard Error', () => {
            expect(isApiError(new Error('Test'))).toBe(false);
        });

        it('should return false for non-error values', () => {
            expect(isApiError('string')).toBe(false);
            expect(isApiError(123)).toBe(false);
            expect(isApiError({})).toBe(false);
            expect(isApiError(null)).toBe(false);
            expect(isApiError(undefined)).toBe(false);
        });
    });

    describe('formatError', () => {
        it('should format ApiError', () => {
            const error = new ApiError('Test error', 400);
            const formatted = formatError(error);
            expect(formatted).toEqual({
                message: 'Test error',
                type: 'ApiError',
                statusCode: 400
            });
        });

        it('should format ValidationError with field', () => {
            const error = new ValidationError('Invalid input', 'username');
            const formatted = formatError(error);
            expect(formatted).toEqual({
                message: 'Invalid input',
                type: 'ValidationError',
                statusCode: 400,
                field: 'username'
            });
        });

        it('should format ValidationError with field errors', () => {
            const fieldErrors = [{ field: 'username', message: 'Required' }];
            const error = new ValidationError('Invalid input', undefined, fieldErrors);
            const formatted = formatError(error);
            expect(formatted).toEqual({
                message: 'Invalid input',
                type: 'ValidationError',
                statusCode: 400,
                fieldErrors
            });
        });

        it('should format DatabaseError with original error', () => {
            const originalError = new Error('Connection timeout');
            const error = new DatabaseError('Database error', originalError);
            const formatted = formatError(error);
            expect(formatted).toEqual({
                message: 'Database error',
                type: 'DatabaseError',
                statusCode: 500,
                originalError: {
                    message: 'Connection timeout',
                    type: 'Error',
                    statusCode: 500
                }
            });
        });

        it('should format standard Error', () => {
            const error = new Error('Standard error');
            const formatted = formatError(error);
            expect(formatted).toEqual({
                message: 'Standard error',
                type: 'Error',
                statusCode: 500
            });
        });
    });

    describe('formatErrorResponse', () => {
        it('should format ValidationError with field errors', () => {
            const fieldErrors = [
                { field: 'username', message: 'Required' },
                { field: 'email', message: 'Invalid format' }
            ];
            const error = new ValidationError('Validation failed', undefined, fieldErrors);
            const response = formatErrorResponse(error);
            expect(response).toEqual({
                success: false,
                message: 'Validation failed',
                errors: fieldErrors
            });
        });

        it('should format standard error as general error', () => {
            const error = new Error('Something went wrong');
            const response = formatErrorResponse(error);
            expect(response).toEqual({
                success: false,
                message: 'Something went wrong',
                errors: [{
                    field: 'general',
                    message: 'Something went wrong'
                }]
            });
        });

        it('should format ApiError as general error', () => {
            const error = new ApiError('API error', 500);
            const response = formatErrorResponse(error);
            expect(response).toEqual({
                success: false,
                message: 'API error',
                errors: [{
                    field: 'general',
                    message: 'API error'
                }]
            });
        });
    });
});
