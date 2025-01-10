import { performanceMonitor } from '../utils/performance';
import { DatabaseError, ValidationError } from '../utils/errors';
import { RoomLayout } from './roomLayoutService';
import { MoistureReadingData } from '../components/MoistureMappingSystem/MoistureReading';
import { pdfService } from './pdfService';

export type ExportFormat = 'csv' | 'pdf' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  includeReadings?: boolean;
  includeLayout?: boolean;
  includeHistory?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

interface ExportMetadata {
  timestamp: string;
  jobNumber: string;
  format: ExportFormat;
  version: string;
  options: ExportOptions;
}

export interface ExportData {
  metadata: ExportMetadata;
  layout?: RoomLayout;
  readings?: MoistureReadingData[];
  history?: {
    readings: MoistureReadingData[];
    timestamps: string[];
  };
}

class ExportService {
  private readonly VERSION = '1.0.0';

  async exportData(jobNumber: string, options: ExportOptions): Promise<Blob> {
    return performanceMonitor.measureAsync('export_data', async () => {
      try {
        // Validate options
        this.validateOptions(options);

        // Prepare export data
        const data = await this.prepareExportData(jobNumber, options);

        // Generate export file based on format
        switch (options.format) {
          case 'csv':
            return this.generateCSV(data);
          case 'pdf':
            return this.generatePDF(data);
          case 'json':
            return this.generateJSON(data);
          default:
            throw new ValidationError(`Unsupported export format: ${options.format}`);
        }
      } catch (error) {
        console.error('Export failed:', error);
        throw error;
      }
    });
  }

  private validateOptions(options: ExportOptions): void {
    if (!options.format) {
      throw new ValidationError('Export format is required');
    }

    if (!['csv', 'pdf', 'json'].includes(options.format)) {
      throw new ValidationError(`Invalid export format: ${options.format}`);
    }

    if (options.dateRange) {
      const { start, end } = options.dateRange;
      if (!(start instanceof Date) || !(end instanceof Date)) {
        throw new ValidationError('Invalid date range');
      }
      if (start > end) {
        throw new ValidationError('Start date must be before end date');
      }
    }

    if (!options.includeReadings && !options.includeLayout && !options.includeHistory) {
      throw new ValidationError('At least one data type must be included in export');
    }
  }

  private async prepareExportData(jobNumber: string, options: ExportOptions): Promise<ExportData> {
    return performanceMonitor.measureAsync('prepare_export_data', async () => {
      const metadata: ExportMetadata = {
        timestamp: new Date().toISOString(),
        jobNumber,
        format: options.format,
        version: this.VERSION,
        options,
      };

      const data: ExportData = { metadata };

      // TODO: Implement data gathering from respective services
      // This will be implemented when we create the moisture reading service

      return data;
    });
  }

  private async generateCSV(data: ExportData): Promise<Blob> {
    return performanceMonitor.measureAsync('generate_csv', async () => {
      // Convert data to CSV format
      const csvRows: string[] = [];

      // Add metadata
      csvRows.push('# Export Metadata');
      csvRows.push(`Job Number,${data.metadata.jobNumber}`);
      csvRows.push(`Timestamp,${data.metadata.timestamp}`);
      csvRows.push(`Version,${data.metadata.version}`);
      csvRows.push('');

      // Add layout data if present
      if (data.layout) {
        csvRows.push('# Room Layout');
        csvRows.push('Type,Start X,Start Y,End X,End Y,ID');
        data.layout.elements.forEach(element => {
          csvRows.push(
            `${element.type},${element.startPoint.x},${element.startPoint.y},${element.endPoint.x},${element.endPoint.y},${element.id}`
          );
        });
        csvRows.push('');
      }

      // Add readings if present
      if (data.readings) {
        csvRows.push('# Moisture Readings');
        csvRows.push('ID,Position X,Position Y,Value,Timestamp');
        data.readings.forEach(reading => {
          const lastValue = reading.values[reading.values.length - 1];
          csvRows.push(
            `${reading.id},${reading.position.x},${reading.position.y},${lastValue.value},${lastValue.timestamp}`
          );
        });
      }

      // Convert to blob
      const csvContent = csvRows.join('\n');
      return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    });
  }

  private async generatePDF(data: ExportData): Promise<Blob> {
    return performanceMonitor.measureAsync('generate_pdf', async () => {
      if (!data.layout && data.metadata.options.includeLayout) {
        throw new ValidationError('Layout data is required for PDF export');
      }

      if (!data.readings && data.metadata.options.includeReadings) {
        throw new ValidationError('Reading data is required for PDF export');
      }

      return pdfService.generatePDF(
        data.metadata.jobNumber,
        data.layout!,
        data.readings || [],
        data.metadata.options
      );
    });
  }

