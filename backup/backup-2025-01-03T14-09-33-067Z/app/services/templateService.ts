import { prisma } from '../lib/prisma';
import { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';

type Template = Prisma.TemplateGetPayload<{}>;
type TemplateSection = Prisma.TemplateSectionGetPayload<{}>;
type TemplateField = Prisma.TemplateFieldGetPayload<{}>;
type ValidationRule = Prisma.ValidationRuleGetPayload<{}>;

export type TemplateWithRelations = Prisma.TemplateGetPayload<{
  include: {
    sections: {
      include: {
        fields: {
          include: {
            validationRules: true
          }
        }
      }
    }
  }
}>;

export type CreateTemplateInput = {
  name: string;
  description?: string;
  category: 'Commercial' | 'Residential';
  sections: Array<Omit<TemplateSection, 'id' | 'templateId' | 'createdAt' | 'updatedAt'> & {
    title: string;
    description?: string;
    order: number;
    isRequired: boolean;
    fields: Array<Omit<TemplateField, 'id' | 'sectionId' | 'createdAt' | 'updatedAt'> & {
      label: string;
      type: string;
      description?: string;
      placeholder?: string;
      defaultValue?: string;
      options?: any;
      order: number;
      isRequired: boolean;
      validationRules?: Array<Omit<ValidationRule, 'id' | 'fieldId' | 'createdAt' | 'updatedAt'> & {
        type: string;
        value: string;
        message: string;
      }>;
    }>;
  }>;
};

export class TemplateService {
  // Create a new template with all related data
  async createTemplate(data: CreateTemplateInput): Promise<TemplateWithRelations> {
    try {
      return prisma.template.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        sections: {
          create: data.sections.map(section => ({
            title: section.title,
            description: section.description,
            order: section.order,
            isRequired: section.isRequired,
            fields: {
              create: section.fields.map(field => ({
                label: field.label,
                type: field.type,
                description: field.description,
                placeholder: field.placeholder,
                defaultValue: field.defaultValue,
                options: field.options,
                order: field.order,
                isRequired: field.isRequired,
                validationRules: field.validationRules ? {
                  create: field.validationRules.map(rule => ({
                    type: rule.type,
                    value: rule.value,
                    message: rule.message
                  }))
                } : undefined
              }))
            }
          }))
        }
      },
      include: {
        sections: {
          include: {
            fields: {
              include: {
                validationRules: true
              }
            }
          }
        }
      }
      });
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  // Get all templates
  async getTemplates(): Promise<Template[]> {
    return prisma.template.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Get template by ID with all relations
  async getTemplateById(id: string): Promise<TemplateWithRelations | null> {
    return prisma.template.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: {
            order: 'asc'
          },
          include: {
            fields: {
              orderBy: {
                order: 'asc'
              },
              include: {
                validationRules: true
              }
            }
          }
        }
      }
    });
  }

  // Update template
  async updateTemplate(
    id: string,
    data: Partial<CreateTemplateInput>
  ): Promise<TemplateWithRelations> {
    // First, delete existing relations to avoid conflicts
    await prisma.$transaction([
      prisma.validationRule.deleteMany({
        where: {
          field: {
            section: {
              templateId: id
            }
          }
        }
      }),
      prisma.templateField.deleteMany({
        where: {
          section: {
            templateId: id
          }
        }
      }),
      prisma.templateSection.deleteMany({
        where: {
          templateId: id
        }
      })
    ]);

    // Then update the template with new data
    return prisma.template.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        sections: data.sections ? {
          create: data.sections.map(section => ({
            title: section.title,
            description: section.description,
            order: section.order,
            isRequired: section.isRequired,
            fields: {
              create: section.fields.map(field => ({
                label: field.label,
                type: field.type,
                description: field.description,
                placeholder: field.placeholder,
                defaultValue: field.defaultValue,
                options: field.options,
                order: field.order,
                isRequired: field.isRequired,
                validationRules: field.validationRules ? {
                  create: field.validationRules.map(rule => ({
                    type: rule.type,
                    value: rule.value,
                    message: rule.message
                  }))
                } : undefined
              }))
            }
          }))
        } : undefined
      },
      include: {
        sections: {
          include: {
            fields: {
              include: {
                validationRules: true
              }
            }
          }
        }
      }
    });
  }

  // Soft delete template
  async deleteTemplate(id: string): Promise<Template> {
    return prisma.template.update({
      where: { id },
      data: {
        isActive: false
      }
    });
  }

  // Get templates by category
  async getTemplatesByCategory(category: 'Commercial' | 'Residential'): Promise<Template[]> {
    return prisma.template.findMany({
      where: {
        category,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Clone template
  async cloneTemplate(id: string, newName: string): Promise<TemplateWithRelations> {
    const template = await this.getTemplateById(id);
    if (!template) {
      throw new Error('Template not found');
    }

    const { id: _, createdAt, updatedAt, ...templateData } = template as any;
    return this.createTemplate({
      ...templateData,
      name: newName,
      sections: template.sections.map(section => ({
        ...section,
        fields: section.fields.map(field => ({
          ...field,
          validationRules: field.validationRules
        }))
      }))
    });
  }
}

export const templateService = new TemplateService();
