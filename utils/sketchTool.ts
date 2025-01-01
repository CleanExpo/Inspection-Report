import { Point, Wall, Door, Window, Room } from '../types/moisture';

type DrawingMode = 'wall' | 'door' | 'window' | 'reading';
type MaterialType = 'drywall' | 'concrete' | 'wood' | 'tile';

export class SketchTool {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mode: DrawingMode;
  private material: MaterialType;
  private isDrawing: boolean;
  private startPoint: Point | null;
  private elements: {
    walls: Wall[];
    doors: Door[];
    windows: Window[];
  };
  private undoHistory: any[];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get canvas context');
    this.ctx = context;
    
    // Initialize properties
    this.mode = 'wall';
    this.material = 'drywall';
    this.isDrawing = false;
    this.startPoint = null;
    this.elements = {
      walls: [],
      doors: [],
      windows: []
    };
    this.undoHistory = [];

    // Bind event handlers
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);

    // Add event listeners
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
  }

  private getCanvasPoint(e: MouseEvent): Point {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  private drawPreview(start: Point, end: Point) {
    // Clear the canvas and redraw all elements
    this.redraw();

    // Draw preview based on current mode
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;

    switch (this.mode) {
      case 'wall':
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.stroke();
        break;

      case 'door':
      case 'window':
        const width = this.mode === 'door' ? 30 : 40;
        const height = this.mode === 'door' ? 80 : 60;
        this.ctx.rect(end.x - width/2, end.y - height/2, width, height);
        this.ctx.stroke();
        break;
    }
  }

  private finalizeDraw(start: Point, end: Point) {
    // Save current state for undo
    this.undoHistory.push(JSON.parse(JSON.stringify(this.elements)));

    // Create new element based on mode
    switch (this.mode) {
      case 'wall':
        const wall: Wall = {
          id: crypto.randomUUID(),
          start: { ...start },
          end: { ...end },
          material: this.material
        };
        this.elements.walls.push(wall);
        break;

      case 'door':
        const door: Door = {
          id: crypto.randomUUID(),
          position: { ...end },
          width: 30,
          height: 80,
          rotation: 0
        };
        this.elements.doors.push(door);
        break;

      case 'window':
        const window: Window = {
          id: crypto.randomUUID(),
          position: { ...end },
          width: 40,
          height: 60,
          rotation: 0
        };
        this.elements.windows.push(window);
        break;
    }

    // Redraw everything
    this.redraw();
  }

  private redraw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw walls
    this.elements.walls.forEach(wall => {
      this.ctx.beginPath();
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = 2;
      this.ctx.moveTo(wall.start.x, wall.start.y);
      this.ctx.lineTo(wall.end.x, wall.end.y);
      this.ctx.stroke();
    });

    // Draw doors
    this.elements.doors.forEach(door => {
      this.ctx.beginPath();
      this.ctx.strokeStyle = '#666';
      this.ctx.lineWidth = 2;
      this.ctx.rect(
        door.position.x - door.width/2,
        door.position.y - door.height/2,
        door.width,
        door.height
      );
      this.ctx.stroke();
    });

    // Draw windows
    this.elements.windows.forEach(window => {
      this.ctx.beginPath();
      this.ctx.strokeStyle = '#999';
      this.ctx.lineWidth = 2;
      this.ctx.rect(
        window.position.x - window.width/2,
        window.position.y - window.height/2,
        window.width,
        window.height
      );
      this.ctx.stroke();
    });
  }

  // Event Handlers
  private handleMouseDown(e: MouseEvent) {
    this.isDrawing = true;
    this.startPoint = this.getCanvasPoint(e);
  }

  private handleMouseMove(e: MouseEvent) {
    if (!this.isDrawing || !this.startPoint) return;
    const currentPoint = this.getCanvasPoint(e);
    this.drawPreview(this.startPoint, currentPoint);
  }

  private handleMouseUp(e: MouseEvent) {
    if (!this.isDrawing || !this.startPoint) return;
    const endPoint = this.getCanvasPoint(e);
    this.finalizeDraw(this.startPoint, endPoint);
    this.isDrawing = false;
    this.startPoint = null;
  }

  // Public methods
  setMode(mode: DrawingMode) {
    this.mode = mode;
  }

  setMaterial(material: MaterialType) {
    this.material = material;
  }

  undo() {
    if (this.undoHistory.length > 0) {
      this.elements = this.undoHistory.pop();
      this.redraw();
    }
  }

  getElements() {
    return this.elements;
  }

  loadElements(elements: {
    walls: Wall[];
    doors: Door[];
    windows: Window[];
  }) {
    this.elements = elements;
    this.redraw();
  }

  destroy() {
    // Remove event listeners
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
  }
}
