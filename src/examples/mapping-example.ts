import { BuildingMapper } from '../services/mapping/BuildingMapper';
import { GNSSData, BarometerData, IMUData, LiDARData } from '../types/mapping/sensors';

async function runMappingExample() {
  // Initialize BuildingMapper with custom options
  const mapper = new BuildingMapper({
    roomMapper: {
      minRoomSize: 2,
      maxRoomSize: 100,
      minWallLength: 0.5,
      floorHeightThreshold: 2.5,
      autoStitchRooms: true
    },
    export: {
      outputDir: './output',
      formats: ['json', 'geojson', 'svg', 'obj'],
      createSubdirs: true,
      overwrite: true,
      svg: {
        width: 800,
        height: 600,
        margin: 20,
        strokeWidth: 2,
        fontSize: 12,
        colors: {
          walls: '#000000',
          doors: '#0066cc',
          windows: '#99ccff'
        }
      },
      obj: {
        includeNormals: true,
        includeTextures: true,
        scale: 1.0,
        precision: 6
      }
    }
  });

  try {
    // Start mapping a new building
    mapper.startMapping('building_001', 'Example Building');

    // Set initial location
    const initialGNSS: GNSSData = {
      latitude: 37.7749,
      longitude: -122.4194,
      elevation: 100,
      accuracy: 5,
      timestamp: Date.now()
    };

    // Process initial GNSS reading
    mapper.processSensorData(initialGNSS);

    // Simulate sensor data updates
    // In a real application, this would come from actual sensors
    const sensorData = generateSampleSensorData();
    
    // Process each set of sensor readings
    for (const reading of sensorData) {
      mapper.processSensorData(
        reading.gnss,
        reading.barometer,
        reading.imu,
        reading.lidar
      );

      // Optional: Export current state periodically
      if (reading.timestamp % 10000 === 0) {
        try {
          await mapper.exportCurrentState('./output/partial');
        } catch (error) {
          console.warn('Failed to export partial state:', error instanceof Error ? error.message : String(error));
        }
      }
    }

    // Complete mapping and export results
    const buildingMap = await mapper.completeMapping('./output');
    console.log('Mapping completed successfully');
    console.log('Total rooms:', buildingMap.building.floors.reduce(
      (total, floor) => total + floor.rooms.length, 0
    ));
    console.log('Total floors:', buildingMap.building.floors.length);

    // Export error log
    await mapper.exportErrorLog('./output/error_log.txt');

    // Print mapping summary
    console.log('\nMapping Summary:');
    console.log('---------------');
    console.log(`Building: ${buildingMap.building.name} (${buildingMap.building.id})`);
    console.log(`Location: ${buildingMap.building.location.latitude}, ${buildingMap.building.location.longitude}`);
    console.log(`Elevation: ${buildingMap.building.location.elevation}m`);
    console.log(`Total Floors: ${buildingMap.building.floors.length}`);
    console.log(`Total Rooms: ${buildingMap.building.floors.reduce((total, floor) => total + floor.rooms.length, 0)}`);
    console.log(`Total Transitions: ${buildingMap.transitions.length}`);
    
    const errors = mapper.getErrors();
    if (errors.length > 0) {
      console.log('\nWarnings/Errors:', errors.length);
      errors.forEach((err, index) => {
        console.log(`${index + 1}. [${err.sensorType}] ${err.message}`);
      });
    } else {
      console.log('\nNo errors reported during mapping');
    }

  } catch (error) {
    console.error('\nMapping failed:', error instanceof Error ? error.message : String(error));
    
    // Log detailed errors if available
    const errors = mapper.getErrors();
    if (errors.length > 0) {
      console.error('\nDetailed errors:');
      errors.forEach((err, index) => {
        console.error(`${index + 1}. [${err.sensorType}] ${err.message}`);
        if (err.details) {
          console.error('   Details:', JSON.stringify(err.details, null, 2));
        }
      });
    }

    // Try to export error log even if mapping failed
    try {
      await mapper.exportErrorLog('./output/error_log.txt');
      console.log('\nError log exported to ./output/error_log.txt');
    } catch (logError) {
      console.error('Failed to export error log:', logError instanceof Error ? logError.message : String(logError));
    }
  }
}

