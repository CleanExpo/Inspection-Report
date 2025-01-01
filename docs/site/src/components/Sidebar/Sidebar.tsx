import React from 'react';
import type { SidebarProps } from '../../types/sidebar';
import { useSidebar } from '../../hooks/useSidebar';
import { SidebarHeader } from './SidebarHeader';
import { SidebarSection } from './SidebarSection';
import './Sidebar.css';

export function Sidebar({
  sections,
  className = '',
  onNavigate,
  activeItemId,
}: SidebarProps) {
  const {
    isOpen,
    toggle,
    toggleSection,
    isSectionExpanded,
    expandAll,
    collapseAll,
  } = useSidebar();

  return (
    <aside
      className={`sidebar ${isOpen ? 'open' : ''} ${className}`}
      aria-label="Navigation sidebar"
    >
      <SidebarHeader
        isOpen={isOpen}
        onToggle={toggle}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
      />

      <nav className="sidebar-nav">
        {sections.map((section) => (
          <SidebarSection
            key={section.id}
            section={section}
            isExpanded={isSectionExpanded(section.id)}
            onToggle={() => toggleSection(section.id)}
            activeItemId={activeItemId}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={toggle}
          aria-hidden="true"
        />
      )}
    </aside>
  );
}
