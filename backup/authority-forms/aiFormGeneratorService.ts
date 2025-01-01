import type { AuthorityFormTemplate, AuthorityFormType, AuthorityFormSection } from '../types/authority';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface RiskAssessment {
  level: RiskLevel;
  description: string;
  requirements: string[];
  mitigationSteps: string[];
}

const RISK_LEVELS: Record<RiskLevel, RiskAssessment> = {
  LOW: {
    level: 'LOW',
    description: 'Minimal risk with standard compliance requirements',
    requirements: [
      'Standard statutory declaration',
      'Basic client identification',
      'Single witness signature'
    ],
    mitigationSteps: [
      'Standard documentation review',
      'Basic identity verification'
    ]
  },
  MEDIUM: {
    level: 'MEDIUM',
    description: 'Moderate risk requiring additional verification',
    requirements: [
      'Enhanced statutory declaration',
      'Proof of identity documentation',
      'Professional witness signature',
      'Photographic evidence'
    ],
    mitigationSteps: [
      'Secondary document verification',
      'Professional witness verification',
      'Photographic documentation',
      'Client briefing on legal implications'
    ]
  },
  HIGH: {
    level: 'HIGH',
    description: 'Significant risk requiring comprehensive documentation',
    requirements: [
      'Comprehensive statutory declaration',
      'Multiple forms of ID verification',
      'Legal professional witness',
      'Detailed documentation',
      'Video/photographic evidence'
    ],
    mitigationSteps: [
      'Legal professional review',
      'Multi-factor identity verification',
      'Comprehensive documentation review',
      'Client legal briefing',
      'Detailed risk assessment report'
    ]
  },
  CRITICAL: {
    level: 'CRITICAL',
    description: 'Maximum risk requiring stringent controls and legal oversight',
    requirements: [
      'Expert statutory declaration',
      'Government-issued ID verification',
      'Legal professional oversight',
      'Video recording of declaration',
      'Multiple witness signatures',
      'Comprehensive documentation'
    ],
    mitigationSteps: [
      'Legal counsel review',
      'Expert witness verification',
      'Video documentation',
      'Multiple authority signatures',
      'Comprehensive risk assessment',
      'Client legal consultation'
    ]
  }
};

const RISK_ASSESSMENT_SECTION: AuthorityFormSection = {
  id: 'risk_assessment',
  title: 'Risk Assessment',
  description: 'Assessment of risk level and required controls',
  isRequired: true,
  order: 0,
  fields: [
    {
      id: 'risk_level',
      type: 'text',
      label: 'Risk Level',
      isRequired: true,
      order: 0
    },
    {
      id: 'risk_description',
      type: 'textarea',
      label: 'Risk Description',
      isRequired: true,
      order: 1
    },
    {
      id: 'requirements',
      type: 'textarea',
      label: 'Requirements',
      isRequired: true,
      order: 2
    },
    {
      id: 'mitigation_steps',
      type: 'textarea',
      label: 'Mitigation Steps',
      isRequired: true,
      order: 3
    }
  ]
};

// ... (keep existing section definitions like BUSINESS_SECTION, CLIENT_SECTION, etc.)

export class AIFormGeneratorService {
  private static instance: AIFormGeneratorService;

  private constructor() {}

  public static getInstance(): AIFormGeneratorService {
    if (!AIFormGeneratorService.instance) {
      AIFormGeneratorService.instance = new AIFormGeneratorService();
    }
    return AIFormGeneratorService.instance;
  }

  private assessRiskLevel(formName: string): RiskAssessment {
    // Analyze form name and type to determine risk level
    const lowerFormName = formName.toLowerCase();
    
    if (lowerFormName.includes('dispose') || lowerFormName.includes('demolition')) {
      return RISK_LEVELS.CRITICAL;
    }
    
    if (lowerFormName.includes('structural') || lowerFormName.includes('hazardous')) {
      return RISK_LEVELS.HIGH;
    }
    
    if (lowerFormName.includes('repair') || lowerFormName.includes('modify')) {
      return RISK_LEVELS.MEDIUM;
    }
    
    return RISK_LEVELS.LOW;
  }

