export interface AIRequestParams {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  service: 'openai' | 'anthropic' | 'perplexity';
  context?: {
    inspectionType?: string;
    propertyType?: string;
    damageType?: string;
    standardsRequired?: string[];
  };
}

export interface AIResponse {
  text: string;
  source: string;
  confidence?: number;
  citations?: {
    text: string;
    source: string;
    page?: number;
  }[];
  relevantStandards?: {
    code: string;
    description: string;
    applicability: string;
  }[];
}

export interface StandardsReference {
  code: string;
  title: string;
  description: string;
  applicability: string[];
  requirements: string[];
}

export interface AIServiceConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface ReportAssistanceRequest {
  inspectionDetails: {
    damageType: string;
    propertyType: string;
    affectedAreas: string[];
  };
  requestType: 'scope' | 'standards' | 'recommendations';
  specificQuestions?: string[];
}
