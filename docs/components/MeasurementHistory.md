# MeasurementHistory Component

The MeasurementHistory component provides a comprehensive interface for tracking, visualizing, and analyzing moisture readings over time. It helps users monitor the drying progress of different materials and locations within a job site.

## Features

### Real-Time Progress Tracking
- Displays an overall progress bar showing the percentage of locations that have reached dry status
- Updates automatically when new readings are added
- Visual progress indicator with percentage completion

### Detailed Reading History
- Tabular view of all moisture readings
- Organized by date, location, and material type
- Shows individual moisture values with percentage units
- Status indicators for each reading (Dry, Drying, Concern)

### Trend Analysis
- Interactive trend visualization for each measurement location
- Line charts showing moisture level changes over time
- Benchmark overlays for different material types
- Comparison against expected drying timelines

### Status Monitoring
- Automatic status calculation based on:
  - Material-specific benchmark values
  - Number of days monitored
  - Current moisture levels
- Color-coded status chips (Success for Dry, Warning for Drying, Error for Concern)

### Material-Specific Tracking
- Supports different material types with unique benchmarks
- Tracks drying progress against material-specific thresholds
- Considers maximum drying days for each material type

## Props

| Prop | Type | Description |
|------|------|-------------|
| jobId | string | Unique identifier for the job |
| initialReadings | MoistureReading[] | Optional initial set of readings |
| onUpdate | (readings: DailyReadings) => Promise<void> | Callback for reading updates |
| className | string | Optional CSS class name |

## Usage

```tsx
import { MeasurementHistory } from 'components/MoistureReadingHistory';

const JobSite = ({ jobId }) => {
  return (
    <MeasurementHistory
      jobId={jobId}
      initialReadings={[
        {
          id: '1',
          value: 15,
          materialType: 'drywall',
          locationDescription: 'Living Room Wall',
          position: { x: 100, y: 200 }
        }
      ]}
      onUpdate={async (readings) => {
        // Handle reading updates
      }}
    />
  );
};
```

## Component Structure

1. **Progress Bar**
   - Shows overall drying progress
   - Updates based on the number of dry locations

2. **Reading Table**
   - Columns: Date, Location, Material, Reading, Status, Trend
   - Sortable and filterable data
   - Status indicators for each reading

3. **Trend Dialog**
   - Opens when "View Trend" is clicked
   - Shows moisture level changes over time
   - Includes material-specific benchmarks
   - Displays expected drying timeline

## Status Calculation

The component automatically calculates status based on several factors:

- **Dry**: Reading is below or equal to the material's dry value
- **Drying**: Above dry value but within expected drying time
- **Concern**: Above dry value and exceeded expected drying time
- **Unknown**: Material type not recognized

## Best Practices

1. **Initial Readings**
   - Provide initial readings when available
   - Ensures immediate data display
   - Helps establish baseline measurements

2. **Update Handling**
   - Implement onUpdate callback
   - Handle reading persistence
   - Manage state updates efficiently

3. **Material Types**
   - Use consistent material type identifiers
   - Ensure materials have defined benchmarks
   - Consider material-specific drying characteristics

4. **Location Descriptions**
   - Provide clear, descriptive location names
   - Use consistent naming conventions
   - Include relevant position data

## Error Handling

The component handles several error states:

- Loading state with progress indicator
- Error alerts for data loading failures
- Fallback for unknown material types
- Graceful handling of missing data points
