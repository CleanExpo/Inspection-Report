import React from 'react';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { ThemeDemo } from '../src/components/ThemeDemo';

export default function ThemeDemoPage() {
  return (
    <ThemeProvider>
      <ThemeDemo />
      
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.5;
          transition: var(--theme-transition);
        }

        /* Import theme CSS */
        @import '../src/styles/theme.css';
      `}</style>
    </ThemeProvider>
  );
}
