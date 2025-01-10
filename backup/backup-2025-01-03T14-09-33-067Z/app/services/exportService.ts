import { prisma } from '../lib/prisma';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Parser } from 'json2csv';
import type { MoistureMap, MoistureReading } from '../types/moisture';
import type { Template, MaterialType, Prisma } from '@prisma/client';

export class ExportService {
  // Export to CSV
  async exportToCsv(data: any[], fields: string[]): Promise<string> {
    try {
      if (!data || !Array.isArray(data) || !fields || !Array.isArray(fields)) {
        throw new Error('Invalid data format');
      }

      // Create CSV with custom formatting
      const headerRow = fields.join(',');
      if (data.length === 0) {
        throw new Error('Invalid data format');
      }

      // Transform data to ensure consistent string formatting
      const transformedData = data.map(item => {
        const transformed: Record<string, any> = {};
        fields.forEach(field => {
          const value = item[field];
          if (value === null || value === undefined) {
            transformed[field] = '';
          } else if (value instanceof Date) {
            transformed[field] = value.toISOString();
          } else {
            transformed[field] = String(value);
          }
        });
        return transformed;
      });

      const dataRows = transformedData.map(row => {
        return fields.map(field => {
          const value = row[field];
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes(' ') || field === 'notes' || field === 'timestamp') {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',');
      });

      return [headerRow, ...dataRows].join('\n');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  }

  // Export moisture readings to CSV
  async exportMoistureReadingsToCsv(mapId: string): Promise<string> {
    try {
      const readings = await prisma.moistureReading.findMany({
        where: { mapId },
        orderBy: { timestamp: 'asc' },
      });

      const fields = [
        'id',
        'value',
        'materialType',
        'locationX',
        'locationY',
        'notes',
        'timestamp',
      ];

      return this.exportToCsv(readings, fields);
    } catch (error) {
      console.error('Error exporting moisture readings:', error);
      throw error;
    }
  }

  // Export template to JSON
  async exportTemplateToJson(templateId: string): Promise<string> {
    try {
      const template = await prisma.template.findUnique({
        where: { id: templateId },
        include: {
          sections: {
            include: {
              fields: {
                include: {
                  validationRules: true,
                },
              },
            },
          },
        },
      });

      if (!template) {
        throw new Error('Template not found');
      }

      return JSON.stringify(template, null, 2);
    } catch (error) {
      console.error('Error exporting template:', error);
      throw error;
    }
  }

  // Export moisture map to PDF
  async exportMoistureMapToPdf(mapId: string): Promise<Buffer> {
    try {
      const map = await prisma.moistureMap.findUnique({
        where: { id: mapId },
        include: {
          readings: true,
        },
      });

      if (!map) {
        throw new Error('Map not found');
      }

      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Moisture Map Report', 20, 20);

      // Add map details
      doc.setFontSize(12);
      doc.text(`Map ID: ${map.id}`, 20, 40);
      doc.text(`Job ID: ${map.jobId}`, 20, 50);
      doc.text(`Created: ${map.createdAt.toLocaleDateString()}`, 20, 60);

      // Add readings table
      const tableData = map.readings.map(reading => [
        reading.value.toString(),
        reading.materialType,
        `(${reading.locationX}, ${reading.locationY})`,
        reading.timestamp.toLocaleString(),
        reading.notes || '',
      ]);

      doc.autoTable({
        head: [['Value', 'Material', 'Location', 'Timestamp', 'Notes']],
        body: tableData,
        startY: 80,
      });

      // Add layout visualization
      // TODO: Implement layout drawing

      return Buffer.from(doc.output('arraybuffer'));
    } catch (error) {
      console.error('Error exporting moisture map:', error);
      throw error;
    }
  }

  // Import template from JSON
  async importTemplateFromJson(jsonString: string): Promise<Template> {
    try {
      const data = JSON.parse(jsonString);
      
      // Remove IDs and timestamps for clean import
      const { id, createdAt, updatedAt, ...templateData } = data;
      templateData.sections = templateData.sections.map((section: any) => {
        const { id, createdAt, updatedAt, templateId, ...sectionData } = section;
        sectionData.fields = section.fields.map((field: any) => {
          const { id, createdAt, updatedAt, sectionId, ...fieldData } = field;
          fieldData.validationRules = field.validationRules?.map((rule: any) => {
            const { id, createdAt, updatedAt, fieldId, ...ruleData } = rule;
            return ruleData;
          });
          return fieldData;
        });
        return sectionData;
      });

      return prisma.template.create({
        data: templateData,
        include: {
          sections: {
            include: {
              fields: {
                include: {
                  validationRules: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error('Error importing template:', error);
      throw error;
    }
  }

  // Import moisture readings from CSV
  async importMoistureReadingsFromCsv(mapId: string, csvString: string): Promise<MoistureReading[]> {
    try {
      // Verify map exists
      const map = await prisma.moistureMap.findUnique({
        where: { id: mapId },
      });

      if (!map) {
        throw new Error('Map not found');
      }

      // Parse CSV
      const rows = csvString.split('\n').slice(1); // Skip header
      const readings: Prisma.MoistureReadingCreateInput[] = rows.map(row => {
        const [value, materialType, locationX, locationY, notes, timestamp] = row.split(',');
        return {
          map: { connect: { id: mapId } },
          value: parseFloat(value),
          materialType: materialType as MaterialType,
          locationX: parseInt(locationX),
          locationY: parseInt(locationY),
          notes: notes || undefined,
          timestamp: new Date(timestamp),
        };
      });

      // Insert readings
      const createdReadings = await prisma.$transaction(
        readings.map(reading =>
          prisma.moistureReading.create({
            data: reading,
          })
        )
      );

      // Convert to MoistureReading type
      return createdReadings.map(reading => ({
        id: reading.id,
        mapId: reading.mapId,
        value: reading.value,
        materialType: reading.materialType,
        location: { x: reading.locationX, y: reading.locationY },
        notes: reading.notes || undefined,
        timestamp: reading.timestamp.toISOString(),
        createdAt: reading.createdAt,
        updatedAt: reading.updatedAt,
      }));
    } catch (error) {
      console.error('Error importing moisture readings:', error);
      throw error;
    }
  }
}

export const exportService = new ExportService();