/**
 * Generate sample sensor data for demonstration
 */
function generateSampleSensorData(): Array<{
  timestamp: number;
  gnss?: GNSSData;
  barometer?: BarometerData;
  imu?: IMUData;
  lidar?: LiDARData;
}> {
  const data = [];
  const startTime = Date.now();

  // Simulate 60 seconds of sensor readings at 10Hz
  for (let i = 0; i < 600; i++) {
    const timestamp = startTime + (i * 100); // 100ms intervals

    data.push({
      timestamp,
      gnss: {
        latitude: 37.7749 + (Math.random() - 0.5) * 0.0001,
        longitude: -122.4194 + (Math.random() - 0.5) * 0.0001,
        elevation: 100 + (Math.random() - 0.5) * 0.1,
        accuracy: 5 + Math.random() * 2,
        timestamp
      },
      barometer: {
        pressure: 1013.25 + (Math.random() - 0.5) * 0.1,
        temperature: 20 + (Math.random() - 0.5) * 0.5,
        relativeAltitude: (Math.floor(i / 200) * 3) + (Math.random() - 0.5) * 0.1, // Change floor every 20 seconds
        timestamp
      },
      imu: {
        acceleration: {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: -9.81 + (Math.random() - 0.5) * 0.1
        },
        gyroscope: {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1
        },
        orientation: {
          pitch: (Math.random() - 0.5) * 0.1,
          roll: (Math.random() - 0.5) * 0.1,
          yaw: (i / 600) * Math.PI * 2 // Complete 360° rotation over 60 seconds
        },
        timestamp
      },
      lidar: {
        points: generateRoomPoints(i),
        timestamp,
        scanId: `scan_${i}`
      }
    });
  }

  return data;
}

/**
 * Generate sample room point cloud data
 */
function generateRoomPoints(iteration: number): Array<{ x: number; y: number; z: number; intensity?: number }> {
  const points = [];
  const roomSize = 5; // 5x5 meter room
  const pointDensity = 50; // points per wall

  // Generate points for four walls
  for (let i = 0; i < pointDensity; i++) {
    // North wall
    points.push({
      x: (i / pointDensity) * roomSize,
      y: roomSize,
      z: 1 + Math.random() * 0.1,
      intensity: 0.8 + Math.random() * 0.2
    });

    // East wall
    points.push({
      x: roomSize,
      y: (i / pointDensity) * roomSize,
      z: 1 + Math.random() * 0.1,
      intensity: 0.8 + Math.random() * 0.2
    });

    // South wall
    points.push({
      x: (i / pointDensity) * roomSize,
      y: 0,
      z: 1 + Math.random() * 0.1,
      intensity: 0.8 + Math.random() * 0.2
    });

    // West wall
    points.push({
      x: 0,
      y: (i / pointDensity) * roomSize,
      z: 1 + Math.random() * 0.1,
      intensity: 0.8 + Math.random() * 0.2
    });
  }

  // Add door in north wall
  const doorWidth = 1;
  const doorStart = 2;
  points.push(
    { x: doorStart, y: roomSize, z: 0, intensity: 0.9 },
    { x: doorStart + doorWidth, y: roomSize, z: 0, intensity: 0.9 }
  );

  // Add window in east wall
  const windowWidth = 1.5;
  const windowStart = 1.5;
  const windowHeight = 1.2;
  points.push(
    { x: roomSize, y: windowStart, z: windowHeight, intensity: 0.7 },
    { x: roomSize, y: windowStart + windowWidth, z: windowHeight, intensity: 0.7 }
  );

  return points;
}

// Run the example
runMappingExample().catch(console.error);
