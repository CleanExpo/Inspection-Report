class SketchTool {
    constructor() {
        try {
            // Initialize properties first
            this.initializeProperties();
            
            // Initialize canvas immediately
            this.initializeCanvas();
            
            // Set up event listeners
            this.setupEventListeners();
            
            console.log('SketchTool construction completed');
        } catch (error) {
            console.error('Error in SketchTool constructor:', error);
        }
    }

    initializeProperties() {
        try {
            // Initialize arrays
            this.walls = [];
            this.doors = [];
            this.windows = [];
            this.moisturePoints = [];
            this.measurements = [];
            this.curves = [];
            this.freehandLines = [];
            this.currentFreehandLine = [];

            // Initialize state
            this.mode = 'wall';
            this.isDrawing = false;
            this.startPoint = null;
            this.currentPoint = null;
            this.controlPoint = null;
            this.scale = 50;
            this.showGrid = true;
            this.gridSize = 50;
            this.isTouchDevice = 'ontouchstart' in window;
            this.isPinching = false;
            this.lastTouchDistance = 0;
            this.undoStack = [];
            this.redoStack = [];

            console.log('Properties initialized successfully');
        } catch (error) {
            console.error('Error initializing properties:', error);
            throw error;
        }
    }

    initializeCanvas() {
        try {
            console.log('Starting canvas initialization...');
            
            // Get canvas element
            this.canvas = document.getElementById('sketch-canvas');
            if (!this.canvas) {
                throw new Error('Canvas element not found');
            }
            console.log('Canvas element found');

            // Get context
            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                throw new Error('Could not get canvas context');
            }
            console.log('Canvas context obtained');

            // Get container dimensions
            const container = this.canvas.parentElement;
            if (!container) {
                throw new Error('Canvas container not found');
            }
            
            const rect = container.getBoundingClientRect();
            console.log('Container dimensions:', rect.width, 'x', rect.height);

            // Set canvas size
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
            console.log('Canvas size set to:', this.canvas.width, 'x', this.canvas.height);

            // Initial draw
            this.redraw();
            console.log('Canvas initialized successfully');
        } catch (error) {
            console.error('Error initializing canvas:', error);
            throw error;
        }
    }

    setupEventListeners() {
        try {
            console.log('Setting up event listeners...');

            // Mouse event handlers
            if (!this.isTouchDevice) {
                this.canvas.addEventListener('mousedown', (e) => {
                    const point = this.getCanvasPoint(e);
                    this.startDrawing(point);
                });

                this.canvas.addEventListener('mousemove', (e) => {
                    if (!this.isDrawing) return;
                    const point = this.getCanvasPoint(e);
                    this.updateDrawing(point);
                });

                this.canvas.addEventListener('mouseup', (e) => {
                    if (!this.isDrawing) return;
                    const point = this.getCanvasPoint(e);
                    this.finishDrawing(point);
                });

                this.canvas.addEventListener('mouseleave', () => {
                    if (this.isDrawing) {
                        this.isDrawing = false;
                        this.redraw();
                    }
                });

                this.canvas.addEventListener('wheel', (e) => {
                    e.preventDefault();
                    const delta = e.deltaY * -0.01;
                    const newScale = Math.max(10, Math.min(100, this.scale + delta * 5));
                    this.setScale(newScale);
                });
            }
            // Touch event handlers
            else {
                this.canvas.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    if (e.touches.length !== 1) return;
                    const point = this.getCanvasPoint(e.touches[0]);
                    this.startDrawing(point);
                });

                this.canvas.addEventListener('touchmove', (e) => {
                    e.preventDefault();
                    if (!this.isDrawing || e.touches.length !== 1) return;
                    const point = this.getCanvasPoint(e.touches[0]);
                    this.updateDrawing(point);
                });

                this.canvas.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    if (!this.isDrawing) return;
                    this.finishDrawing(this.currentPoint);
                });
            }

            // Window resize handler
            window.addEventListener('resize', () => {
                this.resizeCanvas();
            });

            console.log('Event listeners set up successfully');
        } catch (error) {
            console.error('Error setting up event listeners:', error);
            throw error;
        }
    }

    startDrawing(point) {
        this.isDrawing = true;
        this.startPoint = point;
        this.currentPoint = point;
    }

    updateDrawing(point) {
        this.currentPoint = point;
        this.redraw();
        this.drawPreview();
    }

    finishDrawing(point) {
        if (!this.startPoint || !point) return;
        
        const element = {
            start: { ...this.startPoint },
            end: { ...point },
            length: Math.hypot(point.x - this.startPoint.x, point.y - this.startPoint.y) / this.scale
        };

        switch (this.mode) {
            case 'wall':
                this.walls.push(element);
                break;
            case 'door':
                this.doors.push(element);
                break;
            case 'window':
                this.windows.push(element);
                break;
            case 'measure':
                this.measurements.push(element);
                break;
        }

        this.isDrawing = false;
        this.startPoint = null;
        this.currentPoint = null;
        this.redraw();
    }

    getCanvasPoint(e) {
        if (!this.canvas) return { x: 0, y: 0 };

        try {
            const rect = this.canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        } catch (error) {
            console.error('Error getting canvas point:', error);
            return { x: 0, y: 0 };
        }
    }

    resizeCanvas() {
        try {
            console.log('Resizing canvas...');
            if (!this.canvas) {
                throw new Error('Canvas not initialized');
            }

            const container = this.canvas.parentElement;
            if (!container) {
                throw new Error('Canvas container not found');
            }

            const rect = container.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;

            console.log('Canvas resized to:', this.canvas.width, 'x', this.canvas.height);
            this.redraw();
        } catch (error) {
            console.error('Error resizing canvas:', error);
        }
    }

    redraw() {
        try {
            if (!this.ctx || !this.canvas) {
                throw new Error('Canvas or context not initialized');
            }

            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw grid if enabled
            if (this.showGrid) {
                this.drawGrid();
            }

            // Draw elements
            this.drawElements();
            
            console.log('Canvas redrawn successfully');
        } catch (error) {
            console.error('Error redrawing canvas:', error);
        }
    }

    drawElements() {
        try {
            // Draw walls
            this.walls.forEach((wall, i) => 
                this.drawElement(wall, '#000', `Wall ${i + 1}`));

            // Draw doors
            this.doors.forEach((door, i) => 
                this.drawElement(door, '#8B4513', `Door ${i + 1}`));

            // Draw windows
            this.windows.forEach((window, i) => 
                this.drawElement(window, '#87CEEB', `Window ${i + 1}`));

            // Draw measurements
            this.measurements.forEach(measure => 
                this.drawElement(measure, '#FF4081', `${measure.length.toFixed(2)}m`));

            // Draw moisture points
            this.moisturePoints.forEach(point => {
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
                this.ctx.fillStyle = this.getMoistureColor(point.value);
                this.ctx.fill();
                
                this.ctx.fillStyle = '#000';
                this.ctx.font = '12px Arial';
                this.ctx.fillText(`${point.value}%`, point.x + 10, point.y + 4);
            });
        } catch (error) {
            console.error('Error drawing elements:', error);
        }
    }

    drawGrid() {
        try {
            const gridSize = this.gridSize;

            // Draw grid lines
            this.ctx.strokeStyle = '#ddd';
            this.ctx.lineWidth = 1;

            // Vertical lines
            for (let x = 0; x <= this.canvas.width; x += gridSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, this.canvas.height);
                this.ctx.stroke();
            }

            // Horizontal lines
            for (let y = 0; y <= this.canvas.height; y += gridSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.canvas.width, y);
                this.ctx.stroke();
            }

            // Add measurements
            this.ctx.fillStyle = '#999';
            this.ctx.font = '10px Arial';
            for (let x = 0; x <= this.canvas.width; x += gridSize) {
                this.ctx.fillText(`${(x/this.scale).toFixed(1)}m`, x + 2, 10);
            }
            for (let y = 0; y <= this.canvas.height; y += gridSize) {
                this.ctx.fillText(`${(y/this.scale).toFixed(1)}m`, 2, y + 10);
            }
        } catch (error) {
            console.error('Error drawing grid:', error);
        }
    }

    drawElement(element, color, label) {
        if (!this.ctx) return;

        try {
            this.ctx.beginPath();
            this.ctx.moveTo(element.start.x, element.start.y);
            this.ctx.lineTo(element.end.x, element.end.y);
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            const midX = (element.start.x + element.end.x) / 2;
            const midY = (element.start.y + element.end.y) / 2;
            this.ctx.fillStyle = '#666';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(label, midX, midY - 5);
        } catch (error) {
            console.error('Error drawing element:', error);
        }
    }

    drawPreview() {
        if (!this.ctx || !this.startPoint || !this.currentPoint) return;

        try {
            this.ctx.beginPath();
            this.ctx.moveTo(this.startPoint.x, this.startPoint.y);
            this.ctx.lineTo(this.currentPoint.x, this.currentPoint.y);
            
            switch (this.mode) {
                case 'wall':
                    this.ctx.strokeStyle = '#000';
                    break;
                case 'door':
                    this.ctx.strokeStyle = '#8B4513';
                    break;
                case 'window':
                    this.ctx.strokeStyle = '#87CEEB';
                    break;
                case 'measure':
                    this.ctx.strokeStyle = '#FF4081';
                    break;
            }
            
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            // Show measurement while drawing
            const length = Math.hypot(
                this.currentPoint.x - this.startPoint.x,
                this.currentPoint.y - this.startPoint.y
            ) / this.scale;

            const midX = (this.startPoint.x + this.currentPoint.x) / 2;
            const midY = (this.startPoint.y + this.currentPoint.y) / 2;
            this.ctx.fillStyle = '#000';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(`${length.toFixed(2)}m`, midX, midY - 5);
        } catch (error) {
            console.error('Error drawing preview:', error);
        }
    }

    getMoistureColor(value) {
        if (value <= 15) return '#4CAF50';  // Green for dry
        if (value <= 30) return '#FFC107';  // Yellow for moderate
        return '#F44336';  // Red for wet
    }

    setMode(mode) {
        if (['wall', 'door', 'window', 'measure', 'moisture', 'curve', 'freehand'].includes(mode)) {
            this.mode = mode;
            this.canvas.style.cursor = mode === 'moisture' ? 'pointer' : 'crosshair';
            
            // Reset drawing state
            this.isDrawing = false;
            this.startPoint = null;
            this.controlPoint = null;
            this.currentPoint = null;
            this.currentFreehandLine = [];
            
            this.redraw();
        }
    }

    setScale(newScale) {
        this.scale = Math.max(10, Math.min(100, newScale));
        this.gridSize = Math.round(this.scale);
        this.redraw();
    }

    toggleGrid() {
        this.showGrid = !this.showGrid;
        this.redraw();
    }
}

// Initialize SketchTool when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Creating SketchTool instance...');
        window.sketchTool = new SketchTool();
        console.log('SketchTool initialized successfully');
    } catch (error) {
        console.error('Failed to initialize SketchTool:', error);
    }
});
