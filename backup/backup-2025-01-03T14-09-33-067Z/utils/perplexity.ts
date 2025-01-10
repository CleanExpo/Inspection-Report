import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

interface PerplexityOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  // Add other options as needed
}

// Define a local type for chat messages
interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class PerplexityAPI {
  constructor() {}

  async query(
    question: string,
    systemPrompt: string = 'You extract email addresses from the text and return them in a JSON object.',
    options: Partial<PerplexityOptions> = {}
  ): Promise<string> {
    try {
      const messages: ChatCompletionMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ];

      const completion = await openai.chat.completions.create({
        model: options.model || 'gpt-3.5-turbo',
        messages: messages,
        temperature: options.temperature ?? 0.2,
        max_tokens: options.max_tokens ?? 256,
      });

      // Extract the assistant's reply
      const response = completion.choices[0].message?.content;

      return response ?? '';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  // Updated method to handle image analysis by describing images in text
  async analyzeImages(
    imageDescriptions: string[], // Array of image descriptions
    question: string = 'Analyze the following images and identify any differences between them.',
    options: Partial<PerplexityOptions> = {}
  ): Promise<string> {
    try {
      const messages: ChatCompletionMessage[] = [
        {
          role: 'system' as const,
          content: 'You are an AI assistant that analyzes image descriptions provided in text form.',
        },
        { role: 'user' as const, content: question },
        ...imageDescriptions.map((description, index) => ({
          role: 'user' as const,
          content: `Image ${index + 1}: ${description}`,
        })),
      ];

      const completion = await openai.chat.completions.create({
        model: options.model || 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: options.max_tokens ?? 300,
        temperature: options.temperature ?? 0.2,
      });

      // Extract the assistant's reply
      const response = completion.choices[0].message?.content;

      return response ?? '';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  // Update other methods to use OpenAI API as needed
}

// Export a singleton instance
export const perplexityAPI = new PerplexityAPI();

// Export types
export type { PerplexityOptions };
