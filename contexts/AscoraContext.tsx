'use client';

import React, { createContext, useContext, useCallback, useState } from 'react';
import { useAscora } from '../hooks/useAscora';
import type { 
  AscoraDocument, 
  AscoraAnalysis, 
  AscoraValidation, 
  AscoraTemplate,
  AscoraStandard,
  AscoraError
} from '../config/ascora';

interface AscoraContextType {
  loading: boolean;
  error: AscoraError | null;
  clearError: () => void;
  currentInspection: any | null;
  setCurrentInspection: (inspection: any) => void;
  documents: AscoraDocument[];
  setDocuments: (documents: AscoraDocument[]) => void;
  analysisResults: AscoraAnalysis | null;
  setAnalysisResults: (results: AscoraAnalysis | null) => void;
  validationResults: AscoraValidation | null;
  setValidationResults: (results: AscoraValidation | null) => void;
  templates: AscoraTemplate[];
  setTemplates: (templates: AscoraTemplate[]) => void;
  standards: AscoraStandard[];
  setStandards: (standards: AscoraStandard[]) => void;
  // API Methods
  createInspection: (data: any) => Promise<any>;
  updateInspection: (inspectionId: string, data: any) => Promise<any>;
  getInspection: (inspectionId: string) => Promise<any>;
  uploadDocument: (inspectionId: string, file: File, metadata: any) => Promise<AscoraDocument | null>;
  listDocuments: (inspectionId: string) => Promise<AscoraDocument[]>;
  analyzeInspection: (inspectionId: string) => Promise<AscoraAnalysis | null>;
  getAnalysisResults: (inspectionId: string) => Promise<AscoraAnalysis | null>;
  validateInspection: (inspectionId: string) => Promise<AscoraValidation | null>;
  getValidationResults: (inspectionId: string) => Promise<AscoraValidation | null>;
  generateReport: (inspectionId: string, options: {
    format: 'pdf' | 'docx';
    template?: string;
    sections?: string[];
  }) => Promise<any>;
  getTemplates: () => Promise<AscoraTemplate[]>;
  getStandards: () => Promise<AscoraStandard[]>;
}

const AscoraContext = createContext<AscoraContextType | undefined>(undefined);

export function AscoraProvider({ children }: { children: React.ReactNode }) {
  const [currentInspection, setCurrentInspection] = useState<any | null>(null);
  const [documents, setDocuments] = useState<AscoraDocument[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AscoraAnalysis | null>(null);
  const [validationResults, setValidationResults] = useState<AscoraValidation | null>(null);
  const [templates, setTemplates] = useState<AscoraTemplate[]>([]);
  const [standards, setStandards] = useState<AscoraStandard[]>([]);

  const {
    loading,
    error,
    clearError,
    createInspection,
    updateInspection,
    getInspection,
    uploadDocument,
    listDocuments,
    analyzeInspection,
    getAnalysisResults,
    validateInspection,
    getValidationResults,
    generateReport,
    getTemplates,
    getStandards
  } = useAscora({
    onError: (error) => {
      console.error('Ascora API Error:', error);
      // You could add additional error handling here
    }
  });

  const value = {
    loading,
    error,
    clearError,
    currentInspection,
    setCurrentInspection,
    documents,
    setDocuments,
    analysisResults,
    setAnalysisResults,
    validationResults,
    setValidationResults,
    templates,
    setTemplates,
    standards,
    setStandards,
    createInspection,
    updateInspection,
    getInspection,
    uploadDocument,
    listDocuments,
    analyzeInspection,
    getAnalysisResults,
    validateInspection,
    getValidationResults,
    generateReport,
    getTemplates,
    getStandards
  };

  return (
    <AscoraContext.Provider value={value}>
      {children}
    </AscoraContext.Provider>
  );
}

export function useAscoraContext() {
  const context = useContext(AscoraContext);
  if (context === undefined) {
    throw new Error('useAscoraContext must be used within an AscoraProvider');
  }
  return context;
}
