import { POST } from '../../../app/api/validate/route';
import { jest, expect, describe, it } from '@jest/globals';
import { createRequest, assertSuccessResponse, assertErrorResponse } from '../../utils/testUtils';

/**
 * Tests for the Job Validation API
 * API-1 Segment: Job Validation
 * Covers:
 * - Format validation
 * - Component validation
 * - Error handling
 */
describe('Validation API', () => {
    const currentYear = new Date().getFullYear();
    
    describe('POST /api/validate', () => {
        it('should validate a correct job number', async () => {
            const jobNumber = `${currentYear}-0101-001`;
            const response = await POST(createRequest.post('/api/validate', { jobNumber }));
            const data = await assertSuccessResponse(response);
            expect(data.isValid).toBe(true);
        });

        it('should reject missing job number', async () => {
            const response = await POST(createRequest.post('/api/validate', {}));
            await assertErrorResponse(response, 400, {
                field: 'jobNumber',
                messageIncludes: 'required'
            });
        });

        describe('Format Validation', () => {
            it('should reject invalid format', async () => {
                const jobNumber = 'invalid-format';
                const response = await POST(createRequest.post('/api/validate', { jobNumber }));
                await assertErrorResponse(response, 400, {
                    field: 'jobNumber',
                    messageIncludes: 'Expected: YYYY-MMDD-SSS'
                });
            });

            it('should reject wrong segment lengths', async () => {
                const jobNumber = '202-0101-01';
                const response = await POST(createRequest.post('/api/validate', { jobNumber }));
                await assertErrorResponse(response, 400, {
                    field: 'jobNumber',
                    messageIncludes: 'Expected: YYYY-MMDD-SSS'
                });
            });
        });

        describe('Year Validation', () => {
            it('should reject past year', async () => {
                const jobNumber = `${currentYear - 1}-0101-001`;
                const response = await POST(createRequest.post('/api/validate', { jobNumber }));
                await assertErrorResponse(response, 400, {
                    field: 'jobNumber',
                    messageIncludes: 'Must be current year'
                });
            });

            it('should reject future year', async () => {
                const jobNumber = `${currentYear + 1}-0101-001`;
                const response = await POST(createRequest.post('/api/validate', { jobNumber }));
                await assertErrorResponse(response, 400, {
                    field: 'jobNumber',
                    messageIncludes: 'Must be current year'
                });
            });
        });

        describe('Month Validation', () => {
            it('should reject month 00', async () => {
                const jobNumber = `${currentYear}-0001-001`;
                const response = await POST(createRequest.post('/api/validate', { jobNumber }));
                await assertErrorResponse(response, 400, {
                    field: 'jobNumber',
                    messageIncludes: 'Must be between 01 and 12'
                });
            });

            it('should reject month 13', async () => {
                const jobNumber = `${currentYear}-1301-001`;
                const response = await POST(createRequest.post('/api/validate', { jobNumber }));
                await assertErrorResponse(response, 400, {
                    field: 'jobNumber',
                    messageIncludes: 'Must be between 01 and 12'
                });
            });
        });

        describe('Day Validation', () => {
            it('should reject day 00', async () => {
                const jobNumber = `${currentYear}-0100-001`;
                const response = await POST(createRequest.post('/api/validate', { jobNumber }));
                await assertErrorResponse(response, 400, {
                    field: 'jobNumber',
                    messageIncludes: 'Must be between 01 and'
                });
            });

            it('should reject invalid day for month', async () => {
                const jobNumber = `${currentYear}-0231-001`; // February 31st
                const response = await POST(createRequest.post('/api/validate', { jobNumber }));
                await assertErrorResponse(response, 400, {
                    field: 'jobNumber',
                    messageIncludes: 'Must be between 01 and'
                });
            });

            it('should accept valid day for month', async () => {
                const jobNumber = `${currentYear}-0228-001`; // February 28th
                const response = await POST(createRequest.post('/api/validate', { jobNumber }));
                const data = await assertSuccessResponse(response);
                expect(data.isValid).toBe(true);
            });
        });

        describe('Sequence Validation', () => {
            it('should reject sequence 000', async () => {
                const jobNumber = `${currentYear}-0101-000`;
                const response = await POST(createRequest.post('/api/validate', { jobNumber }));
                await assertErrorResponse(response, 400, {
                    field: 'jobNumber',
                    messageIncludes: 'Must be between 001 and 999'
                });
            });

            it('should reject sequence above 999', async () => {
                const jobNumber = `${currentYear}-0101-1000`;
                const response = await POST(createRequest.post('/api/validate', { jobNumber }));
                await assertErrorResponse(response, 400, {
                    field: 'jobNumber',
                    messageIncludes: 'Expected: YYYY-MMDD-SSS'
                });
            });
        });

        describe('Error Handling', () => {
            it('should handle invalid JSON', async () => {
                const response = await POST(new Request(
                    'http://localhost/api/validate',
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
