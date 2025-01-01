import React, { createContext, useContext, useState, useEffect } from "react";
import { loadIncludeStandards, saveIncludeStandards, syncStandardsPreference } from "../services/standardsStorage";

interface AppState {
  includeStandards: boolean;
  setIncludeStandards: React.Dispatch<React.SetStateAction<boolean>>;
  isSyncing: boolean;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [includeStandards, setIncludeStandards] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load standards preference on mount
  useEffect(() => {
    const loadStandardsPreference = async () => {
      try {
        const savedPreference = await loadIncludeStandards();
        setIncludeStandards(savedPreference);
        
        // Initial sync with server
        setIsSyncing(true);
        await syncStandardsPreference();
      } catch (error) {
        console.error('Error loading standards preference:', error);
      } finally {
        setIsInitialized(true);
        setIsSyncing(false);
      }
    };

    loadStandardsPreference();
  }, []);

  // Save and sync standards preference when changed
  useEffect(() => {
    if (isInitialized) {
      const updatePreference = async () => {
        try {
          setIsSyncing(true);
          await saveIncludeStandards(includeStandards);
          await syncStandardsPreference();
        } catch (error) {
          console.error('Error saving/syncing standards preference:', error);
        } finally {
          setIsSyncing(false);
        }
      };

      updatePreference();
    }
  }, [includeStandards, isInitialized]);

  // Don't render children until initial preference is loaded
  if (!isInitialized) {
    return null;
  }

  return (
    <AppContext.Provider value={{ includeStandards, setIncludeStandards, isSyncing }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
