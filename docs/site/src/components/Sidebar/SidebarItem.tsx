import React from 'react';
import type { SidebarItemProps } from '../../types/sidebar';
import './SidebarItem.css';

export function SidebarItem({
  item,
  isNested = false,
  isActive = false,
  isExpanded = false,
  onToggle,
  onNavigate,
}: SidebarItemProps) {
  const hasNestedItems = item.items && item.items.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    if (hasNestedItems && onToggle) {
      e.preventDefault();
      onToggle();
    } else if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div className={`sidebar-item ${isNested ? 'nested' : ''}`}>
      <a
        href={item.href}
        className={`sidebar-item-link ${isActive ? 'active' : ''}`}
        onClick={handleClick}
        aria-current={isActive ? 'page' : undefined}
      >
        <div className="sidebar-item-content">
          {item.icon && <span className="sidebar-item-icon">{item.icon}</span>}
          <span className="sidebar-item-title">{item.title}</span>
          {item.badge && <span className="sidebar-item-badge">{item.badge}</span>}
          {hasNestedItems && (
            <svg
              className={`sidebar-item-arrow ${isExpanded ? 'expanded' : ''}`}
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
          )}
        </div>
      </a>

      {hasNestedItems && isExpanded && (
        <div className="sidebar-nested-items">
          {item.items?.map((nestedItem) => (
            <SidebarItem
              key={nestedItem.id}
              item={nestedItem}
              isNested={true}
              isActive={isActive}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
