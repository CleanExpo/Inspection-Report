import { createMocks } from 'node-mocks-http';
import templateHandler from '../../api/template';
import { templateService } from '../../app/services/templateService';
import type { CreateTemplateInput } from '../../app/services/templateService';
import { JsonValue } from '@prisma/client/runtime/library';

// Mock the template service
jest.mock('../../app/services/templateService');

// Mock the middleware
jest.mock('../../middleware/auth', () => ({
  withRole: (role: string) => (handler: any) => handler,
  AuthenticatedRequest: {},
}));

jest.mock('../../middleware/validateTemplate', () => ({
  withTemplateValidation: (handler: any) => handler,
}));

jest.mock('../../middleware/rateLimit', () => ({
  withRateLimit: (handler: any) => handler,
}));

jest.mock('../../middleware/cors', () => ({
  withCors: (handler: any) => handler,
}));

describe('Template API', () => {
  const defaultMockOptions = {
    body: {},
    query: {},
    cookies: {},
    env: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/template', () => {
    it('creates a new template', async () => {
      const mockTemplate: CreateTemplateInput = {
        name: 'Test Template',
        description: 'Test Description',
        category: 'Commercial',
        sections: [
          {
            title: 'Section 1',
            description: 'Section Description',
            order: 1,
            isRequired: true,
            fields: [
              {
                label: 'Field 1',
                type: 'text',
                description: 'Field Description',
                placeholder: 'Enter text',
                defaultValue: '',
                options: {} as JsonValue,
                order: 1,
                isRequired: true,
                validationRules: [
                  {
                    type: 'minLength',
                    value: '3',
                    message: 'Must be at least 3 characters',
                  },
                ],
              },
            ],
          },
        ],
      };

      const mockResponse = {
        id: '1',
        ...mockTemplate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      };

      (templateService.createTemplate as jest.Mock).mockResolvedValue(mockResponse);

      const { req, res } = createMocks({
        ...defaultMockOptions,
        method: 'POST',
        body: mockTemplate,
      });

      await templateHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual(mockResponse);
    });
  });

  describe('GET /api/template', () => {
    it('returns all templates', async () => {
      const mockTemplates = [
        {
          id: '1',
          name: 'Template 1',
          category: 'Commercial',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      (templateService.getTemplates as jest.Mock).mockResolvedValue(mockTemplates);

      const { req, res } = createMocks({
        ...defaultMockOptions,
        method: 'GET',
      });

      await templateHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockTemplates);
    });

    it('returns templates filtered by category', async () => {
      const mockTemplates = [
        {
          id: '1',
          name: 'Commercial Template',
          category: 'Commercial',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      (templateService.getTemplatesByCategory as jest.Mock).mockResolvedValue(mockTemplates);

      const { req, res } = createMocks({
        ...defaultMockOptions,
        method: 'GET',
        query: { category: 'Commercial' },
      });

      await templateHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockTemplates);
    });

    it('returns a single template by ID', async () => {
      const mockTemplate = {
        id: '1',
        name: 'Test Template',
        category: 'Commercial',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (templateService.getTemplateById as jest.Mock).mockResolvedValue(mockTemplate);

      const { req, res } = createMocks({
        ...defaultMockOptions,
        method: 'GET',
        query: { id: '1' },
      });

      await templateHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockTemplate);
    });
  });

  describe('PUT /api/template', () => {
    it('updates a template', async () => {
      const mockUpdate = {
        name: 'Updated Template',
        description: 'Updated Description',
      };

      const mockResponse = {
        id: '1',
        ...mockUpdate,
        category: 'Commercial',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (templateService.updateTemplate as jest.Mock).mockResolvedValue(mockResponse);

      const { req, res } = createMocks({
        ...defaultMockOptions,
        method: 'PUT',
        query: { id: '1' },
        body: mockUpdate,
      });

      await templateHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockResponse);
    });
  });

  describe('DELETE /api/template', () => {
    it('soft deletes a template', async () => {
      const mockResponse = {
        id: '1',
        name: 'Test Template',
        category: 'Commercial',
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (templateService.deleteTemplate as jest.Mock).mockResolvedValue(mockResponse);

      const { req, res } = createMocks({
        ...defaultMockOptions,
        method: 'DELETE',
        query: { id: '1' },
      });

      await templateHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockResponse);
    });
  });

  describe('Error handling', () => {
    it('returns 400 when required parameters are missing', async () => {
      const { req, res } = createMocks({
        ...defaultMockOptions,
        method: 'PUT',
      });

      await templateHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Template ID is required',
      });
    });

    it('returns 404 when template is not found', async () => {
      (templateService.getTemplateById as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMocks({
        ...defaultMockOptions,
        method: 'GET',
        query: { id: 'non-existent' },
      });

      await templateHandler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Template not found',
      });
    });

    it('returns 405 for unsupported methods', async () => {
      const { req, res } = createMocks({
        ...defaultMockOptions,
        method: 'PATCH',
      });

      await templateHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Method PATCH Not Allowed',
      });
      expect(res.getHeader('Allow')).toEqual(['GET', 'POST', 'PUT', 'DELETE']);
    });
  });
});
