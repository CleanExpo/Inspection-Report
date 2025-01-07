import { POST } from '../../../app/api/validate/fields/route';
import { jest, expect, describe, it } from '@jest/globals';
import { createRequest, assertSuccessResponse, assertErrorResponse } from '../../utils/testUtils';

/**
 * Tests for the Job Fields Validation API
 * API-1 Segment: Job Fields Validation
 * Covers:
 * - Field validation
 * - Format validation
 * - Business rules
 * - Error handling
 */
describe('Job Fields Validation API', () => {
    describe('POST /api/validate/fields', () => {
        it('should validate valid fields', async () => {
            const response = await POST(createRequest.post('/api/validate/fields', {
                status: 'PENDING',
                priority: 'HIGH',
                category: 'WATER_DAMAGE',
                description: 'Valid description'
            }));
            const data = await assertSuccessResponse(response);
            expect(data.isValid).toBe(true);
        });

        it('should accept empty request (no fields to validate)', async () => {
            const response = await POST(createRequest.post('/api/validate/fields', {}));
            const data = await assertSuccessResponse(response);
            expect(data.isValid).toBe(true);
        });

        describe('Status Validation', () => {
            it('should validate valid status', async () => {
                const response = await POST(createRequest.post('/api/validate/fields', {
                    status: 'IN_PROGRESS'
                }));
                const data = await assertSuccessResponse(response);
                expect(data.isValid).toBe(true);
            });

            it('should reject invalid status', async () => {
                const response = await POST(createRequest.post('/api/validate/fields', {
                    status: 'INVALID_STATUS'
                }));
                await assertErrorResponse(response, 400, {
                    field: 'status',
                    messageIncludes: 'Must be one of'
                });
            });

            it('should validate all valid statuses', async () => {
                const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
                for (const status of validStatuses) {
                    const response = await POST(createRequest.post('/api/validate/fields', { status }));
                    const data = await assertSuccessResponse(response);
                    expect(data.isValid).toBe(true);
                }
            });
        });

        describe('Priority Validation', () => {
            it('should validate valid priority', async () => {
                const response = await POST(createRequest.post('/api/validate/fields', {
                    priority: 'MEDIUM'
                }));
                const data = await assertSuccessResponse(response);
                expect(data.isValid).toBe(true);
            });

            it('should reject invalid priority', async () => {
                const response = await POST(createRequest.post('/api/validate/fields', {
                    priority: 'INVALID_PRIORITY'
                }));
                await assertErrorResponse(response, 400, {
                    field: 'priority',
                    messageIncludes: 'Must be one of'
                });
            });

            it('should validate all valid priorities', async () => {
                const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
                for (const priority of validPriorities) {
                    const response = await POST(createRequest.post('/api/validate/fields', { priority }));
                    const data = await assertSuccessResponse(response);
                    expect(data.isValid).toBe(true);
                }
            });
        });

        describe('Category Validation', () => {
            it('should validate valid category', async () => {
                const response = await POST(createRequest.post('/api/validate/fields', {
                    category: 'WATER_DAMAGE'
                }));
                const data = await assertSuccessResponse(response);
                expect(data.isValid).toBe(true);
            });

            it('should reject invalid category', async () => {
                const response = await POST(createRequest.post('/api/validate/fields', {
                    category: 'INVALID_CATEGORY'
                }));
                await assertErrorResponse(response, 400, {
                    field: 'category',
                    messageIncludes: 'Must be one of'
                });
            });

            it('should validate all valid categories', async () => {
                const validCategories = ['WATER_DAMAGE', 'FIRE_DAMAGE', 'MOLD', 'CLEANING'];
                for (const category of validCategories) {
                    const response = await POST(createRequest.post('/api/validate/fields', { category }));
                    const data = await assertSuccessResponse(response);
                    expect(data.isValid).toBe(true);
                }
            });
        });

        describe('Description Validation', () => {
            it('should validate valid description', async () => {
                const response = await POST(createRequest.post('/api/validate/fields', {
                    description: 'Valid description'
                }));
                const data = await assertSuccessResponse(response);
                expect(data.isValid).toBe(true);
            });

            it('should reject description exceeding max length', async () => {
                const longDescription = 'a'.repeat(1001); // 1001 characters
                const response = await POST(createRequest.post('/api/validate/fields', {
                    description: longDescription
                }));
                await assertErrorResponse(response, 400, {
                    field: 'description',
                    messageIncludes: 'must not exceed 1000 characters'
                });
            });

            it('should accept empty description', async () => {
                const response = await POST(createRequest.post('/api/validate/fields', {
                    description: ''
                }));
                const data = await assertSuccessResponse(response);
                expect(data.isValid).toBe(true);
            });
        });

        describe('Multiple Field Validation', () => {
            it('should report all invalid fields', async () => {
                const response = await POST(createRequest.post('/api/validate/fields', {
                    status: 'INVALID_STATUS',
                    priority: 'INVALID_PRIORITY',
                    category: 'INVALID_CATEGORY',
                    description: 'a'.repeat(1001)
                }));
                const data = await response.json();
                expect(data.success).toBe(false);
                expect(data.errors).toHaveLength(4);
                expect(data.errors).toEqual(expect.arrayContaining([
                    expect.objectContaining({ field: 'status' }),
                    expect.objectContaining({ field: 'priority' }),
                    expect.objectContaining({ field: 'category' }),
                    expect.objectContaining({ field: 'description' })
                ]));
            });
        });

        describe('Error Handling', () => {
            it('should handle invalid JSON', async () => {
                const response = await POST(new Request(
                    'http://localhost/api/validate/fields',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: 'invalid json'
                    }
                ));
                await assertErrorResponse(response, 500, {
                    field: 'general',
                    messageIncludes: 'Failed to process request'
                });
            });
        });
    });
});
