import { MoistureReadingManager } from '../moisture-reading-manager';
import { MoisturePoint, Point2D } from '../../types/canvas';

describe('MoistureReadingManager', () => {
    let manager: MoistureReadingManager;
    const defaultThreshold = 16;
    const customThreshold = 20;

    beforeEach(() => {
        manager = new MoistureReadingManager();
    });

    describe('initialization', () => {
        it('should create instance with default threshold', () => {
            expect(manager).toBeInstanceOf(MoistureReadingManager);
            expect(manager.getStats().criticalPoints).toEqual([]);
        });

        it('should accept custom threshold', () => {
            manager = new MoistureReadingManager(customThreshold);
            const reading = manager.addReading({ x: 0, y: 0 }, customThreshold - 1);
            expect(manager.getCriticalReadings()).toHaveLength(0);
            
            const criticalReading = manager.addReading({ x: 1, y: 1 }, customThreshold + 1);
            expect(manager.getCriticalReadings()).toHaveLength(1);
            expect(manager.getCriticalReadings()[0]).toEqual(criticalReading);
        });
    });

    describe('reading management', () => {
        const point: Point2D = { x: 10, y: 20 };
        const value = 15;
        const notes = 'Test reading';

        it('should add reading with correct data', () => {
            const reading = manager.addReading(point, value, notes);
            
            expect(reading).toMatchObject({
                x: point.x,
                y: point.y,
                value,
                notes
            });
            expect(reading.timestamp).toBeDefined();
        });

        it('should retrieve all readings', () => {
            const reading1 = manager.addReading({ x: 0, y: 0 }, 10);
            const reading2 = manager.addReading({ x: 1, y: 1 }, 20);
            
            const readings = manager.getAllReadings();
            expect(readings).toHaveLength(2);
            expect(readings).toContainEqual(reading1);
            expect(readings).toContainEqual(reading2);
        });

        it('should get readings in area', () => {
            manager.addReading({ x: 0, y: 0 }, 10);
            manager.addReading({ x: 10, y: 10 }, 20);
            manager.addReading({ x: 20, y: 20 }, 30);

            const areaReadings = manager.getReadingsInArea(
                { x: 5, y: 5 },
                { x: 15, y: 15 }
            );
            
            expect(areaReadings).toHaveLength(1);
            expect(areaReadings[0].value).toBe(20);
        });

        it('should get readings near point', () => {
            manager.addReading({ x: 0, y: 0 }, 10);
            manager.addReading({ x: 3, y: 3 }, 20);
            manager.addReading({ x: 10, y: 10 }, 30);

            const nearbyReadings = manager.getReadingsNearPoint({ x: 0, y: 0 }, 5);
            
            expect(nearbyReadings).toHaveLength(2);
            expect(nearbyReadings.map(r => r.value)).toContain(10);
            expect(nearbyReadings.map(r => r.value)).toContain(20);
        });

        it('should update reading', () => {
            manager.addReading({ x: 0, y: 0 }, 10, 'Original');
            
            const updated = manager.updateReading(0, {
                value: 20,
                notes: 'Updated'
            });

            expect(updated.value).toBe(20);
            expect(updated.notes).toBe('Updated');
        });

        it('should remove reading', () => {
            manager.addReading({ x: 0, y: 0 }, 10);
            expect(manager.getReadingCount()).toBe(1);
            
            manager.removeReading(0);
            expect(manager.getReadingCount()).toBe(0);
        });

        it('should clear all readings', () => {
            manager.addReading({ x: 0, y: 0 }, 10);
            manager.addReading({ x: 1, y: 1 }, 20);
            
            manager.clearReadings();
            expect(manager.getReadingCount()).toBe(0);
        });
    });

    describe('statistics', () => {
        beforeEach(() => {
            manager.addReading({ x: 0, y: 0 }, 10);
            manager.addReading({ x: 1, y: 1 }, 20);
            manager.addReading({ x: 2, y: 2 }, 30);
        });

        it('should calculate correct statistics', () => {
            const stats = manager.getStats();
            
            expect(stats.average).toBe(20);
            expect(stats.min).toBe(10);
            expect(stats.max).toBe(30);
            expect(stats.readingCount).toBe(3);
            expect(stats.criticalPoints).toHaveLength(1);
        });

        it('should identify critical readings', () => {
            const criticalReadings = manager.getCriticalReadings();
            
            expect(criticalReadings).toHaveLength(1);
            expect(criticalReadings[0].value).toBe(30);
        });
    });

    describe('data persistence', () => {
        const testReadings: MoisturePoint[] = [
            { x: 0, y: 0, value: 10, timestamp: new Date().toISOString() },
            { x: 1, y: 1, value: 20, timestamp: new Date().toISOString() }
        ];

        it('should export readings to JSON', () => {
            testReadings.forEach(r => manager.addReading({ x: r.x, y: r.y }, r.value));
            
            const exported = manager.exportReadings();
            const parsed = JSON.parse(exported);
            
            expect(parsed.readings).toHaveLength(2);
            expect(parsed.criticalThreshold).toBeDefined();
            expect(parsed.stats).toBeDefined();
            expect(parsed.timestamp).toBeDefined();
        });

        it('should import readings from JSON', () => {
            const data = {
                readings: testReadings,
                criticalThreshold: customThreshold
            };

            manager.importReadings(JSON.stringify(data));
            
            expect(manager.getReadingCount()).toBe(2);
            expect(manager.getAllReadings()).toEqual(expect.arrayContaining(testReadings));
        });

        it('should handle invalid import data', () => {
            expect(() => {
                manager.importReadings('invalid json');
            }).toThrow();

            expect(() => {
                manager.importReadings('{"readings": "not an array"}');
            }).toThrow();
        });
    });
});
