import { generateAccessToken } from '../../app/utils/auth';
import { JobService } from '../../app/services/jobService';
import { GET, POST, PUT, DELETE } from '../../app/api/jobs/route';
import { createRequest } from '../utils/testUtils';

/**
 * End-to-end job workflow tests
 * Tests complete job lifecycle with authentication and validation
 */
describe('Job Workflow Integration', () => {
    // Mock user tokens
    const adminToken = generateAccessToken({
        userId: '123',
        roles: ['ADMIN'],
        email: 'admin@example.com'
    });
    const userToken = generateAccessToken({
        userId: '456',
        roles: ['USER'],
        email: 'user@example.com'
    });
    const viewerToken = generateAccessToken({
        userId: '789',
        roles: ['VIEWER'],
        email: 'viewer@example.com'
    });

    // Mock job data
    const mockJob = {
        clientId: '123',
        category: 'WATER_DAMAGE',
        status: 'PENDING',
        priority: 'HIGH',
        description: 'Test job'
    };

    // Mock JobService
    const mockCreateJob = jest.fn();
    const mockListJobs = jest.fn();
    const mockUpdateJob = jest.fn();
    const mockDeleteJob = jest.fn();
    const mockExists = jest.fn();

    jest.mock('../../app/services/jobService', () => ({
        JobService: {
            createJob: mockCreateJob,
            listJobs: mockListJobs,
            updateJob: mockUpdateJob,
            deleteJob: mockDeleteJob,
            exists: mockExists
        }
    }));

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Complete Job Lifecycle', () => {
        it('should handle complete job lifecycle with admin user', async () => {
            // 1. Create Job
            mockCreateJob.mockResolvedValueOnce({
                ...mockJob,
                jobNumber: '2024-0101-001'
            });

            const createResponse = await POST(createRequest.post('/api/jobs', mockJob, {
                authorization: `Bearer ${adminToken}`
            }));
            const createData = await createResponse.json();
            
            expect(createResponse.status).toBe(200);
            expect(createData.success).toBe(true);
            expect(createData.jobNumber).toBeDefined();

            const jobNumber = createData.jobNumber;

            // 2. Read Job
            mockListJobs.mockResolvedValueOnce({
                jobs: [{
                    ...mockJob,
                    jobNumber,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }],
                total: 1
            });

            const readResponse = await GET(createRequest.get('/api/jobs', {}, {
                authorization: `Bearer ${adminToken}`
            }));
            const readData = await readResponse.json();

            expect(readResponse.status).toBe(200);
            expect(readData.jobs).toHaveLength(1);
            expect(readData.jobs[0].jobNumber).toBe(jobNumber);

            // 3. Update Job
            mockExists.mockResolvedValueOnce(true);
            mockUpdateJob.mockResolvedValueOnce({
                ...mockJob,
                jobNumber,
                status: 'IN_PROGRESS'
            });

            const updateResponse = await PUT(createRequest.put(`/api/jobs/${jobNumber}`, {
                status: 'IN_PROGRESS'
            }, {
                authorization: `Bearer ${adminToken}`
            }));
            const updateData = await updateResponse.json();

            expect(updateResponse.status).toBe(200);
            expect(updateData.success).toBe(true);

            // 4. Delete Job
            mockExists.mockResolvedValueOnce(true);
            mockDeleteJob.mockResolvedValueOnce();

            const deleteResponse = await DELETE(createRequest.delete(`/api/jobs/${jobNumber}`, {
                authorization: `Bearer ${adminToken}`
            }));
            const deleteData = await deleteResponse.json();

            expect(deleteResponse.status).toBe(200);
            expect(deleteData.success).toBe(true);
        });
    });

    describe('Permission-based Access Control', () => {
        it('should enforce read-only access for viewers', async () => {
            // Viewer can read
            mockListJobs.mockResolvedValueOnce({ jobs: [], total: 0 });
            const readResponse = await GET(createRequest.get('/api/jobs', {}, {
                authorization: `Bearer ${viewerToken}`
            }));
            expect(readResponse.status).toBe(200);

            // But cannot create
            const createResponse = await POST(createRequest.post('/api/jobs', mockJob, {
                authorization: `Bearer ${viewerToken}`
            }));
            expect(createResponse.status).toBe(403);
        });

        it('should allow write access for users', async () => {
            mockCreateJob.mockResolvedValueOnce({
                ...mockJob,
                jobNumber: '2024-0101-002'
            });

            const createResponse = await POST(createRequest.post('/api/jobs', mockJob, {
                authorization: `Bearer ${userToken}`
            }));
            expect(createResponse.status).toBe(200);
        });

        it('should restrict delete access to admin', async () => {
            mockExists.mockResolvedValue(true);

            // User cannot delete
            const userDeleteResponse = await DELETE(createRequest.delete('/api/jobs/2024-0101-001', {
                authorization: `Bearer ${userToken}`
            }));
            expect(userDeleteResponse.status).toBe(403);

            // Admin can delete
            mockDeleteJob.mockResolvedValueOnce();
            const adminDeleteResponse = await DELETE(createRequest.delete('/api/jobs/2024-0101-001', {
                authorization: `Bearer ${adminToken}`
            }));
            expect(adminDeleteResponse.status).toBe(200);
        });
    });

    describe('Validation Flow', () => {
        it('should validate job creation input', async () => {
            const invalidJob = {
                clientId: '123',
                category: 'INVALID_CATEGORY', // Invalid category
                status: 'PENDING',
                priority: 'HIGH'
            };

            const response = await POST(createRequest.post('/api/jobs', invalidJob, {
                authorization: `Bearer ${adminToken}`
            }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toBeDefined();
        });

        it('should validate job updates', async () => {
            mockExists.mockResolvedValueOnce(true);

            const response = await PUT(createRequest.put('/api/jobs/2024-0101-001', {
                status: 'INVALID_STATUS' // Invalid status
            }, {
                authorization: `Bearer ${adminToken}`
            }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toBeDefined();
        });
    });

    describe('Error Handling Flow', () => {
        it('should handle database errors gracefully', async () => {
            mockCreateJob.mockRejectedValueOnce(new Error('Database connection failed'));

            const response = await POST(createRequest.post('/api/jobs', mockJob, {
                authorization: `Bearer ${adminToken}`
            }));
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.message).toBeDefined();
        });

        it('should handle not found errors', async () => {
            mockExists.mockResolvedValueOnce(false);

            const response = await PUT(createRequest.put('/api/jobs/non-existent', {
                status: 'IN_PROGRESS'
            }, {
                authorization: `Bearer ${adminToken}`
            }));
            
            expect(response.status).toBe(404);
        });

        it('should handle authentication errors', async () => {
            const response = await POST(createRequest.post('/api/jobs', mockJob, {
                authorization: 'Bearer invalid.token'
            }));
            
            expect(response.status).toBe(401);
        });
    });
});
