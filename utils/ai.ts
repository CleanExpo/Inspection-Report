import { AIRequestParams, AIResponse, AIServiceConfig } from '../types/ai';

const AI_CONFIGS: Record<string, AIServiceConfig> = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4',
    maxTokens: 2000,
    temperature: 0.7
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    baseUrl: 'https://api.anthropic.com/v1',
    model: 'claude-2',
    maxTokens: 2000,
    temperature: 0.7
  },
  perplexity: {
    apiKey: process.env.PERPLEXITY_API_KEY || '',
    baseUrl: 'https://api.perplexity.ai/v1',
    model: 'pplx-7b-online',
    maxTokens: 2000,
    temperature: 0.7
  }
};

const createPrompt = (params: AIRequestParams): string => {
  const { context } = params;
  let prompt = params.prompt;

  if (context) {
    prompt = `
Context:
- Inspection Type: ${context.inspectionType || 'N/A'}
- Property Type: ${context.propertyType || 'N/A'}
- Damage Type: ${context.damageType || 'N/A'}
- Required Standards: ${context.standardsRequired?.join(', ') || 'N/A'}

Question/Task:
${prompt}

Please provide a detailed response including:
1. Relevant IICRC standards and guidelines
2. Specific recommendations based on the damage type
3. Required documentation and procedures
4. Safety considerations
5. Citations and references where applicable
`;
  }

  return prompt;
};

export const queryAI = async (params: AIRequestParams): Promise<AIResponse> => {
  const config = AI_CONFIGS[params.service];
  if (!config) {
    throw new Error(`Unsupported AI service: ${params.service}`);
  }

  const prompt = createPrompt(params);
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`
  };

  try {
    let response;
    switch (params.service) {
      case 'openai':
        response = await fetch(`${config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: config.model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: params.maxTokens || config.maxTokens,
            temperature: params.temperature || config.temperature
          })
        });
        const openAIData = await response.json();
        return {
          text: openAIData.choices[0].message.content,
          source: 'openai',
          confidence: 0.9
        };

      case 'anthropic':
        response = await fetch(`${config.baseUrl}/messages`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: config.model,
            prompt,
            max_tokens_to_sample: params.maxTokens || config.maxTokens,
            temperature: params.temperature || config.temperature
          })
        });
        const claudeData = await response.json();
        return {
          text: claudeData.content[0].text,
          source: 'anthropic',
          confidence: 0.9
        };

      case 'perplexity':
        response = await fetch(`${config.baseUrl}/complete`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: config.model,
            prompt,
            max_tokens: params.maxTokens || config.maxTokens,
            temperature: params.temperature || config.temperature
          })
        });
        const perplexityData = await response.json();
        return {
          text: perplexityData.choices[0].text,
          source: 'perplexity',
          confidence: 0.85
        };

      default:
        throw new Error(`Unsupported AI service: ${params.service}`);
    }
  } catch (error: any) {
    console.error(`Error querying ${params.service}:`, error);
    throw new Error(`Failed to get response from ${params.service}: ${error.message}`);
  }
};

export const getIICRCStandards = async (damageType: string): Promise<AIResponse> => {
  return queryAI({
    service: 'openai',
    prompt: `What are the relevant IICRC standards and guidelines for ${damageType}? Please include specific standard numbers, sections, and key requirements.`,
    context: {
      damageType
    }
  });
};

export const generateScopeOfWork = async (
  damageType: string,
  propertyType: string,
  affectedAreas: string[]
): Promise<AIResponse> => {
  return queryAI({
    service: 'anthropic',
    prompt: `Generate a detailed scope of work for ${damageType} affecting ${affectedAreas.join(', ')} in a ${propertyType}. Include specific steps, equipment needed, and timeline.`,
    context: {
      damageType,
      propertyType
    }
  });
};

export const getRecommendations = async (
  inspectionDetails: any,
  currentConditions: string
): Promise<AIResponse> => {
  return queryAI({
    service: 'perplexity',
    prompt: `Based on the inspection of ${inspectionDetails.damageType} in a ${inspectionDetails.propertyType}, with current conditions: ${currentConditions}, what are your specific recommendations for remediation and repairs?`,
    context: {
      damageType: inspectionDetails.damageType,
      propertyType: inspectionDetails.propertyType
    }
  });
};
