import { jest, expect, describe, it } from '@jest/globals';
import { NextResponse } from 'next/server';
import { 
    ApiError, 
    ValidationError, 
    DatabaseError 
} from '../../app/utils/errorHandling';
import { errorHandler } from '../../app/middleware/errorMiddleware';

describe('Error Middleware', () => {
    const mockRequest = new Request('http://localhost/api/test');

    describe('errorHandler', () => {
        it('should handle ApiError', async () => {
            const error = new ApiError('Test error', 400);
            const response = await errorHandler(error, mockRequest);

            expect(response).toBeInstanceOf(NextResponse);
            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data).toEqual({
                success: false,
                message: 'Test error',
                errors: [{
                    field: 'general',
                    message: 'Test error'
                }]
            });
        });

        it('should handle ValidationError with fields', async () => {
            const error = new ValidationError('Validation failed', undefined, [
                { field: 'username', message: 'Required' },
                { field: 'email', message: 'Invalid format' }
            ]);
            const response = await errorHandler(error, mockRequest);

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toEqual({
                success: false,
                message: 'Validation failed',
                errors: [
                    { field: 'username', message: 'Required' },
                    { field: 'email', message: 'Invalid format' }
                ]
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
            const error = new Error('Unknown error');
            const response = await errorHandler(error, mockRequest);

            expect(response.status).toBe(500);
            const data = await response.json();
            expect(data).toEqual({
                success: false,
                message: 'Internal server error',
                errors: [{
                    field: 'general',
                    message: 'Internal server error'
                }]
            });
        });

        it('should handle non-error objects', async () => {
            const error = { message: 'Not an error' };
            const response = await errorHandler(error, mockRequest);

            expect(response.status).toBe(500);
            const data = await response.json();
            expect(data).toEqual({
                success: false,
                message: 'Internal server error',
                errors: [{
                    field: 'general',
                    message: 'Internal server error'
                }]
            });
        });

        it('should handle errors in production mode', async () => {
            // Mock process.env.NODE_ENV
            const envSpy = jest.spyOn(process.env, 'NODE_ENV', 'get')
                .mockReturnValue('production');

            const error = new Error('Sensitive error');
            const response = await errorHandler(error, mockRequest);

            expect(response.status).toBe(500);
            const data = await response.json();
            expect(data).toEqual({
                success: false,
                message: 'Internal server error',
                errors: [{
                    field: 'general',
                    message: 'Internal server error'
                }]
            });

            envSpy.mockRestore();
        });

        it('should log errors in development mode', async () => {
            // Mock process.env.NODE_ENV
            const envSpy = jest.spyOn(process.env, 'NODE_ENV', 'get')
                .mockReturnValue('development');
            const consoleSpy = jest.spyOn(console, 'error')
                .mockImplementation(() => {});

            const error = new Error('Test error');
            await errorHandler(error, mockRequest);

            expect(consoleSpy).toHaveBeenCalledWith('API Error:', error);

            consoleSpy.mockRestore();
            envSpy.mockRestore();
        });
    });
});
