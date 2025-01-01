import { useState, useCallback } from 'react';

interface PowerReading {
  equipmentId: string;
  equipmentName: string;
  watts: number;
  amps: number;
  voltage: number;
  timestamp: string;
}

interface Equipment {
  id: string;
  name: string;
  maxWatts: number;
}

interface FieldErrors {
  [key: string]: string;
}

interface UsePowerReadingsProps {
  totalEquipmentPower: number;
  equipmentList: Equipment[];
}

interface UsePowerReadingsReturn {
  readings: PowerReading[];
  fieldErrors: FieldErrors;
  error: string | null;
  isLoading: boolean;
  addReading: () => void;
  updateReading: (index: number, field: keyof PowerReading, value: string | number) => void;
  removeReading: (index: number) => void;
  validateAndSaveReadings: (onSave: (readings: PowerReading[]) => Promise<void>) => Promise<void>;
  getTotalPower: () => number;
  validateReading: (reading: PowerReading, index: number) => boolean;
}

export const usePowerReadings = ({
  totalEquipmentPower,
  equipmentList
}: UsePowerReadingsProps): UsePowerReadingsReturn => {
  const [readings, setReadings] = useState<PowerReading[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validatePowerReadings = (reading: PowerReading): boolean => {
    const calculatedWatts = reading.amps * reading.voltage;
    return Math.abs(calculatedWatts - reading.watts) < 1; // Allow for small rounding differences
  };

  const validateReading = useCallback((reading: PowerReading, index: number) => {
    const newErrors: Record<string, string> = {};

    // Validate individual values
    if (reading.watts < 0) newErrors.watts = 'Watts must be positive';
    if (reading.amps < 0) newErrors.amps = 'Amps must be positive';
    if (reading.voltage < 0) newErrors.voltage = 'Voltage must be positive';

    // Validate power calculations
    if (!validatePowerReadings(reading)) {
      newErrors.watts = 'Power readings are inconsistent (W = A × V)';
    }

    // Validate against equipment maximum
    const equipment = equipmentList.find(e => e.id === reading.equipmentId);
    if (equipment && reading.watts > equipment.maxWatts) {
      newErrors.watts = `Exceeds equipment maximum of ${equipment.maxWatts}W`;
    }

    // Update field errors
    setFieldErrors(prev => ({
      ...prev,
      [`${index}-watts`]: newErrors.watts,
      [`${index}-amps`]: newErrors.amps,
      [`${index}-voltage`]: newErrors.voltage,
    }));

    return Object.keys(newErrors).length === 0;
  }, [equipmentList]);

  const updateReading = useCallback((index: number, field: keyof PowerReading, value: string | number) => {
    setReadings(prevReadings => {
      const updatedReadings = [...prevReadings];
      const reading = { ...updatedReadings[index] };
      
      // Type guard to ensure we're setting the correct type for each field
      if (field === 'equipmentId' || field === 'equipmentName' || field === 'timestamp') {
        if (typeof value === 'string') {
          reading[field] = value;
        }
      } else if (field === 'watts' || field === 'amps' || field === 'voltage') {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        reading[field] = numValue;

        // Auto-calculate watts when amps or voltage changes
        if (field === 'amps' || field === 'voltage') {
          reading.watts = reading.amps * reading.voltage;
        }
        // Auto-calculate amps when watts or voltage changes (if voltage is not 0)
        else if (field === 'watts' && reading.voltage !== 0) {
          reading.amps = reading.watts / reading.voltage;
        }
      }

      updatedReadings[index] = reading;

      // Validate the updated reading
      validateReading(reading, index);

      return updatedReadings;
    });
  }, [validateReading]);

  const addReading = useCallback(() => {
    setReadings(prevReadings => {
      const newReading = {
        equipmentId: '',
        equipmentName: '',
        watts: 0,
        amps: 0,
        voltage: 0,
        timestamp: new Date().toISOString()
      };

      validateReading(newReading, prevReadings.length);
      return [...prevReadings, newReading];
    });
  }, [validateReading]);

  const removeReading = useCallback((index: number) => {
    setReadings(prev => prev.filter((_, i) => i !== index));
    // Clean up field errors for removed reading
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`${index}-watts`];
      delete newErrors[`${index}-amps`];
      delete newErrors[`${index}-voltage`];
      return newErrors;
    });
  }, []);

  const validateAndSaveReadings = async (onSave: (readings: PowerReading[]) => Promise<void>) => {
    try {
      setError(null);
      setIsLoading(true);

      // Validate all readings
      const invalidReadings = readings.filter(
        reading => reading.watts <= 0 || reading.amps <= 0 || reading.voltage <= 0 || !reading.equipmentId
      );

      if (invalidReadings.length > 0) {
        setError('All power readings must be complete and greater than 0');
        return;
      }

      // Calculate total power
      const totalPower = readings.reduce((sum, reading) => sum + reading.watts, 0);
      if (totalPower > totalEquipmentPower) {
        setError(`Total power (${totalPower}W) exceeds equipment capacity (${totalEquipmentPower}W)`);
        return;
      }

      await onSave(readings);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save power readings');
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalPower = useCallback(() => 
    readings.reduce((sum, reading) => sum + reading.watts, 0),
    [readings]
  );

  return {
    readings,
    fieldErrors,
    error,
    isLoading,
    addReading,
    updateReading,
    removeReading,
    validateAndSaveReadings,
    getTotalPower,
    validateReading
  };
};
