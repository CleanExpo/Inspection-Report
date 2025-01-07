import { NextResponse } from 'next/server';
import { errorHandler } from '../../app/middleware/errorMiddleware';
import { ApiError, ValidationError, DatabaseError } from '../../app/utils/errorHandling';
import { JobService } from '../../app/services/jobService';
import { GET } from '../../app/api/jobs/route';
import { createRequest } from '../utils/testUtils';

/**
 * End-to-end error flow tests
 * Demonstrates how errors propagate through the system:
 * Service -> API Layer -> Error Middleware -> Client Response
 */
describe('Error Flow Integration', () => {
    // Mock JobService
    const mockListJobs = jest.fn();
    jest.mock('../../app/services/jobService', () => ({
        JobService: {
            listJobs: mockListJobs
        }
    }));

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('API Error Flow', () => {
        it('should handle validation errors through the complete flow', async () => {
            // 1. Service throws a validation error
            const fieldErrors = [
                { field: 'page', message: 'Must be a positive number' }
            ];
            const validationError = new ValidationError(
                'Invalid pagination parameters',
                'page',
                fieldErrors
            );
            mockListJobs.mockRejectedValue(validationError);

            // 2. Make API request
            const response = await GET(createRequest.get('/api/jobs', {
                page: '-1'
            }));

            // 3. Verify error is properly transformed
            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toEqual({
                success: false,
                message: 'Invalid pagination parameters',
                errors: fieldErrors
            });
        });

        it('should handle database errors through the complete flow', async () => {
            // 1. Service throws a database error
            const dbError = new DatabaseError(
                'Database connection failed',
                new Error('Connection timeout')
            );
            mockListJobs.mockRejectedValue(dbError);

            // 2. Make API request
            const response = await GET(createRequest.get('/api/jobs'));

            // 3. Verify error is properly transformed
            expect(response.status).toBe(500);
            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.message).toBe('Database connection failed');
        });

        it('should handle unexpected errors through the complete flow', async () => {
            // 1. Service throws an unexpected error
            const unexpectedError = new Error('Unexpected failure');
            mockListJobs.mockRejectedValue(unexpectedError);

            // 2. Make API request
            const response = await GET(createRequest.get('/api/jobs'));

            // 3. Verify error is properly transformed
            expect(response.status).toBe(500);
            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.errors[0].field).toBe('general');
        });
    });

    describe('Error Middleware Integration', () => {
        it('should properly integrate with API endpoints', async () => {
            // 1. Create a test endpoint that throws an error
            const testEndpoint = async () => {
                throw new ApiError('Test API error', 400);
            };

            // 2. Simulate request handling with error middleware
            const request = createRequest.get('/api/test');
            let response;
            try {
                await testEndpoint();
            } catch (error) {
                response = await errorHandler(error, request);
            }

            // 3. Verify middleware properly handled the error
            expect(response?.status).toBe(400);
            const data = await response?.json();
            expect(data).toEqual({
                success: false,
                message: 'Test API error',
                errors: [{
                    field: 'general',
                    message: 'Test API error'
                }]
            });
        });

        it('should maintain error context through the middleware chain', async () => {
            // 1. Create a nested error scenario
            const dbError = new Error('DB connection failed');
            const serviceError = new DatabaseError('Service failed', dbError);
            const apiError = new ApiError('API failed', 500);
            apiError.cause = serviceError;

            // 2. Process through error middleware
            const request = createRequest.get('/api/test');
            const response = await errorHandler(apiError, request);

            // 3. Verify error context is maintained
            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.message).toBe('API failed');
            expect(response.status).toBe(500);
        });
    });

    describe('Environment-Specific Error Handling', () => {
        it('should handle errors differently in development vs production', async () => {
            const error = new Error('Sensitive information');

            // Test development environment
            jest.spyOn(process, 'env', 'get').mockReturnValue({ NODE_ENV: 'development' } as any);
            const devResponse = await errorHandler(error, createRequest.get('/api/test'));
            const devData = await devResponse.json();
            expect(devData.message).toBe('Sensitive information');

            // Test production environment
            jest.spyOn(process, 'env', 'get').mockReturnValue({ NODE_ENV: 'production' } as any);
            const prodResponse = await errorHandler(error, createRequest.get('/api/test'));
            const prodData = await prodResponse.json();
            expect(prodData.message).toBe('Internal server error');
        });
    });
});
