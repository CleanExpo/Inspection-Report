import { prisma } from '../../../lib/db/client';

describe('Database Middleware Performance Monitoring', () => {
  const testJobId = 'middleware-test-123';
  
  // Spy on console methods
  const consoleWarnSpy = jest.spyOn(console, 'warn');

  beforeEach(() => {
    consoleWarnSpy.mockClear();
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.moistureReading.deleteMany({
      where: {
        jobId: testJobId
      }
    });
  });

  test('monitors query performance', async () => {
    // Create multiple readings to potentially trigger performance warning
    const readings = Array(10).fill(null).map((_, i) => ({
      jobId: testJobId,
      room: `room-${i}`,
      floor: '1',
      locationX: i * 1.0,
      locationY: i * 1.0,
      equipmentId: 'test-meter',
      floorPlanId: 'test-plan'
    }));

    await prisma.moistureReading.createMany({
      data: readings
    });

    // Perform a potentially slow query
    await prisma.moistureReading.findMany({
      where: {
        jobId: testJobId
      },
      include: {
        dataPoints: true
      }
    });

    // Check if any slow queries were detected
    const warningCalls = consoleWarnSpy.mock.calls;
    warningCalls.forEach(call => {
      const warning = call[0];
      if (warning.alert === 'Slow Query Detected') {
        expect(warning).toMatchObject({
          model: 'MoistureReading',
          duration: expect.stringMatching(/\d+ms/)
        });
      }
    });
  });

  test('tracks query execution time', async () => {
    const startTime = Date.now();
    
    await prisma.moistureReading.findMany({
      where: {
        jobId: testJobId
      }
    });

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
  });

  test('detects resource intensive operations', async () => {
    // Create a large batch of readings
    const readings = Array(50).fill(null).map((_, i) => ({
      jobId: testJobId,
      room: `room-${i}`,
      floor: '1',
      locationX: i * 1.0,
      locationY: i * 1.0,
      equipmentId: 'test-meter',
      floorPlanId: 'test-plan'
    }));

    await prisma.moistureReading.createMany({
      data: readings
    });

    // Verify resource usage warning was logged
    expect(consoleWarnSpy).toHaveBeenCalled();
    const warningCall = consoleWarnSpy.mock.calls.find(call => 
      call[0].alert === 'High Resource Usage'
    );
    expect(warningCall).toBeDefined();
  });
});
