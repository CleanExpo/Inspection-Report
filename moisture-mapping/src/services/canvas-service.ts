import { Point2D, DrawingMode, CanvasLayer, Wall } from '../types/canvas';
import { debounce, rafThrottle } from '../utils/debounce';
import { TouchGestureManager } from './touch-gesture-manager';
import { RenderOptimizer } from './canvas-optimizations';
import { PerformanceMonitor, monitorPerformance } from './performance-monitor';

export class CanvasService {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private layers: Map<CanvasLayer, HTMLCanvasElement>;
    private mode: DrawingMode;
    private isDrawing: boolean;
    private startPoint: Point2D | null;
    private scale: number;
    private rotation: number;
    private offset: Point2D;
    private walls: Wall[] = [];
    private touchGestureManager: TouchGestureManager | null = null;
    private renderOptimizer: RenderOptimizer;
    private performanceMonitor: PerformanceMonitor;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (context) {
            this.optimizeContext(context);
        }
        if (!context) {
            throw new Error('Could not get canvas context');
        }
        this.ctx = context;
        this.layers = new Map();
        this.mode = 'wall';
        this.isDrawing = false;
        this.startPoint = null;
        this.scale = 1;
        this.rotation = 0;
        this.offset = { x: 0, y: 0 };

        this.renderOptimizer = new RenderOptimizer(canvas.width, canvas.height);
        this.performanceMonitor = PerformanceMonitor.getInstance();

