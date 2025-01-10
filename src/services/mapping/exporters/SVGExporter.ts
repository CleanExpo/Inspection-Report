import { 
  Sketch2D, 
  Layer, 
  Point2D, 
  Point3D,
  Annotation, 
  RoomLabel, 
  Dimension 
} from '../../../types/mapping/sketch';

export interface SVGExportOptions {
  width?: number;
  height?: number;
  margin?: number;
  strokeWidth?: number;
  fontSize?: number;
  colors?: {
    walls?: string;
    doors?: string;
    windows?: string;
    annotations?: string;
    dimensions?: string;
    labels?: string;
    [key: string]: string | undefined;
  };
}

interface Wall {
  points: Point2D[];
}

interface Door {
  start: Point2D;
  end: Point2D;
}

interface Window {
  start: Point2D;
  end: Point2D;
}

export class SVGExporter {
  private options: Required<SVGExportOptions>;

  constructor(options: SVGExportOptions = {}) {
    this.options = {
      width: 800,
      height: 600,
      margin: 20,
      strokeWidth: 2,
      fontSize: 12,
      colors: {
        walls: '#000000',
        doors: '#0066cc',
        windows: '#99ccff',
        annotations: '#ff6600',
        dimensions: '#666666',
        labels: '#333333',
        ...options.colors
      },
      ...options
    };
  }

  /**
   * Export sketch to SVG string
   */
  exportToSVG(sketch: Sketch2D): string {
    const { width, height, margin } = this.options;

    // Calculate scale to fit content
    const scale = Math.min(
      (width - 2 * margin) / sketch.viewBox.width,
      (height - 2 * margin) / sketch.viewBox.height
    );

    // Generate SVG content
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     width="${width}" 
     height="${height}" 
     viewBox="${-margin} ${-margin} ${width + 2 * margin} ${height + 2 * margin}">
  <defs>
    ${this.generateDefs()}
  </defs>
  <g transform="translate(${margin},${margin}) scale(${scale}) rotate(${sketch.rotation})">
    ${this.renderLayers(sketch.layers)}
  </g>
</svg>`;

    return svgContent;
  }

  /**
   * Generate SVG definitions (markers, patterns, etc.)
   */
  private generateDefs(): string {
    return `
    <!-- Arrow marker for dimensions -->
    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5"
            markerWidth="4" markerHeight="4"
            orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="${this.options.colors.dimensions}"/>
    </marker>
    
    <!-- Door arc -->
    <marker id="doorArc" viewBox="0 0 10 10" refX="5" refY="5"
            markerWidth="4" markerHeight="4">
      <path d="M 0 10 A 10 10 0 0 1 10 0" 
            fill="none" 
            stroke="${this.options.colors.doors}" 
            stroke-width="1"/>
    </marker>`;
  }

  /**
   * Render all layers
   */
  private renderLayers(layers: Layer[]): string {
    return layers
      .filter(layer => layer.visible)
      .map(layer => this.renderLayer(layer))
      .join('\n');
  }

  /**
   * Render single layer
   */
  private renderLayer(layer: Layer): string {
    const opacity = layer.opacity;
    const color = this.options.colors[layer.type] || '#000000';

    return `<g class="layer-${layer.type}" 
              opacity="${opacity}" 
              stroke="${color}" 
              fill="none" 
              stroke-width="${this.options.strokeWidth}">
      ${this.renderLayerContent(layer)}
    </g>`;
  }

  /**
   * Render layer content based on type
   */
  private renderLayerContent(layer: Layer): string {
    switch (layer.type) {
      case 'walls':
        return this.renderWalls(layer.data as Wall[]);
      case 'doors':
        return this.renderDoors(layer.data as Door[]);
      case 'windows':
        return this.renderWindows(layer.data as Window[]);
      case 'annotations':
        return this.renderAnnotations(layer.data as Annotation[]);
      case 'dimensions':
        return this.renderDimensions(layer.data as Dimension[]);
      case 'labels':
        return this.renderLabels(layer.data as RoomLabel[]);
      default:
        return '';
    }
  }

  /**
   * Render walls
   */
  private renderWalls(walls: Wall[]): string {
    return walls.map(wall => {
      const points = wall.points.map(p => `${p.x},${p.y}`).join(' ');
      return `<polyline points="${points}" />`;
    }).join('\n');
  }

  /**
   * Render doors
   */
  private renderDoors(doors: Door[]): string {
    return doors.map(door => {
      const { start, end } = door;
      return `<line x1="${start.x}" y1="${start.y}" 
                    x2="${end.x}" y2="${end.y}" 
                    marker-end="url(#doorArc)" />`;
    }).join('\n');
  }

  /**
   * Render windows
   */
  private renderWindows(windows: Window[]): string {
    return windows.map(window => {
      const { start, end } = window;
      return `<line x1="${start.x}" y1="${start.y}" 
                    x2="${end.x}" y2="${end.y}" 
                    stroke-dasharray="5,3" />`;
    }).join('\n');
  }

  /**
   * Render annotations
   */
  private renderAnnotations(annotations: Annotation[]): string {
    return annotations.map(annotation => {
      const { position, content, style } = annotation;
      const x = this.getPositionX(position);
      const y = this.getPositionY(position);
      
      return `<g transform="translate(${x},${y})">
        <text font-size="${style?.fontSize || this.options.fontSize}"
              fill="${style?.color || this.options.colors.annotations}">
          ${this.escapeXml(content)}
        </text>
      </g>`;
    }).join('\n');
  }

  /**
   * Render dimensions
   */
  private renderDimensions(dimensions: Dimension[]): string {
    return dimensions.map(dimension => {
      const { start, end, value, unit } = dimension;
      const startX = this.getPositionX(start);
      const startY = this.getPositionY(start);
      const endX = this.getPositionX(end);
      const endY = this.getPositionY(end);

      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;

      return `<g class="dimension">
        <line x1="${startX}" y1="${startY}" 
              x2="${endX}" y2="${endY}"
              marker-start="url(#arrow)"
              marker-end="url(#arrow)" />
        <text x="${midX}" y="${midY}"
              dy="-5"
              text-anchor="middle"
              font-size="${this.options.fontSize}"
              fill="${this.options.colors.dimensions}">
          ${value}${unit}
        </text>
      </g>`;
    }).join('\n');
  }

  /**
   * Render room labels
   */
  private renderLabels(labels: RoomLabel[]): string {
    return labels.map(label => {
      const { position, text } = label;
      return `<text x="${position.x}" 
                    y="${position.y}"
                    text-anchor="middle"
                    font-size="${this.options.fontSize}"
                    fill="${this.options.colors.labels}">
        ${this.escapeXml(text)}
      </text>`;
    }).join('\n');
  }

  /**
   * Get X coordinate from Point2D or Point3D
   */
  private getPositionX(position: Point2D | Point3D): number {
    return position.x;
  }

  /**
   * Get Y coordinate from Point2D or Point3D
   */
  private getPositionY(position: Point2D | Point3D): number {
    return position.y;
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, c => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }

  /**
   * Update export options
   */
  setOptions(options: SVGExportOptions): void {
    this.options = {
      ...this.options,
      ...options,
      colors: {
        ...this.options.colors,
        ...options.colors
      }
    };
  }

  /**
   * Get current options
   */
  getOptions(): SVGExportOptions {
    return { ...this.options };
  }
}
