import { useState, useEffect } from 'react';
import { RequestHistory } from '../../types/api-playground';

const STORAGE_KEY = 'api-playground-history';
const MAX_HISTORY_ITEMS = 50;

export function useRequestHistory() {
  const [history, setHistory] = useState<RequestHistory[]>(() => {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
  }, [history]);

  const addToHistory = (item: Omit<RequestHistory, 'id' | 'timestamp'>) => {
    const newItem: RequestHistory = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    setHistory(prev => {
      const newHistory = [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const removeFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const updateHistoryItemName = (id: string, name: string) => {
    setHistory(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, name }
          : item
      )
    );
  };

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
    updateHistoryItemName,
  };
}
