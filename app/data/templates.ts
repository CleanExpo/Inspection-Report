import { Template } from '../types/templates';

export const templates: Template[] = [
  {
    id: 'template-commercial-1',
    name: 'Commercial Property Inspection',
    description: 'Comprehensive inspection template for commercial properties including structural, safety, and compliance checks',
    category: 'Commercial',
    sections: [
      {
        id: 'section-1',
        title: 'Property Information',
        description: 'Basic property details and insurance information',
        insuranceTypes: ['Property Insurance', 'Public Liability', 'Professional Indemnity'],
        fields: [
          {
            id: 'field-1',
            type: 'text',
            label: 'Property Name',
            required: true
          },
          {
            id: 'field-2',
            type: 'select',
            label: 'Property Type',
            required: true,
            options: ['Office', 'Retail', 'Industrial', 'Mixed Use']
          }
        ]
      }
    ]
  },
  {
    id: 'template-residential-1',
    name: 'Residential Property Inspection',
    description: 'Detailed inspection template for residential properties covering all major aspects of home inspection',
    category: 'Residential',
    sections: [
      {
        id: 'section-1',
        title: 'Property Information',
        description: 'Basic property details and insurance information',
        insuranceTypes: ['Home Insurance', 'Contents Insurance'],
        fields: [
          {
            id: 'field-1',
            type: 'text',
            label: 'Property Address',
            required: true
          },
          {
            id: 'field-2',
            type: 'select',
            label: 'Property Type',
            required: true,
            options: ['House', 'Apartment', 'Townhouse', 'Unit']
          }
        ]
      }
    ]
  }
];
