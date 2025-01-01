# ThreeDVisualization Component Documentation

## Overview
The ThreeDVisualization component provides a 3D visualization system for moisture readings across multiple floor plans. It supports interactive viewing, measurements, and data visualization in a three-dimensional space.

## Components

### 1. Scene Management
```typescript
import { SceneManager } from './setup';

// Initialize scene
const sceneManager = new SceneManager(container, {
  backgroundColor: 0xf0f0f0,
  fov: 75
});
```

Key features:
- Scene initialization and cleanup
- Camera configuration
- Lighting setup
- Resource management

### 2. Controls System
```typescript
import { ControlManager } from './controls';

// Setup controls
const controlManager = new ControlManager(camera, domElement, {
  minDistance: 5,
  maxDistance: 100,
  rotationSpeed: 1.0
});
```

Features:
- Orbit controls
- Zoom constraints
- Rotation limits
- Pan controls

### 3. Points System
```typescript
import { PointsManager } from './points';

// Initialize points
const pointsManager = new PointsManager(scene, {
  defaultMaterial: {
    color: 0x0088ff,
    opacity: 0.8,
    size: 0.1
  }
});
```

Features:
- Point creation and management
- Interactive states (hover/select)
- Color mapping for values
- Resource cleanup

## Usage

### Basic Implementation
```typescript
import ThreeDVisualization from './ThreeDVisualization';

function MoistureMappingView() {
  return (
    <ThreeDVisualization
      floorPlans={[
        {
          id: 'floor-1',
          level: 1,
          scale: 1,
          width: 100,
          height: 100,
          readings: [
            {
              locationX: 50,
              locationY: 50,
              dataPoints: [{ value: 15, unit: '%' }]
            }
          ]
        }
      ]}
      controlSettings={{
        minDistance: 5,
        maxDistance: 100,
        rotationSpeed: 1.0
      }}
    />
  );
}
```

### Configuration Options

#### Scene Configuration
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| backgroundColor | number | 0xf0f0f0 | Scene background color |
| fov | number | 75 | Camera field of view |

#### Control Settings
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| minDistance | number | 5 | Minimum zoom distance |
| maxDistance | number | 100 | Maximum zoom distance |
| rotationSpeed | number | 1.0 | Camera rotation speed |
| enableDamping | boolean | true | Smooth camera movement |

#### Point Configuration
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| size | number | 0.1 | Point size |
| opacity | number | 0.8 | Point opacity |
| color | number | 0x0088ff | Default point color |

## Development

### Prerequisites
- Three.js
- React
- TypeScript

### Installation
```bash
npm install three @types/three
```

### Testing
```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage
```

## Examples

### Multiple Floor Plans
```typescript
<ThreeDVisualization
  floorPlans={[
    {
      id: 'floor-1',
      level: 1,
      scale: 1,
      readings: readings1
    },
    {
      id: 'floor-2',
      level: 2,
      scale: 1,
      readings: readings2
    }
  ]}
/>
```

### Custom Controls
```typescript
<ThreeDVisualization
  controlSettings={{
    minDistance: 10,
    maxDistance: 200,
    rotationSpeed: 0.5,
    enableDamping: true,
    dampingFactor: 0.05
  }}
/>
```

### Custom Point Styling
```typescript
<ThreeDVisualization
  pointSettings={{
    defaultMaterial: {
      color: 0x00ff00,
      opacity: 1.0,
      size: 0.2
    },
    hoverMaterial: {
      color: 0xff0000,
      opacity: 1.0,
      size: 0.3
    }
  }}
/>
```

## Best Practices

1. Resource Management
   - Always cleanup resources in useEffect cleanup functions
   - Dispose of geometries and materials when removing objects
   - Clear scene objects before unmounting

2. Performance
   - Use appropriate point sizes based on scene scale
   - Enable frustum culling for large datasets
   - Implement level-of-detail for complex scenes

3. User Experience
   - Provide visual feedback for interactions
   - Implement smooth transitions
   - Add helpful UI overlays for navigation

## Troubleshooting

### Common Issues

1. Blank Scene
   - Check container dimensions
   - Verify camera position
   - Ensure lights are added

2. Performance Issues
   - Reduce point count
   - Optimize materials
   - Check for memory leaks

3. Control Issues
   - Verify control settings
   - Check event listeners
   - Validate camera constraints

## API Reference

### SceneManager
```typescript
class SceneManager {
  constructor(container: HTMLElement, config?: Partial<SceneConfig>);
  setupLighting(): void;
  handleResize(): void;
  dispose(): void;
  getRefs(): SceneRefs;
}
```

### ControlManager
```typescript
class ControlManager {
  constructor(camera: THREE.Camera, element: HTMLElement, config?: Partial<ControlConfig>);
  update(): void;
  setTarget(position: THREE.Vector3): void;
  resetView(): void;
  dispose(): void;
}
```

### PointsManager
```typescript
class PointsManager {
  constructor(scene: THREE.Scene, config?: Partial<PointConfig>);
  addPoint(reading: MoistureReading, level: number): Point;
  updatePoint(id: string, reading: MoistureReading): void;
  setHovered(id: string | null): void;
  setSelected(id: string | null): void;
  clear(): void;
}
