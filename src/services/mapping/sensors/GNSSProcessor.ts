import { GNSSData, SensorError } from '../../../types/mapping/sensors';

export class GNSSProcessor {
  private static readonly MINIMUM_ACCURACY = 10; // meters
  private lastValidReading: GNSSData | null = null;
  private errorLog: SensorError[] = [];

  /**
   * Process raw GNSS data and validate accuracy
   */
  processReading(data: GNSSData): GNSSData | null {
    try {
      this.validateReading(data);
      this.lastValidReading = data;
      return data;
    } catch (error) {
      this.logError(error as Error);
      return this.lastValidReading;
    }
  }

  /**
   * Get the current location with elevation
   */
  getCurrentLocation(): { latitude: number; longitude: number; elevation: number } | null {
    if (!this.lastValidReading) return null;
    
    const { latitude, longitude, elevation } = this.lastValidReading;
    return { latitude, longitude, elevation };
  }

  /**
   * Validate GNSS reading accuracy and data integrity
   */
  private validateReading(data: GNSSData): void {
    if (!data.timestamp || typeof data.timestamp !== 'number') {
      throw new Error('Invalid timestamp in GNSS data');
    }

    if (data.accuracy > GNSSProcessor.MINIMUM_ACCURACY) {
      throw new Error(`GNSS accuracy (${data.accuracy}m) exceeds minimum requirement (${GNSSProcessor.MINIMUM_ACCURACY}m)`);
    }

    if (!this.isValidCoordinate(data.latitude, data.longitude)) {
      throw new Error('Invalid GPS coordinates');
    }

    if (typeof data.elevation !== 'number' || isNaN(data.elevation)) {
      throw new Error('Invalid elevation data');
    }
  }

  /**
   * Validate latitude and longitude values
   */
  private isValidCoordinate(latitude: number, longitude: number): boolean {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180 &&
      !isNaN(latitude) &&
      !isNaN(longitude)
    );
  }

  /**
   * Log sensor errors
   */
  private logError(error: Error): void {
    const sensorError: SensorError = {
      sensorType: 'GNSS',
      errorCode: 'VALIDATION_ERROR',
      message: error.message,
      timestamp: Date.now(),
      details: {
        lastValidReading: this.lastValidReading,
      },
    };
    this.errorLog.push(sensorError);
  }

  /**
   * Get all logged errors
   */
  getErrors(): SensorError[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrors(): void {
    this.errorLog = [];
  }
}
