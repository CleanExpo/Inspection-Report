import { useCallback, useEffect, useRef, useState } from 'react';

interface AutoSaveOptions {
  value: string;
  onSave: (value: string) => void | Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
}

interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
}

export function useAutoSave({
  value,
  onSave,
  debounceMs = 1000,
  enabled = true
}: AutoSaveOptions) {
  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    error: null
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const valueRef = useRef(value);

  // Update the ref when value changes
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const save = useCallback(async () => {
    if (!enabled) return;

    try {
      setState(prev => ({ ...prev, isSaving: true, error: null }));
      await onSave(valueRef.current);
      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error : new Error('Failed to save')
      }));
    }
  }, [enabled, onSave]);

  // Debounced save effect
  useEffect(() => {
    if (!enabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(save, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, debounceMs, enabled, save]);

  // Force save immediately
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await save();
  }, [save]);

  return {
    ...state,
    saveNow
  };
}
