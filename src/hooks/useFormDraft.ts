import { useCallback, useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { InspectionFormValues } from '../types/form';

interface UseFormDraftOptions {
  autosaveDelay?: number;
  onDraftSaved?: () => void;
  onDraftRestored?: () => void;
  onError?: (error: Error) => void;
}

const DRAFT_STORAGE_KEY = 'inspectionDraftData';
const FORM_STORAGE_KEY = 'inspectionFormData';

export function useFormDraft({
  autosaveDelay = 1000,
  onDraftSaved,
  onDraftRestored,
  onError,
}: UseFormDraftOptions = {}) {
  const { showToast } = useToast();
  const autosaveTimeoutRef = useRef<NodeJS.Timeout>();

  const saveDraft = useCallback((values: InspectionFormValues) => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(values));
      showToast('Draft saved successfully', 'success');
      onDraftSaved?.();
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showToast('Failed to save draft', 'error');
      onError?.(new Error(`Failed to save draft: ${errorMessage}`));
      return false;
    }
  }, [showToast, onDraftSaved, onError]);

  const loadDraft = useCallback((): InspectionFormValues | null => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft);
        onDraftRestored?.();
        return parsedDraft;
      }
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showToast('Failed to load draft', 'error');
      onError?.(new Error(`Failed to load draft: ${errorMessage}`));
      return null;
    }
  }, [showToast, onDraftRestored, onError]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onError?.(new Error(`Failed to clear draft: ${errorMessage}`));
      return false;
    }
  }, [onError]);

  const setupAutosave = useCallback((values: InspectionFormValues, isDirty: boolean) => {
    if (isDirty) {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }

      autosaveTimeoutRef.current = setTimeout(() => {
        saveDraft(values);
        showToast('Progress auto-saved', 'info');
      }, autosaveDelay);

      return () => {
        if (autosaveTimeoutRef.current) {
          clearTimeout(autosaveTimeoutRef.current);
        }
      };
    }
  }, [autosaveDelay, saveDraft, showToast]);

  const saveFormProgress = useCallback((values: InspectionFormValues) => {
    try {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(values));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onError?.(new Error(`Failed to save form progress: ${errorMessage}`));
      return false;
    }
  }, [onError]);

  const loadFormProgress = useCallback((): InspectionFormValues | null => {
    try {
      const savedProgress = localStorage.getItem(FORM_STORAGE_KEY);
      return savedProgress ? JSON.parse(savedProgress) : null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onError?.(new Error(`Failed to load form progress: ${errorMessage}`));
      return null;
    }
  }, [onError]);

  const clearFormProgress = useCallback(() => {
    try {
      localStorage.removeItem(FORM_STORAGE_KEY);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onError?.(new Error(`Failed to clear form progress: ${errorMessage}`));
      return false;
    }
  }, [onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    setupAutosave,
    saveFormProgress,
    loadFormProgress,
    clearFormProgress,
  };
}
