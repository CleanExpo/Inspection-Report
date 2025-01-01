'use client';

import { useState, useCallback } from 'react';
import { perplexityAPI, type PerplexityOptions, type PerplexityResponse } from '../utils/perplexity';

// Import gpt-3-encoder to calculate token counts
import { encode } from 'gpt-3-encoder';

interface UsePerplexityOptions {
  onError?: (error: Error) => void;
}

const MAX_TOKENS = 2048; // Set maximum allowed tokens per request

export function usePerplexity(options: UsePerplexityOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((error: Error) => {
    setError(error);
    options.onError?.(error);
  }, [options]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Function to check token limits, updated to handle undefined inputs
  const checkTokenLimit = (inputs: (string | undefined)[]) => {
    const totalTokens = inputs.reduce((count, input) => count + encode(input || '').length, 0);
    if (totalTokens > MAX_TOKENS) {
      throw new Error(`Input exceeds the maximum token limit of ${MAX_TOKENS} tokens.`);
    }
  };

  const query = useCallback(async (
    question: string,
    systemPrompt?: string,
    queryOptions?: Partial<PerplexityOptions>
  ) => {
    setLoading(true);
    clearError();
    try {
      // Check token limit before making API call
      checkTokenLimit([question, systemPrompt]);
      const response = await perplexityAPI.query(question, systemPrompt, queryOptions);
      return response;
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Failed to query Perplexity API'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  const searchWeb = useCallback(async (
    searchQuery: string,
    queryOptions?: Partial<PerplexityOptions>
  ) => {
    setLoading(true);
    clearError();
    try {
      checkTokenLimit([searchQuery]);
      const response = await perplexityAPI.searchWeb(searchQuery, queryOptions);
      return response;
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Failed to search web'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  const analyzeDocument = useCallback(async (
    document: string,
    question: string,
    queryOptions?: Partial<PerplexityOptions>
  ) => {
    setLoading(true);
    clearError();
    try {
      checkTokenLimit([document, question]);
      const response = await perplexityAPI.analyzeDocument(document, question, queryOptions);
      return response;
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Failed to analyze document'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  const summarize = useCallback(async (
    text: string,
    queryOptions?: Partial<PerplexityOptions>
  ) => {
    setLoading(true);
    clearError();
    try {
      checkTokenLimit([text]);
      const response = await perplexityAPI.summarize(text, queryOptions);
      return response;
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Failed to summarize text'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  const compareDocuments = useCallback(async (
    doc1: string,
    doc2: string,
    queryOptions?: Partial<PerplexityOptions>
  ) => {
    setLoading(true);
    clearError();
    try {
      checkTokenLimit([doc1, doc2]);
      const response = await perplexityAPI.compareDocuments(doc1, doc2, queryOptions);
      return response;
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Failed to compare documents'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  const validateInformation = useCallback(async (
    statement: string,
    queryOptions?: Partial<PerplexityOptions>
  ) => {
    setLoading(true);
    clearError();
    try {
      checkTokenLimit([statement]);
      const response = await perplexityAPI.validateInformation(statement, queryOptions);
      return response;
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Failed to validate information'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  return {
    loading,
    error,
    clearError,
    query,
    searchWeb,
    analyzeDocument,
    summarize,
    compareDocuments,
    validateInformation
  };
}
