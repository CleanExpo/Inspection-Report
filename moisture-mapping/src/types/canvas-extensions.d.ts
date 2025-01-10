interface CanvasRenderingContext2D {
    imageSmoothingEnabled: boolean;
    lineCap: CanvasLineCap;
    lineJoin: CanvasLineJoin;
    globalAlpha: number;
}

interface HTMLCanvasElement {
    getContext(contextId: '2d', options?: CanvasRenderingContext2DSettings): CanvasRenderingContext2D | null;
}

interface CanvasRenderingContext2DSettings {
    alpha?: boolean;
    desynchronized?: boolean;
    willReadFrequently?: boolean;
}
