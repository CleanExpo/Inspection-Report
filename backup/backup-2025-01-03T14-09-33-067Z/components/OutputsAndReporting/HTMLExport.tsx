import React from 'react';
import { Button } from '@mui/material';
import { Code } from '@mui/icons-material';
import JSZip from 'jszip';

interface HTMLExportProps {
  contentRef: React.RefObject<HTMLElement>;
  filename?: string;
  includeAssets?: boolean;
  customStyles?: string;
}

export const HTMLExport: React.FC<HTMLExportProps> = ({
  contentRef,
  filename = 'inspection-report',
  includeAssets = true,
  customStyles = '',
}) => {
  const generateHTML = async () => {
    if (!contentRef.current) return;

    try {
      // Create a new ZIP archive
      const zip = new JSZip();

      // Clone the content to avoid modifying the original
      const contentClone = contentRef.current.cloneNode(true) as HTMLElement;

      // Extract and download images if includeAssets is true
      if (includeAssets) {
        const images = contentClone.getElementsByTagName('img');
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          const imgSrc = img.src;
          
          try {
            const response = await fetch(imgSrc);
            const blob = await response.blob();
            
            // Add image to zip in assets folder
            const imgName = `assets/image-${i + 1}.${blob.type.split('/')[1]}`;
            zip.file(imgName, blob);
            
            // Update image src to relative path
            img.src = imgName;
          } catch (error) {
            console.error(`Failed to process image ${imgSrc}:`, error);
          }
        }
      }

      // Generate HTML content
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename}</title>
    <style>
        /* Base styles */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.5;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        img {
            max-width: 100%;
            height: auto;
        }
        /* Tailwind-like utility classes */
        .mb-8 { margin-bottom: 2rem; }
        .font-bold { font-weight: bold; }
        .text-2xl { font-size: 1.5rem; }
        .text-xl { font-size: 1.25rem; }
        .text-lg { font-size: 1.125rem; }
        .text-gray-600 { color: #718096; }
        .grid { display: grid; }
        .gap-8 { gap: 2rem; }
        .p-4 { padding: 1rem; }
        .rounded { border-radius: 0.25rem; }
        .shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); }
        ${customStyles}
    </style>
</head>
<body>
    ${contentClone.outerHTML}
</body>
</html>`;

      // Add HTML file to zip
      zip.file('index.html', htmlContent);

      // Generate and download zip
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${filename}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error generating HTML:', error);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<Code />}
      onClick={generateHTML}
    >
      Export HTML
    </Button>
  );
};

export default HTMLExport;
