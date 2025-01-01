import React from 'react';
import { SearchBar } from './SearchBar';
import { useMobileNav } from '../hooks/useMobileNav';
import type { MobileNavProps } from '../types/navigation';
import './MobileNav.css';

export function MobileNav({ sections, className = '', onNavigate }: MobileNavProps) {
  const { isOpen, animationState, toggle, close } = useMobileNav();
  const { isEntering, isLeaving } = animationState;

  // Determine panel and backdrop classes based on animation state
  const panelClassName = `mobile-nav-panel ${
    isEntering ? 'mobile-nav-panel-entering' : ''
  } ${!isEntering && !isLeaving ? 'mobile-nav-panel-entered' : ''} ${
    isLeaving ? 'mobile-nav-panel-exiting' : ''
  }`;

  const backdropClassName = `mobile-nav-backdrop ${
    isEntering ? 'mobile-nav-backdrop-entering' : ''
  } ${!isEntering && !isLeaving ? 'mobile-nav-backdrop-entered' : ''} ${
    isLeaving ? 'mobile-nav-backdrop-exiting' : ''
  }`;

  const handleItemClick = () => {
    close();
    onNavigate?.();
  };

  return (
    <div className={`md:hidden ${className}`.trim()}>
      {/* Mobile Menu Button */}
      <button
        onClick={toggle}
        className="mobile-nav-toggle"
        aria-label="Toggle mobile menu"
        aria-expanded={isOpen}
        aria-controls="mobile-nav-panel"
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

      {/* Mobile Menu Panel */}
      {(isOpen || isEntering || isLeaving) && (
        <div className="mobile-nav">
          {/* Backdrop */}
          <div className={backdropClassName} onClick={close} />

          {/* Menu Content */}
          <div id="mobile-nav-panel" className={panelClassName}>
            <div className="mobile-nav-close">
              <button
                className="p-2 rounded-md text-gray-400 hover:text-gray-500"
                onClick={close}
                aria-label="Close menu"
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
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mobile-nav-content">
              <div className="mobile-nav-search">
                <SearchBar 
                  placeholder="Search..."
                  className="w-full"
                />
              </div>

              <nav className="mobile-nav-sections">
                {sections.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    <h4 className="mobile-nav-section-title">
                      {section.title}
                    </h4>
                    <ul className="mobile-nav-items">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          <a
                            href={item.href}
                            className="mobile-nav-item"
                            onClick={handleItemClick}
                          >
                            {item.icon && (
                              <span className="mobile-nav-item-icon">
                                {item.icon}
                              </span>
                            )}
                            {item.title}
                          </a>
                          {item.children && (
                            <ul className="pl-4 mt-2 space-y-2">
                              {item.children.map((child, childIndex) => (
                                <li key={childIndex}>
                                  <a
                                    href={child.href}
                                    className="mobile-nav-item"
                                    onClick={handleItemClick}
                                  >
                                    {child.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
