import React, { useEffect } from 'react';
import { useScroll } from '../hooks/useScroll';
import './ScrollSpy.css';

interface ScrollSpyProps {
  navItems: Array<{
    id: string;
    title: string;
    level?: number;
  }>;
  offset?: number;
  onActiveChange?: (activeId: string | null) => void;
  className?: string;
}

export function ScrollSpy({
  navItems,
  offset = 64,
  onActiveChange,
  className = '',
}: ScrollSpyProps) {
  const { progress, scrollToSection } = useScroll({ offset });
  const { currentSection } = progress;

  // Notify parent component of active section changes
  useEffect(() => {
    onActiveChange?.(currentSection);
  }, [currentSection, onActiveChange]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    scrollToSection(id);
  };

  return (
    <nav className={`scroll-spy ${className}`.trim()} aria-label="Table of contents">
      <ul className="scroll-spy-list">
        {navItems.map(({ id, title, level = 0 }) => (
          <li
            key={id}
            className={`scroll-spy-item level-${level} ${
              currentSection === id ? 'active' : ''
            }`}
          >
            <a
              href={`#${id}`}
              onClick={(e) => handleClick(e, id)}
              className="scroll-spy-link"
              aria-current={currentSection === id ? 'true' : undefined}
            >
              {title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
