import { useRef, useEffect, useState } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { useEditorStorage } from '../hooks/useEditorStorage';
import { useEditorErrors } from '../hooks/useEditorErrors';
import { useCodeFormatting } from '../hooks/useCodeFormatting';
import { SaveStatus } from './SaveStatus';
import { useTheme } from '../hooks/useTheme';
import { 
  isLanguageSupported, 
  detectLanguage, 
  type SupportedLanguage 
} from '../utils/languageConfig';
import { registerEditorThemes, getEditorTheme } from '../utils/editorThemes';

interface CodeEditorProps {
  value?: string;
  language?: string;
  filename?: string;
  onChange?: (value: string) => void;
  height?: string | number;
  readOnly?: boolean;
  autoSave?: boolean;
  onSave?: (value: string) => void | Promise<void>;
}

export function CodeEditor({
  value = '',
  language,
  filename,
  onChange,
  height = '400px',
  readOnly = false,
  autoSave = true,
  onSave
}: CodeEditorProps) {
  // Determine the language to use
  const detectedLanguage = filename ? detectLanguage(filename) : undefined;
  const finalLanguage = language && isLanguageSupported(language) 
    ? language 
    : detectedLanguage || 'javascript';
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const [currentValue, setCurrentValue] = useState(value);

  const { isSaving, lastSaved, error, saveNow, lastModified, hasStoredContent } = useEditorStorage({
    id: filename || 'default-editor',
    initialValue: currentValue,
    onChange: onSave || onChange,
    enabled: autoSave && !readOnly,
    debounceMs: 1000
  });

  // Setup error handling
  const {
    addError,
    clearMarkers,
    handleRuntimeError,
    errorCount,
    getErrorsBySeverity
  } = useEditorErrors({
    editor: editorRef.current,
    monaco: monacoRef.current,
    language: finalLanguage
  });

  const {
    formatDocument,
    formatSelection,
    isFormatting,
    handleSave
  } = useCodeFormatting({
    editor: editorRef.current,
    language: finalLanguage
  });

  // Handle editor mount
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    // Register custom themes
    registerEditorThemes(monaco);
    // Focus the editor when mounted if not readonly
    if (!readOnly) {
      editor.focus();
    }
  };

  // Handle value changes
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCurrentValue(value);
      if (onChange) {
        onChange(value);
      }
      
      // Clear any existing error markers when content changes
      clearMarkers();
      
      // Syntax validation
      try {
        if (finalLanguage === 'javascript') {
          // Attempt to parse JavaScript code
          const fn = new Function(value);
          
          // Try to execute the code to catch runtime errors
          try {
            fn();
          } catch (runtimeError) {
            if (runtimeError instanceof Error) {
              // Extract line number from error stack if available
              const stackMatch = runtimeError.stack?.match(/<anonymous>:(\d+):(\d+)/);
              const position = stackMatch ? {
                line: parseInt(stackMatch[1], 10),
                column: parseInt(stackMatch[2], 10)
              } : undefined;
              
              handleRuntimeError(runtimeError, position);
            }
          }
        }
      } catch (syntaxError) {
        if (syntaxError instanceof Error) {
          addError({
            message: syntaxError.message,
            severity: 'error',
            type: 'syntax',
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 1,
            source: 'parser'
          });
        }
      }
    }
  };

  // Force save handler
  const handleForceSave = () => {
    if (!readOnly && currentValue) {
      saveNow();
    }
  };

  return (
    <div className="w-full border dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="flex justify-between items-center p-2 border-b dark:border-gray-700">
        <div className="flex items-center">
          {errorCount > 0 && (
            <span className="text-red-500 text-sm mr-4">
              {errorCount} {errorCount === 1 ? 'error' : 'errors'} found
            </span>
          )}
        </div>
        <div className="flex items-center">
          <button
            onClick={formatDocument}
            disabled={isFormatting || readOnly}
            className="px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 mr-2"
            title="Format document (Alt+Shift+F)"
          >
            {isFormatting ? 'Formatting...' : 'Format'}
          </button>
          <SaveStatus
            isSaving={isSaving}
            lastSaved={lastSaved}
            error={error}
            className="mr-2"
          />
        </div>
      </div>
      <Editor
        height={height}
        defaultValue={value}
        defaultLanguage={finalLanguage}
        theme={getEditorTheme(theme)}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on'
        }}
      />
    </div>
  );
}
