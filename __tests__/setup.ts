import { jest } from '@jest/globals';

// Create basic mock functions with default implementations
export const createMockPrisma = () => ({
  template: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  templateSection: {
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn(async (callback) => {
    if (typeof callback === 'function') {
      return callback();
    }
    return callback;
  }),
});

// Helper to create mock responses
export const mockSuccess = <T>(data: T) => Promise.resolve(data);
export const mockError = (message: string) => Promise.reject(new Error(message));

// Re-export jest for convenience
export { jest };
