import { MoistureReading } from '../types/inspection';
import { moistureManagementService } from './moistureManagementService';
import { equipmentTrackingService } from './equipmentTrackingService';

interface MoistureMap {
    area: string;
    room: string;
    readings: {
        subfloorWME: number;
        flooringWME: number;
        basePlateWME: number;
        bottomWallWME: number;
        scanReading: number;
        relativeHumidity: number;
        airTemp: number;
    };
    benchmark: number;
    progress: number;
    equipment: Array<{
        type: string;
        count: number;
    }>;
    status: 'dry' | 'drying' | 'wet';
}

interface TrendData {
    timestamps: string[];
    readings: {
        subfloorWME: number[];
        flooringWME: number[];
        basePlateWME: number[];
        bottomWallWME: number[];
        relativeHumidity: number[];
        airTemp: number[];
    };
    benchmarks: number[];
    equipment: Array<{
        timestamp: string;
        changes: Array<{
            type: string;
            action: 'added' | 'removed';
            count: number;
        }>;
    }>;
}

/**
 * Service for generating visualizations of moisture data and drying progress
 */
class VisualizationService {
    private static instance: VisualizationService;

    private constructor() {
        // Private constructor for singleton
    }

    static getInstance(): VisualizationService {
        if (!VisualizationService.instance) {
            VisualizationService.instance = new VisualizationService();
        }
        return VisualizationService.instance;
    }

    /**
     * Generate moisture map for all areas
     */
    generateMoistureMap(): {
        maps: MoistureMap[];
        summary: {
            totalAreas: number;
            areasComplete: number;
            averageProgress: number;
            problemAreas: string[];
        };
    } {
        const maps: MoistureMap[] = [];
        let totalProgress = 0;
        const problemAreas: string[] = [];

        // Get all areas with readings
        const areasWithReadings = new Set<string>();
        moistureManagementService.getAreasNeedingAttention().forEach(area => {
            areasWithReadings.add(`${area.area}|${area.room}`);
        });

        // Generate map for each area
        Array.from(areasWithReadings).forEach(areaKey => {
            const [area, room] = areaKey.split('|');
            const latestReading = moistureManagementService.getLatestReading(area, room);
            const progress = moistureManagementService.getDryingProgress(area, room).progress;
            const equipment = equipmentTrackingService.getEquipmentByLocation(area, room);

            if (latestReading) {
                const map: MoistureMap = {
                    area,
                    room,
                    readings: latestReading.readings,
                    benchmark: latestReading.readings.benchmarkWME,
                    progress,
                    equipment: this.summarizeEquipment(equipment),
                    status: this.determineStatus(progress)
                };

                maps.push(map);
                totalProgress += progress;

                if (progress < 50 || latestReading.readings.relativeHumidity > 60) {
                    problemAreas.push(`${area} ${room}`);
                }
            }
        });

        return {
            maps,
            summary: {
                totalAreas: maps.length,
                areasComplete: maps.filter(m => m.status === 'dry').length,
                averageProgress: maps.length > 0 ? totalProgress / maps.length : 0,
                problemAreas
            }
        };
    }

    /**
     * Generate trend data for a specific area
     */
    generateTrendData(area: string, room: string): TrendData {
        const readings = moistureManagementService.getReadings(area, room);
        const equipment = equipmentTrackingService.getEquipmentByLocation(area, room);

        const trendData: TrendData = {
            timestamps: readings.map(r => r.timestamp),
            readings: {
                subfloorWME: readings.map(r => r.readings.subfloorWME),
                flooringWME: readings.map(r => r.readings.flooringWME),
                basePlateWME: readings.map(r => r.readings.basePlateWME),
                bottomWallWME: readings.map(r => r.readings.bottomWallWME),
                relativeHumidity: readings.map(r => r.readings.relativeHumidity),
                airTemp: readings.map(r => r.readings.airTemp)
            },
            benchmarks: readings.map(r => r.readings.benchmarkWME),
            equipment: this.generateEquipmentTimeline(equipment)
        };

        return trendData;
    }

    /**
     * Generate drying progress visualization data
     */
    generateProgressVisualization(): {
        timeline: Array<{
            timestamp: string;
            dryAreas: number;
            inProgressAreas: number;
            wetAreas: number;
            equipmentCount: number;
        }>;
        projections: {
            estimatedCompletion: string;
            remainingDays: number;
            confidence: number;
        };
    } {
        // Implementation would analyze historical data to generate timeline
        // and use trend analysis to make projections
        return {
            timeline: [],
            projections: {
                estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                remainingDays: 7,
                confidence: 0.85
            }
        };
    }

    /**
     * Generate heat map data for moisture levels
     */
    generateHeatMap(readings: MoistureReading[]): {
        data: Array<{
            x: number;
            y: number;
            value: number;
        }>;
        max: number;
        min: number;
    } {
        // Implementation would convert readings into heat map coordinates
        return {
            data: [],
            max: Math.max(...readings.map(r => r.readings.subfloorWME)),
            min: Math.min(...readings.map(r => r.readings.subfloorWME))
        };
    }

    private summarizeEquipment(equipment: any[]): Array<{ type: string; count: number }> {
        const summary = new Map<string, number>();
        equipment.forEach(e => {
            const count = summary.get(e.type) || 0;
            summary.set(e.type, count + 1);
        });
        return Array.from(summary.entries()).map(([type, count]) => ({ type, count }));
    }

    private determineStatus(progress: number): 'dry' | 'drying' | 'wet' {
        if (progress >= 95) return 'dry';
        if (progress >= 50) return 'drying';
        return 'wet';
    }

    private generateEquipmentTimeline(equipment: any[]): Array<{
        timestamp: string;
        changes: Array<{
            type: string;
            action: 'added' | 'removed';
            count: number;
        }>;
    }> {
        // Implementation would analyze equipment installation/removal dates
        // to generate a timeline of changes
        return [];
    }
}

export const visualizationService = VisualizationService.getInstance();
