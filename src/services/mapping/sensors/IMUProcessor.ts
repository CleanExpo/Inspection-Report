import { IMUData, SensorError } from '../../../types/mapping/sensors';
import { Point3D } from '../../../types/mapping/building';

export class IMUProcessor {
  private static readonly GRAVITY = 9.81; // m/s²
  private static readonly GYRO_THRESHOLD = 0.02; // rad/s
  private static readonly MAG_DECLINATION = 0; // Set based on location

  private lastValidReading: IMUData | null = null;
  private position: Point3D = { x: 0, y: 0, z: 0 };
  private velocity: Point3D = { x: 0, y: 0, z: 0 };
  private lastTimestamp: number | null = null;
  private errorLog: SensorError[] = [];

  /**
   * Process raw IMU data and update position/orientation
   */
  processReading(data: IMUData): IMUData | null {
    try {
      this.validateReading(data);
      
      if (this.lastTimestamp) {
        const deltaTime = (data.timestamp - this.lastTimestamp) / 1000; // Convert to seconds
        this.updatePosition(data, deltaTime);
      }

      this.lastTimestamp = data.timestamp;
      this.lastValidReading = data;
      return data;
    } catch (error) {
      this.logError(error as Error);
      return this.lastValidReading;
    }
  }

  /**
   * Get current orientation in degrees
   */
  getOrientation(): { pitch: number; roll: number; yaw: number } | null {
    if (!this.lastValidReading) return null;

    const { pitch, roll, yaw } = this.lastValidReading.orientation;
    return {
      pitch: this.radToDeg(pitch),
      roll: this.radToDeg(roll),
      yaw: this.radToDeg(yaw + IMUProcessor.MAG_DECLINATION),
    };
  }

  /**
   * Get current position relative to starting point
   */
  getPosition(): Point3D {
    return { ...this.position };
  }

  /**
   * Reset position tracking to origin
   */
  resetPosition(): void {
    this.position = { x: 0, y: 0, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.lastTimestamp = null;
  }

  /**
   * Update position based on acceleration and orientation
   */
  private updatePosition(data: IMUData, deltaTime: number): void {
    // Remove gravity from acceleration based on orientation
    const gravityCompensated = this.removeGravity(data);

    // Update velocity using acceleration
    this.velocity.x += gravityCompensated.x * deltaTime;
    this.velocity.y += gravityCompensated.y * deltaTime;
    this.velocity.z += gravityCompensated.z * deltaTime;

    // Apply simple threshold-based zero velocity update
    this.applyZeroVelocityUpdate();

    // Update position using velocity
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.position.z += this.velocity.z * deltaTime;
  }

  /**
   * Remove gravity component from acceleration based on orientation
   */
  private removeGravity(data: IMUData): Point3D {
    const { pitch, roll } = data.orientation;
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);
    const cosR = Math.cos(roll);
    const sinR = Math.sin(roll);

    // Calculate gravity components in sensor frame
    const gravityX = IMUProcessor.GRAVITY * sinP;
    const gravityY = -IMUProcessor.GRAVITY * cosP * sinR;
    const gravityZ = -IMUProcessor.GRAVITY * cosP * cosR;

    return {
      x: data.acceleration.x - gravityX,
      y: data.acceleration.y - gravityY,
      z: data.acceleration.z - gravityZ,
    };
  }

  /**
   * Apply zero velocity update when movement is below threshold
   */
  private applyZeroVelocityUpdate(): void {
    const isStationary = 
      Math.abs(this.velocity.x) < 0.01 &&
      Math.abs(this.velocity.y) < 0.01 &&
      Math.abs(this.velocity.z) < 0.01;

    if (isStationary) {
      this.velocity = { x: 0, y: 0, z: 0 };
    }
  }

  /**
   * Validate IMU reading data integrity
   */
  private validateReading(data: IMUData): void {
    if (!data.timestamp || typeof data.timestamp !== 'number') {
      throw new Error('Invalid timestamp in IMU data');
    }

    this.validateVector(data.acceleration, 'acceleration');
    this.validateVector(data.gyroscope, 'gyroscope');
    if (data.magnetometer) {
      this.validateVector(data.magnetometer, 'magnetometer');
    }
    this.validateOrientation(data.orientation);
  }

  /**
   * Validate vector components
   */
  private validateVector(vector: { x: number; y: number; z: number }, name: string): void {
    if (
      typeof vector.x !== 'number' ||
      typeof vector.y !== 'number' ||
      typeof vector.z !== 'number' ||
      isNaN(vector.x) ||
      isNaN(vector.y) ||
      isNaN(vector.z)
    ) {
      throw new Error(`Invalid ${name} vector components`);
    }
  }

  /**
   * Validate orientation angles
   */
  private validateOrientation(orientation: { pitch: number; roll: number; yaw: number }): void {
    if (
      typeof orientation.pitch !== 'number' ||
      typeof orientation.roll !== 'number' ||
      typeof orientation.yaw !== 'number' ||
      isNaN(orientation.pitch) ||
      isNaN(orientation.roll) ||
      isNaN(orientation.yaw)
    ) {
      throw new Error('Invalid orientation angles');
    }
  }

  /**
   * Convert radians to degrees
   */
  private radToDeg(rad: number): number {
    return rad * (180 / Math.PI);
  }

  /**
   * Log sensor errors
   */
  private logError(error: Error): void {
    const sensorError: SensorError = {
      sensorType: 'IMU',
      errorCode: 'VALIDATION_ERROR',
      message: error.message,
      timestamp: Date.now(),
      details: {
        lastValidReading: this.lastValidReading,
        currentPosition: this.position,
        currentVelocity: this.velocity,
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
