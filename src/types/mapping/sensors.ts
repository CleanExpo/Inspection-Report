export interface GNSSData {
  latitude: number;
  longitude: number;
  elevation: number;
  accuracy: number;
  timestamp: number;
}

export interface BarometerData {
  pressure: number;  // in hPa
  temperature: number;  // in Celsius
  relativeAltitude: number;  // in meters
  timestamp: number;
}

export interface LiDARPoint {
  x: number;
  y: number;
  z: number;
  intensity?: number;
}

export interface LiDARData {
  points: LiDARPoint[];
  timestamp: number;
  scanId: string;
}

export interface IMUData {
  acceleration: {
    x: number;
    y: number;
    z: number;
  };
  gyroscope: {
    x: number;
    y: number;
    z: number;
  };
  magnetometer?: {
    x: number;
    y: number;
    z: number;
  };
  orientation: {
    pitch: number;
    roll: number;
    yaw: number;
  };
  timestamp: number;
}

export interface SensorError {
  sensorType: 'GNSS' | 'Barometer' | 'LiDAR' | 'IMU';
  errorCode: string;
  message: string;
  timestamp: number;
  details?: Record<string, any>;
}
