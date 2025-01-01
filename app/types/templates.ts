export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'Residential' | 'Commercial';
  sections: TemplateSection[];
}

export interface TemplateSection {
  id: string;
  title: string;
  description: string;
  insuranceTypes: string[];
  fields: TemplateField[];
}

export interface TemplateField {
  id: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'date' | 'photo';
  label: string;
  required: boolean;
  options?: string[];
}
