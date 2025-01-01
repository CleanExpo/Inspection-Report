import { useCallback, useEffect, useRef, useState } from 'react';
import type * as Monaco from 'monaco-editor';
import { 
  createErrorCollection, 
  type EditorError,
  type ErrorSeverity,
  type ErrorType 
} from '../utils/errorCollection';

interface UseEditorErrorsOptions {
  editor: Monaco.editor.IStandaloneCodeEditor | null;
  monaco: typeof Monaco | null;
  language: string;
}

export function useEditorErrors({
  editor,
  monaco,
  language
}: UseEditorErrorsOptions) {
  const modelRef = useRef<Monaco.editor.ITextModel | null>(null);
  const errorCollectionRef = useRef(createErrorCollection());
  const [errorCount, setErrorCount] = useState(0);

  // Add error to collection and update markers
  const addError = useCallback((error: Omit<EditorError, 'id'>) => {
    if (!monaco || !editor) return;

    const newError = errorCollectionRef.current.addError(error);
    const model = editor.getModel();
    if (!model) return;

    const markers = errorCollectionRef.current.getAllErrors().map(err => ({
      message: err.message,
      severity: err.severity === 'error' 
        ? monaco.MarkerSeverity.Error 
        : err.severity === 'warning'
        ? monaco.MarkerSeverity.Warning
        : monaco.MarkerSeverity.Info,
      startLineNumber: err.startLineNumber,
      startColumn: err.startColumn,
      endLineNumber: err.endLineNumber,
      endColumn: err.endColumn,
      source: err.source || 'editor'
    }));

    monaco.editor.setModelMarkers(model, 'editor', markers);
    setErrorCount(errorCollectionRef.current.getErrorCount());
  }, [monaco, editor]);

  // Set up markers for the editor
  const setMarkers = useCallback((errors: Omit<EditorError, 'id'>[]) => {
    if (!monaco || !editor) return;

    const model = editor.getModel();
    if (!model) return;

    errorCollectionRef.current.clearErrors();
    errors.forEach(error => addError(error));
  }, [monaco, editor]);

  // Clear all markers and errors
  const clearMarkers = useCallback(() => {
    if (!monaco || !editor) return;
    const model = editor.getModel();
    if (model) {
      errorCollectionRef.current.clearErrors();
      monaco.editor.setModelMarkers(model, 'editor', []);
      setErrorCount(0);
    }
  }, [monaco, editor]);

  // Get filtered errors
  const getErrorsBySeverity = useCallback((severity: ErrorSeverity) => {
    return errorCollectionRef.current.getErrorsBySeverity(severity);
  }, []);

  const getErrorsByType = useCallback((type: ErrorType) => {
    return errorCollectionRef.current.getErrorsByType(type);
  }, []);

  // Set up syntax validation
  useEffect(() => {
    if (!monaco || !editor) return;

    const model = editor.getModel();
    if (!model) return;

    modelRef.current = model;

    // Configure language validation settings
    if (language === 'javascript' || language === 'typescript') {
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
        noSuggestionDiagnostics: false
      });
    }

    // Clean up
    return () => {
      clearMarkers();
    };
  }, [monaco, editor, language, clearMarkers]);

  // Handle runtime errors
  const handleRuntimeError = useCallback((error: Error, position?: { line: number; column: number }) => {
    if (!editor) return;

    const errorMarker: Omit<EditorError, 'id'> = {
      message: error.message,
      severity: 'error',
      type: 'runtime',
      startLineNumber: position?.line ?? 1,
      startColumn: position?.column ?? 1,
      endLineNumber: position?.line ?? 1,
      endColumn: (position?.column ?? 1) + 1,
      source: 'runtime'
    };

    addError(errorMarker);
  }, [editor, setMarkers]);

  return {
    addError,
    setMarkers,
    clearMarkers,
    handleRuntimeError,
    getErrorsBySeverity,
    getErrorsByType,
    errorCount
  };
}
