import type { AuthorityFormTemplate } from '../types/authority';

export const defaultTemplates: AuthorityFormTemplate[] = [
  {
    id: 'template_general_authority',
    type: 'general_authority',
    title: 'General Authority Form',
    description: 'Standard authority form for general works and services',
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    isActive: true,
    riskLevel: 'LOW',
    sections: [
      {
        id: 'general_client_information_section',
        title: 'Client Information',
        description: undefined,
        isRequired: true,
        order: 0,
        fields: []
      },
      {
        id: 'general_authorization_items_section',
        title: 'Authorization Items',
        description: 'Please read the following information carefully.',
        isRequired: true,
        order: 1,
        fields: []
      },
      {
        id: 'general_signatures_section',
        title: 'Signatures',
        description: 'I have read and approve the above.',
        isRequired: true,
        order: 2,
        fields: []
      }
    ]
  },
  {
    id: 'template_basic_authority',
    type: 'general_authority',
    title: 'Basic Authority Form',
    description: 'Standard authority form for basic works and services',
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    isActive: true,
    riskLevel: 'LOW',
    sections: [
      {
        id: 'basic_client_information_section',
        title: 'Client Information',
        description: undefined,
        isRequired: true,
        order: 0,
        fields: []
      },
      {
        id: 'basic_authorization_items_section',
        title: 'Authorization Items',
        description: 'Please read the following information carefully.',
        isRequired: true,
        order: 1,
        fields: []
      },
      {
        id: 'basic_signatures_section',
        title: 'Signatures',
        description: 'I have read and approve the above.',
        isRequired: true,
        order: 2,
        fields: []
      }
    ]
  },
  {
    id: 'template_commence_authority',
    type: 'commence_authority',
    title: 'Authority to Commence',
    description: 'Authorization form for commencing restoration works',
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    isActive: true,
    riskLevel: 'MEDIUM',
    sections: [
      {
        id: 'commence_client_information_section',
        title: 'Client Information',
        description: undefined,
        isRequired: true,
        order: 0,
        fields: []
      },
      {
        id: 'commence_scope_section',
        title: 'Scope of Work',
        description: 'Details of the restoration work to be commenced.',
        isRequired: true,
        order: 1,
        fields: []
      },
      {
        id: 'commence_authorization_section',
        title: 'Authorization',
        description: 'Authorization for commencement of works.',
        isRequired: true,
        order: 2,
        fields: []
      },
      {
        id: 'commence_signatures_section',
        title: 'Signatures',
        description: 'I authorize the commencement of the specified works.',
        isRequired: true,
        order: 3,
        fields: []
      }
    ]
  },
  {
    id: 'template_dispose_authority',
    type: 'dispose_authority',
    title: 'Authority to Dispose',
    description: 'Authorization form for disposal of items',
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    isActive: true,
    riskLevel: 'CRITICAL',
    sections: [
      {
        id: 'dispose_client_information_section',
        title: 'Client Information',
        description: undefined,
        isRequired: true,
        order: 0,
        fields: []
      },
      {
        id: 'dispose_items_section',
        title: 'Items for Disposal',
        description: 'List of items to be disposed of.',
        isRequired: true,
        order: 1,
        fields: []
      },
      {
        id: 'dispose_reason_section',
        title: 'Reason for Disposal',
        description: 'Explanation for why these items need to be disposed of.',
        isRequired: true,
        order: 2,
        fields: []
      },
      {
        id: 'dispose_method_section',
        title: 'Disposal Method',
        description: 'Method of disposal to be used.',
        isRequired: true,
        order: 3,
        fields: []
      },
      {
        id: 'dispose_authorization_section',
        title: 'Authorization',
        description: 'Authorization for disposal of specified items.',
        isRequired: true,
        order: 4,
        fields: []
      },
      {
        id: 'dispose_signatures_section',
        title: 'Signatures',
        description: 'I authorize the disposal of the specified items.',
        isRequired: true,
        order: 5,
        fields: []
      }
    ]
  }
];
