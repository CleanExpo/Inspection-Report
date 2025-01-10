import { MoistureReading } from '../types/inspection';

/**
 * Service for managing moisture readings and analysis
 */
class MoistureManagementService {
    private static instance: MoistureManagementService;
    private readings: Map<string, MoistureReading[]> = new Map(); // key: area+room
    private benchmarks: Map<string, number> = new Map(); // key: area+room

    private constructor() {
        // Private constructor for singleton
    }

    static getInstance(): MoistureManagementService {
        if (!MoistureManagementService.instance) {
            MoistureManagementService.instance = new MoistureManagementService();
        }
        return MoistureManagementService.instance;
    }

    /**
     * Add a new moisture reading for a specific area and room
     */
    addReading(reading: MoistureReading): void {
        const key = this.getKey(reading.area, reading.room);
        const existingReadings = this.readings.get(key) || [];
        existingReadings.push(reading);
        this.readings.set(key, existingReadings);

        // Update benchmark if not set
        if (!this.benchmarks.has(key)) {
            this.benchmarks.set(key, reading.readings.benchmarkWME);
        }
    }

    /**
     * Get all readings for a specific area and room
     */
    getReadings(area: string, room: string): MoistureReading[] {
        return this.readings.get(this.getKey(area, room)) || [];
    }

    /**
     * Get the latest reading for a specific area and room
     */
    getLatestReading(area: string, room: string): MoistureReading | null {
        const readings = this.getReadings(area, room);
        return readings.length > 0 ? readings[readings.length - 1] : null;
    }

    /**
     * Check if moisture levels have reached benchmark
     */
    hasBenchmarkBeenReached(area: string, room: string): boolean {
        const latestReading = this.getLatestReading(area, room);
        const benchmark = this.benchmarks.get(this.getKey(area, room));

        if (!latestReading || benchmark === undefined) {
            return false;
        }

        // Check all WME readings against benchmark
        return (
            latestReading.readings.subfloorWME <= benchmark &&
            latestReading.readings.flooringWME <= benchmark &&
            latestReading.readings.basePlateWME <= benchmark &&
            latestReading.readings.bottomWallWME <= benchmark
        );
    }

    /**
     * Get drying progress for a specific area and room
     */
    getDryingProgress(area: string, room: string): {
        progress: number;
        remainingReadings: {
            subfloor?: number;
            flooring?: number;
            basePlate?: number;
            bottomWall?: number;
        };
    } {
        const latestReading = this.getLatestReading(area, room);
        const benchmark = this.benchmarks.get(this.getKey(area, room));

        if (!latestReading || benchmark === undefined) {
            return { progress: 0, remainingReadings: {} };
        }

        const readings = latestReading.readings;
        const remainingReadings: any = {};
        let metCount = 0;

        // Check each reading against benchmark
        if (readings.subfloorWME > benchmark) {
            remainingReadings.subfloor = readings.subfloorWME;
        } else {
            metCount++;
        }

        if (readings.flooringWME > benchmark) {
            remainingReadings.flooring = readings.flooringWME;
        } else {
            metCount++;
        }

        if (readings.basePlateWME > benchmark) {
            remainingReadings.basePlate = readings.basePlateWME;
        } else {
            metCount++;
        }

        if (readings.bottomWallWME > benchmark) {
            remainingReadings.bottomWall = readings.bottomWallWME;
        } else {
            metCount++;
        }

        return {
            progress: (metCount / 4) * 100,
            remainingReadings
        };
    }

    /**
     * Get historical trend for a specific area and room
     */
    getTrend(area: string, room: string): {
        dates: string[];
        subfloorWME: number[];
        flooringWME: number[];
        basePlateWME: number[];
        bottomWallWME: number[];
        relativeHumidity: number[];
        airTemp: number[];
    } {
        const readings = this.getReadings(area, room);
        return {
            dates: readings.map(r => r.timestamp),
            subfloorWME: readings.map(r => r.readings.subfloorWME),
            flooringWME: readings.map(r => r.readings.flooringWME),
            basePlateWME: readings.map(r => r.readings.basePlateWME),
            bottomWallWME: readings.map(r => r.readings.bottomWallWME),
            relativeHumidity: readings.map(r => r.readings.relativeHumidity),
            airTemp: readings.map(r => r.readings.airTemp)
        };
    }

