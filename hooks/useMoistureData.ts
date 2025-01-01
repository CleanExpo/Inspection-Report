import { useState, useEffect, useCallback } from 'react';
import { moistureService } from '@/services/moistureService';
import { SketchData, DailyReadings, MoistureReading } from '@/types/moisture';

interface UseMoistureDataProps {
  jobId: string;
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
  addReading: (reading: Omit<MoistureReading, 'id' | 'timestamp'>) => Promise<void>;
  updateReading: (readingId: string, updates: Partial<MoistureReading>) => Promise<void>;
  deleteReading: (readingId: string) => Promise<void>;
}

export function useMoistureData({ jobId }: UseMoistureDataProps): UseMoistureDataReturn {
  const [sketchData, setSketchData] = useState<SketchData | null>(null);
  const [readingHistory, setReadingHistory] = useState<DailyReadings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [sketch, history] = await Promise.all([
          moistureService.getSketchData(jobId),
          moistureService.getReadingHistory(jobId),
        ]);

        setSketchData(sketch);
        setReadingHistory(history);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load moisture data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [jobId]);

  const saveSketchData = useCallback(async (data: SketchData) => {
    try {
      setError(null);
      await moistureService.saveSketchData(jobId, data);
      setSketchData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save sketch data');
      throw err;
    }
  }, [jobId]);

  const saveReadingHistory = useCallback(async (history: DailyReadings[]) => {
    try {
      setError(null);
      await moistureService.saveReadingHistory(jobId, history);
      setReadingHistory(history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save reading history');
      throw err;
    }
  }, [jobId]);

  const addReading = useCallback(async (reading: Omit<MoistureReading, 'id' | 'timestamp'>) => {
    if (!sketchData) return;

    const newReading: MoistureReading = {
      ...reading,
      id: `reading-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    const updatedSketchData: SketchData = {
      ...sketchData,
      moistureReadings: [...sketchData.moistureReadings, newReading],
    };

    await saveSketchData(updatedSketchData);
  }, [sketchData, saveSketchData]);

  const updateReading = useCallback(async (readingId: string, updates: Partial<MoistureReading>) => {
    if (!sketchData) return;

    const updatedReadings = sketchData.moistureReadings.map(reading =>
      reading.id === readingId ? { ...reading, ...updates } : reading
    );

    const updatedSketchData: SketchData = {
      ...sketchData,
      moistureReadings: updatedReadings,
    };

    await saveSketchData(updatedSketchData);
  }, [sketchData, saveSketchData]);

  const deleteReading = useCallback(async (readingId: string) => {
    if (!sketchData) return;

    const updatedReadings = sketchData.moistureReadings.filter(
      reading => reading.id !== readingId
    );

    const updatedSketchData: SketchData = {
      ...sketchData,
      moistureReadings: updatedReadings,
    };

    await saveSketchData(updatedSketchData);
  }, [sketchData, saveSketchData]);

  const exportData = useCallback(async () => {
    try {
      setError(null);
      const blob = await moistureService.exportData(jobId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moisture-data-${jobId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
      throw err;
    }
  }, [jobId]);

  // Calculate derived data
  const dryingProgress = sketchData 
    ? moistureService.getDryingProgress(sketchData.moistureReadings)
    : 0;

  const estimatedDryingTime = sketchData
    ? moistureService.getEstimatedDryingTime(sketchData.moistureReadings)
    : 0;

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
    updateReading,
    deleteReading,
  };
}
