import { MoisturePoint, Point2D } from '../types/canvas';

export interface MoistureReadingStats {
    average: number;
    max: number;
    min: number;
    criticalPoints: MoisturePoint[];
    readingCount: number;
}

export class MoistureReadingManager {
    private readings: MoisturePoint[] = [];
    private criticalThreshold: number = 16; // Default critical moisture threshold

    constructor(criticalThreshold?: number) {
        if (criticalThreshold !== undefined) {
            this.criticalThreshold = criticalThreshold;
        }
    }

    /**
     * Add a new moisture reading
     */
    public addReading(point: Point2D, value: number, notes?: string): MoisturePoint {
        const reading: MoisturePoint = {
            x: point.x,
            y: point.y,
            value,
            timestamp: new Date().toISOString(),
            notes
        };

        this.readings.push(reading);
        return reading;
    }

    /**
     * Get all moisture readings
     */
    public getAllReadings(): MoisturePoint[] {
        return [...this.readings];
    }

    /**
     * Get readings within a specific area
     */
    public getReadingsInArea(topLeft: Point2D, bottomRight: Point2D): MoisturePoint[] {
        return this.readings.filter(reading => 
            reading.x >= topLeft.x &&
            reading.x <= bottomRight.x &&
            reading.y >= topLeft.y &&
            reading.y <= bottomRight.y
        );
    }

    /**
     * Get critical moisture readings (above threshold)
     */
    public getCriticalReadings(): MoisturePoint[] {
        return this.readings.filter(reading => reading.value >= this.criticalThreshold);
    }

    /**
     * Calculate moisture reading statistics
     */
    public getStats(): MoistureReadingStats {
        if (this.readings.length === 0) {
            return {
                average: 0,
                max: 0,
                min: 0,
                criticalPoints: [],
                readingCount: 0
            };
        }

        const values = this.readings.map(r => r.value);
        const criticalPoints = this.getCriticalReadings();

        return {
            average: values.reduce((a, b) => a + b) / values.length,
            max: Math.max(...values),
            min: Math.min(...values),
            criticalPoints,
            readingCount: this.readings.length
        };
    }

    /**
     * Get readings near a specific point
     */
    public getReadingsNearPoint(point: Point2D, radius: number): MoisturePoint[] {
        return this.readings.filter(reading => {
            const distance = Math.sqrt(
                Math.pow(reading.x - point.x, 2) + 
                Math.pow(reading.y - point.y, 2)
            );
            return distance <= radius;
        });
    }

    /**
     * Update an existing reading
     */
    public updateReading(index: number, updates: Partial<MoisturePoint>): MoisturePoint {
        if (index < 0 || index >= this.readings.length) {
            throw new Error('Reading index out of bounds');
        }

        this.readings[index] = {
            ...this.readings[index],
            ...updates
        };

        return this.readings[index];
    }

    /**
     * Remove a reading
     */
    public removeReading(index: number): void {
        if (index < 0 || index >= this.readings.length) {
            throw new Error('Reading index out of bounds');
        }

        this.readings.splice(index, 1);
    }

    /**
     * Clear all readings
     */
    public clearReadings(): void {
        this.readings = [];
    }

    /**
     * Set critical moisture threshold
     */
    public setCriticalThreshold(threshold: number): void {
        if (threshold < 0) {
            throw new Error('Threshold must be non-negative');
        }
        this.criticalThreshold = threshold;
    }

    /**
     * Export readings to JSON
     */
    public exportReadings(): string {
        return JSON.stringify({
            readings: this.readings,
            criticalThreshold: this.criticalThreshold,
            stats: this.getStats(),
            timestamp: new Date().toISOString()
        }, null, 2);
    }

    /**
     * Import readings from JSON
     */
    public importReadings(json: string): void {
        try {
            const data = JSON.parse(json);
            if (Array.isArray(data.readings)) {
                this.readings = data.readings;
                if (typeof data.criticalThreshold === 'number') {
                    this.criticalThreshold = data.criticalThreshold;
                }
            } else {
                throw new Error('Invalid readings data format');
            }
        } catch (error) {
            throw new Error(`Failed to import readings: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get reading at specific index
     */
    public getReading(index: number): MoisturePoint {
        if (index < 0 || index >= this.readings.length) {
            throw new Error('Reading index out of bounds');
        }
        return this.readings[index];
    }

    /**
     * Get total number of readings
     */
    public getReadingCount(): number {
        return this.readings.length;
    }
}
