import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { docSearch } from '../utils/search';
import { debounce } from '../utils/debounce';
import type { SearchResult, SearchAnalytics, SearchState, SearchActions } from '../types/search';

const ANALYTICS_STORAGE_KEY = 'doc_search_analytics';
const MAX_ANALYTICS_ENTRIES = 1000;

export function useSearch(): SearchState & SearchActions {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();

  // Track search analytics
  const trackSearch = useCallback((analytics: SearchAnalytics) => {
    try {
      const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY);
      const searches: SearchAnalytics[] = stored ? JSON.parse(stored) : [];
      
      searches.push(analytics);
      
      // Keep only the most recent searches
      if (searches.length > MAX_ANALYTICS_ENTRIES) {
        searches.splice(0, searches.length - MAX_ANALYTICS_ENTRIES);
      }
      
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(searches));
    } catch (error) {
      console.error('Failed to track search analytics:', error);
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.length >= 2) {
        const searchResults = docSearch.search(searchQuery);
        setResults(searchResults);
        setIsOpen(true);
        setSelectedIndex(-1);

        // Track search analytics
        trackSearch({
          query: searchQuery,
          timestamp: Date.now(),
          resultCount: searchResults.length
        });
      } else {
        setResults([]);
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }, 300),
    [trackSearch]
  );

  // Handle search input
  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  // Handle result selection
  const handleSelect = useCallback((result: SearchResult) => {
    trackSearch({
      query,
      timestamp: Date.now(),
      resultCount: results.length,
      selectedResult: result.path
    });
    
    router.push(result.path);
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
  }, [query, results.length, router, trackSearch]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : prev);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  }, [isOpen, results, selectedIndex, handleSelect]);

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    query,
    results,
    isOpen,
    selectedIndex,
    setIsOpen,
    setSelectedIndex,
    handleSearch,
    handleSelect,
    clearSearch: () => {
      setQuery('');
      setResults([]);
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };
}
