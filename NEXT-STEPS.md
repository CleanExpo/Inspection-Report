# Next Steps for Moisture Mapping Implementation

## Immediate Tasks (Next 24-48 Hours)

### 1. Complete Basic Drawing Tools
```javascript
// Priority updates to sketch.js
class SketchTool {
    constructor() {
        this.mode = 'wall'; // Default mode
        this.isDrawing = false;
        this.startPoint = null;
        
        // Add event listeners
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }
    
    // Implement basic drawing functionality
    handleMouseDown(e) {
        this.isDrawing = true;
        this.startPoint = this.getCanvasPoint(e);
    }
    
    handleMouseMove(e) {
        if (!this.isDrawing) return;
        const currentPoint = this.getCanvasPoint(e);
        this.drawPreview(this.startPoint, currentPoint);
    }
    
    handleMouseUp(e) {
        if (!this.isDrawing) return;
        const endPoint = this.getCanvasPoint(e);
        this.finalizeDraw(this.startPoint, endPoint);
        this.isDrawing = false;
    }
}
```

### 2. Implement Data Storage
```javascript
// New file: data-manager.js
class DataManager {
    constructor() {
        this.roomData = null;
        this.moistureReadings = [];
        this.walls = [];
        this.doors = [];
        this.windows = [];
    }
    
    saveRoomData(data) {
        this.roomData = data;
        this.persistData();
    }
    
    addMoistureReading(reading) {
        this.moistureReadings.push(reading);
        this.persistData();
    }
    
    persistData() {
        localStorage.setItem('moisture-mapping-data', JSON.stringify({
            roomData: this.roomData,
            moistureReadings: this.moistureReadings,
            walls: this.walls,
            doors: this.doors,
            windows: this.windows
        }));
    }
}
```

### 3. Add Basic Moisture Reading Input
```javascript
// New file: moisture-input.js
class MoistureInput {
    constructor(canvas) {
        this.canvas = canvas;
        this.readings = [];
        
        this.canvas.addEventListener('click', this.handleClick.bind(this));
    }
    
    handleClick(e) {
        const point = this.getCanvasPoint(e);
        this.showReadingDialog(point);
    }
    
    showReadingDialog(point) {
        // Implement dialog for moisture reading input
        // Save reading with point coordinates
    }
}
```

## Implementation Steps

1. Drawing Tools Implementation
   - Update sketch.js with new drawing functionality
   - Add mode switching between wall/door/window
   - Implement basic shape rendering
   - Add validation for drawn elements

2. Data Management Setup
   - Create data-manager.js file
   - Implement local storage persistence
   - Add data validation
   - Create data recovery mechanisms

3. Moisture Reading Features
   - Create moisture-input.js file
   - Implement reading input dialog
   - Add basic visualization
   - Setup data validation

## Testing Requirements

1. Drawing Tools
   - Test all drawing modes
   - Verify shape rendering
   - Check event handling
   - Validate measurements

2. Data Management
   - Test data persistence
   - Verify data recovery
   - Check validation
   - Test error handling

3. Moisture Readings
   - Test input handling
   - Verify visualization
   - Check data validation
   - Test summary generation

## Success Criteria

1. Users can:
   - Draw room layouts
   - Add moisture readings
   - Save and recover data
   - View basic visualizations

2. System should:
   - Persist data reliably
   - Handle errors gracefully
   - Provide clear feedback
   - Maintain performance

## Notes
- Focus on core functionality first
- Maintain existing features
- Document all changes
- Add debug logging
- Consider mobile support
- Test cross-browser compatibility
