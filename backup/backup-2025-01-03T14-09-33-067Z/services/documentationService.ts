import { InspectionDocumentation } from '../types/inspection';

interface PhotoRecord {
    id: string;
    type: 'moisture' | 'damage' | 'equipment' | 'property' | 'thermal';
    area?: string;
    room?: string;
    timestamp: string;
    description: string;
    url: string;
    metadata?: {
        moistureReading?: number;
        thermalReading?: number;
        equipmentSerial?: string;
        damageType?: string;
    };
}

interface AuthorityForm {
    type: 'JSA' | 'SWMS' | 'PreWork' | 'Authority';
    completed: boolean;
    timestamp: string;
    signedBy?: string;
    notes?: string;
    attachments?: string[];
}

/**
 * Service for managing inspection documentation including photos and forms
 */
class DocumentationService {
    private static instance: DocumentationService;
    private photos: Map<string, PhotoRecord> = new Map();
    private forms: Map<string, AuthorityForm> = new Map();
    private documentation: InspectionDocumentation = {
        frontPropertyPhotos: { completed: false },
        jsa: { completed: false },
        swms: { completed: false },
        preWorkAgreement: { completed: false },
        authorityToCommence: { completed: false },
        photos: {
            moisture: false,
            damage: false,
            equipment: false
        }
    };

    private constructor() {
        // Private constructor for singleton
    }

    static getInstance(): DocumentationService {
        if (!DocumentationService.instance) {
            DocumentationService.instance = new DocumentationService();
        }
        return DocumentationService.instance;
    }

    /**
     * Add a photo to the documentation
     */
    addPhoto(photo: PhotoRecord): void {
        this.photos.set(photo.id, photo);
        
        // Update documentation status
        switch (photo.type) {
            case 'moisture':
                this.documentation.photos.moisture = true;
                break;
            case 'damage':
                this.documentation.photos.damage = true;
                break;
            case 'equipment':
                this.documentation.photos.equipment = true;
                break;
            case 'property':
                if (!this.documentation.frontPropertyPhotos.completed) {
                    this.documentation.frontPropertyPhotos.completed = true;
                }
                break;
        }
    }

    /**
     * Update authority form status
     */
    updateFormStatus(type: AuthorityForm['type'], form: Partial<AuthorityForm>): void {
        const existingForm = this.forms.get(type) || {
            type,
            completed: false,
            timestamp: new Date().toISOString()
        };

        this.forms.set(type, { ...existingForm, ...form });

        // Update documentation status
        switch (type) {
            case 'JSA':
                this.documentation.jsa = {
                    completed: form.completed || false,
                    unable: !form.completed,
                    reason: form.notes
                };
                break;
            case 'SWMS':
                this.documentation.swms = {
                    completed: form.completed || false,
                    unable: !form.completed,
                    reason: form.notes
                };
                break;
            case 'PreWork':
                this.documentation.preWorkAgreement = {
                    completed: form.completed || false,
                    unable: !form.completed,
                    reason: form.notes
                };
                break;
            case 'Authority':
                this.documentation.authorityToCommence = {
                    completed: form.completed || false,
                    unable: !form.completed,
                    reason: form.notes
                };
                break;
        }
    }

    /**
     * Get photos by area and room
     */
    getPhotos(area?: string, room?: string): PhotoRecord[] {
        return Array.from(this.photos.values()).filter(photo => {
            if (!area && !room) return true;
            if (area && !room) return photo.area === area;
            return photo.area === area && photo.room === room;
        });
    }

    /**
     * Get photos by type
     */
    getPhotosByType(type: PhotoRecord['type']): PhotoRecord[] {
        return Array.from(this.photos.values()).filter(photo => photo.type === type);
    }

    /**
     * Get form status
     */
    getFormStatus(type: AuthorityForm['type']): AuthorityForm | undefined {
        return this.forms.get(type);
    }

    /**
     * Get documentation status
     */
    getDocumentationStatus(): {
        complete: boolean;
        missingItems: string[];
        status: InspectionDocumentation;
    } {
        const missingItems: string[] = [];

        // Check front property photos
        if (!this.documentation.frontPropertyPhotos.completed) {
            missingItems.push('Front property photos');
        }

        // Check required forms
        if (!this.documentation.jsa.completed) {
            missingItems.push('Job Safety Analysis (JSA)');
        }
        if (!this.documentation.swms.completed) {
            missingItems.push('Safe Work Method Statement (SWMS)');
        }
        if (!this.documentation.preWorkAgreement.completed) {
            missingItems.push('Pre-work Agreement');
        }
        if (!this.documentation.authorityToCommence.completed) {
            missingItems.push('Authority to Commence');
        }

        // Check required photos
        if (!this.documentation.photos.moisture) {
            missingItems.push('Moisture reading photos');
        }
        if (!this.documentation.photos.damage) {
            missingItems.push('Damage documentation photos');
        }
        if (!this.documentation.photos.equipment) {
            missingItems.push('Equipment installation photos');
        }

        return {
            complete: missingItems.length === 0,
            missingItems,
            status: this.documentation
        };
    }

    /**
     * Generate photo documentation report
     */
    generatePhotoReport(): {
        byArea: { [key: string]: PhotoRecord[] };
        byType: { [key: string]: PhotoRecord[] };
        timeline: PhotoRecord[];
    } {
        const byArea: { [key: string]: PhotoRecord[] } = {};
        const byType: { [key: string]: PhotoRecord[] } = {};
        const timeline = Array.from(this.photos.values())
            .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

        // Group by area
        timeline.forEach(photo => {
            if (photo.area && photo.room) {
                const key = `${photo.area}-${photo.room}`;
                byArea[key] = byArea[key] || [];
                byArea[key].push(photo);
            }
        });

        // Group by type
        timeline.forEach(photo => {
            byType[photo.type] = byType[photo.type] || [];
            byType[photo.type].push(photo);
        });

        return {
            byArea,
            byType,
            timeline
        };
    }

    /**
     * Clear all records (useful for testing)
     */
    clearRecords(): void {
        this.photos.clear();
        this.forms.clear();
        this.documentation = {
            frontPropertyPhotos: { completed: false },
            jsa: { completed: false },
            swms: { completed: false },
            preWorkAgreement: { completed: false },
            authorityToCommence: { completed: false },
            photos: {
                moisture: false,
                damage: false,
                equipment: false
            }
        };
    }
}

export const documentationService = DocumentationService.getInstance();
