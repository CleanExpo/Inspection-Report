import { useMemo } from 'react';
import { validateMoistureReading, validateDryingProgress } from '../utils/iicrcStandards';
import { MoistureReading } from '../types/moisture';

export function useIICRCCompliance(readings: MoistureReading[]) {
  const readingValidations = useMemo(() => {
    return readings.map(reading => ({
      readingId: reading.id,
      ...validateMoistureReading(reading.value, reading.materialType)
    }));
  }, [readings]);

  const dryingValidation = useMemo(() => {
    return validateDryingProgress(
      readings.map(r => ({
        value: r.value,
        timestamp: new Date(r.timestamp),
        materialType: r.materialType
      }))
    );
  }, [readings]);

  const hasWarnings = useMemo(() => {
    return readingValidations.some(v => !v.isValid) || !dryingValidation.isValid;
  }, [readingValidations, dryingValidation]);

  const getReadingValidation = (readingId: string) => {
    return readingValidations.find(v => v.readingId === readingId) || {
      isValid: false,
      status: 'unknown',
      message: 'Reading validation not found'
    };
  };

  return {
    readingValidations,
    dryingValidation,
    hasWarnings,
    getReadingValidation
  };
}
