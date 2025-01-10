import { Point2D, CanvasLayer } from '../types/canvas';

interface DirtyRegion {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class LayerCache {
    private cache: Map<CanvasLayer, ImageData> = new Map();
    private dirtyRegions: Map<CanvasLayer, DirtyRegion[]> = new Map();
    private isLayerDirty: Map<CanvasLayer, boolean> = new Map();

    constructor(private width: number, private height: number) {}

    public markDirty(layer: CanvasLayer, region?: DirtyRegion) {
        this.isLayerDirty.set(layer, true);
        if (region) {
            const regions = this.dirtyRegions.get(layer) || [];
            regions.push(region);
            this.dirtyRegions.set(layer, regions);
        }
    }

    public isDirty(layer: CanvasLayer): boolean {
        return this.isLayerDirty.get(layer) || false;
    }

    public getDirtyRegions(layer: CanvasLayer): DirtyRegion[] {
        return this.dirtyRegions.get(layer) || [];
    }

    public clearDirty(layer: CanvasLayer) {
        this.isLayerDirty.set(layer, false);
        this.dirtyRegions.set(layer, []);
    }

    public updateCache(layer: CanvasLayer, ctx: CanvasRenderingContext2D) {
        this.cache.set(layer, ctx.getImageData(0, 0, this.width, this.height));
    }

    public getCache(layer: CanvasLayer): ImageData | undefined {
        return this.cache.get(layer);
    }

    public clear() {
        this.cache.clear();
        this.dirtyRegions.clear();
        this.isLayerDirty.clear();
    }

    public resize(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.clear();
    }
}

export class ViewportCuller {
    constructor(
        private width: number,
        private height: number,
        private scale: number,
        private offset: Point2D
    ) {}

    public isVisible(region: DirtyRegion): boolean {
        // Transform region to screen space
        const screenX = region.x * this.scale + this.offset.x;
        const screenY = region.y * this.scale + this.offset.y;
        const screenWidth = region.width * this.scale;
        const screenHeight = region.height * this.scale;

        // Check if region intersects viewport
        return !(
            screenX + screenWidth < 0 ||
            screenY + screenHeight < 0 ||
            screenX > this.width ||
            screenY > this.height
        );
    }

    public getVisibleRegion(): DirtyRegion {
        // Convert viewport to world space
        const worldX = -this.offset.x / this.scale;
        const worldY = -this.offset.y / this.scale;
        const worldWidth = this.width / this.scale;
        const worldHeight = this.height / this.scale;

        return {
            x: worldX,
            y: worldY,
            width: worldWidth,
            height: worldHeight
        };
    }

    public update(width: number, height: number, scale: number, offset: Point2D) {
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.offset = offset;
    }
}

export class RenderOptimizer {
    private layerCache: LayerCache;
    private viewportCuller: ViewportCuller;
    private transformStack: DOMMatrix[] = [];

    constructor(width: number, height: number) {
        this.layerCache = new LayerCache(width, height);
        this.viewportCuller = new ViewportCuller(width, height, 1, { x: 0, y: 0 });
    }

    public beginFrame(ctx: CanvasRenderingContext2D) {
        // Save current transform state
        this.transformStack.push(ctx.getTransform());
    }

    public endFrame(ctx: CanvasRenderingContext2D) {
        // Restore transform state
        const transform = this.transformStack.pop();
        if (transform) {
            ctx.setTransform(transform);
        }
    }

    public shouldRenderLayer(layer: CanvasLayer): boolean {
        return this.layerCache.isDirty(layer);
    }

    public markLayerDirty(layer: CanvasLayer, region?: DirtyRegion) {
        this.layerCache.markDirty(layer, region);
    }

    public updateLayerCache(layer: CanvasLayer, ctx: CanvasRenderingContext2D) {
        this.layerCache.updateCache(layer, ctx);
        this.layerCache.clearDirty(layer);
    }

    public getLayerCache(layer: CanvasLayer): ImageData | undefined {
        return this.layerCache.getCache(layer);
    }

    public isRegionVisible(region: DirtyRegion): boolean {
        return this.viewportCuller.isVisible(region);
    }

    public getVisibleRegion(): DirtyRegion {
        return this.viewportCuller.getVisibleRegion();
    }

    public updateViewport(width: number, height: number, scale: number, offset: Point2D) {
        this.viewportCuller.update(width, height, scale, offset);
    }

    public resize(width: number, height: number) {
        this.layerCache.resize(width, height);
    }

    public clear() {
        this.layerCache.clear();
        this.transformStack = [];
    }
}
