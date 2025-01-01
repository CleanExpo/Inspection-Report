import { POST } from '../../../app/api/jobs/route';
import { ClientService } from '../../../app/services/clientService';
import type { JobPriority as JobPriorityType, JobStatus as JobStatusType } from '../../../app/types/client';
import { jest, expect, describe, it, beforeEach } from '@jest/globals';

// Enums and constants for testing
enum JobStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED'
}

enum JobPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH'
}

const JobCategory = {
    WATER_DAMAGE: 'WATER_DAMAGE'
} as const;

// Ensure enums match the types
const _typeCheck: JobStatusType = JobStatus.PENDING;
const _typeCheck2: JobPriorityType = JobPriority.HIGH;

// Mock ClientService
const mockExists = jest.fn() as jest.MockedFunction<(clientId: string) => Promise<boolean>>;
jest.mock('../../../app/services/clientService', () => ({
    ClientService: {
        exists: mockExists,
        createClient: jest.fn(),
        getClient: jest.fn(),
        listClients: jest.fn(),
        updateClient: jest.fn(),
        deleteClient: jest.fn()
    }
}));

/**
 * Tests for the Jobs API POST endpoint
 * API-1 Segment: Job Management Base
 * Covers:
 * - Basic validation
 * - Error handling
 * - Response formatting
 */
describe('Jobs API - POST Endpoint', () => {
    const mockClientId = '123';
    const mockRequest = (body: any) => new Request('http://localhost/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/jobs', () => {
        it('should create a job with valid data', async () => {
            // Mock client exists
            mockExists.mockResolvedValue(true);

            const response = await POST(mockRequest({
                clientId: mockClientId,
                category: JobCategory.WATER_DAMAGE,
                status: JobStatus.PENDING,
                priority: JobPriority.HIGH,
                description: 'Test job'
            }));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.jobNumber).toMatch(/^\d{4}-\d{4}-\d{3}$/);
        });

        it('should reject request with missing required fields', async () => {
            const response = await POST(mockRequest({
                clientId: mockClientId
                // missing category
            }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'category',
                    message: expect.any(String)
                })
            );
        });

        it('should reject invalid client ID', async () => {
            // Mock client does not exist
            mockExists.mockResolvedValue(false);

            const response = await POST(mockRequest({
                clientId: 'invalid-id',
                category: JobCategory.WATER_DAMAGE
            }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'clientId',
                    message: expect.any(String)
                })
            );
        });

        it('should reject invalid job category', async () => {
            // Mock client exists
            mockExists.mockResolvedValue(true);

            const response = await POST(mockRequest({
                clientId: mockClientId,
                category: 'INVALID_CATEGORY'
            }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'general',
                    message: expect.stringContaining('Invalid job category')
                })
            );
        });

        it('should handle client service errors', async () => {
            // Mock client service error
            mockExists.mockRejectedValue(new Error('DB Error'));

            const response = await POST(mockRequest({
                clientId: mockClientId,
                category: JobCategory.WATER_DAMAGE
            }));
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({
                    field: 'clientId',
                    message: expect.any(String)
                })
            );
        });

        it('should accept custom sequence number', async () => {
            // Mock client exists
            mockExists.mockResolvedValue(true);

            const sequence = 42;
            const response = await POST(mockRequest({
                clientId: mockClientId,
                category: JobCategory.WATER_DAMAGE,
                sequence
            }));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.jobNumber).toMatch(/-042$/);
        });
    });
});
