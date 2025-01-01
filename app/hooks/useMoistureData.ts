import { useState, useEffect, useCallback } from 'react';
import type { 
  SketchData, 
  DailyReadings, 
  MoistureReading,
  DryingProgress,
  Equipment,
  ReadingConfidence,
  ReadingConditions,
  ReadingLocation,
  EquipmentOperationalStatus
} from '../types/moisture';

interface AddReadingParams {
  value: number;
  location: ReadingLocation;
  material: string;
  confidence?: ReadingConfidence;
  conditions?: Partial<ReadingConditions>;
  equipmentUsed?: string;
  notes?: string;
}

interface EquipmentSettings {
  power: number;
  mode: string;
  targetHumidity?: number;
  fanSpeed?: number;
  temperature?: number;
}

interface AddEquipmentParams {
  type: Equipment['type'];
  position: { x: number; y: number };
  model?: string;
  serialNumber?: string;
  settings?: EquipmentSettings;
  operationalStatus?: EquipmentOperationalStatus;
}

interface UseMoistureDataProps {
  jobNumber: string;
}

interface UseMoistureDataReturn {
  sketchData: SketchData | null;
  readingHistory: DailyReadings[];
  dryingProgress: number;
  estimatedDryingTime: number;
  isLoading: boolean;
  error: string | null;
  saveSketchData: (data: SketchData) => Promise<void>;
  saveReadingHistory: (history: DailyReadings[]) => Promise<void>;
  exportData: () => Promise<void>;
  addReading: (reading: AddReadingParams) => Promise<void>;
  addEquipment: (equipment: AddEquipmentParams) => Promise<void>;
  updateEquipmentStatus: (equipmentId: string, status: EquipmentOperationalStatus) => Promise<void>;
  getReadingsByConfidence: (confidence: ReadingConfidence) => MoistureReading[];
  getEquipmentByStatus: (status: EquipmentOperationalStatus) => Equipment[];
}

