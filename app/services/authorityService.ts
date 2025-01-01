import type {
  AuthorityForm,
  AuthorityFormTemplate,
  AuthorityFormType,
  AuthorityFormValidation,
  AuthorityFormSubmission
} from '../types/authority';

class AuthorityService {
  private static instance: AuthorityService;
  private templates: Map<string, AuthorityFormTemplate>;
  private forms: Map<string, AuthorityForm>;

  private constructor() {
    this.templates = new Map();
    this.forms = new Map();
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const storedTemplates = localStorage.getItem('authority_templates');
        if (storedTemplates) {
          const templates = JSON.parse(storedTemplates);
          if (Array.isArray(templates)) {
            templates.forEach(template => {
              this.templates.set(template.id, template);
            });
          }
        }
      } catch (error) {
        console.error('Error loading templates from storage:', error);
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        const templatesArray = Array.from(this.templates.values());
        localStorage.setItem('authority_templates', JSON.stringify(templatesArray));
        console.log('Saved templates to storage:', templatesArray);
      } catch (error) {
        console.error('Error saving templates to storage:', error);
      }
    }
  }

  public static getInstance(): AuthorityService {
    if (!AuthorityService.instance) {
      AuthorityService.instance = new AuthorityService();
    }
    return AuthorityService.instance;
  }

  async getTemplates(): Promise<AuthorityFormTemplate[]> {
    try {
      // Reload from storage to ensure we have the latest data
      this.loadFromStorage();
      const templates = Array.from(this.templates.values());
      console.log('Retrieved templates:', templates);
      return templates;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  async getTemplateById(templateId: string): Promise<AuthorityFormTemplate | null> {
    try {
      return this.templates.get(templateId) || null;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  }

  async createTemplate(template: Omit<AuthorityFormTemplate, 'id'>): Promise<AuthorityFormTemplate> {
    try {
      const templateId = `template_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newTemplate: AuthorityFormTemplate = {
        ...template,
        id: templateId,
        sections: template.sections.map(section => ({
          ...section,
          id: section.id || `section_${templateId}_${section.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
        }))
      };
      console.log('Creating template:', JSON.stringify(newTemplate, null, 2));
      this.templates.set(newTemplate.id, newTemplate);
      this.saveToStorage();
      return newTemplate;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  async updateTemplate(templateId: string, updates: Partial<AuthorityFormTemplate>): Promise<AuthorityFormTemplate> {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error('Template not found');
      }
      const updatedTemplate = {
        ...template,
        ...updates,
        sections: updates.sections?.map((section, index) => ({
          ...section,
          id: section.id || `section_${templateId}_${section.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          order: index
        })) || template.sections,
        lastUpdated: new Date().toISOString()
      };
      this.templates.set(templateId, updatedTemplate);
      this.saveToStorage();
      return updatedTemplate;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }

  async deleteTemplate(templateId: string): Promise<void> {
    try {
      this.templates.delete(templateId);
      this.saveToStorage();
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }
}

export const authorityService = AuthorityService.getInstance();
