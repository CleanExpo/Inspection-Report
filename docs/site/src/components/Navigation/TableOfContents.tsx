import React, { useEffect, useState } from 'react';
import styles from './TableOfContents.module.css';

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

export interface TableOfContentsProps {
  contentId?: string; // ID of the content container to scan
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ contentId = 'content' }) => {
  const [items, setItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Find all headings in the content
    const content = document.getElementById(contentId);
    if (!content) return;

    const headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const tocItems: TOCItem[] = Array.from(headings).map((heading) => ({
      id: heading.id || '',
      title: heading.textContent || '',
      level: parseInt(heading.tagName[1]),
    })).filter(item => item.id && item.title);

    setItems(tocItems);

    // Set up intersection observer for headings
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 1.0,
      }
    );

    headings.forEach((heading) => {
      if (heading.id) {
        observer.observe(heading);
      }
    });

    return () => {
      headings.forEach((heading) => {
        if (heading.id) {
          observer.unobserve(heading);
        }
      });
    };
  }, [contentId]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (items.length === 0) return null;

  return (
    <nav className={styles.tableOfContents} aria-label="Table of contents">
      <h2 className={styles.title}>On this page</h2>
      <ul className={styles.list}>
        {items.map((item) => (
          <li
            key={item.id}
            className={`${styles.item} ${styles[`level${item.level}`]} ${
              activeId === item.id ? styles.active : ''
            }`}
          >
            <button
              onClick={() => handleClick(item.id)}
              className={styles.link}
              aria-current={activeId === item.id ? 'location' : undefined}
            >
              {item.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};
