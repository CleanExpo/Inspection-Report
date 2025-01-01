/**
 * Utility for managing editor errors with different severity levels and types
 */

export type ErrorSeverity = 'error' | 'warning' | 'info';
export type ErrorType = 'syntax' | 'runtime' | 'semantic';

export interface EditorError {
  id: string;
  message: string;
  severity: ErrorSeverity;
  type: ErrorType;
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  code?: string;
  source?: string;
}

class ErrorCollection {
  private errors: Map<string, EditorError> = new Map();

  /**
   * Add a new error to the collection
   */
  addError(error: Omit<EditorError, 'id'>): EditorError {
    const id = this.generateErrorId(error);
    const newError = { ...error, id };
    this.errors.set(id, newError);
    return newError;
  }

  /**
   * Remove an error from the collection
   */
  removeError(id: string): boolean {
    return this.errors.delete(id);
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors.clear();
  }

  /**
   * Get all errors
   */
  getAllErrors(): EditorError[] {
    return Array.from(this.errors.values());
  }

  /**
   * Get errors filtered by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): EditorError[] {
    return this.getAllErrors().filter(error => error.severity === severity);
  }

  /**
   * Get errors filtered by type
   */
  getErrorsByType(type: ErrorType): EditorError[] {
    return this.getAllErrors().filter(error => error.type === type);
  }

  /**
   * Get errors for a specific line
   */
  getErrorsForLine(lineNumber: number): EditorError[] {
    return this.getAllErrors().filter(
      error => 
        error.startLineNumber <= lineNumber && 
        error.endLineNumber >= lineNumber
    );
  }

  /**
   * Check if there are any errors
   */
  hasErrors(): boolean {
    return this.errors.size > 0;
  }

  /**
   * Get error count
   */
  getErrorCount(): number {
    return this.errors.size;
  }

  /**
   * Generate a unique ID for an error based on its properties
   */
  private generateErrorId(error: Omit<EditorError, 'id'>): string {
    return `${error.type}-${error.startLineNumber}:${error.startColumn}-${error.endLineNumber}:${error.endColumn}`;
  }
}

export const createErrorCollection = () => new ErrorCollection();
