import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../api/client';
import { ClientService } from '../../services/clientService';
import { AddressFormatter } from '../../utils/addressFormatting';
import { AuthenticatedRequest } from '../../middleware/auth';

jest.mock('../../services/clientService');

describe('Client API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/client', () => {
    it('should create a new client with valid data', async () => {
      const validClient = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '0412345678',
        address: '123 Main Street, Sydney NSW 2000',
        company: 'ACME Corp',
        abn: '12345678901',
        preferredContact: 'email',
      };

      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'POST',
        body: validClient,
        headers: {
          'authorization': 'Bearer valid-token',
        },
      });

      const mockResponse = {
        ...validClient,
        id: '123',
        createdAt: new Date(),
        updatedAt: new Date(),
        inspections: [],
      };

      jest.spyOn(ClientService, 'createClient').mockResolvedValueOnce(mockResponse);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toHaveProperty('id');
      expect(responseData.name).toBe(validClient.name);
      expect(responseData.email).toBe(validClient.email);
      expect(AddressFormatter.parseAddress(responseData.address)).toBeTruthy();
    });

    it('should return validation error for invalid data', async () => {
      const invalidClient = {
        name: '', // Invalid: empty name
        email: 'invalid-email', // Invalid: wrong format
        phone: '123', // Invalid: wrong format
        address: 'invalid address', // Invalid: wrong format
      };

      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'POST',
        body: invalidClient,
        headers: {
          'authorization': 'Bearer valid-token',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('ValidationError');
      expect(responseData.details).toHaveProperty('name');
      expect(responseData.details).toHaveProperty('email');
      expect(responseData.details).toHaveProperty('phone');
      expect(responseData.details).toHaveProperty('address');
    });
  });

  describe('GET /api/client', () => {
    const mockClient = {
      id: '123',
      name: 'John Smith',
      email: 'john@example.com',
      phone: '0412345678',
      address: '123 Main Street, Sydney NSW 2000',
      createdAt: new Date(),
      updatedAt: new Date(),
      inspections: [],
    };

    it('should get client by ID', async () => {
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        query: { id: '123' },
        headers: {
          'authorization': 'Bearer valid-token',
        },
      });

      jest.spyOn(ClientService, 'getClient').mockResolvedValueOnce(mockClient);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockClient);
    });

    it('should get client by email', async () => {
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        query: { email: 'john@example.com' },
        headers: {
          'authorization': 'Bearer valid-token',
        },
      });

      jest.spyOn(ClientService, 'getClientByEmail').mockResolvedValueOnce(mockClient);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockClient);
    });

    it('should search clients by address', async () => {
      const address = '123 Main Street, Sydney NSW 2000';
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        query: { address },
        headers: {
          'authorization': 'Bearer valid-token',
        },
      });

      jest.spyOn(ClientService, 'searchClients').mockResolvedValueOnce([mockClient]);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(Array.isArray(responseData)).toBe(true);
      expect(responseData[0]).toEqual(mockClient);
    });
  });

  describe('PUT /api/client', () => {
    it('should update client with valid data', async () => {
      const updates = {
        name: 'John Updated Smith',
        address: '456 New Street, Melbourne VIC 3000',
      };

      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'PUT',
        query: { id: '123' },
        body: updates,
        headers: {
          'authorization': 'Bearer valid-token',
        },
      });

      const updatedClient = {
        id: '123',
        ...updates,
        email: 'john@example.com',
        phone: '0412345678',
        createdAt: new Date(),
        updatedAt: new Date(),
        inspections: [],
      };

      jest.spyOn(ClientService, 'updateClient').mockResolvedValueOnce(updatedClient);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.name).toBe(updates.name);
      expect(AddressFormatter.parseAddress(responseData.address)).toBeTruthy();
    });
  });

  describe('DELETE /api/client', () => {
    it('should delete client', async () => {
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'DELETE',
        query: { id: '123' },
        headers: {
          'authorization': 'Bearer valid-token',
        },
      });

      jest.spyOn(ClientService, 'deleteClient').mockResolvedValueOnce();

      await handler(req, res);

      expect(res._getStatusCode()).toBe(204);
      expect(ClientService.deleteClient).toHaveBeenCalledWith('123');
    });

    it('should return 400 if id is missing', async () => {
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'DELETE',
        headers: {
          'authorization': 'Bearer valid-token',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData()).error).toBe('Missing client ID');
    });
  });
});