        this.initializeLayers();
        this.setupEventListeners();
        this.setupTouchGestures();
    }

    private initializeLayers() {
        const layers: CanvasLayer[] = ['background', 'walls', 'readings', 'overlay'];
        
        layers.forEach(layer => {
            const layerCanvas = document.createElement('canvas');
            layerCanvas.width = this.canvas.width;
            layerCanvas.height = this.canvas.height;
            const ctx = layerCanvas.getContext('2d');
            if (ctx) {
                this.optimizeContext(ctx, layer);
            }
            this.layers.set(layer, layerCanvas);
        });
    }

    private setupTouchGestures() {
        this.touchGestureManager = new TouchGestureManager(this.canvas, {
            onPan: (delta: Point2D) => {
                this.offset.x += delta.x;
                this.offset.y += delta.y;
                this.renderOptimizer.updateViewport(
                    this.canvas.width,
                    this.canvas.height,
                    this.scale,
                    this.offset
                );
                this.render();
            },
            onZoom: (scale: number, center: Point2D) => {
                const prevScale = this.scale;
                this.scale = scale;

                this.offset.x += (center.x - this.offset.x) * (1 - scale / prevScale);
                this.offset.y += (center.y - this.offset.y) * (1 - scale / prevScale);

                this.renderOptimizer.updateViewport(
                    this.canvas.width,
                    this.canvas.height,
                    this.scale,
                    this.offset
                );
                this.render();
            },
            onRotate: (angle: number, center: Point2D) => {
                const prevRotation = this.rotation;
                this.rotation = angle;

                const cos = Math.cos(angle - prevRotation);
                const sin = Math.sin(angle - prevRotation);
                const dx = center.x - this.offset.x;
                const dy = center.y - this.offset.y;

                this.offset.x = center.x - (dx * cos - dy * sin);
                this.offset.y = center.y - (dx * sin + dy * cos);

                ['background', 'walls', 'readings', 'overlay'].forEach(layer => {
                    this.renderOptimizer.markLayerDirty(layer as CanvasLayer);
                    this.performanceMonitor.recordDirtyRegion();
                });

                this.render();
            },
            onDoubleTap: (point: Point2D) => {
                this.scale = 1;
                this.rotation = 0;
                this.offset = { x: 0, y: 0 };

                this.renderOptimizer.updateViewport(
                    this.canvas.width,
                    this.canvas.height,
                    1,
                    { x: 0, y: 0 }
                );

                ['background', 'walls', 'readings', 'overlay'].forEach(layer => {
                    this.renderOptimizer.markLayerDirty(layer as CanvasLayer);
                    this.performanceMonitor.recordDirtyRegion();
                });

                this.render();
            }
        });
    }

    private setupEventListeners() {
        const boundMouseDown = this.handleMouseDown.bind(this);
        const boundMouseUp = this.handleMouseUp.bind(this);

        this.canvas.addEventListener('mousedown', boundMouseDown);
        this.canvas.addEventListener('mouseup', boundMouseUp);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);

        this._boundHandlers = {
            mouseDown: boundMouseDown,
            mouseUp: boundMouseUp
        };
    }

    private _boundHandlers: {
        mouseDown: (e: MouseEvent) => void;
        mouseUp: (e: MouseEvent) => void;
    } = {
        mouseDown: () => {},
        mouseUp: () => {}
    };

    private getCanvasPoint(event: MouseEvent | Touch): Point2D {
        const rect = this.canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left - this.offset.x) / this.scale;
        const y = (event.clientY - rect.top - this.offset.y) / this.scale;
        
        if (this.rotation !== 0) {
            const cos = Math.cos(-this.rotation);
            const sin = Math.sin(-this.rotation);
            return {
                x: x * cos - y * sin,
                y: x * sin + y * cos
            };
        }
        
        return { x, y };
    }

    private handleMouseDown(event: MouseEvent) {
        this.isDrawing = true;
        this.startPoint = this.getCanvasPoint(event);
    }

    private handleMouseMove = rafThrottle((event: MouseEvent) => {
        if (!this.isDrawing || !this.startPoint) return;
        
        const currentPoint = this.getCanvasPoint(event);
        this.drawPreview(this.startPoint, currentPoint);
    }, 16);

    private handleMouseUp(event: MouseEvent) {
        if (!this.isDrawing || !this.startPoint) return;
        
        const endPoint = this.getCanvasPoint(event);
        if (this.mode === 'wall' || this.mode === 'door' || this.mode === 'window') {
            this.drawWall(this.startPoint, endPoint, this.mode);
        }
        this.isDrawing = false;
        this.startPoint = null;
    }

    @monitorPerformance()
    private drawPreview = rafThrottle((start: Point2D, end: Point2D) => {
        const overlayCanvas = this.layers.get('overlay');
        if (!overlayCanvas) return;

        const ctx = overlayCanvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        
        const region = {
            x: Math.min(start.x, end.x),
            y: Math.min(start.y, end.y),
            width: Math.abs(end.x - start.x),
            height: Math.abs(end.y - start.y)
        };

        if (this.renderOptimizer.isRegionVisible(region)) {
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 2;
            ctx.stroke();

            this.renderOptimizer.markLayerDirty('overlay', region);
            this.performanceMonitor.recordDirtyRegion();
        }

        this.render();
    });

    @monitorPerformance()
    public drawWall = rafThrottle((start: Point2D, end: Point2D, type: 'wall' | 'door' | 'window' = 'wall'): Wall | null => {
        const layerCanvas = this.layers.get('walls');
        if (!layerCanvas) {
            console.error('Walls layer not found');
            return null;
        }

        const ctx = layerCanvas.getContext('2d');
        if (!ctx) {
            console.error('Could not get walls layer context');
            return null;
        }

        try {
            const wall: Wall = { start, end, type };
            this.walls.push(wall);

            const region = {
                x: Math.min(start.x, end.x) - 2,
                y: Math.min(start.y, end.y) - 2,
                width: Math.abs(end.x - start.x) + 4,
                height: Math.abs(end.y - start.y) + 4
            };

            if (this.renderOptimizer.isRegionVisible(region)) {
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.strokeStyle = type === 'wall' ? '#000' : type === 'door' ? '#a00' : '#00a';
                ctx.lineWidth = 3;
                ctx.stroke();

                this.renderOptimizer.markLayerDirty('walls', region);
                this.performanceMonitor.recordDirtyRegion();
            }

            const overlayCanvas = this.layers.get('overlay');
            if (overlayCanvas) {
                const overlayCtx = overlayCanvas.getContext('2d');
                overlayCtx?.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
                this.renderOptimizer.markLayerDirty('overlay');
                this.performanceMonitor.recordDirtyRegion();
            }

            this.render();
            return wall;
        } catch (error) {
            console.error('Error drawing wall:', error);
            return null;
        }
    });

    public getWalls(): Wall[] {
        return [...this.walls];
    }

    public setMode(mode: DrawingMode) {
        this.mode = mode;
    }

    public setScale(scale: number) {
        this.scale = scale;
        this.renderOptimizer.updateViewport(
            this.canvas.width,
            this.canvas.height,
            scale,
            this.offset
        );
        this.render();
    }

    public getScale(): number {
        return this.scale;
    }

    public getRotation(): number {
        return this.rotation;
    }

    public getTouchGestureManager(): TouchGestureManager | null {
        return this.touchGestureManager;
    }

    public clear(layer?: CanvasLayer) {
        if (layer) {
            const layerCanvas = this.layers.get(layer);
            if (layerCanvas) {
                const ctx = layerCanvas.getContext('2d');
                ctx?.clearRect(0, 0, layerCanvas.width, layerCanvas.height);
                this.renderOptimizer.markLayerDirty(layer);
                this.performanceMonitor.recordDirtyRegion();
            }
            if (layer === 'walls') {
                this.walls = [];
            }
        } else {
            this.layers.forEach((layerCanvas, layerName) => {
                const ctx = layerCanvas.getContext('2d');
                ctx?.clearRect(0, 0, layerCanvas.width, layerCanvas.height);
                this.renderOptimizer.markLayerDirty(layerName);
                this.performanceMonitor.recordDirtyRegion();
            });
            this.walls = [];
        }
        this.render();
    }

    @monitorPerformance()
    private renderFrame = rafThrottle(() => {
        this.renderOptimizer.beginFrame(this.ctx);

        if (this.rotation !== 0 || this.scale !== 1 || this.offset.x !== 0 || this.offset.y !== 0) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        this.ctx.translate(this.offset.x, this.offset.y);
        this.ctx.rotate(this.rotation);
        this.ctx.scale(this.scale, this.scale);

        const visibleRegion = this.renderOptimizer.getVisibleRegion();

        ['background', 'walls', 'readings', 'overlay'].forEach(layerName => {
            const layer = layerName as CanvasLayer;
            if (this.renderOptimizer.shouldRenderLayer(layer)) {
                const layerCanvas = this.layers.get(layer);
                if (layerCanvas) {
                    this.ctx.drawImage(
                        layerCanvas,
                        visibleRegion.x,
                        visibleRegion.y,
                        visibleRegion.width,
                        visibleRegion.height,
                        visibleRegion.x,
                        visibleRegion.y,
                        visibleRegion.width,
                        visibleRegion.height
                    );
                    
                    const layerCtx = layerCanvas.getContext('2d');
                    if (layerCtx) {
                        this.renderOptimizer.updateLayerCache(layer, layerCtx);
                    }
                    this.performanceMonitor.recordDrawCall();
                }
            }
        });

        this.renderOptimizer.endFrame(this.ctx);
    });

    public render() {
        this.renderFrame();
    }

    public setSize = debounce((width: number, height: number) => {
        this.canvas.width = width;
        this.canvas.height = height;

        this.layers.forEach(layerCanvas => {
            layerCanvas.width = width;
            layerCanvas.height = height;
        });

        this.renderOptimizer.resize(width, height);
        this.renderOptimizer.updateViewport(width, height, this.scale, this.offset);

        ['background', 'walls', 'readings', 'overlay'].forEach(layer => {
            this.renderOptimizer.markLayerDirty(layer as CanvasLayer);
            this.performanceMonitor.recordDirtyRegion();
        });

        this.render();
    }, 150);

    private optimizeContext(ctx: CanvasRenderingContext2D, layer?: CanvasLayer) {
        ctx.imageSmoothingEnabled = false;

        if (layer) {
            switch (layer) {
                case 'overlay':
                    ctx.imageSmoothingEnabled = true;
                    break;
                case 'background':
                    ctx.globalAlpha = 1;
                    break;
                case 'walls':
                case 'readings':
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    break;
            }
        }
    }

    public destroy() {
        this.canvas.removeEventListener('mousedown', this._boundHandlers.mouseDown);
        this.canvas.removeEventListener('mouseup', this._boundHandlers.mouseUp);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.touchGestureManager?.destroy();
        this.renderOptimizer.clear();
    }
}
