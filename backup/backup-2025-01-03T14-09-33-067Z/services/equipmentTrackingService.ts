import { EquipmentRecord } from '../types/inspection';

/**
 * Service for tracking equipment installation, removal, and monitoring
 */
class EquipmentTrackingService {
    private static instance: EquipmentTrackingService;
    private equipment: Map<string, EquipmentRecord> = new Map(); // key: serialNumber

    private constructor() {
        // Private constructor for singleton
    }

    static getInstance(): EquipmentTrackingService {
        if (!EquipmentTrackingService.instance) {
            EquipmentTrackingService.instance = new EquipmentTrackingService();
        }
        return EquipmentTrackingService.instance;
    }

    /**
     * Record equipment installation
     */
    installEquipment(record: EquipmentRecord): void {
        this.equipment.set(record.serialNumber, record);
    }

    /**
     * Record equipment removal
     */
    removeEquipment(serialNumber: string, removalDate: string): void {
        const record = this.equipment.get(serialNumber);
        if (record) {
            record.removalDate = removalDate;
            this.equipment.set(serialNumber, record);
        }
    }

    /**
     * Update equipment runtime
     */
    updateRuntime(serialNumber: string, runtime: number): void {
        const record = this.equipment.get(serialNumber);
        if (record) {
            record.runtime = runtime;
            this.equipment.set(serialNumber, record);
        }
    }

    /**
     * Get equipment by location
     */
    getEquipmentByLocation(area: string, room: string): EquipmentRecord[] {
        return Array.from(this.equipment.values()).filter(
            record => record.location.area === area && record.location.room === room
        );
    }

    /**
     * Get active equipment (not removed)
     */
    getActiveEquipment(): EquipmentRecord[] {
        return Array.from(this.equipment.values()).filter(
            record => !record.removalDate
        );
    }

    /**
     * Get equipment runtime report
     */
    getRuntimeReport(): {
        totalRuntime: number;
        equipmentDetails: Array<{
            serialNumber: string;
            modelNumber: string;
            runtime: number;
            powerUsage: number;
            location: string;
        }>;
        powerUsageSummary: {
            total: number;
            byArea: { [key: string]: number };
        };
    } {
        let totalRuntime = 0;
        let totalPowerUsage = 0;
        const powerByArea: { [key: string]: number } = {};
        const equipmentDetails: Array<{
            serialNumber: string;
            modelNumber: string;
            runtime: number;
            powerUsage: number;
            location: string;
        }> = [];

        Array.from(this.equipment.values()).forEach(record => {
            totalRuntime += record.runtime;
            totalPowerUsage += record.powerUsage;

            const areaKey = `${record.location.area}-${record.location.room}`;
            powerByArea[areaKey] = (powerByArea[areaKey] || 0) + record.powerUsage;

            equipmentDetails.push({
                serialNumber: record.serialNumber,
                modelNumber: record.modelNumber,
                runtime: record.runtime,
                powerUsage: record.powerUsage,
                location: `${record.location.area} - ${record.location.room}`
            });
        });

        return {
            totalRuntime,
            equipmentDetails,
            powerUsageSummary: {
                total: totalPowerUsage,
                byArea: powerByArea
            }
        };
    }

    /**
     * Get equipment placement recommendations
     */
    getPlacementRecommendations(
        area: string,
        room: string,
        roomSize: number,
        moistureLevel: number
    ): {
        recommendations: Array<{
            equipmentType: string;
            count: number;
            placement: string;
            reason: string;
        }>;
    } {
        const recommendations = [];

        // Air movers recommendation (1 per 150-300 sq ft depending on moisture level)
        const airMoverCount = Math.ceil(roomSize / (moistureLevel > 80 ? 150 : 300));
        recommendations.push({
            equipmentType: 'Air Mover',
            count: airMoverCount,
            placement: 'Place in corners and along walls',
            reason: 'Optimal air circulation for drying'
        });

        // Dehumidifier recommendation (1 per 500-1000 sq ft depending on moisture level)
        if (roomSize > 400 || moistureLevel > 70) {
            const dehumidifierCount = Math.ceil(roomSize / (moistureLevel > 80 ? 500 : 1000));
            recommendations.push({
                equipmentType: 'Dehumidifier',
                count: dehumidifierCount,
                placement: 'Central location with good airflow',
                reason: 'Remove excess moisture from air'
            });
        }

        // Air scrubber recommendation (if needed for air quality)
        if (moistureLevel > 75) {
            recommendations.push({
                equipmentType: 'Air Scrubber',
                count: 1,
                placement: 'Central location near return air',
                reason: 'Maintain air quality and prevent mold'
            });
        }

        return { recommendations };
    }

    /**
     * Check IICRC compliance for equipment setup
     */
    checkEquipmentCompliance(area: string, room: string, roomSize: number): {
        compliant: boolean;
        issues: string[];
        recommendations: string[];
    } {
        const equipment = this.getEquipmentByLocation(area, room);
        const issues: string[] = [];
        const recommendations: string[] = [];

        // Count equipment types
        const airMovers = equipment.filter(e => e.type.toLowerCase().includes('air mover')).length;
        const dehumidifiers = equipment.filter(e => e.type.toLowerCase().includes('dehumidifier')).length;

        // Check air mover coverage (IICRC S500 standard)
        const recommendedAirMovers = Math.ceil(roomSize / 250); // 1 per 250 sq ft is standard
        if (airMovers < recommendedAirMovers) {
            issues.push(`Insufficient air movers: ${airMovers} installed, ${recommendedAirMovers} recommended`);
            recommendations.push(`Add ${recommendedAirMovers - airMovers} air movers`);
        }

        // Check dehumidifier coverage
        const recommendedDehumidifiers = Math.ceil(roomSize / 750); // 1 per 750 sq ft is standard
        if (dehumidifiers < recommendedDehumidifiers) {
            issues.push(`Insufficient dehumidifiers: ${dehumidifiers} installed, ${recommendedDehumidifiers} recommended`);
            recommendations.push(`Add ${recommendedDehumidifiers - dehumidifiers} dehumidifiers`);
        }

        return {
            compliant: issues.length === 0,
            issues,
            recommendations
        };
    }

    /**
     * Clear all equipment records (useful for testing)
     */
    clearRecords(): void {
        this.equipment.clear();
    }
}

export const equipmentTrackingService = EquipmentTrackingService.getInstance();
