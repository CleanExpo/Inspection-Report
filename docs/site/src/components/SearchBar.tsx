import React, { useRef, useEffect } from 'react';
import { useSearch } from '../hooks/useSearch';
import { useSearchShortcuts } from '../hooks/useSearchShortcuts';
import type { SearchResult } from '../types/search';
import './SearchBar.css';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export function SearchBar({ className = '', placeholder }: SearchBarProps) {
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    query,
    results,
    isOpen,
    selectedIndex,
    setSelectedIndex,
    handleSearch,
    handleSelect,
    setIsOpen,
    clearSearch
  } = useSearch();

  const { searchShortcut, alternativeShortcut } = useSearchShortcuts({
    onOpen: () => setIsOpen(true),
    inputRef
  });

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  // Highlight matching text in results
  const highlightMatch = (text: string, searchQuery: string) => {
    if (!searchQuery) return text;

    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <span key={i} className="highlight">{part}</span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div ref={searchRef} className={`search-container ${className}`.trim()}>
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder || `Search documentation... (${searchShortcut} or ${alternativeShortcut})`}
          className="search-input"
          aria-label="Search documentation"
          aria-expanded={isOpen}
          aria-controls="search-results"
          aria-activedescendant={selectedIndex >= 0 ? `result-${selectedIndex}` : undefined}
          role="combobox"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="clear-button"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (
        <div 
          id="search-results"
          className="results-container"
          role="listbox"
        >
          {results.length > 0 ? (
            <ul className="results-list">
              {results.map((result, index) => (
                <li
                  key={result.path}
                  id={`result-${index}`}
                  className={`result-item ${selectedIndex === index ? 'selected' : ''}`}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  role="option"
                  aria-selected={selectedIndex === index}
                  data-selected={selectedIndex === index}
                >
                  <h3 className="result-title">
                    {highlightMatch(result.title, query)}
                  </h3>
                  <p className="result-excerpt">
                    {highlightMatch(result.excerpt, query)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            query.length >= 2 && (
              <p className="no-results">
                No results found for "{query}"
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}