export function useMoistureData({ jobNumber }: UseMoistureDataProps): UseMoistureDataReturn {
  const [sketchData, setSketchData] = useState<SketchData | null>(null);
  const [readingHistory, setReadingHistory] = useState<DailyReadings[]>([]);
  const [dryingProgress, setDryingProgress] = useState(0);
  const [estimatedDryingTime, setEstimatedDryingTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/moisture/${jobNumber}`);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No moisture data found for this job number');
        }
        throw new Error(data.error || 'Failed to load moisture data');
      }
      
      setSketchData(data.sketchData);
      setReadingHistory(data.readingHistory);
      calculateDryingProgress(data.readingHistory);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while loading data';
      console.error('Load data error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

    loadData();
  }, [jobNumber]);

  // Calculate drying progress
  const calculateDryingProgress = useCallback((history: DailyReadings[]) => {
    if (history.length === 0) {
      setDryingProgress(0);
      setEstimatedDryingTime(0);
      return;
    }

    const latestReadings = history[history.length - 1];
    const progress = (latestReadings.dryLocations / latestReadings.totalLocations) * 100;
    setDryingProgress(progress);

    // Estimate drying time based on progress trend
    if (history.length >= 2) {
      const progressRate = calculateProgressRate(history);
      const remainingProgress = 100 - progress;
      const estimatedDays = Math.ceil(remainingProgress / progressRate);
      setEstimatedDryingTime(estimatedDays);
    }
  }, []);

  const calculateProgressRate = (history: DailyReadings[]): number => {
    const recentReadings = history.slice(-3); // Look at last 3 days
    if (recentReadings.length < 2) return 0;

    const progressChanges = recentReadings.map((day, index) => {
      if (index === 0) return 0;
      const prevDay = recentReadings[index - 1];
      return (day.dryLocations / day.totalLocations) - 
             (prevDay.dryLocations / prevDay.totalLocations);
    });

    const averageChange = progressChanges.reduce((a, b) => a + b, 0) / (progressChanges.length - 1);
    return averageChange * 100; // Convert to percentage
  };

  const saveSketchData = async (data: SketchData): Promise<void> => {
    try {
      const response = await fetch(`/api/moisture/${jobNumber}/sketch`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save sketch data');
      }

      setSketchData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save sketch data');
      throw err;
    }
  };

  const saveReadingHistory = async (history: DailyReadings[]): Promise<void> => {
    try {
      const response = await fetch(`/api/moisture/${jobNumber}/readings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(history),
      });

      if (!response.ok) {
        throw new Error('Failed to save reading history');
      }

      setReadingHistory(history);
      calculateDryingProgress(history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save reading history');
      throw err;
    }
  };

  const addReading = async (readingParams: AddReadingParams): Promise<void> => {
    if (!sketchData) return;

    try {
      const reading: Partial<MoistureReading> = {
        value: readingParams.value,
        location: readingParams.location,
        material: readingParams.material,
        timestamp: new Date(),
        inspectionDay: readingHistory.length + 1,
        confidence: readingParams.confidence || 'MEDIUM',
        conditions: {
          temperature: readingParams.conditions?.temperature || 20,
          humidity: readingParams.conditions?.humidity || 50,
          surfaceType: readingParams.conditions?.surfaceType || 'unknown',
          pressure: readingParams.conditions?.pressure || 1
        },
        equipmentUsed: readingParams.equipmentUsed,
        notes: readingParams.notes
      };

      const response = await fetch(`/api/moisture/${jobNumber}/readings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reading),
      });

      if (!response.ok) {
        throw new Error('Failed to add reading');
      }

      const newReading = await response.json();
      const updatedSketchData = {
        ...sketchData,
        moistureReadings: [...sketchData.moistureReadings, newReading],
      };

      setSketchData(updatedSketchData);

      // Update reading history with confidence tracking
      const today = new Date().toISOString().split('T')[0];
      const updatedHistory = [...readingHistory];
      const todayIndex = updatedHistory.findIndex(day => day.date === today);

      if (todayIndex >= 0) {
        updatedHistory[todayIndex].readings.push(newReading);
        // Recalculate statistics
        const readings = updatedHistory[todayIndex].readings;
        updatedHistory[todayIndex] = {
          ...updatedHistory[todayIndex],
          averageValue: readings.reduce((sum, r) => sum + r.value, 0) / readings.length,
          maxValue: Math.max(...readings.map(r => r.value)),
          minValue: Math.min(...readings.map(r => r.value)),
          dryLocations: readings.filter(r => r.value <= 15).length,
          totalLocations: readings.length,
        };
      } else {
        updatedHistory.push({
          date: today,
          readings: [newReading],
          averageValue: newReading.value,
          maxValue: newReading.value,
          minValue: newReading.value,
          dryLocations: newReading.value <= 15 ? 1 : 0,
          totalLocations: 1,
        });
      }

      await saveReadingHistory(updatedHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add reading');
      throw err;
    }
  };

  const addEquipment = async (equipmentParams: AddEquipmentParams): Promise<void> => {
    if (!sketchData) return;

    try {
      const defaultSettings: EquipmentSettings = {
        power: 0,
        mode: 'standard',
        targetHumidity: undefined,
        fanSpeed: undefined,
        temperature: undefined
      };

      const equipment: Partial<Equipment> = {
        type: equipmentParams.type,
        model: equipmentParams.model,
        serialNumber: equipmentParams.serialNumber,
        position: equipmentParams.position,
        rotation: 0,
        operationalStatus: equipmentParams.operationalStatus || 'OPERATIONAL',
        settings: {
          ...defaultSettings,
          ...equipmentParams.settings
        }
      };

      const response = await fetch(`/api/moisture/${jobNumber}/equipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(equipment),
      });

      if (!response.ok) {
        throw new Error('Failed to add equipment');
      }

      const newEquipment = await response.json();
      setSketchData({
        ...sketchData,
        equipment: [...sketchData.equipment, newEquipment],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add equipment');
      throw err;
    }
  };

  const updateEquipmentStatus = async (
    equipmentId: string, 
    status: EquipmentOperationalStatus
  ): Promise<void> => {
    if (!sketchData) return;

    try {
      const response = await fetch(`/api/moisture/${jobNumber}/equipment/${equipmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update equipment status');
      }

      setSketchData({
        ...sketchData,
        equipment: sketchData.equipment.map(eq =>
          eq.id === equipmentId ? { ...eq, operationalStatus: status } : eq
        ),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update equipment status');
      throw err;
    }
  };

  const getReadingsByConfidence = useCallback((confidence: ReadingConfidence): MoistureReading[] => {
    if (!sketchData) return [];
    return sketchData.moistureReadings.filter(reading => reading.confidence === confidence);
  }, [sketchData]);

  const getEquipmentByStatus = useCallback((status: EquipmentOperationalStatus): Equipment[] => {
    if (!sketchData) return [];
    return sketchData.equipment.filter(eq => eq.operationalStatus === status);
  }, [sketchData]);

  const exportData = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/moisture/${jobNumber}/export`);
      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moisture-data-${jobNumber}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
      throw err;
    }
  };

  return {
    sketchData,
    readingHistory,
    dryingProgress,
    estimatedDryingTime,
    isLoading,
    error,
    saveSketchData,
    saveReadingHistory,
    exportData,
    addReading,
    addEquipment,
    updateEquipmentStatus,
    getReadingsByConfidence,
    getEquipmentByStatus,
  };
}
