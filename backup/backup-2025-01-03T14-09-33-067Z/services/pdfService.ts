import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { performanceMonitor } from '../utils/performance';
import { RoomLayout, DrawingElement } from './roomLayoutService';
import { MoistureReadingData } from '../components/MoistureMappingSystem/MoistureReading';

interface PDFOptions {
  includeReadings?: boolean;
  includeLayout?: boolean;
  includeHistory?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

class PDFService {
  private readonly PAGE_WIDTH = 210; // A4 width in mm
  private readonly PAGE_HEIGHT = 297; // A4 height in mm
  private readonly MARGIN = 20; // margin in mm

  async generatePDF(
    jobNumber: string,
    layout: RoomLayout,
    readings: MoistureReadingData[],
    options: PDFOptions
  ): Promise<Blob> {
    return performanceMonitor.measureAsync('generate_pdf', async () => {
      const doc = new jsPDF();

      // Add header
      this.addHeader(doc, jobNumber);

      // Add layout section if included
      if (options.includeLayout && layout) {
        this.addLayoutSection(doc, layout);
      }

      // Add readings section if included
      if (options.includeReadings && readings.length > 0) {
        this.addReadingsSection(doc, readings);
      }

      // Add history section if included
      if (options.includeHistory && options.dateRange && readings.length > 0) {
        this.addHistorySection(doc, readings, options.dateRange);
      }

      // Add footer
      this.addFooter(doc);

      return doc.output('blob');
    });
  }

  private addHeader(doc: jsPDF, jobNumber: string): void {
    doc.setFontSize(20);
    doc.text('Moisture Mapping Report', this.MARGIN, this.MARGIN);
    
    doc.setFontSize(12);
    doc.text(`Job Number: ${jobNumber}`, this.MARGIN, this.MARGIN + 10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, this.MARGIN, this.MARGIN + 20);
    
    doc.line(this.MARGIN, this.MARGIN + 25, this.PAGE_WIDTH - this.MARGIN, this.MARGIN + 25);
  }

  private addLayoutSection(doc: jsPDF, layout: RoomLayout): void {
    const startY = (doc as any).lastAutoTable?.finalY || this.MARGIN + 35;
    
    doc.setFontSize(16);
    doc.text('Room Layout', this.MARGIN, startY);

    // Create a canvas to draw the layout
    const canvas = document.createElement('canvas');
    canvas.width = layout.width;
    canvas.height = layout.height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Draw layout elements
      layout.elements.forEach(element => {
        ctx.beginPath();
        switch (element.type) {
          case 'wall':
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 4;
            break;
          case 'door':
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 3;
            break;
          case 'window':
            ctx.strokeStyle = '#2196F3';
            ctx.lineWidth = 2;
            break;
          default:
            return;
        }
        ctx.moveTo(element.startPoint.x, element.startPoint.y);
        ctx.lineTo(element.endPoint.x, element.endPoint.y);
        ctx.stroke();
      });

      // Add the layout image to PDF
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = this.PAGE_WIDTH - (this.MARGIN * 2);
      const imgHeight = (layout.height * imgWidth) / layout.width;
      
      doc.addImage(imgData, 'PNG', this.MARGIN, startY + 10, imgWidth, imgHeight);
    }
  }

  private addReadingsSection(doc: jsPDF, readings: MoistureReadingData[]): void {
    const startY = (doc as any).lastAutoTable?.finalY || this.MARGIN + 35;
    
    doc.setFontSize(16);
    doc.text('Current Moisture Readings', this.MARGIN, startY);

    const tableData = readings.map(reading => {
      const lastReading = reading.values[reading.values.length - 1];
      return [
        reading.id,
        `(${reading.position.x.toFixed(1)}, ${reading.position.y.toFixed(1)})`,
        `${lastReading.value.toFixed(1)}%`,
        new Date(lastReading.timestamp).toLocaleString(),
      ];
    });

    (doc as any).autoTable({
      startY: startY + 10,
      head: [['ID', 'Position', 'Value', 'Timestamp']],
      body: tableData,
      margin: { left: this.MARGIN, right: this.MARGIN },
      headStyles: { fillColor: [33, 150, 243] },
    });
  }

  private addHistorySection(
    doc: jsPDF,
    readings: MoistureReadingData[],
    dateRange: { start: Date; end: Date }
  ): void {
    const startY = (doc as any).lastAutoTable?.finalY || this.MARGIN + 35;
    
    doc.setFontSize(16);
    doc.text('Reading History', this.MARGIN, startY);

    const historyData = readings.flatMap(reading =>
      reading.values
        .filter(value => {
          const timestamp = new Date(value.timestamp);
          return timestamp >= dateRange.start && timestamp <= dateRange.end;
        })
        .map(value => [
          reading.id,
          `(${reading.position.x.toFixed(1)}, ${reading.position.y.toFixed(1)})`,
          `${value.value.toFixed(1)}%`,
          new Date(value.timestamp).toLocaleString(),
        ])
    );

    (doc as any).autoTable({
      startY: startY + 10,
      head: [['ID', 'Position', 'Value', 'Timestamp']],
      body: historyData,
      margin: { left: this.MARGIN, right: this.MARGIN },
      headStyles: { fillColor: [33, 150, 243] },
    });
  }

  private addFooter(doc: jsPDF): void {
    const pageCount = doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount}`,
        this.PAGE_WIDTH / 2,
        this.PAGE_HEIGHT - 10,
        { align: 'center' }
      );
    }
  }
}

export const pdfService = new PDFService();
