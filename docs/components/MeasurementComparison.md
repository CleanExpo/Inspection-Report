# MeasurementComparison Component

The MeasurementComparison component provides a detailed comparison interface between expected measurements (from templates) and actual measurements taken in the field. It helps users validate their measurements against predefined standards.

## Features

### Template-Based Comparison
- Displays template information including name and description
- Shows expected measurements from selected template
- Provides context for measurement validation

### Area Comparison
- Compares expected vs. measured area
- Shows area measurements in square meters
- Calculates and displays area deviation
- Visual indicators for deviation status

### Perimeter Comparison
- Compares expected vs. measured perimeter
- Shows perimeter measurements in meters
- Calculates and displays perimeter deviation
- Visual feedback for deviation status

### Tolerance Checking
- Validates measurements against template tolerance levels
- Clear visual indicators for within/outside tolerance
- Shows tolerance percentage for reference
- Comprehensive validation status display

## Props

| Prop | Type | Description |
|------|------|-------------|
| measurements | Measurement[] | Array of recorded measurements |
| selectedTemplate | Template | Selected room template for comparison |

## Usage

```tsx
import { MeasurementComparison } from 'components/MeasurementComparison';

const RoomMeasurements = () => {
  return (
    <MeasurementComparison
      measurements={[
        {
          id: '1',
          type: 'area',
          value: 100,
          timestamp: '2023-01-01T12:00:00Z'
        }
      ]}
      selectedTemplate={{
        name: 'Standard Room',
        description: 'Template for standard room measurements',
        defaultArea: 100,
        defaultPerimeter: 40,
        tolerancePercent: 10
      }}
    />
  );
};
```

## Component Structure

1. **Template Information**
   - Template name and description
   - Expected measurements display
   - Tolerance specifications

2. **Area Comparison Section**
   - Expected area from template
   - Actual measured area
   - Deviation calculation and display
   - Visual status indicators

3. **Perimeter Comparison Section**
   - Expected perimeter from template
   - Actual measured perimeter
   - Deviation calculation and display
   - Visual status indicators

4. **Tolerance Status**
   - Overall tolerance compliance
   - Tolerance percentage display
   - Status indicators for validation

## Validation Logic

The component performs several validation checks:

- **Area Deviation**: Calculates the percentage difference between expected and measured areas
- **Perimeter Deviation**: Calculates the percentage difference between expected and measured perimeters
- **Tolerance Check**: Validates if deviations are within the template's specified tolerance
- **Overall Validation**: Determines if all measurements meet requirements

## Visual Indicators

The component uses color-coded indicators:

- **Green**: Measurements within tolerance
- **Red**: Measurements outside tolerance
- **Gray**: No measurements or template selected

## Best Practices

1. **Template Selection**
   - Choose appropriate templates for comparison
   - Verify template values match requirements
   - Consider tolerance levels for different scenarios

2. **Measurement Validation**
   - Review all deviation calculations
   - Check both area and perimeter measurements
   - Consider environmental factors affecting measurements

3. **Tolerance Management**
   - Set appropriate tolerance levels
   - Document reasons for tolerance adjustments
   - Consider industry standards

4. **Data Quality**
   - Ensure accurate measurement input
   - Validate measurement units
   - Regular calibration of measuring tools

## Error Handling

The component handles several scenarios:

- Missing measurements display "N/A"
- Invalid template data gracefully degraded
- Clear error states for validation failures
- Informative messages for incomplete data
