interface Measurement {
  id: string;
  type: 'distance' | 'area';
  value: number;
  timestamp: Date;
  label?: string;
}

const STORAGE_PREFIX = 'moisture_measurements_';

export function saveMeasurements(jobId: string, measurements: Measurement[]): void {
  try {
    const serializedMeasurements = measurements.map(m => ({
      ...m,
      timestamp: m.timestamp.toISOString()
    }));
    localStorage.setItem(
      `${STORAGE_PREFIX}${jobId}`,
      JSON.stringify(serializedMeasurements)
    );
  } catch (error) {
    console.error('Error saving measurements:', error);
  }
}

export function loadMeasurements(jobId: string): Measurement[] {
  try {
    const serializedMeasurements = localStorage.getItem(`${STORAGE_PREFIX}${jobId}`);
    if (!serializedMeasurements) return [];

    return JSON.parse(serializedMeasurements).map((m: any) => ({
      ...m,
      timestamp: new Date(m.timestamp)
    }));
  } catch (error) {
    console.error('Error loading measurements:', error);
    return [];
  }
}

export async function exportMeasurementsToJson(jobId: string): Promise<void> {
  try {
    const measurements = loadMeasurements(jobId);
    const blob = new Blob([JSON.stringify(measurements, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moisture_measurements_${jobId}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting measurements:', error);
    throw new Error('Failed to export measurements');
  }
}

export async function importMeasurementsFromJson(
  jobId: string,
  file: File
): Promise<Measurement[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          throw new Error('Failed to read file');
        }

        const measurements = JSON.parse(event.target.result as string).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));

        // Validate measurements
        if (!Array.isArray(measurements)) {
          throw new Error('Invalid measurements format');
        }

        measurements.forEach(m => {
          if (!m.id || !m.type || typeof m.value !== 'number' || !(m.timestamp instanceof Date)) {
            throw new Error('Invalid measurement data');
          }
          if (!['distance', 'area'].includes(m.type)) {
            throw new Error('Invalid measurement type');
          }
        });

        saveMeasurements(jobId, measurements);
        resolve(measurements);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

export function backupAllMeasurements(): void {
  try {
    const backup: Record<string, Measurement[]> = {};
    const prefix = STORAGE_PREFIX;

    // Collect all moisture measurements from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        const jobId = key.slice(prefix.length);
        const measurements = loadMeasurements(jobId);
        if (measurements.length > 0) {
          backup[jobId] = measurements;
        }
      }
    }

    // Create and download backup file
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moisture_measurements_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error creating backup:', error);
    throw new Error('Failed to create measurements backup');
  }
}

export function clearMeasurements(jobId: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${jobId}`);
  } catch (error) {
    console.error('Error clearing measurements:', error);
  }
}

export function getAllMeasurementJobIds(): string[] {
  try {
    const prefix = STORAGE_PREFIX;
    const jobIds: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        jobIds.push(key.slice(prefix.length));
      }
    }

    return jobIds;
  } catch (error) {
    console.error('Error getting job IDs:', error);
    return [];
  }
}
