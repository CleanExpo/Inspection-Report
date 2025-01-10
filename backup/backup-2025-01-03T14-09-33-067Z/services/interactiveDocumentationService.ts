interface MediaPoint {
    id: string;
    type: 'photo' | 'video';
    url: string;
    timestamp: string;
    coordinates: {
        x: number;
        y: number;
    };
    room: string;
    level: string;
    jobId: string;
    notes?: string;
    tags?: string[];
    metadata?: {
        moistureReading?: number;
        thermalReading?: number;
        equipmentId?: string;
    };
}

interface MediaGroup {
    id: string;
    points: MediaPoint[];
    area: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    type: string; // e.g., 'water damage', 'mold', 'equipment'
    severity?: 'low' | 'medium' | 'high';
}

/**
 * Service for handling interactive documentation with floor plan integration
 */
class InteractiveDocumentationService {
    private static instance: InteractiveDocumentationService;
    private mediaPoints: Map<string, MediaPoint[]> = new Map(); // key: jobId
    private mediaGroups: Map<string, MediaGroup[]> = new Map(); // key: jobId

    private constructor() {
        // Private constructor for singleton
    }

    static getInstance(): InteractiveDocumentationService {
        if (!InteractiveDocumentationService.instance) {
            InteractiveDocumentationService.instance = new InteractiveDocumentationService();
        }
        return InteractiveDocumentationService.instance;
    }

    /**
     * Add media point to floor plan
     */
    addMediaPoint(point: Omit<MediaPoint, 'id'>): MediaPoint {
        const id = `media-${Date.now()}`;
        const mediaPoint: MediaPoint = {
            ...point,
            id
        };

        const existingPoints = this.mediaPoints.get(point.jobId) || [];
        existingPoints.push(mediaPoint);
        this.mediaPoints.set(point.jobId, existingPoints);

        return mediaPoint;
    }

    /**
     * Create media group (e.g., for affected areas with multiple photos)
     */
    createMediaGroup(jobId: string, group: Omit<MediaGroup, 'id'>): MediaGroup {
        const id = `group-${Date.now()}`;
        const mediaGroup: MediaGroup = {
            ...group,
            id
        };

        const existingGroups = this.mediaGroups.get(jobId) || [];
        existingGroups.push(mediaGroup);
        this.mediaGroups.set(jobId, existingGroups);

        return mediaGroup;
    }

    /**
     * Get media points for a room
     */
    getRoomMedia(jobId: string, level: string, room: string): MediaPoint[] {
        return (this.mediaPoints.get(jobId) || []).filter(
            point => point.level === level && point.room === room
        );
    }

    /**
     * Get media groups for a room
     */
    getRoomGroups(jobId: string, level: string, room: string): MediaGroup[] {
        return (this.mediaGroups.get(jobId) || []).filter(group =>
            group.points.some(point => point.level === level && point.room === room)
        );
    }

    /**
     * Get media near a point
     */
    getMediaNearPoint(
        jobId: string,
        x: number,
        y: number,
        radius: number
    ): MediaPoint[] {
        return (this.mediaPoints.get(jobId) || []).filter(point => {
            const distance = Math.sqrt(
                Math.pow(point.coordinates.x - x, 2) +
                Math.pow(point.coordinates.y - y, 2)
            );
            return distance <= radius;
        });
    }

    /**
     * Generate interactive SVG with media points
     */
    generateInteractiveSVG(jobId: string, level: string, room: string): string {
        const points = this.getRoomMedia(jobId, level, room);
        const groups = this.getRoomGroups(jobId, level, room);

        let svg = `<svg width="1000" height="1000" viewBox="0 0 1000 1000">`;

        // Draw media points
        points.forEach(point => {
            const x = point.coordinates.x;
            const y = point.coordinates.y;
            const color = point.type === 'photo' ? 'blue' : 'red';

            svg += `
                <g class="media-point" data-id="${point.id}">
                    <circle cx="${x}" cy="${y}" r="5" fill="${color}"/>
                    <circle cx="${x}" cy="${y}" r="10" fill="none" 
                            stroke="${color}" stroke-width="2" opacity="0.5">
                        <animate attributeName="r" from="10" to="20" 
                                dur="2s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" from="0.5" to="0" 
                                dur="2s" repeatCount="indefinite"/>
                    </circle>
                </g>
            `;
        });

        // Draw media groups
        groups.forEach(group => {
            const { x, y, width, height } = group.area;
            const color = this.getGroupColor(group.type, group.severity);

            svg += `
                <g class="media-group" data-id="${group.id}">
                    <rect x="${x}" y="${y}" width="${width}" height="${height}"
                          fill="${color}" fill-opacity="0.3" stroke="${color}"
                          stroke-width="2" stroke-dasharray="5,5"/>
                    ${group.points.map(point => `
                        <line x1="${x + width/2}" y1="${y + height/2}"
                              x2="${point.coordinates.x}" y2="${point.coordinates.y}"
                              stroke="${color}" stroke-width="1" stroke-dasharray="2,2"/>
                    `).join('')}
                </g>
            `;
        });

        svg += '</svg>';
        return svg;
    }

    /**
     * Generate media report section
     */
    generateMediaReport(jobId: string): string {
        const points = this.mediaPoints.get(jobId) || [];
        const groups = this.mediaGroups.get(jobId) || [];

        let report = `
Media Documentation:
-------------------

Individual Media Points:
${points.map(point => `
- ${point.type.toUpperCase()} [${point.id}]
  Location: ${point.room} (Level: ${point.level})
  Coordinates: (${point.coordinates.x}, ${point.coordinates.y})
  Timestamp: ${new Date(point.timestamp).toLocaleString()}
  ${point.notes ? `Notes: ${point.notes}` : ''}
  ${point.metadata?.moistureReading ? `Moisture: ${point.metadata.moistureReading}%` : ''}
  ${point.metadata?.thermalReading ? `Thermal: ${point.metadata.thermalReading}°C` : ''}
`).join('\n')}

Media Groups:
${groups.map(group => `
Group: ${group.type} [${group.id}]
${group.severity ? `Severity: ${group.severity}` : ''}
Area: ${group.area.width}x${group.area.height} at (${group.area.x}, ${group.area.y})
Media Points:
${group.points.map(point => `
  - ${point.type.toUpperCase()} [${point.id}]
    Timestamp: ${new Date(point.timestamp).toLocaleString()}
    ${point.notes ? `Notes: ${point.notes}` : ''}
`).join('\n')}
`).join('\n')}
        `;

        return report;
    }

    private getGroupColor(type: string, severity?: 'low' | 'medium' | 'high'): string {
        switch (type) {
            case 'water damage':
                return severity === 'high' ? '#ff0000' :
                       severity === 'medium' ? '#ff6600' : '#ffcc00';
            case 'mold':
                return '#00ff00';
            case 'equipment':
                return '#0000ff';
            default:
                return '#666666';
        }
    }

    /**
     * Clear all records (useful for testing)
     */
    clearRecords(): void {
        this.mediaPoints.clear();
        this.mediaGroups.clear();
    }
}

export const interactiveDocumentationService = InteractiveDocumentationService.getInstance();
