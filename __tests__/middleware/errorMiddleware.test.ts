import { NextResponse } from 'next/server';
import { errorHandler } from '../../app/middleware/errorMiddleware';
import { ApiError, ValidationError, DatabaseError } from '../../app/utils/errorHandling';

describe('Error Middleware', () => {
    const mockRequest = new Request('http://localhost/api/test');
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Development Environment', () => {
        beforeEach(() => {
            jest.spyOn(process, 'env', 'get').mockReturnValue({ NODE_ENV: 'development' } as any);
        });

        it('should log errors in development', async () => {
            const error = new Error('Test error');
            await errorHandler(error, mockRequest);
            expect(console.error).toHaveBeenCalledWith('API Error:', error);
        });

        it('should include actual error message in development', async () => {
            const error = new Error('Detailed error message');
            const response = await errorHandler(error, mockRequest);
            const data = await response.json();
            expect(data.message).toBe('Detailed error message');
        });
    });

    describe('Production Environment', () => {
        beforeEach(() => {
            jest.spyOn(process, 'env', 'get').mockReturnValue({ NODE_ENV: 'production' } as any);
        });

        it('should not log errors in production', async () => {
            const error = new Error('Test error');
            await errorHandler(error, mockRequest);
            expect(console.error).not.toHaveBeenCalled();
        });

        it('should use generic error message in production', async () => {
            const error = new Error('Sensitive error details');
            const response = await errorHandler(error, mockRequest);
            const data = await response.json();
            expect(data.message).toBe('Internal server error');
        });
    });

    describe('Error Type Handling', () => {
        it('should handle ApiError', async () => {
            const error = new ApiError('API error', 400);
            const response = await errorHandler(error, mockRequest);
            
            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toEqual({
                success: false,
                message: 'API error',
                errors: [{
                    field: 'general',
                    message: 'API error'
                }]
            });
        });

        it('should handle ValidationError with field errors', async () => {
            const fieldErrors = [
                { field: 'username', message: 'Required' }
            ];
            const error = new ValidationError('Validation failed', undefined, fieldErrors);
            const response = await errorHandler(error, mockRequest);
            
            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toEqual({
                success: false,
                message: 'Validation failed',
                errors: fieldErrors
            });
        });

        it('should handle DatabaseError', async () => {
            const originalError = new Error('DB connection failed');
            const error = new DatabaseError('Database error', originalError);
            const response = await errorHandler(error, mockRequest);
            
            expect(response.status).toBe(500);
            const data = await response.json();
            expect(data).toEqual({
                success: false,
                message: 'Database error',
                errors: [{
                    field: 'general',
                    message: 'Database error'
                }]
            });
        });

        it('should handle unknown errors', async () => {
            const error = { custom: 'error' };
            const response = await errorHandler(error, mockRequest);
            
            expect(response.status).toBe(500);
            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.errors[0].field).toBe('general');
        });
    });

    describe('Response Format', () => {
        it('should return NextResponse instance', async () => {
            const error = new Error('Test error');
            const response = await errorHandler(error, mockRequest);
            expect(response).toBeInstanceOf(NextResponse);
        });

        it('should include correct content type', async () => {
            const error = new Error('Test error');
            const response = await errorHandler(error, mockRequest);
            expect(response.headers.get('content-type')).toBe('application/json');
        });

        it('should maintain consistent error response structure', async () => {
            const error = new Error('Test error');
            const response = await errorHandler(error, mockRequest);
            const data = await response.json();
            
            expect(data).toHaveProperty('success', false);
            expect(data).toHaveProperty('message');
            expect(data).toHaveProperty('errors');
            expect(Array.isArray(data.errors)).toBe(true);
        });
    });
});
