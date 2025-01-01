import { useState, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';

interface CodeDisplayProps {
  code: string;
  language: string;
  filename?: string;
  className?: string;
}

export function CodeDisplay({ code, language, filename, className = '' }: CodeDisplayProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Normalize language string for Prism
  const normalizedLanguage = language
    ?.toLowerCase()
    .replace('typescript', 'ts')
    .replace('javascript', 'js');

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      {/* Code header with filename and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-gray-200">
        {filename && (
          <span className="text-sm font-mono">{filename}</span>
        )}
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 text-sm hover:text-white transition-colors"
          aria-label="Copy code to clipboard"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isCopied ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            )}
          </svg>
          <span>{isCopied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Code content */}
      <div className="relative overflow-auto max-h-[500px] bg-gray-900">
        <pre className="p-4 m-0 overflow-auto">
          <code className={`language-${normalizedLanguage}`}>
            {code.trim()}
          </code>
        </pre>

        {/* Line numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-800 border-r border-gray-700" aria-hidden="true">
          {code.split('\n').map((_, i) => (
            <div
              key={i}
              className="text-right pr-2 text-gray-500 text-sm select-none"
              style={{ lineHeight: '1.5rem' }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
