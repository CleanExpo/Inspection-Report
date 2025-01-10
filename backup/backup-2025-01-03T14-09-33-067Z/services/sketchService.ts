interface Point {
    x: number;
    y: number;
}

interface Dimension {
    width: number;
    height: number;
    unit: 'meters' | 'feet';
}

interface Room {
    id: string;
    name: string;
    dimensions: Dimension;
    position: Point;
    features: Array<{
        type: 'window' | 'door' | 'fixture' | 'furniture';
        label: string;
        position: Point;
        size?: Dimension;
    }>;
    affectedAreas: Array<{
        position: Point;
        size: Dimension;
        damageType: string;
        severity: 'low' | 'medium' | 'high';
        readings?: {
            moisture: number;
            timestamp: string;
        }[];
    }>;
}

interface FloorPlan {
    jobId: string;
    level: string;
    dimensions: Dimension;
    rooms: Room[];
    equipment?: Array<{
        type: string;
        serialNumber: string;
        position: Point;
    }>;
    notes?: string[];
    created: string;
    updated: string;
}

/**
 * Service for managing floor plans and area sketches
 */
class SketchService {
    private static instance: SketchService;
    private floorPlans: Map<string, FloorPlan[]> = new Map(); // key: jobId

    private constructor() {
        // Private constructor for singleton
    }

    static getInstance(): SketchService {
        if (!SketchService.instance) {
            SketchService.instance = new SketchService();
        }
        return SketchService.instance;
    }

    /**
     * Create new floor plan
     */
    createFloorPlan(jobId: string, level: string, dimensions: Dimension): FloorPlan {
        const floorPlan: FloorPlan = {
            jobId,
            level,
            dimensions,
            rooms: [],
            created: new Date().toISOString(),
            updated: new Date().toISOString()
        };

        const existingPlans = this.floorPlans.get(jobId) || [];
        existingPlans.push(floorPlan);
        this.floorPlans.set(jobId, existingPlans);

        return floorPlan;
    }

    /**
     * Add room to floor plan
     */
    addRoom(jobId: string, level: string, room: Omit<Room, 'id'>): Room {
        const plans = this.floorPlans.get(jobId);
        const plan = plans?.find(p => p.level === level);

        if (!plan) {
            throw new Error('Floor plan not found');
        }

        const roomWithId: Room = {
            ...room,
            id: `${level}-${room.name}-${Date.now()}`
        };

        plan.rooms.push(roomWithId);
        plan.updated = new Date().toISOString();

        return roomWithId;
    }

    /**
     * Add affected area to room
     */
    addAffectedArea(
        jobId: string,
        level: string,
        roomId: string,
        area: Room['affectedAreas'][0]
    ): void {
        const plan = this.floorPlans.get(jobId)?.find(p => p.level === level);
        const room = plan?.rooms.find(r => r.id === roomId);

        if (!room) {
            throw new Error('Room not found');
        }

        room.affectedAreas.push(area);
        plan!.updated = new Date().toISOString();
    }

    /**
     * Add equipment to floor plan
     */
    addEquipment(
        jobId: string,
        level: string,
        equipment: NonNullable<FloorPlan['equipment']>[number]
    ): void {
        const plan = this.floorPlans.get(jobId)?.find(p => p.level === level);

        if (!plan) {
            throw new Error('Floor plan not found');
        }

        plan.equipment = plan.equipment || [];
        plan.equipment.push(equipment);
        plan.updated = new Date().toISOString();
    }

    /**
     * Get floor plan
     */
    getFloorPlan(jobId: string, level: string): FloorPlan | undefined {
        return this.floorPlans.get(jobId)?.find(p => p.level === level);
    }

    /**
     * Get all floor plans for a job
     */
    getAllFloorPlans(jobId: string): FloorPlan[] {
        return this.floorPlans.get(jobId) || [];
    }

