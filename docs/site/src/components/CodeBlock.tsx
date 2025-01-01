import { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';

interface CodeBlockProps {
  children: string;
  language?: string;
  className?: string;
}

const CodeBlock = ({ children, language = 'typescript', className = '' }: CodeBlockProps) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [children]);

  return (
    <div className="relative rounded-lg overflow-hidden">
      <pre className={`${className} p-4 bg-gray-800 overflow-x-auto`}>
        <code className={`language-${language}`}>{children}</code>
      </pre>
      {language && (
        <div className="absolute top-2 right-2 text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
          {language}
        </div>
      )}
    </div>
  );
};

export default CodeBlock;
