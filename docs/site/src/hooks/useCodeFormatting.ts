import { useCallback, useState } from 'react';
import type * as Monaco from 'monaco-editor';
import { formatCode, needsFormatting, getFormatOptions } from '../utils/codeFormatter';

interface UseCodeFormattingOptions {
  editor: Monaco.editor.IStandaloneCodeEditor | null;
  language: string;
  formatOnSave?: boolean;
}

export function useCodeFormatting({
  editor,
  language,
  formatOnSave = true
}: UseCodeFormattingOptions) {
  const [isFormatting, setIsFormatting] = useState(false);

  // Format the entire document
  const formatDocument = useCallback(async () => {
    if (!editor) return;

    try {
      setIsFormatting(true);
      const model = editor.getModel();
      if (!model) return;

      const value = model.getValue();
      const formatted = await formatCode(value, {
        language,
        ...getFormatOptions(language)
      });

      // Only update if there were changes
      if (formatted !== value) {
        const edits = [{
          range: model.getFullModelRange(),
          text: formatted
        }];
        model.pushEditOperations([], edits, () => null);
      }
    } catch (error) {
      console.error('Format document error:', error);
    } finally {
      setIsFormatting(false);
    }
  }, [editor, language]);

  // Format the selected text
  const formatSelection = useCallback(async () => {
    if (!editor) return;

    try {
      setIsFormatting(true);
      const model = editor.getModel();
      if (!model) return;

      const selection = editor.getSelection();
      if (!selection) return;

      const value = model.getValueInRange(selection);
      const formatted = await formatCode(value, {
        language,
        ...getFormatOptions(language)
      });

      // Only update if there were changes
      if (formatted !== value) {
        const edits = [{
          range: selection,
          text: formatted
        }];
        model.pushEditOperations([], edits, () => null);
      }
    } catch (error) {
      console.error('Format selection error:', error);
    } finally {
      setIsFormatting(false);
    }
  }, [editor, language]);

  // Check if document needs formatting
  const checkFormatting = useCallback(async () => {
    if (!editor) return false;

    const model = editor.getModel();
    if (!model) return false;

    const value = model.getValue();
    return needsFormatting(value, {
      language,
      ...getFormatOptions(language)
    });
  }, [editor, language]);

  // Format on save handler
  const handleSave = useCallback(async () => {
    if (formatOnSave) {
      await formatDocument();
    }
  }, [formatOnSave, formatDocument]);

  return {
    formatDocument,
    formatSelection,
    checkFormatting,
    handleSave,
    isFormatting
  };
}
