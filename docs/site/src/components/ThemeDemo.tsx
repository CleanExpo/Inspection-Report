import React from 'react';
import { ThemeManager } from './ThemeManager';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeDemo() {
  const { theme, transitionClass } = useTheme();

  return (
    <div className={`theme-demo ${transitionClass}`}>
      <header className="demo-header">
        <h1>Theme System Demo</h1>
        <p>Current Theme: {theme.name}</p>
      </header>

      <div className="demo-content">
        <section className="theme-manager-section">
          <h2>Theme Management</h2>
          <ThemeManager />
        </section>

        <section className="preview-section">
          <h2>Theme Preview</h2>
          
          <div className="preview-elements">
            <div className="element-group">
              <h3>Buttons</h3>
              <div className="button-group">
                <button className="btn-primary">Primary Button</button>
                <button className="btn-secondary">Secondary Button</button>
              </div>
            </div>

            <div className="element-group">
              <h3>Text & Colors</h3>
              <div className="color-samples">
                <div className="color-sample">
                  <div className="color-box" style={{ backgroundColor: theme.colors.primary }} />
                  <span>Primary</span>
                </div>
                <div className="color-sample">
                  <div className="color-box" style={{ backgroundColor: theme.colors.secondary }} />
                  <span>Secondary</span>
                </div>
                <div className="color-sample">
                  <div className="color-box" style={{ backgroundColor: theme.colors.accent }} />
                  <span>Accent</span>
                </div>
              </div>
            </div>

            <div className="element-group">
              <h3>Form Elements</h3>
              <div className="form-preview">
                <input type="text" placeholder="Text Input" />
                <select>
                  <option>Select Option</option>
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
              </div>
            </div>

            <div className="element-group">
              <h3>Status Colors</h3>
              <div className="status-colors">
                <div className="status-item" style={{ backgroundColor: theme.colors.success }}>
                  Success
                </div>
                <div className="status-item" style={{ backgroundColor: theme.colors.warning }}>
                  Warning
                </div>
                <div className="status-item" style={{ backgroundColor: theme.colors.error }}>
                  Error
                </div>
                <div className="status-item" style={{ backgroundColor: theme.colors.info }}>
                  Info
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .theme-demo {
          padding: 2rem;
          background-color: var(--color-background);
          min-height: 100vh;
          transition: var(--theme-transition);
        }

        /* Apply hardware acceleration during transitions */
        .theme-demo.theme-transition-active {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }

        .demo-header {
          text-align: center;
          margin-bottom: 2rem;
          color: var(--color-text);
        }

        .demo-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .theme-manager-section,
        .preview-section {
          background: var(--color-surface);
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid var(--color-border);
        }

        h2 {
          color: var(--color-text);
          margin-bottom: 1.5rem;
        }

        .preview-elements {
          display: grid;
          gap: 2rem;
        }

        .element-group {
          padding: 1rem;
          border: 1px solid var(--color-border);
          border-radius: 4px;
        }

        h3 {
          color: var(--color-text);
          margin-bottom: 1rem;
        }

        .button-group {
          display: flex;
          gap: 1rem;
        }

        .btn-primary,
        .btn-secondary {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-primary {
          background: var(--color-primary);
          color: white;
        }

        .btn-secondary {
          background: var(--color-secondary);
          color: white;
        }

        .color-samples {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 1rem;
        }

        .color-sample {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .color-box {
          width: 50px;
          height: 50px;
          border-radius: 4px;
          border: 1px solid var(--color-border);
        }

        .form-preview {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        input,
        select {
          padding: 0.5rem;
          border: 1px solid var(--color-border);
          border-radius: 4px;
          background: var(--color-background);
          color: var(--color-text);
        }

        .status-colors {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 0.5rem;
        }

        .status-item {
          padding: 0.5rem;
          border-radius: 4px;
          text-align: center;
          color: white;
        }

        @media (max-width: 768px) {
          .demo-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
