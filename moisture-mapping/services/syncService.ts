// Mock implementation for testing
export const syncService = {
  initialize: async () => {
    console.log('Initialized sync service');
    return Promise.resolve();
  },
  
  syncDrawingElements: async (elements: any[], options?: { onError?: (error: Error) => void }) => {
    console.log('Synced elements with server');
    return Promise.resolve();
  },
  
  disconnect: () => {
    console.log('Disconnected sync service');
  }
};
