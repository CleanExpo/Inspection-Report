'use client';

import { useState, useCallback } from 'react';
import { ascoraAPI } from '../utils/ascora';
import type { 
  AscoraDocument, 
  AscoraAnalysis, 
  AscoraValidation, 
  AscoraTemplate,
  AscoraStandard,
  AscoraError
} from '../config/ascora';

interface UseAscoraOptions {
  onError?: (error: AscoraError) => void;
}

export function useAscora(options: UseAscoraOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AscoraError | null>(null);

  const handleError = useCallback((error: AscoraError) => {
    setError(error);
    options.onError?.(error);
  }, [options]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Inspection Methods
  const createInspection = useCallback(async (data: any) => {
    setLoading(true);
    clearError();
    try {
      const response = await ascoraAPI.createInspection(data);
      if (!response.success) {
        handleError(response.error!);
        return null;
      }
      return response.data;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  const updateInspection = useCallback(async (inspectionId: string, data: any) => {
    setLoading(true);
    clearError();
    try {
      const response = await ascoraAPI.updateInspection(inspectionId, data);
      if (!response.success) {
        handleError(response.error!);
        return null;
      }
      return response.data;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  const getInspection = useCallback(async (inspectionId: string) => {
    setLoading(true);
    clearError();
    try {
      const response = await ascoraAPI.getInspection(inspectionId);
      if (!response.success) {
        handleError(response.error!);
        return null;
      }
      return response.data;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  // Document Methods
  const uploadDocument = useCallback(async (
    inspectionId: string,
    file: File,
    metadata: any
  ) => {
    setLoading(true);
    clearError();
    try {
      const response = await ascoraAPI.uploadDocument(inspectionId, file, metadata);
      if (!response.success) {
        handleError(response.error!);
        return null;
      }
      return response.data as AscoraDocument;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  const listDocuments = useCallback(async (inspectionId: string) => {
    setLoading(true);
    clearError();
    try {
      const response = await ascoraAPI.listDocuments(inspectionId);
      if (!response.success) {
        handleError(response.error!);
        return [];
      }
      return response.data as AscoraDocument[];
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  // Analysis Methods
  const analyzeInspection = useCallback(async (inspectionId: string) => {
    setLoading(true);
    clearError();
    try {
      const response = await ascoraAPI.analyzeInspection(inspectionId);
      if (!response.success) {
        handleError(response.error!);
        return null;
      }
      return response.data as AscoraAnalysis;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  const getAnalysisResults = useCallback(async (inspectionId: string) => {
    setLoading(true);
    clearError();
    try {
      const response = await ascoraAPI.getAnalysisResults(inspectionId);
      if (!response.success) {
        handleError(response.error!);
        return null;
      }
      return response.data as AscoraAnalysis;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  // Validation Methods
  const validateInspection = useCallback(async (inspectionId: string) => {
    setLoading(true);
    clearError();
    try {
      const response = await ascoraAPI.validateInspection(inspectionId);
      if (!response.success) {
        handleError(response.error!);
        return null;
      }
      return response.data as AscoraValidation;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  const getValidationResults = useCallback(async (inspectionId: string) => {
    setLoading(true);
    clearError();
    try {
      const response = await ascoraAPI.getValidationResults(inspectionId);
      if (!response.success) {
        handleError(response.error!);
        return null;
      }
      return response.data as AscoraValidation;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  // Report Generation Methods
  const generateReport = useCallback(async (inspectionId: string, options: {
    format: 'pdf' | 'docx';
    template?: string;
    sections?: string[];
  }) => {
    setLoading(true);
    clearError();
    try {
      const response = await ascoraAPI.generateReport(inspectionId, options);
      if (!response.success) {
        handleError(response.error!);
        return null;
      }
      return response.data;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  // Utility Methods
  const getTemplates = useCallback(async () => {
    setLoading(true);
    clearError();
    try {
      const response = await ascoraAPI.getTemplates();
      if (!response.success) {
        handleError(response.error!);
        return [];
      }
      return response.data as AscoraTemplate[];
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  const getStandards = useCallback(async () => {
    setLoading(true);
    clearError();
    try {
      const response = await ascoraAPI.getStandards();
      if (!response.success) {
        handleError(response.error!);
        return [];
      }
      return response.data as AscoraStandard[];
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  return {
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
  };
}
