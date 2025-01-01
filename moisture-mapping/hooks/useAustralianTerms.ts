// Mock implementation for testing
export const useAustralianTerms = () => {
  return {
    getAustralianTerm: (category: string, term: string) => {
      // For testing, just return the term itself
      return term.charAt(0).toUpperCase() + term.slice(1);
    }
  };
};
