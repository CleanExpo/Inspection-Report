import { roomAIService } from '@/services/roomAIService';
import { SketchData, MoistureReading } from '@/types/moisture';
import { ProcessedReading } from '@/types/room';

describe('RoomAIService', () => {
  // Mock data
  const mockMoistureReading: MoistureReading = {
    id: 'reading-1',
    position: { x: 100, y: 100 },
    value: 25,
    materialType: 'drywall',
    timestamp: new Date().toISOString(),
  };

  const mockSketchData: SketchData = {
    room: {
      id: 'room-1',
      width: 500,
      height: 300,
      dimensions: { width: '20', height: '15', unit: 'ft' },
    },
    moistureReadings: [
      mockMoistureReading,
      {
        ...mockMoistureReading,
        id: 'reading-2',
        position: { x: 120, y: 120 },
        value: 30,
      },
      {
        ...mockMoistureReading,
        id: 'reading-3',
        position: { x: 300, y: 200 },
        value: 15,
      },
    ],
    damageAreas: [],
    equipment: [],
  };

  describe('Room Analysis', () => {
    it('analyzes room and detects objects', async () => {
      const analysis = await roomAIService.analyzeRoom(mockSketchData);
      
      expect(analysis).toHaveProperty('boundaries');
      expect(analysis).toHaveProperty('objects');
      expect(analysis).toHaveProperty('suggestedEquipmentPlacements');
      expect(analysis).toHaveProperty('damageAreas');
    });

    it('identifies damage areas based on moisture readings', async () => {
      const analysis = await roomAIService.analyzeRoom(mockSketchData);
      
      expect(analysis.damageAreas.length).toBeGreaterThan(0);
      expect(analysis.damageAreas[0]).toHaveProperty('severity');
      expect(analysis.damageAreas[0]).toHaveProperty('points');
    });

    it('suggests equipment placements near moisture hotspots', async () => {
      const analysis = await roomAIService.analyzeRoom(mockSketchData);
      
      expect(analysis.suggestedEquipmentPlacements.length).toBeGreaterThan(0);
      analysis.suggestedEquipmentPlacements.forEach(equipment => {
        expect(equipment).toHaveProperty('type');
        expect(equipment).toHaveProperty('position');
        expect(['dehumidifier', 'fan', 'air-mover']).toContain(equipment.type);
      });
    });
  });

  describe('Room Stitching', () => {
    const mockRoom2: SketchData = {
      ...mockSketchData,
      room: {
        ...mockSketchData.room,
        id: 'room-2',
      },
    };

    it('stitches multiple rooms together', async () => {
      const result = await roomAIService.stitchRooms([mockSketchData, mockRoom2]);
      
      expect(result).toHaveProperty('combinedLayout');
      expect(result).toHaveProperty('connections');
      expect(result.combinedLayout.width).toBeGreaterThanOrEqual(mockSketchData.room.width);
      expect(result.combinedLayout.height).toBeGreaterThanOrEqual(mockSketchData.room.height);
    });

    it('identifies connections between rooms', async () => {
      const result = await roomAIService.stitchRooms([mockSketchData, mockRoom2]);
      
      expect(Array.isArray(result.connections)).toBe(true);
      result.connections.forEach(connection => {
        expect(connection).toHaveProperty('room1Id');
        expect(connection).toHaveProperty('room2Id');
        expect(connection).toHaveProperty('connectionType');
        expect(connection).toHaveProperty('position');
      });
    });
  });

  describe('Moisture Analysis', () => {
    it('processes moisture readings correctly', async () => {
      const analysis = await roomAIService.analyzeRoom(mockSketchData);
      const damageAreas = analysis.damageAreas;

      // Check that high moisture readings are identified as damage areas
      const highMoistureReadings = mockSketchData.moistureReadings.filter(r => r.value > 20);
      expect(damageAreas.length).toBeGreaterThan(0);
      expect(damageAreas.length).toBeLessThanOrEqual(highMoistureReadings.length);
    });

    it('suggests appropriate equipment based on moisture levels', async () => {
      const analysis = await roomAIService.analyzeRoom(mockSketchData);
      const equipment = analysis.suggestedEquipmentPlacements;

      // Check equipment suggestions
      const hasHighMoisture = mockSketchData.moistureReadings.some(r => r.value > 30);
      if (hasHighMoisture) {
        expect(equipment.some(e => e.type === 'dehumidifier')).toBe(true);
      }
    });

    it('clusters nearby moisture readings', async () => {
      const analysis = await roomAIService.analyzeRoom({
        ...mockSketchData,
        moistureReadings: [
          mockMoistureReading,
          {
            ...mockMoistureReading,
            id: 'reading-2',
            position: { x: 101, y: 101 }, // Very close to first reading
            value: 28,
          },
          {
            ...mockMoistureReading,
            id: 'reading-3',
            position: { x: 400, y: 400 }, // Far from others
            value: 35,
          },
        ],
      });

      // Should create at least 2 damage areas (one for close readings, one for distant)
      expect(analysis.damageAreas.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Error Handling', () => {
    it('handles invalid room dimensions', async () => {
      const invalidSketchData: SketchData = {
        ...mockSketchData,
        room: {
          ...mockSketchData.room,
          width: -1, // Invalid width
        },
      };

      await expect(roomAIService.analyzeRoom(invalidSketchData))
        .rejects
        .toThrow();
    });

    it('handles empty moisture readings', async () => {
      const emptySketchData: SketchData = {
        ...mockSketchData,
        moistureReadings: [],
      };

      const analysis = await roomAIService.analyzeRoom(emptySketchData);
      expect(analysis.damageAreas).toHaveLength(0);
      expect(analysis.suggestedEquipmentPlacements).toHaveLength(0);
    });

    it('handles missing room data in stitching', async () => {
      const invalidRooms: SketchData[] = [];
      await expect(roomAIService.stitchRooms(invalidRooms))
        .rejects
        .toThrow();
    });
  });
});
