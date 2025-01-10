import { MoisturePoint, Wall } from '../types/canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface PDFExportOptions {
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

export async function generatePDF(options: PDFExportOptions): Promise<Blob> {
    const {
        canvas,
        readings,
        walls,
        stats,
        metadata = {}
    } = options;

    // Initialize PDF document
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm'
    });

    // Add title
    pdf.setFontSize(20);
    pdf.text(metadata.title || 'Moisture Map Report', 20, 20);

    // Add metadata
    pdf.setFontSize(12);
    let yPos = 35;
    if (metadata.date) {
        pdf.text(`Date: ${metadata.date}`, 20, yPos);
        yPos += 7;
    }
    if (metadata.location) {
        pdf.text(`Location: ${metadata.location}`, 20, yPos);
        yPos += 7;
    }

    // Add moisture map image
    const imageData = canvas.toDataURL('image/png');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const aspectRatio = canvas.width / canvas.height;
    const maxWidth = pageWidth - 40; // 20mm margins on each side
    const maxHeight = 100; // Maximum height for the image
    
    let imgWidth = maxWidth;
    let imgHeight = imgWidth / aspectRatio;
    
    if (imgHeight > maxHeight) {
        imgHeight = maxHeight;
        imgWidth = imgHeight * aspectRatio;
    }

    const xPos = (pageWidth - imgWidth) / 2;
    pdf.addImage(imageData, 'PNG', xPos, yPos, imgWidth, imgHeight);
    yPos += imgHeight + 10;

    // Add statistics if available
    if (stats) {
        pdf.setFontSize(14);
        pdf.text('Statistics', 20, yPos);
        yPos += 7;
        
        pdf.setFontSize(12);
        const statItems = [
            `Average Moisture: ${stats.average.toFixed(1)}%`,
            `Maximum Reading: ${stats.max.toFixed(1)}%`,
            `Minimum Reading: ${stats.min.toFixed(1)}%`,
            `Critical Points: ${stats.criticalCount}`
        ];
        
        statItems.forEach(item => {
            pdf.text(item, 25, yPos);
            yPos += 6;
        });
        yPos += 5;
    }

    // Add readings table
    if (readings.length > 0) {
        pdf.setFontSize(14);
        pdf.text('Moisture Readings', 20, yPos);
        yPos += 7;

        const tableData = readings.map((reading, index) => [
            (index + 1).toString(),
            reading.value.toFixed(1) + '%',
            `(${reading.x.toFixed(0)}, ${reading.y.toFixed(0)})`,
            reading.notes || ''
        ]);

        (pdf as any).autoTable({
            head: [['#', 'Reading', 'Position', 'Notes']],
            body: tableData,
            startY: yPos,
            margin: { left: 20 },
            theme: 'grid',
            headStyles: { fillColor: [66, 135, 245] },
            styles: { fontSize: 10 }
        });
    }

    // Add notes if available
    if (metadata.notes) {
        pdf.addPage();
        pdf.setFontSize(14);
        pdf.text('Notes', 20, 20);
        pdf.setFontSize(12);
        const splitNotes = pdf.splitTextToSize(metadata.notes, pageWidth - 40);
        pdf.text(splitNotes, 20, 30);
    }

    // Return as blob
    return pdf.output('blob');
}

export class PDFExportService {
    private static readonly PAGE_MARGIN = 20;
    private static readonly MAX_IMAGE_HEIGHT = 100;

    public static async downloadPDF(
        blob: Blob,
        filename: string
    ): Promise<void> {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}
