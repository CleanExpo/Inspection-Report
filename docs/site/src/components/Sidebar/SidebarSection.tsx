import React from 'react';
import type { SidebarSectionProps } from '../../types/sidebar';
import { SidebarItem } from './SidebarItem';
import './SidebarSection.css';

export function SidebarSection({
  section,
  isExpanded,
  onToggle,
  activeItemId,
  onNavigate,
}: SidebarSectionProps) {
  return (
    <div className="sidebar-section">
      <button
        className="sidebar-section-header"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <svg
          className={`sidebar-section-icon ${isExpanded ? 'expanded' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 12l4-4-4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="sidebar-section-title">{section.title}</span>
      </button>

      {isExpanded && (
        <div className="sidebar-section-content">
          {section.items.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              isActive={item.id === activeItemId}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
