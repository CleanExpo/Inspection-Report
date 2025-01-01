import { useState } from 'react';

interface SearchResult {
  title: string;
  url: string;
  excerpt: string;
}

const DocSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    // Simple mock search results for now
    // This will be replaced with actual search implementation
    const mockResults: SearchResult[] = [
      {
        title: 'Installation Guide',
        url: '/docs/getting-started/installation',
        excerpt: 'Learn how to install and set up the inspection report system...',
      },
      {
        title: 'Quick Start Guide',
        url: '/docs/getting-started/quick-start',
        excerpt: 'Get started quickly with the basic features and functionality...',
      },
    ].filter(result => 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    setResults(mockResults);
    setIsSearching(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Search documentation..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {isSearching && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-md shadow-lg border border-gray-200">
          <ul className="py-2">
            {results.map((result, index) => (
              <li key={index} className="px-4 py-2 hover:bg-gray-50">
                <a href={result.url} className="block">
                  <h4 className="text-sm font-medium text-gray-900">{result.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{result.excerpt}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DocSearch;
