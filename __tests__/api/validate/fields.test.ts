import { POST } from '../../../app/api/validate/fields/route';
import { jest, expect, describe, it } from '@jest/globals';
import { JobStatus, JobPriority } from '../../../app/types/client';

describe('Job Fields Validation API', () => {
    const mockRequest = (body: any) => new Request('http://localhost/api/validate/fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    describe('POST /api/validate/fields', () => {
        it('should validate valid job fields', async () => {
            const response = await POST(mockRequest({
                status: 'IN_PROGRESS' as JobStatus,
                priority: 'HIGH' as JobPriority,
                category: 'WATER_DAMAGE',
                description: 'Valid description'
            }));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.isValid).toBe(true);
            expect(data.validatedFields).toEqual({
                status: true,
                priority: true,
                category: true,
                description: true
            });
        });

        it('should validate partial fields', async () => {
            const response = await POST(mockRequest({
                status: 'IN_PROGRESS' as JobStatus,
                category: 'WATER_DAMAGE'
            }));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.isValid).toBe(true);
            expect(data.validatedFields).toEqual({
                status: true,
                category: true
            });
        });

        it('should reject invalid status', async () => {
            const response = await POST(mockRequest({
                status: 'INVALID_STATUS'
            }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.isValid).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'status',
                    message: expect.stringContaining('Invalid status')
                })
            );
        });

        it('should reject invalid priority', async () => {
            const response = await POST(mockRequest({
                priority: 'INVALID_PRIORITY'
            }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.isValid).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'priority',
                    message: expect.stringContaining('Invalid priority')
                })
            );
        });

        it('should reject invalid category', async () => {
            const response = await POST(mockRequest({
                category: 'INVALID_CATEGORY'
            }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.isValid).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'category',
                    message: expect.stringContaining('Invalid category')
                })
            );
        });

        it('should reject empty description', async () => {
            const response = await POST(mockRequest({
                description: ''
            }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.isValid).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'description',
                    message: expect.stringContaining('Description cannot be empty')
                })
            );
        });

        it('should reject description exceeding max length', async () => {
            const response = await POST(mockRequest({
                description: 'a'.repeat(1001)
            }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.isValid).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'description',
                    message: expect.stringContaining('Description too long')
                })
            );
        });

        it('should handle validation errors', async () => {
            const response = await POST(mockRequest({
                status: null,
                priority: undefined,
                category: 123,
                description: {}
            }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.isValid).toBe(false);
            expect(data.errors).toHaveLength(4);
        });

        it('should handle empty request', async () => {
            const response = await POST(mockRequest({}));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.isValid).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'general',
                    message: expect.stringContaining('No fields to validate')
                })
            );
        });
    });
});
