import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { VoiceNote, PhotoAttachment } from '../types/voice';

interface ExportOptions {
  title?: string;
  includePhotos?: boolean;
  includeAnalysis?: boolean;
  format?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
}

async function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

async function addPhotoToPDF(
  doc: jsPDF,
  photo: PhotoAttachment,
  y: number,
  maxWidth: number,
  maxHeight: number
): Promise<number> {
  try {
    const img = await loadImage(photo.dataUrl);
    const aspectRatio = img.width / img.height;
    
    let width = maxWidth;
    let height = width / aspectRatio;
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    const x = (doc.internal.pageSize.width - width) / 2;
    doc.addImage(photo.dataUrl, 'JPEG', x, y, width, height);

    if (photo.caption) {
      doc.setFontSize(10);
      doc.text(photo.caption, x, y + height + 5, { maxWidth });
      return height + 15;
    }

    return height + 10;
  } catch (error) {
    console.error('Failed to add photo to PDF:', error);
    return 0;
  }
}

export async function exportToPDF(
  notes: VoiceNote[],
  options: ExportOptions = {}
): Promise<Blob> {
  const {
    title = 'Inspection Report',
    includePhotos = true,
    includeAnalysis = true,
    format = 'A4',
    orientation = 'portrait'
  } = options;

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format
  });

  // Add title
  doc.setFontSize(20);
  doc.text(title, 20, 20);
  doc.setFontSize(12);
  doc.text(new Date().toLocaleDateString(), 20, 30);

  let yPos = 40;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Add notes
  for (const note of notes) {
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPos = 20;
    }

    // Add note header
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    const timestamp = new Date(note.timestamp).toLocaleString();
    doc.text(`${note.type.toUpperCase()} - ${timestamp}`, margin, yPos);
    yPos += 10;

    // Add note content
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(note.text, contentWidth);
    doc.text(splitText, margin, yPos);
    yPos += (splitText.length * 7);

    // Add metadata
    if (note.metadata) {
      yPos += 5;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const metadataText = Object.entries(note.metadata)
        .filter(([key, value]) => value && key !== 'aiProcessed')
        .map(([key, value]) => `${key}: ${value}`)
        .join(' | ');
      doc.text(metadataText, margin, yPos);
      yPos += 10;
    }

    // Add AI analysis
    if (includeAnalysis && note.metadata?.aiProcessed) {
      if (note.keyFindings?.length) {
        yPos += 5;
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 150);
        doc.text('Key Findings:', margin, yPos);
        yPos += 5;
        doc.setFontSize(10);
        note.keyFindings.forEach(finding => {
          const splitFinding = doc.splitTextToSize(`• ${finding}`, contentWidth - 10);
          doc.text(splitFinding, margin + 5, yPos);
          yPos += (splitFinding.length * 5);
        });
      }

      if (note.criticalIssues?.length) {
        yPos += 5;
        doc.setFontSize(11);
        doc.setTextColor(150, 0, 0);
        doc.text('Critical Issues:', margin, yPos);
        yPos += 5;
        doc.setFontSize(10);
        note.criticalIssues.forEach(issue => {
          const splitIssue = doc.splitTextToSize(`• ${issue}`, contentWidth - 10);
          doc.text(splitIssue, margin + 5, yPos);
          yPos += (splitIssue.length * 5);
        });
      }

      if (note.nextSteps?.length) {
        yPos += 5;
        doc.setFontSize(11);
        doc.setTextColor(0, 100, 0);
        doc.text('Next Steps:', margin, yPos);
        yPos += 5;
        doc.setFontSize(10);
        note.nextSteps.forEach(step => {
          const splitStep = doc.splitTextToSize(`• ${step}`, contentWidth - 10);
          doc.text(splitStep, margin + 5, yPos);
          yPos += (splitStep.length * 5);
        });
      }
    }

    // Add photos
    if (includePhotos && note.photos?.length) {
      for (const photo of note.photos) {
        // Check if we need a new page
        if (yPos > doc.internal.pageSize.height - 100) {
          doc.addPage();
          yPos = 20;
        }

        const photoHeight = await addPhotoToPDF(
          doc,
          photo,
          yPos,
          contentWidth,
          120
        );
        yPos += photoHeight;
      }
    }

    yPos += 20;
  }

  return doc.output('blob');
}

export function downloadPDF(blob: Blob, filename: string = 'inspection-report.pdf'): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
