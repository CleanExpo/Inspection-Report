# Moisture Sketch Map Component

An interactive component for creating detailed moisture and damage maps for restoration jobs. This component allows technicians to document water damage, take moisture readings, place equipment, and make measurements directly on a digital floor plan.

## Features

### Room Layout
- Set room dimensions in feet or meters
- Grid-based layout for accurate measurements
- Support for multiple rooms (planned)
- Custom floor plan import (planned)

### Damage Documentation
- Draw water damage areas
- Mark moisture readings
- Indicate mold growth areas
- Add notes to specific locations
- Track damage severity levels

### Moisture Readings
- Record moisture readings with material types
- Visual indicators for readings outside normal range
- Historical tracking of readings
- Material-specific normal ranges
- Color-coded severity indicators

### Equipment Placement
- Place dehumidifiers, air movers, and other equipment
- Rotate equipment for proper orientation
- Add equipment-specific notes
- Track equipment coverage areas

### Measurements
- Take and record measurements
- Calculate total affected area
- Support for multiple measurement units
- Auto-scaling based on room dimensions

### Notes and Documentation
- Add general and location-specific notes
- Document material types
- Record timestamps for all readings
- Export detailed reports

## Usage

```tsx
import MoistureSketchMap from './components/MoistureSketchMap';

function JobPage() {
  const handleSave = async (data) => {
    // Handle saving sketch data
    await saveToDatabase(data);
  };

  return (
    <MoistureSketchMap
      jobId="123456"
      onSave={handleSave}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| jobId | string | Yes | Unique identifier for the job |
| onSave | (data: SketchData) => Promise<void> | No | Callback when sketch is saved |
| className | string | No | Additional CSS classes |

## Data Structures

### SketchData
```typescript
interface SketchData {
  room: Room;
  damageAreas: DamageArea[];
  equipment: Equipment[];
  measurements: Measurement[];
  notes: string[];
  moistureReadings: MoistureReading[];
}
```

### Room
```typescript
interface Room {
  width: number;
  height: number;
  dimensions: {
    width: string;
    height: string;
    unit: 'ft' | 'm';
  };
}
```

### DamageArea
```typescript
interface DamageArea {
  id: string;
  points: Point[];
  moistureLevel: number;
  notes: string;
  type: 'water' | 'moisture' | 'mold';
  readings: MoistureReading[];
}
```

### MoistureReading
```typescript
interface MoistureReading {
  position: Point;
  value: number;
  timestamp: string;
  materialType: string;
}
```

## Tools

### Draw Tool
- Click and drag to draw damage areas
- Different colors for different severity levels
- Automatic area calculation

### Measure Tool
- Click two points to measure distance
- Supports multiple measurements
- Automatic unit conversion

### Equipment Tool
- Click to place equipment
- Drag to move
- Rotate for proper orientation
- Equipment-specific icons

### Reading Tool
- Click to add moisture reading
- Select material type
- Enter reading value
- Automatic severity indication

### Note Tool
- Click to add notes
- Support for multiple note types
- Location-specific annotations

## Material Types

The component includes predefined normal ranges for common materials:

| Material | Normal Range |
|----------|-------------|
| Drywall | 10-15% |
| Wood | 6-12% |
| Concrete | 4-8% |
| Carpet | 8-14% |

## Future Improvements

1. Multi-Room Support
   - Add multiple rooms
   - Connect rooms with doorways
   - Support for multi-floor buildings

2. Advanced Measurements
   - Area calculations
   - Volume calculations
   - Automatic equipment coverage calculation

3. Equipment Features
   - Equipment coverage visualization
   - Automatic placement optimization
   - Power usage calculation

4. Reporting
   - PDF export
   - Progress tracking
   - Before/after comparisons
   - Automated recommendations

5. Integration Features
   - Photo integration
   - Thermal imaging overlay
   - 3D visualization
   - Real-time sensor data

6. Collaboration
   - Multi-user editing
   - Comment system
   - Change tracking
   - Version history

## Contributing

1. Follow TypeScript best practices
2. Add tests for new features
3. Update documentation
4. Follow existing code style
5. Consider mobile usability

## Testing

Run tests:
```bash
npm test
```

Key test areas:
- Drawing functionality
- Measurement accuracy
- Equipment placement
- Reading validation
- Data persistence
- Touch interaction
- Accessibility compliance
