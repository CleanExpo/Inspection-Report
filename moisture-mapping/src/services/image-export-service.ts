import { MoisturePoint, Wall } from '../types/canvas';

export type ImageFormat = 'png' | 'jpeg';

export interface ImageExportOptions {
    format: ImageFormat;
    quality?: number; // 0-1 for JPEG
    includeReadings?: boolean;
    includeAnnotations?: boolean;
    backgroundColor?: string;
    width?: number;
    height?: number;
    scale?: number;
}

interface AnnotationStyle {
    font: string;
    fillStyle: string;
    strokeStyle: string;
    lineWidth: number;
    padding: number;
}

export async function generateImage(options: {
    canvas: HTMLCanvasElement;
    readings: MoisturePoint[];
    walls: Wall[];
    format: ImageFormat;
    quality?: number;
}): Promise<Blob> {
    const service = new ImageExportService(options.canvas, options.readings, options.walls);
    return service.exportImage({
        format: options.format,
        quality: options.quality,
        includeReadings: true,
        includeAnnotations: true
    });
}

export class ImageExportService {
    private canvas: HTMLCanvasElement;
    private readings: MoisturePoint[];
    private walls: Wall[];
    private annotationStyle: AnnotationStyle = {
        font: '12px Arial',
        fillStyle: '#000000',
        strokeStyle: '#ffffff',
        lineWidth: 2,
        padding: 4
    };

    constructor(
        canvas: HTMLCanvasElement,
        readings: MoisturePoint[],
        walls: Wall[]
    ) {
        this.canvas = canvas;
        this.readings = readings;
        this.walls = walls;
    }

    public async exportImage(options: ImageExportOptions): Promise<Blob> {
        const {
            format = 'png',
            quality = 0.95,
            includeReadings = true,
            includeAnnotations = true,
            backgroundColor = '#ffffff',
            width = this.canvas.width,
            height = this.canvas.height,
            scale = 1
        } = options;

        // Create temporary canvas for export
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = width * scale;
        exportCanvas.height = height * scale;
        const ctx = exportCanvas.getContext('2d');

        if (!ctx) {
            throw new Error('Could not get canvas context');
        }

        // Apply scale
        ctx.scale(scale, scale);

        // Draw background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        // Draw original canvas content
        ctx.drawImage(this.canvas, 0, 0, width, height);

        // Draw readings and annotations if requested
        if (includeReadings) {
            this.drawReadings(ctx, width, height, includeAnnotations);
        }

        // Convert to blob
        return new Promise((resolve, reject) => {
            exportCanvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create image blob'));
                    }
                },
                `image/${format}`,
                format === 'jpeg' ? quality : undefined
            );
        });
    }

    private drawReadings(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        includeAnnotations: boolean
    ): void {
        // Set up styles for readings
        ctx.font = this.annotationStyle.font;
        ctx.lineWidth = this.annotationStyle.lineWidth;

        this.readings.forEach((reading, index) => {
            // Draw reading point
            ctx.beginPath();
            ctx.arc(reading.x, reading.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = this.getReadingColor(reading.value);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();

            if (includeAnnotations) {
                // Draw reading value
                const text = `${reading.value.toFixed(1)}%`;
                const metrics = ctx.measureText(text);
                const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
                const padding = this.annotationStyle.padding;

                // Position text above point
                const textX = reading.x - metrics.width / 2;
                const textY = reading.y - textHeight - padding;

                // Draw text background
                ctx.fillStyle = this.annotationStyle.strokeStyle;
                ctx.fillRect(
                    textX - padding,
                    textY - textHeight,
                    metrics.width + padding * 2,
                    textHeight + padding * 2
                );

                // Draw text
                ctx.fillStyle = this.annotationStyle.fillStyle;
                ctx.fillText(text, textX, textY);
            }
        });
    }

    private getReadingColor(value: number): string {
        // Color scale from green to red based on moisture reading
        const hue = Math.max(0, Math.min(120, 120 * (1 - value / 100)));
        return `hsl(${hue}, 100%, 40%)`;
    }

    public setAnnotationStyle(style: Partial<AnnotationStyle>): void {
        this.annotationStyle = {
            ...this.annotationStyle,
            ...style
        };
    }

    public static async downloadImage(
        blob: Blob,
        filename: string,
        format: ImageFormat
    ): Promise<void> {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}
