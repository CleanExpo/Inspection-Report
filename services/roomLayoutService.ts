import { DatabaseError, ValidationError } from '../utils/errors';
import { performanceMonitor } from '../utils/performance';
import { roomLayoutCache } from './cacheService';

export interface Point {
  x: number;
  y: number;
}

export interface DrawingElement {
  type: 'wall' | 'door' | 'window' | 'erase';
  startPoint: Point;
  endPoint: Point;
  id: string;
}

export interface RoomLayout {
  id: string;
  jobNumber: string;
  elements: DrawingElement[];
  scale: number;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoomLayoutInput {
  jobNumber: string;
  elements: DrawingElement[];
  scale?: number;
  width?: number;
  height?: number;
}

class RoomLayoutService {
  private readonly STORAGE_KEY = 'room-layouts';

  private getStoredLayouts(): RoomLayout[] {
    return performanceMonitor.measureSync('get_stored_layouts', () => {
      if (typeof window === 'undefined') return [];

      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse stored layouts:', error);
        return [];
      }
    });
  }

  private saveLayouts(layouts: RoomLayout[]): void {
    performanceMonitor.measureSync('save_layouts', () => {
      if (typeof window === 'undefined') return;

      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(layouts));
      } catch (error) {
        throw new DatabaseError('Failed to save layouts', 'STORAGE_ERROR');
      }
    });
  }

  async createLayout(input: RoomLayoutInput): Promise<RoomLayout> {
    return performanceMonitor.measureAsync('create_layout', async () => {
      const layouts = this.getStoredLayouts();

      // Check if layout already exists for job number
      const existingIndex = layouts.findIndex(l => l.jobNumber === input.jobNumber);
      
      const newLayout: RoomLayout = {
        id: crypto.randomUUID(),
        jobNumber: input.jobNumber,
        elements: input.elements,
        scale: input.scale || 1,
        width: input.width || 800,
        height: input.height || 600,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        // Update existing layout
        layouts[existingIndex] = {
          ...layouts[existingIndex],
          ...newLayout,
          id: layouts[existingIndex].id,
          createdAt: layouts[existingIndex].createdAt,
        };
      } else {
        // Add new layout
        layouts.push(newLayout);
      }

      await this.validateLayout(newLayout);
      this.saveLayouts(layouts);
      roomLayoutCache.set(input.jobNumber, newLayout);
      return newLayout;
    });
  }

  async getLayout(jobNumber: string): Promise<RoomLayout | null> {
    return performanceMonitor.measureAsync('get_layout', async () => {
      // Try to get from cache first
      const cached = roomLayoutCache.get(jobNumber);
      if (cached) {
        return cached;
      }

      // If not in cache, get from storage
      const layouts = this.getStoredLayouts();
      const layout = layouts.find(l => l.jobNumber === jobNumber) || null;

      // Cache the result if found
      if (layout) {
        roomLayoutCache.set(jobNumber, layout);
      }

      return layout;
    });
  }

  async updateLayout(jobNumber: string, elements: DrawingElement[]): Promise<RoomLayout> {
    return performanceMonitor.measureAsync('update_layout', async () => {
      const layouts = this.getStoredLayouts();
      const index = layouts.findIndex(l => l.jobNumber === jobNumber);

      if (index === -1) {
        throw new DatabaseError('Layout not found', 'NOT_FOUND');
      }

      const updatedLayout: RoomLayout = {
        ...layouts[index],
        elements,
        updatedAt: new Date().toISOString(),
      };

      await this.validateLayout(updatedLayout);
      layouts[index] = updatedLayout;
      this.saveLayouts(layouts);
      roomLayoutCache.set(jobNumber, updatedLayout);

      return updatedLayout;
    });
  }

  async deleteLayout(jobNumber: string): Promise<void> {
    return performanceMonitor.measureAsync('delete_layout', async () => {
      const layouts = this.getStoredLayouts();
      const filteredLayouts = layouts.filter(l => l.jobNumber !== jobNumber);

      if (filteredLayouts.length === layouts.length) {
        throw new DatabaseError('Layout not found', 'NOT_FOUND');
      }

      this.saveLayouts(filteredLayouts);
      roomLayoutCache.delete(jobNumber);
    });
  }

  async listLayouts(): Promise<RoomLayout[]> {
    return performanceMonitor.measureAsync('list_layouts', async () => {
      return this.getStoredLayouts();
    });
  }

  async validateLayout(layout: RoomLayout): Promise<boolean> {
    return performanceMonitor.measureAsync('validate_layout', async () => {
      // Basic validation rules
      if (!layout.jobNumber) {
        throw new ValidationError('Job number is required');
      }

      if (!Array.isArray(layout.elements)) {
        throw new ValidationError('Elements must be an array');
      }

      // Validate each element
      layout.elements.forEach((element, index) => {
        if (!element.type || !['wall', 'door', 'window', 'erase'].includes(element.type)) {
          throw new ValidationError(`Invalid element type at index ${index}`);
        }

        if (!element.startPoint || typeof element.startPoint.x !== 'number' || typeof element.startPoint.y !== 'number') {
          throw new ValidationError(`Invalid start point at index ${index}`);
        }

        if (!element.endPoint || typeof element.endPoint.x !== 'number' || typeof element.endPoint.y !== 'number') {
          throw new ValidationError(`Invalid end point at index ${index}`);
        }

        if (!element.id) {
          throw new ValidationError(`Missing element ID at index ${index}`);
        }
      });

      return true;
    });
  }
}

export const roomLayoutService = new RoomLayoutService();
