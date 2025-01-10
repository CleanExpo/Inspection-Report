import type { FloorPlanConfig, ViewportConfig, MeasurementOverlay, ControlsConfig } from './types';

export class CanvasManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private image: HTMLImageElement | null = null;
  private _config: FloorPlanConfig;
  private _controls: ControlsConfig;
  public viewport: ViewportConfig;

  public get config(): FloorPlanConfig {
    return this._config;
  }

  public get controls(): ControlsConfig {
    return this._controls;
  }
  private isDragging = false;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private overlays: MeasurementOverlay[] = [];
  private hoveredOverlay: MeasurementOverlay | null = null;
  private cleanupCallbacks: (() => void)[] = [];

  constructor(
    canvas: HTMLCanvasElement,
    config: Partial<FloorPlanConfig> = {},
    viewport: Partial<ViewportConfig> = {},
    controls: Partial<ControlsConfig> = {}
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get canvas context');
    this.ctx = context;

    // Default configuration
    this._config = {
      width: canvas.width,
      height: canvas.height,
      scale: 1,
      gridSize: 50,
      backgroundColor: '#ffffff',
      gridColor: '#e0e0e0',
      showGrid: true,
      showControls: true,
      showTooltips: true,
      controlPosition: 'bottom-right',
      ...config
    };

    // Default controls configuration
    this._controls = {
      zoomStep: 0.1,
      panStep: 50,
      gridSizeStep: 10,
      minGridSize: 5,
      maxGridSize: 100,
      shortcuts: {
        zoomIn: '+',
        zoomOut: '-',
        panUp: 'ArrowUp',
        panDown: 'ArrowDown',
        panLeft: 'ArrowLeft',
        panRight: 'ArrowRight',
        reset: 'r',
        toggleGrid: 'g',
        increaseGridSize: ']',
        decreaseGridSize: '['
      },
      ...controls
    };

    // Default viewport
    this.viewport = {
      zoom: 1,
      panX: 0,
      panY: 0,
      minZoom: 0.1,
      maxZoom: 5,
      ...viewport
    };

    this.setupEventListeners();
    this.setupKeyboardShortcuts();
  }

  private setupKeyboardShortcuts() {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if focused on input elements
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const { shortcuts } = this._controls;
      const actions: Record<string, () => void> = {
        [shortcuts.zoomIn]: () => this.zoomIn(),
        [shortcuts.zoomOut]: () => this.zoomOut(),
        [shortcuts.reset]: () => this.resetView(),
        [shortcuts.toggleGrid]: () => this.toggleGrid(),
        [shortcuts.panUp]: () => this.pan(0, -this._controls.panStep),
        [shortcuts.panDown]: () => this.pan(0, this._controls.panStep),
        [shortcuts.panLeft]: () => this.pan(-this._controls.panStep, 0),
        [shortcuts.panRight]: () => this.pan(this._controls.panStep, 0),
        [shortcuts.increaseGridSize]: () => this._config.showGrid && this.increaseGridSize(),
        [shortcuts.decreaseGridSize]: () => this._config.showGrid && this.decreaseGridSize()
      };

      const action = actions[e.key];
      if (action) {
      const requiresCtrl = ['zoomIn', 'zoomOut', 'reset', 'toggleGrid', 'increaseGridSize', 'decreaseGridSize'].includes(
          Object.entries(shortcuts).find(([_, key]) => key === e.key)?.[0] ?? ''
        );

        if ((!requiresCtrl && !e.ctrlKey) || (requiresCtrl && e.ctrlKey)) {
          e.preventDefault();
          action();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    this.cleanupCallbacks.push(() => {
      document.removeEventListener('keydown', handleKeyDown);
    });
  }

  public updateShortcut(action: keyof ControlsConfig['shortcuts'], key: string) {
    this._controls = {
      ...this._controls,
      shortcuts: {
        ...this._controls.shortcuts,
        [action]: key
      }
    };
  }

  public getShortcuts(): Record<string, string> {
    const shortcuts = { ...this._controls.shortcuts };
    const requiresCtrl = ['zoomIn', 'zoomOut', 'reset', 'toggleGrid', 'increaseGridSize', 'decreaseGridSize'];
    
    return Object.entries(shortcuts).reduce((acc, [action, key]) => {
      acc[action] = requiresCtrl.includes(action) ? `Ctrl + ${key}` : key;
      return acc;
    }, {} as Record<string, string>);
  }

  public disableShortcut(action: keyof ControlsConfig['shortcuts']) {
    this.updateShortcut(action, '');
  }

  public resetShortcuts() {
    this._controls = {
      ...this._controls,
      shortcuts: {
        zoomIn: '+',
        zoomOut: '-',
        panUp: 'ArrowUp',
        panDown: 'ArrowDown',
        panLeft: 'ArrowLeft',
        panRight: 'ArrowRight',
        reset: 'r',
        toggleGrid: 'g',
        increaseGridSize: ']',
        decreaseGridSize: '['
      }
    };
  }

  public pan(deltaX: number, deltaY: number) {
    this.viewport.panX += deltaX / this.viewport.zoom;
    this.viewport.panY += deltaY / this.viewport.zoom;
    this.render();
  }

  private setupEventListeners() {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('wheel', this.handleWheel);

    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart);
    this.canvas.addEventListener('touchmove', this.handleTouchMove);
    this.canvas.addEventListener('touchend', this.handleTouchEnd);
  }

  private handleMouseDown = (e: MouseEvent) => {
    this.isDragging = true;
    this.lastMouseX = e.offsetX;
    this.lastMouseY = e.offsetY;
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (this.isDragging) {
      const deltaX = e.offsetX - this.lastMouseX;
      const deltaY = e.offsetY - this.lastMouseY;
      
      this.viewport.panX += deltaX / this.viewport.zoom;
      this.viewport.panY += deltaY / this.viewport.zoom;
      
      this.lastMouseX = e.offsetX;
      this.lastMouseY = e.offsetY;
      
      this.render();
    } else {
      this.checkHover(e.offsetX, e.offsetY);
    }
  };

  private handleMouseUp = () => {
    this.isDragging = false;
  };

  private handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = this.viewport.zoom * zoomFactor;
    
    if (newZoom >= this.viewport.minZoom && newZoom <= this.viewport.maxZoom) {
      // Zoom centered on mouse position
      const mouseX = e.offsetX;
      const mouseY = e.offsetY;
      
      const worldX = (mouseX - this.viewport.panX) / this.viewport.zoom;
      const worldY = (mouseY - this.viewport.panY) / this.viewport.zoom;
      
      this.viewport.zoom = newZoom;
      
      this.viewport.panX = mouseX - worldX * this.viewport.zoom;
      this.viewport.panY = mouseY - worldY * this.viewport.zoom;
      
      this.render();
    }
  };

  private handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      this.isDragging = true;
      this.lastMouseX = e.touches[0].clientX;
      this.lastMouseY = e.touches[0].clientY;
    }
  };

  private handleTouchMove = (e: TouchEvent) => {
    if (this.isDragging && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - this.lastMouseX;
      const deltaY = e.touches[0].clientY - this.lastMouseY;
      
      this.viewport.panX += deltaX / this.viewport.zoom;
      this.viewport.panY += deltaY / this.viewport.zoom;
      
      this.lastMouseX = e.touches[0].clientX;
      this.lastMouseY = e.touches[0].clientY;
      
      this.render();
    }
  };

  private handleTouchEnd = () => {
    this.isDragging = false;
  };

  public zoomIn() {
    this.setZoom(this.viewport.zoom * (1 + this._controls.zoomStep));
  }

  public zoomOut() {
    this.setZoom(this.viewport.zoom / (1 + this._controls.zoomStep));
  }

  public updateControls(controls: Partial<ControlsConfig>) {
    this._controls = {
      ...this._controls,
      ...controls
    };
  }

  public resetView() {
    this.viewport = {
      ...this.viewport,
      zoom: 1,
      panX: 0,
      panY: 0
    };
    this.render();
  }

  public toggleGrid() {
    this._config = {
      ...this._config,
      showGrid: !this._config.showGrid
    };
    this.render();
  }

  public setGridSize(size: number) {
    this._config = {
      ...this._config,
      gridSize: Math.max(10, size) // Minimum grid size of 10
    };
    this.render();
  }

  public increaseGridSize() {
    this.setGridSize(this._config.gridSize + 10);
  }

  public decreaseGridSize() {
    this.setGridSize(this._config.gridSize - 10);
  }

  public setGridColor(color: string) {
    this._config = {
      ...this._config,
      gridColor: color
    };
    this.render();
  }

  public showGrid() {
    if (!this._config.showGrid) {
      this._config = {
        ...this._config,
        showGrid: true
      };
      this.render();
    }
  }

  public hideGrid() {
    if (this._config.showGrid) {
      this._config = {
        ...this._config,
        showGrid: false
      };
      this.render();
    }
  }

  private setZoom(newZoom: number) {
    const zoom = Math.min(Math.max(newZoom, this.viewport.minZoom), this.viewport.maxZoom);
    if (zoom === this.viewport.zoom) return;

    // Zoom around center
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    const worldX = (centerX - this.viewport.panX) / this.viewport.zoom;
    const worldY = (centerY - this.viewport.panY) / this.viewport.zoom;
    
    this.viewport.zoom = zoom;
    
    this.viewport.panX = centerX - worldX * zoom;
    this.viewport.panY = centerY - worldY * zoom;
    
    this.render();
  }

  private checkHover(x: number, y: number) {
    const worldX = (x - this.viewport.panX) / this.viewport.zoom;
    const worldY = (y - this.viewport.panY) / this.viewport.zoom;
    
    let hoveredOverlay: MeasurementOverlay | null = null;
    
    for (const overlay of this.overlays) {
      if (this.isPointInOverlay(worldX, worldY, overlay)) {
        hoveredOverlay = overlay;
        break;
      }
    }
    
    if (hoveredOverlay !== this.hoveredOverlay) {
      this.hoveredOverlay = hoveredOverlay;
      this.render();
    }
  }

  public isPointInOverlay(x: number, y: number, overlay: MeasurementOverlay): boolean {
    switch (overlay.type) {
      case 'point':
        const point = overlay.coordinates[0];
        const distance = Math.sqrt(
          Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
        );
        return distance < 5 / this.viewport.zoom;
        
      case 'area':
        return this.isPointInPolygon(x, y, overlay.coordinates);
        
      case 'perimeter':
        return this.isPointNearPolyline(x, y, overlay.coordinates);
        
      default:
        return false;
    }
  }

  private isPointInPolygon(x: number, y: number, points: { x: number; y: number }[]): boolean {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].x, yi = points[i].y;
      const xj = points[j].x, yj = points[j].y;
      
      const intersect = ((yi > y) !== (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  private isPointNearPolyline(x: number, y: number, points: { x: number; y: number }[]): boolean {
    const threshold = 5 / this.viewport.zoom;
    
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      
      const distance = this.pointToLineDistance(x, y, p1.x, p1.y, p2.x, p2.y);
      if (distance < threshold) return true;
    }
    
    return false;
  }

  private pointToLineDistance(x: number, y: number, x1: number, y1: number, x2: number, y2: number): number {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) param = dot / lenSq;
    
    let xx, yy;
    
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    
    const dx = x - xx;
    const dy = y - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
  }

  public loadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.image = img;
        this.render();
        resolve();
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  public setOverlays(overlays: MeasurementOverlay[]) {
    this.overlays = overlays;
    this.render();
  }

  public updateConfig(config: Partial<FloorPlanConfig>) {
    this._config = {
      ...this._config,
      ...config
    };
    this.render();
  }

  public render() {
    requestAnimationFrame(() => {
      // Clear canvas
      this.ctx.fillStyle = this._config.backgroundColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Save context state
      this.ctx.save();
      
      // Apply viewport transform
      this.ctx.translate(this.viewport.panX, this.viewport.panY);
      this.ctx.scale(this.viewport.zoom, this.viewport.zoom);
      
      // Draw grid
      if (this._config.showGrid) {
        this.drawGrid();
      }
      
      // Draw image
      if (this.image) {
        this.ctx.drawImage(this.image, 0, 0);
      }
      
      // Draw overlays
      this.drawOverlays();
      
      // Restore context state
      this.ctx.restore();
      
      // Notify viewport change if callback is set
      if (this.onViewportChange) {
        this.onViewportChange(this.viewport);
      }
    });
  }

  private drawGrid(): void {
    const gridSize = this._config.gridSize;
    const width = this._config.width;
    const height = this._config.height;
    
    this.ctx.strokeStyle = this._config.gridColor;
    this.ctx.lineWidth = 1 / this.viewport.zoom;
    
    // Calculate grid offset based on pan position
    const offsetX = this.viewport.panX % (gridSize * this.viewport.zoom);
    const offsetY = this.viewport.panY % (gridSize * this.viewport.zoom);
    
    // Draw vertical lines
    for (let x = -offsetX; x <= width * this.viewport.zoom; x += gridSize * this.viewport.zoom) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height * this.viewport.zoom);
      this.ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = -offsetY; y <= height * this.viewport.zoom; y += gridSize * this.viewport.zoom) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width * this.viewport.zoom, y);
      this.ctx.stroke();
    }
    
    // Draw grid size indicator if enabled
    if (this._config.showControls) {
      this.drawGridSizeIndicator();
    }
  }

  private drawGridSizeIndicator(): void {
    const padding = 10;
    const fontSize = 12;
    const text = `Grid: ${this._config.gridSize}px`;
    
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    
    this.ctx.font = `${fontSize}px Arial`;
    this.ctx.fillStyle = '#000000';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    
    // Position based on control position
    const metrics = this.ctx.measureText(text);
    const x = this._config.controlPosition.includes('right') 
      ? this.canvas.width - metrics.width - padding 
      : padding;
    const y = this._config.controlPosition.includes('bottom') 
      ? this.canvas.height - fontSize - padding 
      : padding;
    
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }

  private drawOverlays() {
    for (const overlay of this.overlays) {
      const isHovered = overlay === this.hoveredOverlay;
      this.drawOverlay(overlay, isHovered);
    }
  }

  private drawOverlay(overlay: MeasurementOverlay, isHovered: boolean) {
    this.ctx.lineWidth = (isHovered ? 3 : 2) / this.viewport.zoom;
    this.ctx.strokeStyle = isHovered ? '#ff0000' : '#0088ff';
    this.ctx.fillStyle = isHovered ? 'rgba(255,0,0,0.2)' : 'rgba(0,136,255,0.2)';
    
    switch (overlay.type) {
      case 'point':
        this.drawPoint(overlay, isHovered);
        break;
      case 'area':
        this.drawArea(overlay);
        break;
      case 'perimeter':
        this.drawPerimeter(overlay);
        break;
    }
    
    if (overlay.label) {
      this.drawLabel(overlay);
    }
  }

  private drawPoint(overlay: MeasurementOverlay, isHovered: boolean) {
    const point = overlay.coordinates[0];
    const radius = (isHovered ? 6 : 4) / this.viewport.zoom;
    
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
  }

  private drawArea(overlay: MeasurementOverlay) {
    const points = overlay.coordinates;
    
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  private drawPerimeter(overlay: MeasurementOverlay) {
    const points = overlay.coordinates;
    
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    
    this.ctx.stroke();
  }

  private drawLabel(overlay: MeasurementOverlay) {
    if (!overlay.label) return;
    
    const center = this.getOverlayCenter(overlay);
    const fontSize = 12 / this.viewport.zoom;
    
    this.ctx.font = `${fontSize}px Arial`;
    this.ctx.fillStyle = '#000000';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(overlay.label, center.x, center.y);
  }

  private getOverlayCenter(overlay: MeasurementOverlay): { x: number; y: number } {
    if (overlay.type === 'point') {
      return overlay.coordinates[0];
    }
    
    let sumX = 0;
    let sumY = 0;
    
    for (const point of overlay.coordinates) {
      sumX += point.x;
      sumY += point.y;
    }
    
    return {
      x: sumX / overlay.coordinates.length,
      y: sumY / overlay.coordinates.length
    };
  }

  private onViewportChange?: (viewport: ViewportConfig) => void;

  public setViewportChangeCallback(callback: (viewport: ViewportConfig) => void) {
    this.onViewportChange = callback;
  }

  public dispose() {
    // Remove event listeners
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('wheel', this.handleWheel);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    
    // Run cleanup callbacks
    this.cleanupCallbacks.forEach(cleanup => cleanup());
    
    // Clear references
    this.image = null;
    this.overlays = [];
    this.hoveredOverlay = null;
  }
}
