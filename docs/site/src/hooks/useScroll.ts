import { useState, useEffect, useCallback, useRef } from 'react';
import type { ScrollSection, ScrollProgress, UseScrollOptions, ScrollToOptions } from '../types/scroll';

const DEFAULT_OPTIONS: UseScrollOptions = {
  offset: 0,
  threshold: 0.2,
  smooth: true,
};

export function useScroll(options: UseScrollOptions = DEFAULT_OPTIONS) {
  const [sections, setSections] = useState<ScrollSection[]>([]);
  const [progress, setProgress] = useState<ScrollProgress>({
    currentSection: null,
    percentComplete: 0,
    isAtTop: true,
    isAtBottom: false,
  });

  const observer = useRef<IntersectionObserver | null>(null);
  const rafId = useRef<number | null>(null);

  // Initialize sections
  useEffect(() => {
    const headings = document.querySelectorAll('h1[id], h2[id], h3[id]');
    const newSections: ScrollSection[] = Array.from(headings).map((element) => ({
      id: element.id,
      element: element as HTMLElement,
      top: element.getBoundingClientRect().top + window.pageYOffset - (options.offset || 0),
      bottom: element.getBoundingClientRect().bottom + window.pageYOffset,
    }));

    setSections(newSections);

    // Setup intersection observer
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setProgress((prev) => ({
              ...prev,
              currentSection: entry.target.id,
            }));
          }
        });
      },
      {
        threshold: options.threshold,
        rootMargin: `-${options.offset || 0}px 0px 0px 0px`,
      }
    );

    // Observe all section headings
    headings.forEach((heading) => {
      observer.current?.observe(heading);
    });

    return () => {
      observer.current?.disconnect();
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [options.offset, options.threshold]);

  // Update scroll progress
  const updateProgress = useCallback(() => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percentComplete = (scrollTop / docHeight) * 100;
    
    setProgress((prev) => ({
      ...prev,
      percentComplete,
      isAtTop: scrollTop === 0,
      isAtBottom: Math.ceil(scrollTop) >= Math.floor(docHeight),
    }));

    rafId.current = requestAnimationFrame(updateProgress);
  }, []);

  // Setup scroll listener
  useEffect(() => {
    rafId.current = requestAnimationFrame(updateProgress);
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [updateProgress]);

  // Scroll to section
  const scrollToSection = useCallback((sectionId: string, scrollOptions?: ScrollToOptions) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const offset = scrollOptions?.offset ?? options.offset ?? 0;
    const behavior = options.smooth ? 'smooth' : 'auto';

    window.scrollTo({
      top: section.top - offset,
      behavior,
      ...scrollOptions,
    });
  }, [sections, options.offset, options.smooth]);

  // Scroll to top
  const scrollToTop = useCallback((scrollOptions?: ScrollToOptions) => {
    window.scrollTo({
      top: 0,
      behavior: options.smooth ? 'smooth' : 'auto',
      ...scrollOptions,
    });
  }, [options.smooth]);

  // Get nearest section
  const getNearestSection = useCallback((scrollY: number = window.pageYOffset): string | null => {
    if (sections.length === 0) return null;
    
    let nearest = sections[0];
    let minDistance = Math.abs(scrollY - nearest.top);

    sections.forEach((section) => {
      const distance = Math.abs(scrollY - section.top);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = section;
      }
    });

    return nearest.id;
  }, [sections]);

  return {
    progress,
    sections,
    scrollToSection,
    scrollToTop,
    getNearestSection,
  };
}
