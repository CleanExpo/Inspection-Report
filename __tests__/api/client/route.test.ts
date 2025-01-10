import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import routeHandler from '../../../app/api/client/route';
import { ClientService } from '../../../app/services/clientService';
import { Role } from '../../../middleware/auth';

// Mock the client service
jest.mock('../../../app/services/clientService');
const mockClientService = ClientService as jest.Mocked<typeof ClientService>;

// Mock the auth middleware
jest.mock('../../../middleware/auth', () => ({
  Role: {
    VIEWER: 'VIEWER',
    TECHNICIAN: 'TECHNICIAN',
    ADMIN: 'ADMIN'
  },
  withRole: (role: string) => (handler: any) => handler,
  AuthenticatedRequest: {}
}));

// Mock other middleware
jest.mock('../../../middleware/rateLimit', () => ({
  withRateLimit: (handler: any) => handler
}));

jest.mock('../../../middleware/cors', () => ({
  withCors: (handler: any) => handler
}));

describe('Client API Route', () => {
  const mockClient = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1-234-567-8900',
    address: '123 Main St',
    city: 'Example City',
    state: 'EX',
    zipCode: '12345',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/client', () => {
    it('should return paginated list of clients', async () => {
      const { req, res } = createMocks({
        method: 'GET'
      });

      mockClientService.listClients.mockResolvedValue({
        clients: [mockClient],
        total: 1
      });

      await routeHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        clients: [mockClient],
        total: 1
      });
    });

    it('should return specific client when ID is provided', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: '1' }
      });

      mockClientService.getClient.mockResolvedValue(mockClient);

      await routeHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockClient);
    });

    it('should return 404 when client is not found', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: 'nonexistent' }
      });

      mockClientService.getClient.mockRejectedValue(new Error('Client not found'));

      await routeHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Client not found'
      });
    });
  });

  describe('POST /api/client', () => {
    it('should create a new client', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1-234-567-8900',
          address: '123 Main St',
          city: 'Example City',
          state: 'EX',
          zipCode: '12345'
        }
      });

      mockClientService.createClient.mockResolvedValue(mockClient);

      await routeHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual(mockClient);
    });

    it('should return 400 for invalid client data', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          // Missing required fields
          email: 'john@example.com'
        }
      });

      await routeHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toHaveProperty('error');
    });
  });

  describe('PUT /api/client', () => {
    it('should update an existing client', async () => {
      const updatedClient = { ...mockClient, name: 'Updated Name' };
      const { req, res } = createMocks({
        method: 'PUT',
        query: { id: '1' },
        body: {
          name: 'Updated Name'
        }
      });

      mockClientService.updateClient.mockResolvedValue(updatedClient);

      await routeHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(updatedClient);
    });

    it('should return 400 when ID is missing', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          name: 'Updated Name'
        }
      });

      await routeHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Client ID is required'
      });
    });

    it('should return 404 when client is not found', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        query: { id: 'nonexistent' },
        body: {
          name: 'Updated Name'
        }
      });

      mockClientService.updateClient.mockRejectedValue(new Error('Client not found'));

      await routeHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Client not found'
      });
    });
  });

  describe('DELETE /api/client', () => {
    it('should delete a client', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: '1' }
      });

      mockClientService.deleteClient.mockResolvedValue(undefined);

      await routeHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res._getStatusCode()).toBe(204);
    });

    it('should return 400 when ID is missing', async () => {
      const { req, res } = createMocks({
        method: 'DELETE'
      });

      await routeHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Client ID is required'
      });
    });

    it('should return 404 when client is not found', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: 'nonexistent' }
      });

      mockClientService.deleteClient.mockRejectedValue(new Error('Client not found'));

      await routeHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Client not found'
      });
    });
  });

  describe('Invalid Methods', () => {
    it('should return 405 for unsupported methods', async () => {
      const { req, res } = createMocks({
        method: 'PATCH'
      });

      await routeHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Method PATCH Not Allowed'
      });
    });
  });
});