    /**
     * Get areas that still need attention
     */
    getAreasNeedingAttention(): Array<{
        area: string;
        room: string;
        currentReadings: {
            subfloorWME: number;
            flooringWME: number;
            basePlateWME: number;
            bottomWallWME: number;
        };
        benchmark: number;
    }> {
        const areasNeedingAttention: Array<{
            area: string;
            room: string;
            currentReadings: {
                subfloorWME: number;
                flooringWME: number;
                basePlateWME: number;
                bottomWallWME: number;
            };
            benchmark: number;
        }> = [];

        Array.from(this.readings.entries()).forEach(([key, readings]) => {
            const [area, room] = this.parseKey(key);
            const latestReading = readings[readings.length - 1];
            const benchmark = this.benchmarks.get(key);

            if (!this.hasBenchmarkBeenReached(area, room)) {
                areasNeedingAttention.push({
                    area,
                    room,
                    currentReadings: {
                        subfloorWME: latestReading.readings.subfloorWME,
                        flooringWME: latestReading.readings.flooringWME,
                        basePlateWME: latestReading.readings.basePlateWME,
                        bottomWallWME: latestReading.readings.bottomWallWME
                    },
                    benchmark: benchmark!
                });
            }
        }

        return areasNeedingAttention;
    }

    /**
     * Generate moisture analysis report
     */
    generateReport(): {
        totalAreas: number;
        areasComplete: number;
        areasInProgress: number;
        averageProgress: number;
        problemAreas: Array<{
            area: string;
            room: string;
            issue: string;
        }>;
    } {
        let totalAreas = 0;
        let areasComplete = 0;
        let totalProgress = 0;
        const problemAreas: Array<{
            area: string;
            room: string;
            issue: string;
        }> = [];

        Array.from(this.readings.entries()).forEach(([key, readings]) => {
            const [area, room] = this.parseKey(key);
            totalAreas++;

            if (this.hasBenchmarkBeenReached(area, room)) {
                areasComplete++;
            }

            const progress = this.getDryingProgress(area, room).progress;
            totalProgress += progress;

            // Check for potential issues
            const latestReading = readings[readings.length - 1];
            if (latestReading.readings.relativeHumidity > 60) {
                problemAreas.push({
                    area,
                    room,
                    issue: 'High Relative Humidity'
                });
            }

            // Check for stalled progress
            if (readings.length >= 3) {
                const recentReadings = readings.slice(-3);
                const noProgress = recentReadings.every((reading: MoistureReading, index: number) => 
                    index === 0 || 
                    Math.abs(reading.readings.subfloorWME - recentReadings[index - 1].readings.subfloorWME) < 0.1
                );
                
                if (noProgress && progress < 100) {
                    problemAreas.push({
                        area,
                        room,
                        issue: 'Stalled Drying Progress'
                    });
                }
            }
        });

        return {
            totalAreas,
            areasComplete,
            areasInProgress: totalAreas - areasComplete,
            averageProgress: totalAreas > 0 ? totalProgress / totalAreas : 0,
            problemAreas
        };
    }

    /**
     * Clear all readings (useful for testing)
     */
    clearReadings(): void {
        this.readings.clear();
        this.benchmarks.clear();
    }

    private getKey(area: string, room: string): string {
        return `${area}|${room}`;
    }

    private parseKey(key: string): [string, string] {
        const [area, room] = key.split('|');
        return [area, room];
    }

    /**
     * Get IICRC compliance status
     */
    getIICRCCompliance(): {
        s500Compliant: boolean;
        s520Compliant: boolean;
        issues: string[];
    } {
        const issues: string[] = [];
        let s500Compliant = true;
        let s520Compliant = true;

        Array.from(this.readings.entries()).forEach(([key, readings]) => {
            const [area, room] = this.parseKey(key);
            const latestReading = readings[readings.length - 1];

            // Check S500 compliance (water damage restoration)
            if (latestReading.readings.relativeHumidity > 60) {
                s500Compliant = false;
                issues.push(`High RH in ${area} ${room}: ${latestReading.readings.relativeHumidity}%`);
            }

            // Check temperature for microbial growth (S520)
            if (latestReading.readings.airTemp > 20 && latestReading.readings.relativeHumidity > 65) {
                s520Compliant = false;
                issues.push(`Conditions favorable for microbial growth in ${area} ${room}`);
            }
        });

        return {
            s500Compliant,
            s520Compliant,
            issues
        };
    }

    /**
     * Get drying recommendations based on current readings
     */
    getDryingRecommendations(): {
        recommendations: Array<{
            area: string;
            room: string;
            recommendation: string;
            priority: 'high' | 'medium' | 'low';
        }>;
    } {
        const recommendations: Array<{
            area: string;
            room: string;
            recommendation: string;
            priority: 'high' | 'medium' | 'low';
        }> = [];

        Array.from(this.readings.entries()).forEach(([key, readings]) => {
            const [area, room] = this.parseKey(key);
            const latestReading = readings[readings.length - 1];
            const progress = this.getDryingProgress(area, room).progress;

            // Check for high humidity
            if (latestReading.readings.relativeHumidity > 60) {
                recommendations.push({
                    area,
                    room,
                    recommendation: 'Install additional dehumidification',
                    priority: 'high'
                });
            }

            // Check for stalled drying
            if (progress < 100 && readings.length >= 3) {
                const recentReadings = readings.slice(-3);
                const noProgress = recentReadings.every((reading: MoistureReading, index: number) =>
                    index === 0 ||
                    Math.abs(reading.readings.subfloorWME - recentReadings[index - 1].readings.subfloorWME) < 0.1
                );

                if (noProgress) {
                    recommendations.push({
                        area,
                        room,
                        recommendation: 'Evaluate current drying strategy and consider alternative methods',
                        priority: 'high'
                    });
                }
            }

            // Temperature optimization
            if (latestReading.readings.airTemp < 21) {
                recommendations.push({
                    area,
                    room,
                    recommendation: 'Increase temperature to optimize drying conditions',
                    priority: 'medium'
                });
            }
        });

        return { recommendations };
    }
}

export const moistureManagementService = MoistureManagementService.getInstance();
