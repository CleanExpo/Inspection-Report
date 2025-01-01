'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { usePerplexity } from '../hooks/usePerplexity';
import type { PerplexityResponse, PerplexityOptions } from '../utils/perplexity';

interface SearchHistory {
  id: string;
  query: string;
  response: PerplexityResponse;
  timestamp: string;
}

interface PerplexityContextType {
  loading: boolean;
  error: Error | null;
  clearError: () => void;
  searchHistory: SearchHistory[];
  clearHistory: () => void;
  lastResponse: PerplexityResponse | null;
  // API Methods
  query: (
    question: string,
    systemPrompt?: string,
    options?: Partial<PerplexityOptions>
  ) => Promise<PerplexityResponse | null>;
  searchWeb: (
    query: string,
    options?: Partial<PerplexityOptions>
  ) => Promise<PerplexityResponse | null>;
  analyzeDocument: (
    document: string,
    question: string,
    options?: Partial<PerplexityOptions>
  ) => Promise<PerplexityResponse | null>;
  summarize: (
    text: string,
    options?: Partial<PerplexityOptions>
  ) => Promise<PerplexityResponse | null>;
  compareDocuments: (
    doc1: string,
    doc2: string,
    options?: Partial<PerplexityOptions>
  ) => Promise<PerplexityResponse | null>;
  validateInformation: (
    statement: string,
    options?: Partial<PerplexityOptions>
  ) => Promise<PerplexityResponse | null>;
}

const PerplexityContext = createContext<PerplexityContextType | undefined>(undefined);

export function PerplexityProvider({ children }: { children: React.ReactNode }) {
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [lastResponse, setLastResponse] = useState<PerplexityResponse | null>(null);

  const {
    loading,
    error,
    clearError,
    query: baseQuery,
    searchWeb: baseSearchWeb,
    analyzeDocument: baseAnalyzeDocument,
    summarize: baseSummarize,
    compareDocuments: baseCompareDocuments,
    validateInformation: baseValidateInformation
  } = usePerplexity({
    onError: (error) => {
      console.error('Perplexity API Error:', error);
      // You could add additional error handling here
    }
  });

  const addToHistory = useCallback((query: string, response: PerplexityResponse) => {
    const historyItem: SearchHistory = {
      id: `search-${Date.now()}`,
      query,
      response,
      timestamp: new Date().toISOString()
    };

    setSearchHistory(prev => [historyItem, ...prev]);
    setLastResponse(response);
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    setLastResponse(null);
  }, []);

  // Wrap API methods to include history tracking
  const query = useCallback(async (
    question: string,
    systemPrompt?: string,
    options?: Partial<PerplexityOptions>
  ) => {
    const response = await baseQuery(question, systemPrompt, options);
    if (response) {
      addToHistory(question, response);
    }
    return response;
  }, [baseQuery, addToHistory]);

  const searchWeb = useCallback(async (
    searchQuery: string,
    options?: Partial<PerplexityOptions>
  ) => {
    const response = await baseSearchWeb(searchQuery, options);
    if (response) {
      addToHistory(searchQuery, response);
    }
    return response;
  }, [baseSearchWeb, addToHistory]);

  const analyzeDocument = useCallback(async (
    document: string,
    question: string,
    options?: Partial<PerplexityOptions>
  ) => {
    const response = await baseAnalyzeDocument(document, question, options);
    if (response) {
      addToHistory(`Analyze: ${question}`, response);
    }
    return response;
  }, [baseAnalyzeDocument, addToHistory]);

  const summarize = useCallback(async (
    text: string,
    options?: Partial<PerplexityOptions>
  ) => {
    const response = await baseSummarize(text, options);
    if (response) {
      addToHistory('Summarize text', response);
    }
    return response;
  }, [baseSummarize, addToHistory]);

  const compareDocuments = useCallback(async (
    doc1: string,
    doc2: string,
    options?: Partial<PerplexityOptions>
  ) => {
    const response = await baseCompareDocuments(doc1, doc2, options);
    if (response) {
      addToHistory('Compare documents', response);
    }
    return response;
  }, [baseCompareDocuments, addToHistory]);

  const validateInformation = useCallback(async (
    statement: string,
    options?: Partial<PerplexityOptions>
  ) => {
    const response = await baseValidateInformation(statement, options);
    if (response) {
      addToHistory(`Validate: ${statement}`, response);
    }
    return response;
  }, [baseValidateInformation, addToHistory]);

  const value = {
    loading,
    error,
    clearError,
    searchHistory,
    clearHistory,
    lastResponse,
    query,
    searchWeb,
    analyzeDocument,
    summarize,
    compareDocuments,
    validateInformation
  };

  return (
    <PerplexityContext.Provider value={value}>
      {children}
    </PerplexityContext.Provider>
  );
}

export function usePerplexityContext() {
  const context = useContext(PerplexityContext);
  if (context === undefined) {
    throw new Error('usePerplexityContext must be used within a PerplexityProvider');
  }
  return context;
}
