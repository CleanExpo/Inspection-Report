import { prisma } from '../../../lib/db/client';

describe('Database Middleware Logging', () => {
  const testJobId = 'middleware-test-123';
  
  // Spy on console methods
  const consoleLogSpy = jest.spyOn(console, 'log');
  const consoleErrorSpy = jest.spyOn(console, 'error');

  beforeEach(() => {
    // Clear console spies
    consoleLogSpy.mockClear();
    consoleErrorSpy.mockClear();
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.moistureReading.deleteMany({
      where: {
        jobId: testJobId
      }
    });
  });

  test('logs successful database operations', async () => {
    // Create a test reading
    await prisma.moistureReading.create({
      data: {
        jobId: testJobId,
        room: 'test-room',
        floor: '1',
        locationX: 1.0,
        locationY: 1.0,
        equipmentId: 'test-meter',
        floorPlanId: 'test-plan'
      }
    });

    // Verify logging middleware captured the operation
    expect(consoleLogSpy).toHaveBeenCalled();
    const logCall = consoleLogSpy.mock.calls[0][0];
    expect(logCall).toMatchObject({
      model: 'MoistureReading',
      action: 'create',
      success: true
    });
  });

  test('logs failed database operations', async () => {
    // Attempt to create a reading with invalid data
    try {
      await prisma.moistureReading.create({
        // @ts-ignore - intentionally missing required fields
        data: {
          jobId: testJobId
        }
      });
    } catch (error) {
      // Expected error
    }

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalled();
    const errorCall = consoleErrorSpy.mock.calls[0][0];
    expect(errorCall).toMatchObject({
      model: 'MoistureReading',
      action: 'create',
      success: false
    });
  });
});
