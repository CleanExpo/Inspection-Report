import { useCallback, useEffect } from 'react';
import { useAutoSave } from './useAutoSave';
import {
  saveEditorContent,
  loadEditorContent,
  hasStoredContent,
  getLastModified
} from '../utils/editorStorage';

interface EditorStorageOptions {
  id: string;
  initialValue?: string;
  onChange?: (value: string) => void;
  debounceMs?: number;
  enabled?: boolean;
}

export function useEditorStorage({
  id,
  initialValue = '',
  onChange,
  debounceMs = 1000,
  enabled = true
}: EditorStorageOptions) {
  // Load initial content from storage
  useEffect(() => {
    if (enabled && hasStoredContent(id)) {
      const storedContent = loadEditorContent(id);
      if (storedContent && onChange) {
        onChange(storedContent);
      }
    }
  }, [id, enabled, onChange]);

  // Handle saving content
  const handleSave = useCallback(
    async (content: string) => {
      if (!enabled) return;

      const saved = saveEditorContent(id, content);
      if (!saved) {
        throw new Error('Failed to save editor content');
      }

      if (onChange) {
        onChange(content);
      }
    },
    [id, enabled, onChange]
  );

  // Use auto-save functionality
  const autoSave = useAutoSave({
    value: initialValue,
    onSave: handleSave,
    debounceMs,
    enabled
  });

  // Get last modified time
  const lastModified = enabled ? getLastModified(id) : null;

  return {
    ...autoSave,
    lastModified,
    hasStoredContent: enabled && hasStoredContent(id)
  };
}
