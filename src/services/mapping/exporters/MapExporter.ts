import fs from 'fs/promises';
import path from 'path';
import { SVGExporter, SVGExportOptions } from './SVGExporter';
import { OBJExporter, OBJExportOptions } from './OBJExporter';
import { SketchGenerationResult } from '../../../types/mapping/sketch';

export interface ExportOptions {
  outputDir: string;
  baseName?: string;
  formats?: ('svg' | 'obj' | 'json' | 'geojson')[];
  svg?: SVGExportOptions;
  obj?: OBJExportOptions;
  createSubdirs?: boolean;
  overwrite?: boolean;
}

export class MapExporter {
  private svgExporter: SVGExporter;
  private objExporter: OBJExporter;

  constructor() {
    this.svgExporter = new SVGExporter();
    this.objExporter = new OBJExporter();
  }

  /**
   * Export mapping result to specified formats
   */
  async exportMap(result: SketchGenerationResult, options: ExportOptions): Promise<void> {
    const {
      outputDir,
      baseName = 'building_map',
      formats = ['svg', 'obj', 'json'],
      createSubdirs = true,
      overwrite = false
    } = options;

    // Ensure output directory exists
    await this.ensureDirectory(outputDir);

    // Create format-specific subdirectories if needed
    const dirs = createSubdirs ? await this.createFormatDirs(outputDir, formats) : {};

    // Export in each requested format
    const exportTasks: Promise<void>[] = [];

    for (const format of formats) {
      const outputPath = createSubdirs
        ? path.join(dirs[format], `${baseName}.${format}`)
        : path.join(outputDir, `${baseName}.${format}`);

      // Check if file exists and should not overwrite
      if (!overwrite && await this.fileExists(outputPath)) {
        console.warn(`File exists and overwrite=false: ${outputPath}`);
        continue;
      }

      switch (format) {
        case 'svg':
          if (result.sketch2D) {
            this.svgExporter.setOptions(options.svg || {});
            const svgContent = this.svgExporter.exportToSVG(result.sketch2D);
            exportTasks.push(fs.writeFile(outputPath, svgContent, 'utf8'));
          }
          break;

        case 'obj':
          if (result.model3D) {
            this.objExporter.setOptions(options.obj || {});
            const objContent = this.objExporter.exportToOBJ(result.model3D);
            exportTasks.push(fs.writeFile(outputPath, objContent, 'utf8'));

            // Export MTL file if materials exist
            const mtlContent = this.objExporter.exportToMTL(result.model3D);
            if (mtlContent) {
              const mtlPath = outputPath.replace(/\.obj$/, '.mtl');
              exportTasks.push(fs.writeFile(mtlPath, mtlContent, 'utf8'));
            }
          }
          break;

        case 'json':
          exportTasks.push(
            fs.writeFile(outputPath, JSON.stringify(result, null, 2), 'utf8')
          );
          break;

        case 'geojson':
          exportTasks.push(
            fs.writeFile(outputPath, this.generateGeoJSON(result), 'utf8')
          );
          break;
      }
    }

    // Export annotations as images if they exist
    if (result.annotations.length > 0) {
      const annotationsDir = path.join(outputDir, 'annotations');
      await this.ensureDirectory(annotationsDir);
      
      // Note: Image export would be implemented here
      // This would typically use a canvas library to render annotations
    }

    // Wait for all export tasks to complete
    await Promise.all(exportTasks);
  }

  /**
   * Create format-specific subdirectories
   */
  private async createFormatDirs(
    baseDir: string,
    formats: string[]
  ): Promise<Record<string, string>> {
    const dirs: Record<string, string> = {};

    for (const format of formats) {
      const formatDir = path.join(baseDir, format);
      await this.ensureDirectory(formatDir);
      dirs[format] = formatDir;
    }

    return dirs;
  }

  /**
   * Ensure directory exists
   */
  private async ensureDirectory(dir: string): Promise<void> {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory ${dir}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate GeoJSON from mapping result
   */
  private generateGeoJSON(result: SketchGenerationResult): string {
    // Convert building data to GeoJSON format
    const geojson = {
      type: 'FeatureCollection',
      features: [] as any[],
      properties: {
        generated: new Date().toISOString(),
        version: '1.0.0',
        metadata: result.metadata
      }
    };

    if (result.sketch2D) {
      // Add building outline
      geojson.features.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            result.sketch2D.layers
              .find(layer => layer.type === 'walls')
              ?.data.flatMap((wall: any) => wall.points.map((p: any) => [p.x, p.y])) || []
          ]
        },
        properties: {
          type: 'building',
          floorLevel: result.sketch2D.floorLevel,
          scale: result.sketch2D.scale
        }
      });

      // Add rooms
      result.sketch2D.layers
        .filter(layer => layer.type === 'walls')
        .forEach(layer => {
          layer.data.forEach((room: any) => {
            geojson.features.push({
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [
                  room.points.map((p: any) => [p.x, p.y])
                ]
              },
              properties: {
                type: 'room',
                floorLevel: result.sketch2D!.floorLevel
              }
            });
          });
        });
    }

    return JSON.stringify(geojson, null, 2);
  }

  /**
   * Update SVG export options
   */
  setSVGOptions(options: SVGExportOptions): void {
    this.svgExporter.setOptions(options);
  }

  /**
   * Update OBJ export options
   */
  setOBJOptions(options: OBJExportOptions): void {
    this.objExporter.setOptions(options);
  }

  /**
   * Get current SVG options
   */
  getSVGOptions(): SVGExportOptions {
    return this.svgExporter.getOptions();
  }

  /**
   * Get current OBJ options
   */
  getOBJOptions(): OBJExportOptions {
    return this.objExporter.getOptions();
  }
}
