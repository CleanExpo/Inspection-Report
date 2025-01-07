import { templateService } from '../../app/services/templateService';
import { prisma } from '../../app/lib/prisma';
import type { CreateTemplateInput } from '../../app/services/templateService';
import { JsonValue } from '@prisma/client/runtime/library';

// Mock Prisma
jest.mock('../../app/lib/prisma', () => ({
  prisma: {
    template: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    validationRule: {
      deleteMany: jest.fn(),
    },
    templateField: {
      deleteMany: jest.fn(),
    },
    templateSection: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('TemplateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.$transaction as jest.Mock).mockImplementation((operations) => 
      Promise.all(operations)
    );
  });

  describe('createTemplate', () => {
    it('creates a template with sections, fields, and validation rules', async () => {
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
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        sections: [
          {
            id: '1',
            templateId: '1',
            ...mockTemplate.sections[0],
            createdAt: new Date(),
            updatedAt: new Date(),
            fields: [
              {
                id: '1',
                sectionId: '1',
                ...mockTemplate.sections[0].fields[0],
                createdAt: new Date(),
                updatedAt: new Date(),
                validationRules: [
                  {
                    id: '1',
                    fieldId: '1',
                    ...mockTemplate.sections[0].fields[0].validationRules![0],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  },
                ],
              },
            ],
          },
        ],
      };

      (prisma.template.create as jest.Mock).mockResolvedValue(mockResponse);

      const result = await templateService.createTemplate(mockTemplate);

      expect(prisma.template.create).toHaveBeenCalledWith({
        data: {
          name: mockTemplate.name,
          description: mockTemplate.description,
          category: mockTemplate.category,
          sections: {
            create: expect.arrayContaining([
              expect.objectContaining({
                title: mockTemplate.sections[0].title,
                fields: {
                  create: expect.arrayContaining([
                    expect.objectContaining({
                      label: mockTemplate.sections[0].fields[0].label,
                      validationRules: {
                        create: expect.arrayContaining([
                          expect.objectContaining({
                            type: mockTemplate.sections[0].fields[0].validationRules![0].type,
                          }),
                        ]),
                      },
                    }),
                  ]),
                },
              }),
            ]),
          },
        },
        include: {
          sections: {
            include: {
              fields: {
                include: {
                  validationRules: true,
                },
              },
            },
          },
        },
      });

      expect(result).toEqual(mockResponse);
    });

    it('handles errors during template creation', async () => {
      const mockError = new Error('Database error');
      (prisma.template.create as jest.Mock).mockRejectedValue(mockError);

      const mockTemplate: CreateTemplateInput = {
        name: 'Test Template',
        category: 'Commercial',
        sections: [],
      };

      await expect(templateService.createTemplate(mockTemplate)).rejects.toThrow(mockError);
    });
  });

  describe('getTemplates', () => {
    it('returns all active templates', async () => {
      const mockTemplates = [
        {
          id: '1',
          name: 'Template 1',
          category: 'Commercial',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Template 2',
          category: 'Residential',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.template.findMany as jest.Mock).mockResolvedValue(mockTemplates);

      const result = await templateService.getTemplates();

      expect(prisma.template.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toEqual(mockTemplates);
    });
  });

  describe('getTemplateById', () => {
    it('returns template with all relations', async () => {
      const mockTemplate = {
        id: '1',
        name: 'Test Template',
        category: 'Commercial',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        sections: [
          {
            id: '1',
            templateId: '1',
            title: 'Section 1',
            description: 'Section Description',
            order: 1,
            isRequired: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            fields: [
              {
                id: '1',
                sectionId: '1',
                label: 'Field 1',
                type: 'text',
                description: 'Field Description',
                placeholder: 'Enter text',
                defaultValue: '',
                options: {} as JsonValue,
                order: 1,
                isRequired: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                validationRules: [
                  {
                    id: '1',
                    fieldId: '1',
                    type: 'minLength',
                    value: '3',
                    message: 'Must be at least 3 characters',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  },
                ],
              },
            ],
          },
        ],
      };

      (prisma.template.findUnique as jest.Mock).mockResolvedValue(mockTemplate);

      const result = await templateService.getTemplateById('1');

      expect(prisma.template.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          sections: {
            orderBy: { order: 'asc' },
            include: {
              fields: {
                orderBy: { order: 'asc' },
                include: {
                  validationRules: true,
                },
              },
            },
          },
        },
      });

      expect(result).toEqual(mockTemplate);
    });

    it('returns null for non-existent template', async () => {
      (prisma.template.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await templateService.getTemplateById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateTemplate', () => {
    it('updates template and its relations', async () => {
      const mockUpdate: Partial<CreateTemplateInput> = {
        name: 'Updated Template',
        description: 'Updated Description',
        sections: [
          {
            title: 'Updated Section',
            description: 'Updated Section Description',
            order: 1,
            isRequired: true,
            fields: [
              {
                label: 'Updated Field',
                type: 'text',
                description: 'Updated Field Description',
                placeholder: 'Updated placeholder',
                defaultValue: '',
                options: {} as JsonValue,
                order: 1,
                isRequired: true,
                validationRules: [],
              },
            ],
          },
        ],
      };

      const mockResponse = {
        id: '1',
        ...mockUpdate,
        category: 'Commercial',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        sections: [
          {
            id: '1',
            templateId: '1',
            ...mockUpdate.sections![0],
            createdAt: new Date(),
            updatedAt: new Date(),
            fields: [
              {
                id: '1',
                sectionId: '1',
                ...mockUpdate.sections![0].fields[0],
                createdAt: new Date(),
                updatedAt: new Date(),
                validationRules: [],
              },
            ],
          },
        ],
      };

      (prisma.$transaction as jest.Mock).mockResolvedValue([]);
      (prisma.template.update as jest.Mock).mockResolvedValue(mockResponse);

      const result = await templateService.updateTemplate('1', mockUpdate);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.template.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' },
          data: expect.objectContaining({
            name: mockUpdate.name,
            description: mockUpdate.description,
          }),
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getTemplatesByCategory', () => {
    it('returns templates filtered by category', async () => {
      const mockTemplates = [
        {
          id: '1',
          name: 'Commercial Template 1',
          category: 'Commercial',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.template.findMany as jest.Mock).mockResolvedValue(mockTemplates);

      const result = await templateService.getTemplatesByCategory('Commercial');

      expect(prisma.template.findMany).toHaveBeenCalledWith({
        where: {
          category: 'Commercial',
          isActive: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(result).toEqual(mockTemplates);
    });
  });
});
