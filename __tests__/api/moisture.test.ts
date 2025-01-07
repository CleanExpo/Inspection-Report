import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../api/moisture';
import { moistureService } from '../../app/services/moistureService';
import { Role } from '../../middleware/auth';
import { redis } from '../../lib/redis';
import { verify } from 'jsonwebtoken';

// Mock dependencies
jest.mock('../../app/services/moistureService');
jest.mock('jsonwebtoken');
jest.mock('../../lib/redis');

describe('Moisture API', () => {
    let mockReq: Partial<NextApiRequest>;
    let mockRes: Partial<NextApiResponse>;
    let mockVerify: jest.MockedFunction<typeof verify>;
    let mockRedis: jest.Mocked<typeof redis>;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup request mock
        mockReq = {
            method: 'GET',
            query: {},
            headers: {
                authorization: 'Bearer valid.token.here'
            }
        };

        // Setup response mock
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            setHeader: jest.fn()
        };

        // Setup JWT verify mock
        mockVerify = verify as jest.MockedFunction<typeof verify>;

        // Setup Redis mock
        mockRedis = redis as jest.Mocked<typeof redis>;
    });

    describe('Authentication & Authorization', () => {
        it('should allow viewers to read data', async () => {
            mockReq.method = 'GET';
            mockReq.query = { mapId: '123' };
            mockVerify.mockReturnValueOnce({
                userId: '123',
                role: Role.VIEWER,
                email: 'viewer@example.com'
            } as any);

            const mockMap = { id: '123', name: 'Test Map' };
            (moistureService.getMapById as jest.Mock).mockResolvedValueOnce(mockMap);

            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockMap);
        });

        it('should prevent viewers from creating data', async () => {
            mockReq.method = 'POST';
            mockVerify.mockReturnValueOnce({
                userId: '123',
                role: Role.VIEWER,
                email: 'viewer@example.com'
            } as any);

            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(moistureService.createMap).not.toHaveBeenCalled();
        });

        it('should allow technicians to create and update data', async () => {
            mockReq.method = 'POST';
            mockReq.body = { jobId: '123', name: 'New Map' };
            mockVerify.mockReturnValueOnce({
                userId: '123',
                role: Role.TECHNICIAN,
                email: 'tech@example.com'
            } as any);

            const mockMap = { id: '456', ...mockReq.body };
            (moistureService.createMap as jest.Mock).mockResolvedValueOnce(mockMap);

            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(mockMap);
        });

        it('should allow only admins to delete data', async () => {
            mockReq.method = 'DELETE';
            mockReq.query = { readingId: '123' };
            mockVerify.mockReturnValueOnce({
                userId: '123',
                role: Role.ADMIN,
                email: 'admin@example.com'
            } as any);

            const mockReading = { id: '123', value: 10 };
            (moistureService.deleteReading as jest.Mock).mockResolvedValueOnce(mockReading);

            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockReading);
        });
    });

    describe('Caching', () => {
        beforeEach(() => {
            mockVerify.mockReturnValue({
                userId: '123',
                role: Role.VIEWER,
                email: 'viewer@example.com'
            } as any);
        });

        it('should return cached data when available', async () => {
            mockReq.method = 'GET';
            mockReq.query = { mapId: '123' };

            const cachedData = {
                data: { id: '123', name: 'Cached Map' },
                headers: { 'content-type': 'application/json' }
            };
            mockRedis.get.mockResolvedValueOnce(JSON.stringify(cachedData));

            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            expect(moistureService.getMapById).not.toHaveBeenCalled();
            expect(mockRes.setHeader).toHaveBeenCalledWith('X-Cache', 'HIT');
            expect(mockRes.json).toHaveBeenCalledWith(cachedData.data);
        });

        it('should cache successful GET responses', async () => {
            mockReq.method = 'GET';
            mockReq.query = { mapId: '123' };
            mockRedis.get.mockResolvedValueOnce(null);

            const mockMap = { id: '123', name: 'Test Map' };
            (moistureService.getMapById as jest.Mock).mockResolvedValueOnce(mockMap);

            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            expect(mockRes.setHeader).toHaveBeenCalledWith('X-Cache', 'MISS');
            expect(mockRedis.setex).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith(mockMap);
        });

        it('should invalidate cache on successful mutations', async () => {
            mockReq.method = 'PUT';
            mockReq.query = { mapId: '123' };
            mockReq.body = { name: 'Updated Map' };
            mockVerify.mockReturnValueOnce({
                userId: '123',
                role: Role.TECHNICIAN,
                email: 'tech@example.com'
            } as any);

            const mockMap = { id: '123', ...mockReq.body };
            (moistureService.updateMap as jest.Mock).mockResolvedValueOnce(mockMap);

            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            expect(mockRedis.keys).toHaveBeenCalledWith('moisture:*mapId=123*');
            expect(mockRedis.del).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            mockVerify.mockReturnValue({
                userId: '123',
                role: Role.VIEWER,
                email: 'viewer@example.com'
            } as any);
        });

        it('should handle not found errors', async () => {
            mockReq.method = 'GET';
            mockReq.query = { mapId: '123' };
            (moistureService.getMapById as jest.Mock).mockResolvedValueOnce(null);

            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Map not found' });
        });

        it('should handle validation errors', async () => {
            mockReq.method = 'POST';
            mockReq.query = { mapId: '123', type: 'reading' };
            mockReq.body = { value: 'invalid' }; // Missing required fields
            mockVerify.mockReturnValueOnce({
                userId: '123',
                role: Role.TECHNICIAN,
                email: 'tech@example.com'
            } as any);

            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                error: expect.any(String)
            }));
        });

        it('should handle service errors gracefully', async () => {
            mockReq.method = 'GET';
            mockReq.query = { mapId: '123' };
            (moistureService.getMapById as jest.Mock).mockRejectedValueOnce(
                new Error('Database error')
            );

            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                error: expect.any(String)
            }));
        });
    });

    describe('Input Validation', () => {
        beforeEach(() => {
            mockVerify.mockReturnValue({
                userId: '123',
                role: Role.TECHNICIAN,
                email: 'tech@example.com'
            } as any);
        });

        it('should validate reading creation input', async () => {
            mockReq.method = 'POST';
            mockReq.query = { mapId: '123', type: 'reading' };
            mockReq.body = {
                value: 15.5,
                materialType: 'WOOD',
                location: { x: 10, y: 20 },
                notes: 'Test reading'
            };

            const mockReading = { id: '456', ...mockReq.body };
            (moistureService.addReading as jest.Mock).mockResolvedValueOnce(mockReading);

            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(mockReading);
        });

        it('should validate map creation input', async () => {
            mockReq.method = 'POST';
            mockReq.body = {
                jobId: '123',
                name: 'Test Map',
                layout: { width: 100, height: 100 }
            };

            const mockMap = { id: '456', ...mockReq.body };
            (moistureService.createMap as jest.Mock).mockResolvedValueOnce(mockMap);

            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(mockMap);
        });

        it('should require job ID or map ID for GET requests', async () => {
            mockReq.method = 'GET';
            mockReq.query = {};
            mockVerify.mockReturnValueOnce({
                userId: '123',
                role: Role.VIEWER,
                email: 'viewer@example.com'
            } as any);

            await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Job ID or Map ID is required'
            });
        });
    });
});