  async generateTemplate(formName: string): Promise<AuthorityFormTemplate> {
    // Generate a unique ID for the template
    const templateId = `template_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Convert the form name to a type
    const formType = formName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_authority';

    // Assess risk level
    const riskAssessment = this.assessRiskLevel(formName);

    // Create risk assessment section with the assessed risk level
    const riskSection: AuthorityFormSection = {
      ...RISK_ASSESSMENT_SECTION,
      fields: RISK_ASSESSMENT_SECTION.fields.map(field => ({
        ...field,
        defaultValue: field.id === 'risk_level' ? riskAssessment.level :
                     field.id === 'risk_description' ? riskAssessment.description :
                     field.id === 'requirements' ? riskAssessment.requirements.join('\n') :
                     field.id === 'mitigation_steps' ? riskAssessment.mitigationSteps.join('\n') :
                     undefined
      }))
    };

    // Create the template with statutory declaration requirements
    const template: AuthorityFormTemplate = {
      id: templateId,
      type: formType as AuthorityFormType,
      title: formName,
      description: `Authority form for ${formName.toLowerCase()}, compliant with Commonwealth Statutory Declaration requirements`,
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      isActive: true,
      riskLevel: riskAssessment.level,
      sections: [
        riskSection,
        BUSINESS_SECTION,
        CLIENT_SECTION,
        {
          id: `${formType}_details`,
          title: 'Authority Details',
          description: 'Specific details required for this authority',
          isRequired: true,
          order: 3,
          fields: [
            {
              id: 'authority_scope',
              type: 'textarea',
              label: 'Scope of Authority',
              isRequired: true,
              order: 0
            },
            {
              id: 'authority_duration',
              type: 'text',
              label: 'Duration of Authority',
              isRequired: true,
              order: 1
            },
            {
              id: 'authority_conditions',
              type: 'textarea',
              label: 'Conditions and Limitations',
              isRequired: true,
              order: 2
            }
          ]
        },
        DECLARATION_SECTION,
        SIGNATURES_SECTION
      ]
    };

    // Add additional requirements based on risk level
    if (riskAssessment.level === 'HIGH' || riskAssessment.level === 'CRITICAL') {
      template.sections.push({
        id: 'additional_documentation',
        title: 'Additional Documentation',
        description: 'Additional documentation required for high-risk authority',
        isRequired: true,
        order: 6,
        fields: [
          {
            id: 'photo_evidence',
            type: 'file',
            label: 'Photographic Evidence',
            isRequired: true,
            order: 0
          },
          {
            id: 'expert_assessment',
            type: 'file',
            label: 'Expert Assessment Report',
            isRequired: true,
            order: 1
          },
          {
            id: 'legal_review',
            type: 'checkbox',
            label: 'Legal Review Completed',
            isRequired: true,
            order: 2
          }
        ]
      });
    }

    return template;
  }

  getStatutoryRequirements(): string {
    return `
Commonwealth Statutory Declaration Requirements:

1. The declaration must be made under the Statutory Declarations Act 1959.
2. The declaration must include:
   - Full name and address of the declarant
   - Statement of truth ("do solemnly and sincerely declare")
   - Subject matter of the declaration
   - Signature of the declarant
   - Signature of an authorized witness
   - Date and place of declaration
3. The declaration must be witnessed by a qualified person as defined in the Statutory Declarations Regulations 2018.
4. False declarations are punishable under section 11 of the Act.

Risk Level Requirements:
- LOW: Standard statutory declaration with basic verification
- MEDIUM: Enhanced verification with professional witness
- HIGH: Comprehensive documentation with legal oversight
- CRITICAL: Maximum controls with multiple verifications
`;
  }
}

export const aiFormGeneratorService = AIFormGeneratorService.getInstance();
