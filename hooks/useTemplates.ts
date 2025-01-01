'use client';

import { useState, useCallback } from 'react';
import { processDocxTemplate, processPdfTemplate } from '../utils/formTemplates';

interface Template {
  id: string;
  filename: string;
  type: 'docx' | 'pdf';
  uploadedAt: string;
  size: number;
}

interface UseTemplatesOptions {
  onError?: (error: Error) => void;
}

export function useTemplates(options: UseTemplatesOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((error: Error) => {
    setError(error);
    options.onError?.(error);
  }, [options]);

  const uploadTemplate = useCallback(async (file: File): Promise<Template> => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/templates', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload template');
      }

      const { filename } = await response.json();

      return {
        id: filename,
        filename: file.name,
        type: file.name.endsWith('.pdf') ? 'pdf' : 'docx',
        uploadedAt: new Date().toISOString(),
        size: file.size
      };
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Failed to upload template'));
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const deleteTemplate = useCallback(async (filename: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`/api/templates?filename=${filename}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete template');
      }
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Failed to delete template'));
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const fillTemplate = useCallback(async (
    template: Template,
    data: any
  ): Promise<Blob | Uint8Array> => {
    setLoading(true);
    try {
      // Download the template
      const response = await fetch(`/api/templates?filename=${template.id}`);
      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const templateBuffer = await response.arrayBuffer();

      // Process the template based on its type
      if (template.type === 'docx') {
        return await processDocxTemplate(templateBuffer, data);
      } else {
        return await processPdfTemplate(templateBuffer, data);
      }
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Failed to fill template'));
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const downloadFilledTemplate = useCallback(async (
    template: Template,
    data: any
  ): Promise<void> => {
    try {
      const result = await fillTemplate(template, data);

      // Create download link
      const blob = result instanceof Blob ? result : new Blob([result]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `filled-${template.filename}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Failed to download filled template'));
      throw error;
    }
  }, [fillTemplate, handleError]);

  return {
    loading,
    error,
    uploadTemplate,
    deleteTemplate,
    fillTemplate,
    downloadFilledTemplate
  };
}

export type { Template };
