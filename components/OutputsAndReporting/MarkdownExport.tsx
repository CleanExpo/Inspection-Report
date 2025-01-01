import React from 'react';
import { Button } from '@mui/material';
import { Description } from '@mui/icons-material';
import TurndownService from 'turndown';
import JSZip from 'jszip';

interface MarkdownExportProps {
  contentRef: React.RefObject<HTMLElement>;
  filename?: string;
  includeAssets?: boolean;
}

export const MarkdownExport: React.FC<MarkdownExportProps> = ({
  contentRef,
  filename = 'inspection-report',
  includeAssets = true,
}) => {
  const generateMarkdown = async () => {
    if (!contentRef.current) return;

    try {
      // Create a new ZIP archive
      const zip = new JSZip();
      
      // Clone the content to avoid modifying the original
      const contentClone = contentRef.current.cloneNode(true) as HTMLElement;
      
      // Initialize Turndown with custom options
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
        emDelimiter: '_',
        bulletListMarker: '-',
      });

      // Custom rule for handling images
      turndownService.addRule('images', {
        filter: ['img'],
        replacement: function (content, node) {
          const img = node as HTMLImageElement;
          const alt = img.alt || '';
          const src = img.getAttribute('data-markdown-src') || img.src;
          return `![${alt}](${src})`;
        }
      });

      // Process images if includeAssets is true
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
            
            // Update image src in the clone to use relative path
            img.setAttribute('data-markdown-src', imgName);
          } catch (error) {
            console.error(`Failed to process image ${imgSrc}:`, error);
          }
        }
      }

      // Convert HTML to Markdown
      const markdown = turndownService.turndown(contentClone);

      // Add README with metadata
      const readme = `# ${filename}

This report was exported as Markdown on ${new Date().toLocaleString()}.

## Structure
- \`README.md\`: This file
- \`report.md\`: The main report content
- \`assets/\`: Directory containing images and other media

## Usage
The report can be viewed in any Markdown reader. Images are referenced relatively
and should work as long as the assets directory structure is maintained.
`;

      // Add files to zip
      zip.file('README.md', readme);
      zip.file('report.md', markdown);

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
      console.error('Error generating Markdown:', error);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<Description />}
      onClick={generateMarkdown}
    >
      Export Markdown
    </Button>
  );
};

export default MarkdownExport;
