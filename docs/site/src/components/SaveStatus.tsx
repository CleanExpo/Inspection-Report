import React from 'react';

// Simple SVG icons as components
const CheckIcon = () => (
  <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const CloudIcon = () => (
  <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" clipRule="evenodd" />
  </svg>
);

const ExclamationIcon = () => (
  <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

interface SaveStatusProps {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
  className?: string;
}

export function SaveStatus({ isSaving, lastSaved, error, className = '' }: SaveStatusProps) {
  if (error) {
    return (
      <div className={`flex items-center text-red-500 ${className}`} title={error.message}>
        <ExclamationIcon aria-hidden="true" />
        <span className="text-sm">Save failed</span>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className={`flex items-center text-gray-500 dark:text-gray-400 ${className}`}>
        <div className="animate-pulse">
          <CloudIcon aria-hidden="true" />
        </div>
        <span className="text-sm">Saving...</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className={`flex items-center text-green-500 ${className}`}>
        <CheckIcon aria-hidden="true" />
        <span className="text-sm">
          Saved {lastSaved.toLocaleTimeString()}
        </span>
      </div>
    );
  }

  return null;
}
