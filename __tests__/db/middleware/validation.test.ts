import { prisma } from '../../../lib/db/client';

describe('Database Middleware Validation', () => {
  const testJobId = 'middleware-test-123';
  
  // Spy on console methods
  const consoleErrorSpy = jest.spyOn(console, 'error');

  beforeEach(() => {
    consoleErrorSpy.mockClear();
  });

  afterEach(async () => {
    await prisma.moistureReading.deleteMany({
      where: {
        jobId: testJobId
      }
    });
  });

  test('validates required fields', async () => {
    // Attempt to create reading without required fields
    await expect(prisma.moistureReading.create({
      // @ts-ignore - intentionally missing required fields
      data: {
        jobId: testJobId
      }
    })).rejects.toThrow();

    expect(consoleErrorSpy).toHaveBeenCalled();
    const errorLog = consoleErrorSpy.mock.calls[0][0];
    expect(errorLog).toMatchObject({
      action: 'create',
      success: false
    });
  });

  test('validates field types', async () => {
    // Test with invalid type (will be caught by TypeScript, but middleware should also validate)
    try {
      // @ts-ignore - intentionally invalid for testing
      await prisma.moistureReading.create({
        data: {
          jobId: testJobId,
          room: 'test-room',
          floor: '1',
          locationX: 'not-a-number',
          locationY: 1.0,
          equipmentId: 'test-meter',
          floorPlanId: 'test-plan'
        }
      });
      fail('Should have thrown type error');
    } catch (error) {
      expect(consoleErrorSpy).toHaveBeenCalled();
    }
  });

  test('validates data integrity', async () => {
    // Test valid data first
    const reading = await prisma.moistureReading.create({
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

    expect(reading).toBeDefined();
    expect(reading.jobId).toBe(testJobId);

    // Test with invalid data
    try {
      // @ts-ignore - intentionally invalid for testing
      await prisma.moistureReading.create({
        data: {
          jobId: testJobId,
          room: '',
          floor: '',
          locationX: 1.0,
          locationY: 1.0,
          equipmentId: 'test-meter',
          floorPlanId: 'test-plan'
        }
      });
      fail('Should have thrown validation error');
    } catch (error) {
      expect(consoleErrorSpy).toHaveBeenCalled();
    }
  });
});
