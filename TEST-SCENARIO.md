# Test Scenario: Water Damage Restoration Job

## Job Details

### Client Information
- Name: John Smith
- Address: 123 Test Street, Brisbane QLD 4000
- Phone: 0400 123 456
- Email: john.smith@example.com
- Insurance: Test Insurance Co
- Policy Number: POL123456
- Claim Number: CLM789012

### Incident Details
- Date of Loss: 2024-01-15
- Type: Water Damage
- Source: Burst pipe in upstairs bathroom
- Areas Affected: 
  * Upstairs bathroom
  * Upstairs hallway
  * Living room ceiling
  * Living room walls
  * Living room floor

## Workflow Steps

### 1. Job Creation in Ascora
- [ ] Receive job notification
- [ ] Create new job record
- [ ] Assign technician
- [ ] Schedule initial inspection
- [ ] Send client notification

### 2. Initial Site Visit

#### Property Assessment
- [ ] Front property photos
- [ ] Document external damage
- [ ] Identify water source
- [ ] Mark affected areas
- [ ] Take thermal images

#### Moisture Readings
```
Area: Upstairs Bathroom
| Location          | WME% | RH% | Temp °C |
|------------------|------|-----|---------|
| Floor - Center   | 85   | 75  | 23      |
| Floor - Corner   | 92   | 75  | 23      |
| Wall - North     | 78   | 75  | 23      |
| Wall - East      | 82   | 75  | 23      |
| Ceiling          | 35   | 75  | 23      |

Area: Living Room
| Location          | WME% | RH% | Temp °C |
|------------------|------|-----|---------|
| Ceiling - Center | 95   | 78  | 22      |
| Wall - North     | 88   | 78  | 22      |
| Wall - East      | 85   | 78  | 22      |
| Floor - Center   | 45   | 78  | 22      |
```

#### Equipment Setup
- Air Movers: 4 units
  * 2 in bathroom
  * 2 in living room
- Dehumidifiers: 2 units
  * 1 upstairs
  * 1 in living room
- Air Scrubber: 1 unit
  * Positioned in hallway

### 3. Documentation Requirements

#### Forms to Complete
- [ ] Initial Assessment Form
- [ ] Scope of Works
- [ ] Authority to Commence
- [ ] Safety Assessment
- [ ] Equipment Installation Log

#### Required Photos
- [ ] Front of property
- [ ] All affected areas
- [ ] Moisture reading displays
- [ ] Equipment placement
- [ ] Visible damage
- [ ] Thermal images

### 4. Area Sketches

#### Upstairs Bathroom
```
[Window]     [Vanity]
   |            |
   +------------+
   |            |
   |   Toilet   |
   |            |
   |  Affected  |
   |   Area     |
   |            |
   +------------+
   |   Shower   |
   +------------+
```

#### Living Room
```
   +----------------+
   |    Affected    |
   |    Ceiling     |
   |                |
   |  [Furniture]   |
   |                |
   |  [TV Stand]    |
   |                |
   +----------------+
   |    [Window]    |
   +----------------+
```

### 5. Follow-up Visits

#### Day 3 Readings
```
Area: Upstairs Bathroom
| Location          | WME% | RH% | Temp °C |
|------------------|------|-----|---------|
| Floor - Center   | 45   | 55  | 24      |
| Floor - Corner   | 52   | 55  | 24      |
| Wall - North     | 38   | 55  | 24      |
| Wall - East      | 42   | 55  | 24      |
| Ceiling          | 15   | 55  | 24      |

Area: Living Room
| Location          | WME% | RH% | Temp °C |
|------------------|------|-----|---------|
| Ceiling - Center | 55   | 58  | 23      |
| Wall - North     | 48   | 58  | 23      |
| Wall - East      | 45   | 58  | 23      |
| Floor - Center   | 25   | 58  | 23      |
```

#### Day 5 Readings (Final)
```
Area: Upstairs Bathroom
| Location          | WME% | RH% | Temp °C |
|------------------|------|-----|---------|
| Floor - Center   | 15   | 45  | 24      |
| Floor - Corner   | 17   | 45  | 24      |
| Wall - North     | 12   | 45  | 24      |
| Wall - East      | 14   | 45  | 24      |
| Ceiling          | 11   | 45  | 24      |

Area: Living Room
| Location          | WME% | RH% | Temp °C |
|------------------|------|-----|---------|
| Ceiling - Center | 16   | 48  | 23      |
| Wall - North     | 15   | 48  | 23      |
| Wall - East      | 14   | 48  | 23      |
| Floor - Center   | 12   | 48  | 23      |
```

### 6. Final Report Components

#### Summary
- Initial condition
- Actions taken
- Drying progress
- Final readings
- Equipment used
- Time to dry

#### Documentation
- All moisture readings
- Equipment logs
- Daily photos
- Thermal images
- Area sketches
- Sign-off forms

#### Recommendations
- Repair bathroom plumbing
- Replace affected drywall
- Paint affected areas
- Monitor for mold

## Test Validation

### System Features to Test
- [ ] Job creation workflow
- [ ] Photo upload and organization
- [ ] Moisture reading tracking
- [ ] Equipment monitoring
- [ ] Report generation
- [ ] Sketch tool functionality
- [ ] Form completion
- [ ] Client communication

### Expected Outputs
- [ ] Complete initial assessment report
- [ ] Detailed scope of works
- [ ] Daily monitoring reports
- [ ] Equipment placement diagrams
- [ ] Moisture mapping visualizations
- [ ] Final comprehensive report
- [ ] Client sign-off documentation

### Success Criteria
- All forms properly completed
- Photos properly categorized
- Moisture readings tracked over time
- Equipment usage documented
- Area sketches clear and accurate
- Reports generated correctly
- Client sign-off obtained
