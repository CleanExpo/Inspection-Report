import React from 'react';
import type { SidebarHeaderProps } from '../../types/sidebar';
import './SidebarHeader.css';

export function SidebarHeader({
  isOpen,
  onToggle,
  onExpandAll,
  onCollapseAll,
}: SidebarHeaderProps) {
  return (
    <div className="sidebar-header">
      <button
        onClick={onToggle}
        className="sidebar-toggle"
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={isOpen}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="sidebar-actions">
          <button
            onClick={onExpandAll}
            className="sidebar-action-button"
            aria-label="Expand all sections"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
            <span>Expand All</span>
          </button>

          <button
            onClick={onCollapseAll}
            className="sidebar-action-button"
            aria-label="Collapse all sections"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 15l7-7 7 7" />
            </svg>
            <span>Collapse All</span>
          </button>
        </div>
      )}
    </div>
  );
}
