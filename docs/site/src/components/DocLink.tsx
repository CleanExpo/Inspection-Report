import NextLink from 'next/link';
import { ReactNode } from 'react';

interface DocLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function DocLink({ href, children, className = '' }: DocLinkProps) {
  const isExternal = href.startsWith('http') || href.startsWith('https');
  const isAnchor = href.startsWith('#');

  // Base styles for all links
  const baseStyles = `
    text-blue-600 hover:text-blue-800 
    dark:text-blue-400 dark:hover:text-blue-300 
    transition-colors duration-200
    ${className}
  `.trim();

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseStyles} inline-flex items-center`}
      >
        {children}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 ml-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    );
  }

  if (isAnchor) {
    return (
      <a
        href={href}
        className={baseStyles}
        onClick={(e) => {
          e.preventDefault();
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
            // Update URL without triggering a scroll
            window.history.pushState({}, '', href);
          }
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <NextLink href={href} className={baseStyles}>
      {children}
    </NextLink>
  );
}

// Helper component for API reference links
export function APILink({ name, type }: { name: string; type: 'function' | 'class' | 'interface' | 'type' }) {
  const href = `/api-reference/${type}s/${name.toLowerCase()}`;
  const icons = {
    function: '⚡',
    class: '📦',
    interface: '🔧',
    type: '🏷️',
  };

  return (
    <DocLink href={href} className="inline-flex items-center">
      <span className="mr-1">{icons[type]}</span>
      <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
        {name}
      </code>
    </DocLink>
  );
}
