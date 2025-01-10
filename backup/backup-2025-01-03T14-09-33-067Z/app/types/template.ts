import { Prisma } from '@prisma/client';

// Database Types
export interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  sections: TemplateSection[];
}

export interface TemplateSection {
  id: string;
  templateId: string;
  title: string;
  description: string | null;
  order: number;
  isRequired: boolean;
  fields: TemplateField[];
}

export interface TemplateField {
  id: string;
  sectionId: string;
  label: string;
  type: string;
  description: string | null;
  placeholder: string | null;
  order: number;
  isRequired: boolean;
  options: string[];
  validationRules: ValidationRule[];
}

export interface ValidationRule {
  id: string;
  fieldId: string;
  type: string;
  value: any;
  message: string;
}

// Constants and Literal Types
export const TemplateCategories = ['Commercial', 'Residential'] as const;
export type TemplateCategory = typeof TemplateCategories[number];

export const FieldTypes = [
  'text',
  'textarea',
  'number',
  'select',
  'multiselect',
  'radio',
  'checkbox',
  'date',
  'time',
  'datetime',
  'email',
  'phone',
  'url',
  'file',
  'image',
] as const;
export type FieldType = typeof FieldTypes[number];

export const ValidationRuleTypes = [
  'required',
  'min',
  'max',
  'minLength',
  'maxLength',
  'pattern',
  'email',
  'url',
  'phone',
] as const;
export type ValidationRuleType = typeof ValidationRuleTypes[number];

// Form Types
export interface FormValidationRule {
  type: ValidationRuleType;
  value: any;
  message: string;
}

export interface FormTemplateField {
  label: string;
  type: FieldType;
  description: string | null;
  placeholder: string | null;
  order: number;
  isRequired: boolean;
  options: string[];
  validationRules: FormValidationRule[];
}

export interface FormTemplateSection {
  title: string;
  description: string | null;
  order: number;
  isRequired: boolean;
  fields: FormTemplateField[];
  sectionType?: string;
}

export interface FormTemplateData {
  name: string;
  description: string | null;
  category: TemplateCategory;
  sections: FormTemplateSection[];
}

// API Input Types
export type CreateTemplateInput = {
  name: string;
  description: string | null;
  category: string;
  sections: Array<{
    title: string;
    description: string | null;
    order: number;
    isRequired: boolean;
    fields: Array<{
      label: string;
      type: string;
      description: string | null;
      placeholder: string | null;
      order: number;
      isRequired: boolean;
      options: string[];
      validationRules?: Array<{
        type: string;
        value: any;
        message: string;
      }>;
    }>;
  }>;
};

export type UpdateTemplateInput = CreateTemplateInput & {
  id: string;
};

export type TemplateWithRelations = Template & {
  sections: Array<TemplateSection & {
    fields: Array<TemplateField & {
      validationRules: ValidationRule[];
    }>;
  }>;
};

// Type Guards
export function isTemplateCategory(value: string): value is TemplateCategory {
  return TemplateCategories.includes(value as TemplateCategory);
}

export function isFieldType(value: string): value is FieldType {
  return FieldTypes.includes(value as FieldType);
}

export function isValidationRuleType(value: string): value is ValidationRuleType {
  return ValidationRuleTypes.includes(value as ValidationRuleType);
}

// Form Data Conversion Helpers
export function formToCreateInput(formData: FormTemplateData): CreateTemplateInput {
  return {
    name: formData.name,
    description: formData.description,
    category: formData.category,
    sections: formData.sections.map(section => ({
      title: section.title,
      description: section.description,
      order: section.order,
      isRequired: section.isRequired,
      fields: section.fields.map(field => ({
        label: field.label,
        type: field.type,
        description: field.description,
        placeholder: field.placeholder,
        order: field.order,
        isRequired: field.isRequired,
        options: field.options,
        validationRules: field.validationRules.map(rule => ({
          type: rule.type,
          value: rule.value,
          message: rule.message,
        })),
      })),
    })),
  };
}

export function formToUpdateInput(id: string, formData: FormTemplateData): UpdateTemplateInput {
  return {
    id,
    ...formToCreateInput(formData),
  };
}

export function templateToFormData(template: Template): FormTemplateData {
  return {
    name: template.name,
    description: template.description,
    category: template.category as TemplateCategory,
    sections: template.sections.map(section => ({
      title: section.title,
      description: section.description,
      order: section.order,
      isRequired: section.isRequired,
      fields: section.fields.map(field => ({
        label: field.label,
        type: field.type as FieldType,
        description: field.description,
        placeholder: field.placeholder,
        order: field.order,
        isRequired: field.isRequired,
        options: field.options,
        validationRules: field.validationRules.map(rule => ({
          type: rule.type as ValidationRuleType,
          value: rule.value,
          message: rule.message,
        })),
      })),
    })),
  };
}
