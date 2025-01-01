import React, { useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Button, Box } from '@mui/material';
import { SaveAlt } from '@mui/icons-material';
import { ExportTheme, generateThemeStyles } from './ExportTheme';

interface PDFExportProps {
  contentRef: React.RefObject<HTMLElement>;
  filename?: string;
  paperSize?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  theme: ExportTheme;
}

export const PDFExport: React.FC<PDFExportProps> = ({
  contentRef,
  filename = 'inspection-report.pdf',
  paperSize = 'a4',
  orientation = 'portrait',
  theme,
}) => {
  const styleSheetRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    // Create and inject theme styles
    if (!styleSheetRef.current) {
      styleSheetRef.current = document.createElement('style');
      document.head.appendChild(styleSheetRef.current);
    }

    // Update theme styles
    styleSheetRef.current.textContent = generateThemeStyles(theme);

    // Cleanup
    return () => {
      if (styleSheetRef.current) {
        document.head.removeChild(styleSheetRef.current);
        styleSheetRef.current = null;
      }
    };
  }, [theme]);

  const generatePDF = async () => {
    if (!contentRef.current) return;

    try {
      // Create a temporary container with theme styles
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = `${contentRef.current.offsetWidth}px`;
      document.body.appendChild(tempContainer);

      // Clone the content and apply theme
      const clonedContent = contentRef.current.cloneNode(true) as HTMLElement;
      tempContainer.appendChild(clonedContent);

      // Set up high DPI scaling
      const dpr = window.devicePixelRatio || 1;
      const contentWidth = contentRef.current.offsetWidth;
      const contentHeight = contentRef.current.offsetHeight;

      // Apply styles to temporary container
      tempContainer.style.width = `${contentWidth}px`;
      tempContainer.style.margin = '0';
      tempContainer.style.padding = '0';
      tempContainer.style.transform = `scale(${dpr})`;
      tempContainer.style.transformOrigin = 'top left';
      
      // Capture the content as canvas with theme applied
      const canvas = await html2canvas(tempContainer, {
        width: contentWidth * dpr, // Account for DPI scaling
        height: contentHeight * dpr,
        useCORS: true, // Handle cross-origin images
        logging: false,
        background: theme.colors.background,
        allowTaint: true, // Allow cross-origin images
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

      // Create PDF with proper dimensions
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

      // Save the PDF
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<SaveAlt />}
      onClick={generatePDF}
    >
      Export PDF
    </Button>
  );
};

export default PDFExport;
