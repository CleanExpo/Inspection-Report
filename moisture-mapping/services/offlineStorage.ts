// Mock implementation for testing
export const offlineStorage = {
  initialize: async () => {
    console.log('Initialized offline storage');
    return Promise.resolve();
  },
  
  saveDrawingElements: async (elements: any[]) => {
    console.log('Saved elements to offline storage');
    return Promise.resolve();
  },
  
  getDrawingElements: async () => {
    console.log('Retrieved elements from offline storage');
    return Promise.resolve([]);
  }
};
