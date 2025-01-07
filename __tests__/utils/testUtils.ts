import type { Job } from '../../app/services/jobService';
import type { JobStatus, JobPriority } from '../../app/types/client';

/**
 * Request Factories
 */
export const createRequest = {
    get: (path: string, params: Record<string, string> = {}, headers: Record<string, string> = {}) => {
        const searchParams = new URLSearchParams(params);
        return new Request(`http://localhost${path}?${searchParams.toString()}`, {
            headers: new Headers(headers)
        });
    },

    post: (path: string, body: any, headers: Record<string, string> = {}) => {
        return new Request(`http://localhost${path}`, {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                ...headers
            }),
            body: JSON.stringify(body)
        });
    },

    put: (path: string, body: any, headers: Record<string, string> = {}) => {
        return new Request(`http://localhost${path}`, {
            method: 'PUT',
            headers: new Headers({
                'Content-Type': 'application/json',
                ...headers
            }),
            body: JSON.stringify(body)
        });
    },

    delete: (path: string, headers: Record<string, string> = {}) => {
        return new Request(`http://localhost${path}`, {
            method: 'DELETE',
            headers: new Headers(headers)
        });
    }
};

/**
 * Mock Data Factories
 */
export const createMockJob = (overrides: Partial<Job> = {}): Job => ({
    id: '1',
    jobNumber: '2024-0101-001',
    clientId: '123',
    status: 'PENDING' as JobStatus,
    priority: 'HIGH' as JobPriority,
    category: 'WATER_DAMAGE',
    description: 'Test job',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
});

/**
 * Response Assertions
 */
export const assertErrorResponse = async (response: Response, status: number, fieldError: { field: string; messageIncludes: string }) => {
    expect(response.status).toBe(status);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.errors).toContainEqual(
        expect.objectContaining({
            field: fieldError.field,
            message: expect.stringContaining(fieldError.messageIncludes)
        })
    );
    return data;
};

export const assertSuccessResponse = async (response: Response) => {
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    return data;
};

/**
 * Service Mock Factories
 */
export const createJobServiceMocks = () => {
    const exists = jest.fn();
    const createJob = jest.fn();
    const updateJob = jest.fn();
    const deleteJob = jest.fn();
    const listJobs = jest.fn();

    const mocks = {
        exists,
        createJob,
        updateJob,
        deleteJob,
        listJobs
    };

    jest.mock('../../app/services/jobService', () => ({
        JobService: mocks
    }));

    return mocks;
};

/**
 * Test Data Types
 */
export type TestError = {
    field: string;
    messageIncludes: string;
};

export type TestResponse<T> = {
    success: boolean;
    data?: T;
    errors?: Array<{
        field: string;
        message: string;
    }>;
};
