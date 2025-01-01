import { docCache } from './cache';

interface SearchIndex {
  [key: string]: {
    path: string;
    title: string;
    content: string;
    headings: string[];
  };
}

interface SearchResult {
  path: string;
  title: string;
  excerpt: string;
  score: number;
}

class DocumentationSearch {
  private searchIndex: SearchIndex = {};

  // Index a single document
  public indexDocument(path: string, content: string, title: string): void {
    // Cache the indexed document
    docCache.set(`searchIndex:${path}`, {
      path,
      title,
      content,
      headings: this.extractHeadings(content),
    });

    this.searchIndex[path] = {
      path,
      title,
      content: this.normalizeContent(content),
      headings: this.extractHeadings(content),
    };
  }

  // Search the indexed documents
  public search(query: string): SearchResult[] {
    const normalizedQuery = this.normalizeContent(query);
    const results: SearchResult[] = [];

    // Check cache first
    const cachedResults = docCache.get<SearchResult[]>(`searchResults:${query}`);
    if (cachedResults) {
      return cachedResults;
    }

    Object.entries(this.searchIndex).forEach(([path, doc]) => {
      const score = this.calculateRelevance(normalizedQuery, doc);
      if (score > 0) {
        results.push({
          path,
          title: doc.title,
          excerpt: this.generateExcerpt(doc.content, normalizedQuery),
          score,
        });
      }
    });

    // Sort by relevance score
    results.sort((a, b) => b.score - a.score);

    // Cache the results
    docCache.setSearchResults(query, results);

    return results;
  }

  private normalizeContent(content: string): string {
    return content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractHeadings(content: string): string[] {
    const headingRegex = /^#{1,6}\s+(.+)$/gm;
    const headings: string[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      headings.push(match[1].trim());
    }

    return headings;
  }

  private calculateRelevance(query: string, doc: { content: string; title: string; headings: string[] }): number {
    let score = 0;

    // Title matches are weighted heavily
    if (doc.title.toLowerCase().includes(query)) {
      score += 10;
    }

    // Heading matches are weighted moderately
    doc.headings.forEach(heading => {
      if (heading.toLowerCase().includes(query)) {
        score += 5;
      }
    });

    // Content matches
    const contentMatches = (doc.content.match(new RegExp(query, 'gi')) || []).length;
    score += contentMatches;

    return score;
  }

  private generateExcerpt(content: string, query: string): string {
    const excerptLength = 150;
    const normalizedContent = content.toLowerCase();
    const queryIndex = normalizedContent.indexOf(query.toLowerCase());

    if (queryIndex === -1) {
      return content.slice(0, excerptLength) + '...';
    }

    const start = Math.max(0, queryIndex - 60);
    const end = Math.min(content.length, queryIndex + 90);
    
    return (start > 0 ? '...' : '') +
           content.slice(start, end).trim() +
           (end < content.length ? '...' : '');
  }

  // Clear the search index
  public clearIndex(): void {
    this.searchIndex = {};
  }
}

// Export singleton instance
export const docSearch = new DocumentationSearch();
