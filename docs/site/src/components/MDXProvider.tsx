import { MDXProvider as BaseMDXProvider } from '@mdx-js/react';
import { ReactNode } from 'react';
import CodeBlock from './CodeBlock';
import type { Components } from '@mdx-js/react/lib';

interface MDXProviderProps {
  children: ReactNode;
}

const components: Components = {
  pre: ({ children }) => <div>{children}</div>,
  code: ({ children, className }) => {
    const language = className?.replace('language-', '');
    return <CodeBlock language={language}>{String(children)}</CodeBlock>;
  },
};

export function MDXProvider({ children }: MDXProviderProps) {
  return (
    <BaseMDXProvider components={components}>
      {children}
    </BaseMDXProvider>
  );
}
