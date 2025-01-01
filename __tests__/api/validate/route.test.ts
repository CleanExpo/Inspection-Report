import { POST } from '../../../app/api/validate/route';
import { jest, expect, describe, it } from '@jest/globals';

describe('Job Validation API', () => {
    const mockRequest = (body: any) => new Request('http://localhost/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    describe('POST /api/validate', () => {
        it('should validate a valid job number', async () => {
            const currentYear = new Date().getFullYear();
            const response = await POST(mockRequest({
                jobNumber: `${currentYear}-0101-001`
            }));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.isValid).toBe(true);
        });

        it('should reject invalid year', async () => {
            const response = await POST(mockRequest({
                jobNumber: '1999-0101-001'
            }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.isValid).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'jobNumber',
                    message: expect.stringContaining('year')
                })
            );
        });

        it('should reject invalid month', async () => {
            const currentYear = new Date().getFullYear();
            const response = await POST(mockRequest({
                jobNumber: `${currentYear}-1301-001`
            }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.isValid).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'jobNumber',
                    message: expect.stringContaining('month')
                })
            );
        });

        it('should reject invalid day', async () => {
            const currentYear = new Date().getFullYear();
            const response = await POST(mockRequest({
                jobNumber: `${currentYear}-0132-001`
            }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.isValid).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'jobNumber',
                    message: expect.stringContaining('day')
                })
            );
        });

        it('should reject invalid sequence number', async () => {
            const currentYear = new Date().getFullYear();
            const response = await POST(mockRequest({
                jobNumber: `${currentYear}-0101-000`
            }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.isValid).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'jobNumber',
                    message: expect.stringContaining('sequence')
                })
            );
        });

        it('should reject invalid format', async () => {
            const response = await POST(mockRequest({
                jobNumber: 'invalid-format'
            }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.isValid).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'jobNumber',
                    message: expect.stringContaining('format')
                })
            );
        });

        it('should reject missing job number', async () => {
            const response = await POST(mockRequest({}));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.isValid).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'jobNumber',
                    message: expect.stringContaining('required')
                })
            );
        });

        it('should handle validation errors', async () => {
            const response = await POST(mockRequest({
                jobNumber: null
            }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.isValid).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'jobNumber',
                    message: expect.any(String)
                })
            );
        });
    });
});
