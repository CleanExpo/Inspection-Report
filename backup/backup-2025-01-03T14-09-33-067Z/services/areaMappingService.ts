import { PropertyArea } from '../types/inspection';

interface MaterialDetails {
    type: string;
    subfloor: string;
    age: number;
    installed: string;
    underlay?: string;
    manufacturer?: string;
    model?: string;
    warranty?: {
        period: number;
        expiry: string;
        coverage: string[];
    };
}

interface AreaDetails {
    id: string;
    area: string;
    room: string;
    size: {
        length: number;
        width: number;
        height: number;
        unit: 'meters' | 'feet';
    };
    materials: {
        flooring: MaterialDetails;
        walls?: MaterialDetails;
        ceiling?: MaterialDetails;
    };
    features: {
        windows: number;
        doors: number;
        vents: number;
        fixtures: string[];
    };
    notes?: string;
}

/**
 * Service for managing area mapping and material tracking
 */
class AreaMappingService {
    private static instance: AreaMappingService;
    private areas: Map<string, AreaDetails> = new Map();
    private materialCatalog: Map<string, MaterialDetails> = new Map();

    private constructor() {
        // Private constructor for singleton
    }

    static getInstance(): AreaMappingService {
        if (!AreaMappingService.instance) {
            AreaMappingService.instance = new AreaMappingService();
        }
        return AreaMappingService.instance;
    }

    /**
     * Add or update area details
     */
    updateArea(details: AreaDetails): void {
        this.areas.set(this.getAreaKey(details.area, details.room), details);
        
        // Add materials to catalog if not exists
        this.addToCatalog(details.materials.flooring);
        if (details.materials.walls) this.addToCatalog(details.materials.walls);
        if (details.materials.ceiling) this.addToCatalog(details.materials.ceiling);
    }

    /**
     * Get area details
     */
    getArea(area: string, room: string): AreaDetails | undefined {
        return this.areas.get(this.getAreaKey(area, room));
    }

    /**
     * Get all areas
     */
    getAllAreas(): AreaDetails[] {
        return Array.from(this.areas.values());
    }

    /**
     * Add material to catalog
     */
    addToCatalog(material: MaterialDetails): void {
        const key = this.getMaterialKey(material);
        if (!this.materialCatalog.has(key)) {
            this.materialCatalog.set(key, material);
        }
    }

    /**
     * Get material from catalog
     */
    getMaterial(type: string, manufacturer?: string, model?: string): MaterialDetails | undefined {
        const key = this.getMaterialKey({ type, manufacturer, model } as MaterialDetails);
        return this.materialCatalog.get(key);
    }

    /**
     * Get all materials of a specific type
     */
    getMaterialsByType(type: string): MaterialDetails[] {
        return Array.from(this.materialCatalog.values())
            .filter(material => material.type === type);
    }

    /**
     * Calculate total area
     */
    calculateTotalArea(): {
        totalArea: number;
        byRoom: { [key: string]: number };
        unit: 'square meters' | 'square feet';
    } {
        const byRoom: { [key: string]: number } = {};
        let totalArea = 0;

        this.areas.forEach(area => {
            const roomArea = area.size.length * area.size.width;
            const key = `${area.area}-${area.room}`;
            byRoom[key] = roomArea;
            totalArea += roomArea;
        });

        return {
            totalArea,
            byRoom,
            unit: 'square meters'
        };
    }

    /**
     * Generate area summary
     */
    generateAreaSummary(): {
        totalRooms: number;
        totalArea: number;
        materialBreakdown: {
            [type: string]: number; // count of each material type
        };
        ageAnalysis: {
            averageAge: number;
            oldestMaterial: {
                type: string;
                age: number;
                location: string;
            };
            warrantyStatus: {
                valid: number;
                expired: number;
                expiringSoon: number;
            };
        };
    } {
        const materialCounts: { [type: string]: number } = {};
        let totalAge = 0;
        let materialCount = 0;
        let oldestMaterial = { type: '', age: 0, location: '' };
        const warrantyStatus = { valid: 0, expired: 0, expiringSoon: 0 };

        this.areas.forEach(area => {
            // Count materials
            const materials = [
                area.materials.flooring,
                area.materials.walls,
                area.materials.ceiling
            ].filter(Boolean) as MaterialDetails[];

            materials.forEach(material => {
                materialCounts[material.type] = (materialCounts[material.type] || 0) + 1;
                totalAge += material.age;
                materialCount++;

                // Track oldest material
                if (material.age > oldestMaterial.age) {
                    oldestMaterial = {
                        type: material.type,
                        age: material.age,
                        location: `${area.area} ${area.room}`
                    };
                }

                // Check warranty status
                if (material.warranty) {
                    const expiryDate = new Date(material.warranty.expiry);
                    const threeMonths = 3 * 30 * 24 * 60 * 60 * 1000; // 3 months in milliseconds
                    
                    if (expiryDate < new Date()) {
                        warrantyStatus.expired++;
                    } else if (expiryDate.getTime() - Date.now() < threeMonths) {
                        warrantyStatus.expiringSoon++;
                    } else {
                        warrantyStatus.valid++;
                    }
                }
            });
        });

        return {
            totalRooms: this.areas.size,
            totalArea: this.calculateTotalArea().totalArea,
            materialBreakdown: materialCounts,
            ageAnalysis: {
                averageAge: materialCount > 0 ? totalAge / materialCount : 0,
                oldestMaterial,
                warrantyStatus
            }
        };
    }

    /**
     * Get restoration recommendations based on material types
     */
    getRestorationRecommendations(): Array<{
        area: string;
        room: string;
        recommendations: string[];
        priority: 'high' | 'medium' | 'low';
        estimatedCost?: number;
    }> {
        const recommendations: Array<{
            area: string;
            room: string;
            recommendations: string[];
            priority: 'high' | 'medium' | 'low';
            estimatedCost?: number;
        }> = [];

        this.areas.forEach(area => {
            const areaRecommendations: string[] = [];
            let priority: 'high' | 'medium' | 'low' = 'low';

            // Check flooring
            if (area.materials.flooring.age > 10) {
                areaRecommendations.push('Consider flooring replacement due to age');
                priority = 'medium';
            }

            // Check for water-sensitive materials
            if (area.materials.flooring.type.toLowerCase().includes('wood')) {
                areaRecommendations.push('Monitor closely for water damage on wooden flooring');
                priority = 'high';
            }

            if (areaRecommendations.length > 0) {
                recommendations.push({
                    area: area.area,
                    room: area.room,
                    recommendations: areaRecommendations,
                    priority
                });
            }
        });

        return recommendations;
    }

    private getAreaKey(area: string, room: string): string {
        return `${area}|${room}`;
    }

    private getMaterialKey(material: MaterialDetails): string {
        return `${material.type}|${material.manufacturer || ''}|${material.model || ''}`;
    }

    /**
     * Clear all records (useful for testing)
     */
    clearRecords(): void {
        this.areas.clear();
        this.materialCatalog.clear();
    }
}

export const areaMappingService = AreaMappingService.getInstance();
