import { saveOffline, loadOffline, checkStorageAvailability } from "./offlineStorage";

const STANDARDS_KEY = "includeStandards";

export const saveIncludeStandards = async (includeStandards: boolean): Promise<void> => {
  await saveOffline(STANDARDS_KEY, includeStandards);
};

export const loadIncludeStandards = async (): Promise<boolean> => {
  const isStorageAvailable = await checkStorageAvailability();
  if (!isStorageAvailable) {
    console.warn('IndexedDB storage is not available, defaulting to false');
    return false;
  }
  
  return (await loadOffline<boolean>(STANDARDS_KEY)) ?? false;
};

export const clearStandardsPreference = async (): Promise<void> => {
  await saveOffline(STANDARDS_KEY, false);
};

export const syncStandardsPreference = async (): Promise<void> => {
  try {
    const includeStandards = await loadIncludeStandards();
    
    const response = await fetch("/api/syncStandards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ includeStandards }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Sync failed');
    }

    const result = await response.json();
    console.log(result.message); // Log success message
  } catch (error) {
    console.error("Error syncing standards preference:", error);
    // Don't throw error to allow offline operation
    // but do log it for monitoring
    if (error instanceof Error) {
      console.error('Sync error details:', error.message);
    }
  }
};