    /**
     * Update room dimensions
     */
    updateRoomDimensions(
        jobId: string,
        level: string,
        roomId: string,
        dimensions: Dimension
    ): void {
        const plan = this.floorPlans.get(jobId)?.find(p => p.level === level);
        const room = plan?.rooms.find(r => r.id === roomId);

        if (!room) {
            throw new Error('Room not found');
        }

        room.dimensions = dimensions;
        plan!.updated = new Date().toISOString();
    }

    /**
     * Update affected area readings
     */
    updateAreaReadings(
        jobId: string,
        level: string,
        roomId: string,
        areaIndex: number,
        reading: { moisture: number; timestamp: string }
    ): void {
        const plan = this.floorPlans.get(jobId)?.find(p => p.level === level);
        const room = plan?.rooms.find(r => r.id === roomId);

        if (!room || !room.affectedAreas[areaIndex]) {
            throw new Error('Area not found');
        }

        const area = room.affectedAreas[areaIndex];
        area.readings = area.readings || [];
        area.readings.push(reading);
        plan!.updated = new Date().toISOString();
    }

    /**
     * Generate SVG representation
     */
    generateSVG(jobId: string, level: string): string {
        const plan = this.getFloorPlan(jobId, level);
        if (!plan) {
            throw new Error('Floor plan not found');
        }

        // Scale factors for SVG viewport
        const scale = {
            x: 1000 / plan.dimensions.width,
            y: 1000 / plan.dimensions.height
        };

        let svg = `<svg width="1000" height="1000" viewBox="0 0 1000 1000">`;

        // Draw rooms
        plan.rooms.forEach(room => {
            const x = room.position.x * scale.x;
            const y = room.position.y * scale.y;
            const width = room.dimensions.width * scale.x;
            const height = room.dimensions.height * scale.y;

            // Room outline
            svg += `<rect x="${x}" y="${y}" width="${width}" height="${height}" 
                         fill="none" stroke="black" stroke-width="2"/>`;

            // Room label
            svg += `<text x="${x + width/2}" y="${y + 20}" text-anchor="middle">${room.name}</text>`;

            // Features
            room.features.forEach(feature => {
                const fx = feature.position.x * scale.x;
                const fy = feature.position.y * scale.y;
                
                switch (feature.type) {
                    case 'door':
                        svg += `<path d="M ${fx},${fy} A 20,20 0 0 1 ${fx+20},${fy+20}" 
                                     fill="none" stroke="black"/>`;
                        break;
                    case 'window':
                        svg += `<line x1="${fx}" y1="${fy}" x2="${fx+20}" y2="${fy}" 
                                    stroke="black"/>`;
                        break;
                    default:
                        svg += `<rect x="${fx}" y="${fy}" width="10" height="10" 
                                    fill="gray"/>`;
                }
            });

            // Affected areas
            room.affectedAreas.forEach(area => {
                const ax = area.position.x * scale.x;
                const ay = area.position.y * scale.y;
                const awidth = area.size.width * scale.x;
                const aheight = area.size.height * scale.y;

                const color = area.severity === 'high' ? 'red' : 
                            area.severity === 'medium' ? 'orange' : 'yellow';

                svg += `<rect x="${ax}" y="${ay}" width="${awidth}" height="${aheight}" 
                             fill="${color}" fill-opacity="0.5" stroke="none"/>`;
            });
        });

        // Draw equipment
        plan.equipment?.forEach(eq => {
            const ex = eq.position.x * scale.x;
            const ey = eq.position.y * scale.y;

            svg += `<circle cx="${ex}" cy="${ey}" r="5" fill="blue"/>
                   <text x="${ex+10}" y="${ey+5}" font-size="10">${eq.type}</text>`;
        });

        svg += '</svg>';
        return svg;
    }

    /**
     * Clear all records (useful for testing)
     */
    clearRecords(): void {
        this.floorPlans.clear();
    }
}

export const sketchService = SketchService.getInstance();
