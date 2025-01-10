import { BarometerData, SensorError } from '../../../types/mapping/sensors';

export class BarometerProcessor {
  private static readonly PRESSURE_THRESHOLD = 0.3; // hPa (typical pressure difference per floor)
  private static readonly TEMPERATURE_RANGE = { min: -20, max: 50 }; // Celsius
  private static readonly FLOOR_HEIGHT = 3; // meters (typical floor height)

  private baselinePressure: number | null = null;
  private baselineAltitude: number | null = null;
  private lastValidReading: BarometerData | null = null;
  private errorLog: SensorError[] = [];

  /**
   * Process raw barometer data and calculate relative altitude
   */
  processReading(data: BarometerData): BarometerData | null {
    try {
      this.validateReading(data);
      
      if (!this.baselinePressure) {
        this.setBaseline(data);
      }

      this.lastValidReading = data;
      return data;
    } catch (error) {
      this.logError(error as Error);
      return this.lastValidReading;
    }
  }

  /**
   * Set baseline pressure and altitude for relative measurements
   */
  setBaseline(data: BarometerData): void {
    this.baselinePressure = data.pressure;
    this.baselineAltitude = data.relativeAltitude;
  }

  /**
   * Estimate current floor level based on pressure difference
   */
  estimateFloorLevel(): number | null {
    if (!this.lastValidReading || !this.baselinePressure || !this.baselineAltitude) {
      return null;
    }

    const altitudeDifference = this.lastValidReading.relativeAltitude - this.baselineAltitude;
    return Math.round(altitudeDifference / BarometerProcessor.FLOOR_HEIGHT);
  }

  /**
   * Get relative altitude change from baseline
   */
  getRelativeAltitude(): number | null {
    if (!this.lastValidReading || !this.baselineAltitude) {
      return null;
    }

    return this.lastValidReading.relativeAltitude - this.baselineAltitude;
  }

  /**
   * Validate barometer reading data integrity
   */
  private validateReading(data: BarometerData): void {
    if (!data.timestamp || typeof data.timestamp !== 'number') {
      throw new Error('Invalid timestamp in barometer data');
    }

    if (typeof data.pressure !== 'number' || data.pressure <= 0) {
      throw new Error('Invalid pressure reading');
    }

    if (
      typeof data.temperature !== 'number' ||
      data.temperature < BarometerProcessor.TEMPERATURE_RANGE.min ||
      data.temperature > BarometerProcessor.TEMPERATURE_RANGE.max
    ) {
      throw new Error('Temperature reading out of valid range');
    }

    if (typeof data.relativeAltitude !== 'number' || isNaN(data.relativeAltitude)) {
      throw new Error('Invalid relative altitude data');
    }
  }

  /**
   * Check if pressure change indicates floor level change
   */
  hasFloorChanged(newPressure: number): boolean {
    if (!this.baselinePressure) return false;

    const pressureDifference = Math.abs(newPressure - this.baselinePressure);
    return pressureDifference >= BarometerProcessor.PRESSURE_THRESHOLD;
  }

  /**
   * Log sensor errors
   */
  private logError(error: Error): void {
    const sensorError: SensorError = {
      sensorType: 'Barometer',
      errorCode: 'VALIDATION_ERROR',
      message: error.message,
      timestamp: Date.now(),
      details: {
        lastValidReading: this.lastValidReading,
        baselinePressure: this.baselinePressure,
        baselineAltitude: this.baselineAltitude,
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

  /**
   * Reset baseline measurements
   */
  resetBaseline(): void {
    this.baselinePressure = null;
    this.baselineAltitude = null;
  }
}
