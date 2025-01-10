import { MoisturePoint, Wall } from '../types/canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generatePDF } from './pdf-export-service';
import { generateImage } from './image-export-service';
import { PerformanceMonitor } from './performance-monitoring';

export interface BatchExportOptions {
    format: 'pdf' | 'png' | 'jpeg';
    quality?: number;
    includeAnnotations?: boolean;
    includeStats?: boolean;
    customFileName?: string;
    compressionLevel?: number;
}

export interface BatchExportItem {
    canvas: HTMLCanvasElement;
    readings: MoisturePoint[];
    walls: Wall[];
    stats?: {
        average: number;
        max: number;
        min: number;
        criticalCount: number;
    };
    metadata?: {
        title?: string;
        date?: string;
        location?: string;
        notes?: string;
    };
}

export class BatchExportService {
    private static readonly DEFAULT_OPTIONS: BatchExportOptions = {
        format: 'pdf',
        quality: 0.8,
        includeAnnotations: true,
        includeStats: true,
        compressionLevel: 6
    };

    /**
     * Export multiple moisture maps in batch
     */
    public static async exportBatch(
        items: BatchExportItem[],
        options: Partial<BatchExportOptions> = {},
        onProgress?: (progress: number) => void
    ): Promise<void> {
        const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };
        const zip = new JSZip();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        const performanceMonitor = PerformanceMonitor.getInstance();
        const operationId = `batch-export-${Date.now()}`;

        try {
            performanceMonitor.startOperation(operationId, 'batchExport', {
                itemCount: items.length,
                format: mergedOptions.format,
                totalSize: items.reduce((size, item) => size + item.canvas.width * item.canvas.height, 0)
            });

            // Process items sequentially to manage memory better
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const progress = (i / items.length) * 100;
                
                performanceMonitor.recordProgress(operationId, progress, `Processing item ${i + 1}`);
                onProgress?.(progress);

                const fileName = this.generateFileName(item, i, mergedOptions);
                const fileContent = await this.generateFileContent(item, mergedOptions);
                
                if (fileContent) {
                    zip.file(fileName, fileContent);
                }

                // Force garbage collection if available
                if ('gc' in window) {
                    (window as any).gc();
                }
            }

            performanceMonitor.recordProgress(operationId, 90, 'Generating ZIP file');

            // Generate and save zip file
            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: {
                    level: mergedOptions.compressionLevel || 6
                }
            });

            performanceMonitor.recordProgress(operationId, 95, 'Saving ZIP file');
            saveAs(zipBlob, `moisture-maps-${timestamp}.zip`);
            performanceMonitor.recordProgress(operationId, 100, 'Export complete');

            const metrics = performanceMonitor.endOperation(operationId);
            if (metrics?.recommendations.length) {
                console.info('Batch Export Performance Recommendations:', metrics.recommendations);
            }
        } catch (error) {
            performanceMonitor.endOperation(operationId);
            console.error('Batch export failed:', error);
            throw new Error('Failed to generate batch export');
        }
    }

    /**
     * Generate appropriate filename for export item
     */
    private static generateFileName(
        item: BatchExportItem,
        index: number,
        options: BatchExportOptions
    ): string {
        const baseFileName = item.metadata?.title || 
            options.customFileName || 
            `moisture-map-${index + 1}`;
        
        const sanitizedFileName = baseFileName
            .replace(/[^a-z0-9]/gi, '-')
            .toLowerCase();

        switch (options.format) {
            case 'pdf':
                return `${sanitizedFileName}.pdf`;
            case 'png':
                return `${sanitizedFileName}.png`;
            case 'jpeg':
                return `${sanitizedFileName}.jpg`;
            default:
                return `${sanitizedFileName}.${options.format}`;
        }
    }

    /**
     * Generate file content based on format
     */
    private static async generateFileContent(
        item: BatchExportItem,
        options: BatchExportOptions
    ): Promise<Blob | null> {
        try {
            switch (options.format) {
                case 'pdf':
                    return await generatePDF({
                        canvas: item.canvas,
                        readings: item.readings,
                        walls: item.walls,
                        stats: options.includeStats ? item.stats : undefined,
                        metadata: item.metadata
                    });

                case 'png':
                case 'jpeg':
                    return await generateImage({
                        canvas: item.canvas,
                        readings: options.includeAnnotations ? item.readings : [],
                        walls: options.includeAnnotations ? item.walls : [],
                        format: options.format,
                        quality: options.quality
                    });

                default:
                    throw new Error(`Unsupported format: ${options.format}`);
            }
        } catch (error) {
            console.error(`Failed to generate ${options.format} content:`, error);
            return null;
        }
    }
}