  private async generateJSON(data: ExportData): Promise<Blob> {
    return performanceMonitor.measureAsync('generate_json', async () => {
      const jsonContent = JSON.stringify(data, null, 2);
      return new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    });
  }

  async validateImportData(file: File): Promise<boolean> {
    return performanceMonitor.measureAsync('validate_import', async () => {
      try {
        const content = await file.text();
        const data = JSON.parse(content);

        // Validate metadata
        if (!data.metadata) {
          throw new ValidationError('Invalid import file: missing metadata');
        }

        if (data.metadata.version !== this.VERSION) {
          throw new ValidationError(`Unsupported version: ${data.metadata.version}`);
        }

        // Validate layout if present
        if (data.layout) {
          this.validateLayout(data.layout);
        }

        // Validate readings if present
        if (data.readings) {
          this.validateReadings(data.readings);
        }

        return true;
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error;
        }
        throw new ValidationError('Invalid import file format');
      }
    });
  }

  private validateLayout(layout: RoomLayout): void {
    if (!layout.id || !layout.jobNumber || !Array.isArray(layout.elements)) {
      throw new ValidationError('Invalid layout data structure');
    }

    layout.elements.forEach((element, index) => {
      if (!element.type || !element.id || !element.startPoint || !element.endPoint) {
        throw new ValidationError(`Invalid layout element at index ${index}`);
      }
    });
  }

  private validateReadings(readings: MoistureReadingData[]): void {
    if (!Array.isArray(readings)) {
      throw new ValidationError('Invalid readings data structure');
    }

    readings.forEach((reading, index) => {
      if (!reading.id || !reading.position || !Array.isArray(reading.values)) {
        throw new ValidationError(`Invalid reading at index ${index}`);
      }

      reading.values.forEach((value, vIndex) => {
        if (typeof value.value !== 'number' || !value.timestamp) {
          throw new ValidationError(`Invalid reading value at index ${index}.${vIndex}`);
        }
      });
    });
  }

  async importData(file: File, jobNumber: string): Promise<void> {
    return performanceMonitor.measureAsync('import_data', async () => {
      try {
        // First validate the import file
        await this.validateImportData(file);

        // Parse the file content
        const content = await file.text();
        const data: ExportData = JSON.parse(content);

        // Verify job number matches
        if (data.metadata.jobNumber !== jobNumber) {
          throw new ValidationError(
            'Job number in import file does not match current job'
          );
        }

        // Import layout if present
        if (data.layout) {
          await this.importLayout(data.layout, jobNumber);
        }

        // Import readings if present
        if (data.readings) {
          await this.importReadings(data.readings, jobNumber);
        }

        // Import history if present
        if (data.history) {
          await this.importHistory(data.history, jobNumber);
        }
      } catch (error) {
        console.error('Import failed:', error);
        throw error;
      }
    });
  }

  private async importLayout(layout: RoomLayout, jobNumber: string): Promise<void> {
    return performanceMonitor.measureAsync('import_layout', async () => {
      try {
        const response = await fetch(`/api/moisture/${jobNumber}/layout`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(layout),
        });

        if (!response.ok) {
          throw new DatabaseError('Failed to import layout data');
        }
      } catch (error) {
        console.error('Layout import failed:', error);
        throw new DatabaseError('Failed to import layout data');
      }
    });
  }

  private async importReadings(
    readings: MoistureReadingData[],
    jobNumber: string
  ): Promise<void> {
    return performanceMonitor.measureAsync('import_readings', async () => {
      try {
        const response = await fetch(`/api/moisture/${jobNumber}/readings`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(readings),
        });

        if (!response.ok) {
          throw new DatabaseError('Failed to import readings data');
        }
      } catch (error) {
        console.error('Readings import failed:', error);
        throw new DatabaseError('Failed to import readings data');
      }
    });
  }

  private async importHistory(
    history: ExportData['history'],
    jobNumber: string
  ): Promise<void> {
    return performanceMonitor.measureAsync('import_history', async () => {
      try {
        const response = await fetch(`/api/moisture/${jobNumber}/history`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(history),
        });

        if (!response.ok) {
          throw new DatabaseError('Failed to import history data');
        }
      } catch (error) {
        console.error('History import failed:', error);
        throw new DatabaseError('Failed to import history data');
      }
    });
  }
}

export const exportService = new ExportService();
