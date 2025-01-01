class SketchTool {
    constructor() {
        this.canvas = document.getElementById('sketch-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) return;

        // Initialize properties
        this.mode = 'wall';
        this.isDrawing = false;
        this.startPoint = null;
        this.currentPoint = null;
        this.walls = [];
        this.doors = [];
        this.windows = [];
        this.moisturePoints = [];
        this.measurements = [];
        this.scale = 50;
        this.showGrid = true;
        this.gridSize = 50;
        this.isTouchDevice = 'ontouchstart' in window;
        this.lastTap = 0; // For double tap detection
        
        // History for undo/redo
        this.history = [];
        this.currentStep = -1;
        this.maxHistory = 50;

        // Set canvas size
        this.resizeCanvas();

        // Add event listeners based on device type
        if (this.isTouchDevice) {
            this.initializeTouchEvents();
        } else {
            this.initializeMouseEvents();
        }

        // Common events
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('orientationchange', this.handleResize.bind(this));

        // Initialize with empty state
        this.saveState();
    }

    initializeMouseEvents() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    }

    initializeTouchEvents() {
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        this.canvas.addEventListener('touchcancel', this.handleTouchCancel.bind(this));
    }

    handleResize() {
        // Delay resize to handle orientation change
        setTimeout(() => {
            this.resizeCanvas();
        }, 100);
    }

    handleTouchStart(e) {
        e.preventDefault();
        if (e.touches.length !== 1) return;

        const touch = e.touches[0];
        const point = this.getCanvasPoint(touch);

        // Handle double tap for moisture readings
        const now = Date.now();
        const timeSinceLastTap = now - this.lastTap;
        this.lastTap = now;

        if (timeSinceLastTap < 300 && this.mode === 'moisture') {
            this.handleMoistureReading(point);
            return;
        }

        this.isDrawing = true;
        this.startPoint = point;
        this.currentPoint = point;
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (!this.isDrawing || e.touches.length !== 1) return;

        const touch = e.touches[0];
        this.currentPoint = this.getCanvasPoint(touch);
        this.redraw();
        this.drawPreview();
    }

    handleTouchEnd(e) {
        e.preventDefault();
        if (!this.isDrawing) return;

        if (this.startPoint && this.currentPoint) {
            this.finalizeDrawing();
        }

        this.isDrawing = false;
        this.startPoint = null;
        this.currentPoint = null;
    }

    handleTouchCancel(e) {
        e.preventDefault();
        this.isDrawing = false;
        this.startPoint = null;
        this.currentPoint = null;
        this.redraw();
    }

    getCanvasPoint(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX || e.pageX) - rect.left;
        const y = (e.clientY || e.pageY) - rect.top;
        
        if (this.showGrid) {
            return {
                x: Math.round(x / this.gridSize) * this.gridSize,
                y: Math.round(y / this.gridSize) * this.gridSize
            };
        }
        return { x, y };
    }

    handleMoistureReading(point) {
        if (!window.equipmentData?.meterType) {
            alert('Please select a moisture meter type before taking readings.');
            return;
        }

        // Use native prompt or custom modal based on device
        const reading = this.isTouchDevice ? 
            this.showMobilePrompt('Enter moisture reading (%):') :
            prompt('Enter moisture reading (%):', '0');

        if (reading !== null) {
            const value = parseFloat(reading);
            if (!isNaN(value) && value >= 0 && value <= 100) {
                this.moisturePoints.push({
                    x: point.x,
                    y: point.y,
                    value: value,
                    equipment: { ...window.equipmentData },
                    timestamp: new Date().toISOString()
                });
                this.saveState();
                this.redraw();
                this.updateMoistureSummary();
            }
        }
    }

    showMobilePrompt(message) {
        // Create and show a mobile-friendly input dialog
        const modal = document.createElement('div');
        modal.className = 'mobile-prompt';
        modal.innerHTML = `
            <div class="prompt-content">
                <h3>${message}</h3>
                <input type="number" step="0.1" min="0" max="100" class="prompt-input">
                <div class="prompt-buttons">
                    <button class="cancel-btn">Cancel</button>
                    <button class="ok-btn">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        return new Promise((resolve) => {
            const input = modal.querySelector('.prompt-input');
            const okBtn = modal.querySelector('.ok-btn');
            const cancelBtn = modal.querySelector('.cancel-btn');

            input.focus();

            okBtn.addEventListener('click', () => {
                const value = input.value;
                document.body.removeChild(modal);
                resolve(value);
            });

            cancelBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(null);
            });
        });
    }

    // ... (keep other existing methods)

    setMode(mode) {
        if (['wall', 'door', 'window', 'measure', 'moisture'].includes(mode)) {
            this.mode = mode;
            this.canvas.style.cursor = this.isTouchDevice ? 'default' : 
                (mode === 'moisture' ? 'pointer' : 'crosshair');
        }
    }

    // ... (keep remaining methods)
}

// Initialize SketchTool when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sketchTool = new SketchTool();
});
