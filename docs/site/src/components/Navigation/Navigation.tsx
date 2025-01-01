import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './Navigation.module.css';

export interface NavigationItem {
  title: string;
  path: string;
  children?: NavigationItem[];
}

export interface NavigationProps {
  items: NavigationItem[];
}

export const Navigation: React.FC<NavigationProps> = ({ items }) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMobileMenuOpen(false);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  // Toggle section expansion
  const toggleSection = (path: string) => {
    setExpandedSections(prev => 
      prev.includes(path)
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  // Check if a path is active
  const isActive = (path: string) => {
    return router.asPath === path || router.asPath.startsWith(`${path}/`);
  };

  // Render navigation items recursively
  const renderItems = (items: NavigationItem[], level = 0) => {
    return items.map((item) => {
      const active = isActive(item.path);
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedSections.includes(item.path);

      return (
        <li 
          key={item.path}
          className={`${styles.navItem} ${active ? styles.active : ''} ${styles[`level${level}`]}`}
        >
          <div className={styles.navItemContent}>
            <Link
              href={item.path}
              className={`${styles.navLink} ${active ? styles.activeLink : ''}`}
              onClick={() => !hasChildren && setIsMobileMenuOpen(false)}
            >
              {item.title}
            </Link>
            {hasChildren && (
              <button
                className={`${styles.expandButton} ${isExpanded ? styles.expanded : ''}`}
                onClick={() => toggleSection(item.path)}
                aria-expanded={isExpanded}
                aria-label={`Toggle ${item.title} section`}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 4L6 8L10 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
          {hasChildren && isExpanded && item.children && (
            <ul className={styles.subNav}>
              {renderItems(item.children, level + 1)}
            </ul>
          )}
        </li>
      );
    });
  };

  return (
    <nav className={styles.navigation}>
      <button
        className={`${styles.mobileMenuButton} ${isMobileMenuOpen ? styles.open : ''}`}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-expanded={isMobileMenuOpen}
        aria-label="Toggle navigation menu"
      >
        <span className={styles.hamburger}>
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </span>
      </button>

      <div className={`${styles.navContent} ${isMobileMenuOpen ? styles.open : ''}`}>
        <ul className={styles.navList}>
          {renderItems(items)}
        </ul>
      </div>
    </nav>
  );
};
