export interface SearchResult {
  path: string;
  title: string;
  excerpt: string;
  score: number;
  category?: string;
  lastUpdated?: string;
  index?: number;  // Add index for keyboard navigation
}

export interface SearchAnalytics {
  query: string;
  timestamp: number;
  resultCount: number;
  selectedResult?: string;
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  isOpen: boolean;
  selectedIndex: number;
}

export interface SearchActions {
  setIsOpen: (isOpen: boolean) => void;
  setSelectedIndex: (index: number) => void;
  handleSearch: (value: string) => void;
  handleSelect: (result: SearchResult) => void;
  clearSearch: () => void;
}
