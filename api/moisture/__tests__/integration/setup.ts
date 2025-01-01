import { prisma } from '../../../../lib/prisma';
import { validRequest, generateRequest, AnalyticsRequest } from '../testData';

// Mock Prisma
jest.mock('../../../../lib/prisma', () => ({
  prisma: {
    moistureReading: {
      findMany: jest.fn()
    }
  }
}));

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Export all test helpers
export {
  prisma,
  validRequest,
  generateRequest,
  type AnalyticsRequest
};
