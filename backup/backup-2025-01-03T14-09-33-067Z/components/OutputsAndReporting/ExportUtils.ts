import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ExportTheme } from './ExportTheme';
import { optimizeContent, optimizeImage } from './ExportOptimization';

interface ExportOptions {
  filename?: string;
  paperSize?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  theme: ExportTheme;
}

export class ExportError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ExportError';
  }
}

export const generatePDF = async (
  contentElement: HTMLElement,
  options: ExportOptions
): Promise<Blob> => {
  const {
    filename = 'export.pdf',
    paperSize = 'a4',
    orientation = 'portrait',
    theme,
  } = options;

  try {
    // Create a temporary container with theme styles
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = `${contentElement.offsetWidth}px`;
    document.body.appendChild(tempContainer);

    // Clone and optimize the content
    const optimizedContent = optimizeContent(contentElement);
    tempContainer.appendChild(optimizedContent);

    // Optimize images
    const images = optimizedContent.getElementsByTagName('img');
    await Promise.all(Array.from(images).map(async (img) => {
      try {
        const optimizedBlob = await optimizeImage(img, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.8,
          format: 'jpeg'
        });
        const optimizedUrl = URL.createObjectURL(optimizedBlob);
        img.src = optimizedUrl;
        // Clean up the URL after the image loads
        img.onload = () => URL.revokeObjectURL(optimizedUrl);
      } catch (err) {
        console.warn(`Failed to optimize image: ${err instanceof Error ? err.message : 'Unknown error'}`);
        // Continue with original image if optimization fails
      }
    }));

    // Set up optimized DPI scaling (cap at 2x for better performance)
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const contentWidth = contentElement.offsetWidth;
    const contentHeight = contentElement.offsetHeight;

    // Apply styles to temporary container
    tempContainer.style.width = `${contentWidth}px`;
    tempContainer.style.margin = '0';
    tempContainer.style.padding = '0';
    tempContainer.style.transform = `scale(${dpr})`;
    tempContainer.style.transformOrigin = 'top left';

    // Remove scripts and unused styles before capture
    const scripts = Array.from(tempContainer.getElementsByTagName('script'));
    scripts.forEach((script: HTMLScriptElement) => script.remove());
    
    const styles = Array.from(tempContainer.getElementsByTagName('style'));
    styles.forEach((style: HTMLStyleElement) => {
      if (!style.getAttribute('data-critical')) {
        style.remove();
      }
    });

    // Capture the content as canvas with optimized settings
    const canvas = await html2canvas(tempContainer, {
      width: contentWidth * dpr,
      height: contentHeight * dpr,
      useCORS: true,
      logging: false,
      background: theme.colors.background,
      allowTaint: true,
      timeout: 15000 // Increased timeout for image loading
    });

    // Clean up
    document.body.removeChild(tempContainer);

    // PDF dimensions based on paper size
    const dimensions = {
      a4: { width: 210, height: 297 },
      letter: { width: 215.9, height: 279.4 },
    };

    const selectedSize = dimensions[paperSize];
    const pdfWidth = orientation === 'portrait' ? selectedSize.width : selectedSize.height;
    const pdfHeight = orientation === 'portrait' ? selectedSize.height : selectedSize.width;

    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: paperSize,
    });

    // Calculate dimensions to maintain aspect ratio
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add the captured content to PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Return as blob
    return pdf.output('blob');
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error occurred');
    throw new ExportError(`Failed to generate PDF: ${error.message}`, error);
  }
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateFilename = (
  baseFilename: string,
  extension: string,
  version?: string
): string => {
  const date = new Date().toISOString().split('T')[0];
  const versionSuffix = version ? `-v${version}` : '';
  return `${baseFilename}${versionSuffix}-${date}.${extension}`;
};
