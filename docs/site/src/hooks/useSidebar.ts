import { useState, useCallback, useEffect } from 'react';

interface SidebarState {
  isOpen: boolean;
  expandedSections: Set<string>;
}

const STORAGE_KEY = 'sidebar_state';

export function useSidebar(defaultIsOpen = true) {
  // Initialize state from localStorage if available
  const [state, setState] = useState<SidebarState>(() => {
    if (typeof window === 'undefined') {
      return { isOpen: defaultIsOpen, expandedSections: new Set() };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          isOpen: parsed.isOpen ?? defaultIsOpen,
          expandedSections: new Set(parsed.expandedSections ?? []),
        };
      }
    } catch (error) {
      console.error('Error reading sidebar state:', error);
    }

    return { isOpen: defaultIsOpen, expandedSections: new Set() };
  });

  // Persist state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          isOpen: state.isOpen,
          expandedSections: Array.from(state.expandedSections),
        })
      );
    } catch (error) {
      console.error('Error saving sidebar state:', error);
    }
  }, [state]);

  // Toggle sidebar
  const toggle = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: !prev.isOpen,
    }));
  }, []);

  // Toggle section
  const toggleSection = useCallback((sectionId: string) => {
    setState((prev) => {
      const newExpandedSections = new Set(prev.expandedSections);
      if (newExpandedSections.has(sectionId)) {
        newExpandedSections.delete(sectionId);
      } else {
        newExpandedSections.add(sectionId);
      }
      return {
        ...prev,
        expandedSections: newExpandedSections,
      };
    });
  }, []);

  // Check if section is expanded
  const isSectionExpanded = useCallback(
    (sectionId: string) => state.expandedSections.has(sectionId),
    [state.expandedSections]
  );

  // Expand all sections
  const expandAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      expandedSections: new Set(
        Array.from(document.querySelectorAll('[data-section-id]'))
          .map((el) => el.getAttribute('data-section-id'))
          .filter((id): id is string => id !== null)
      ),
    }));
  }, []);

  // Collapse all sections
  const collapseAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      expandedSections: new Set(),
    }));
  }, []);

  return {
    isOpen: state.isOpen,
    toggle,
    toggleSection,
    isSectionExpanded,
    expandAll,
    collapseAll,
  };
}
