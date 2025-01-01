'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import TurndownService from 'turndown';
import { useExportOptimizer } from './ExportOptimizer';

type ExportFormat = 'pdf' | 'html' | 'markdown';

interface ExportOptions {
  format: ExportFormat;
  includeAssets: boolean;
  optimizeAssets: boolean;
  applyBranding: boolean;
}

interface ExportResult {
  url: string;
  format: ExportFormat;
  optimizedUrls: string[];
  optimizationStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  optimizationError?: string;
}

interface ExportManagerProps {
  content: React.ReactNode;
  title: string;
  onExportComplete?: (result: ExportResult) => void;
  onError?: (error: Error) => void;
}

// Type definitions for export functions
// Improved type definitions for better type safety
type ExportFunction = (element: HTMLElement) => Promise<ExportResult>;
type OptimizationStatus = ExportResult['optimizationStatus'];
type CleanupFunction = (urls: string[]) => void;

export default function ExportManager({
  content,
  title,
  onExportComplete,
  onError
}: ExportManagerProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [optimizedUrls, setOptimizedUrls] = useState<string[]>([]);
  const [optimizationStatus, setOptimizationStatus] = useState<OptimizationStatus>('pending');
  const [optimizationError, setOptimizationError] = useState<string | null>(null);
  const { optimizeImage } = useExportOptimizer();
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeAssets: true,
    optimizeAssets: true,
    applyBranding: true
  });

  // Cleanup optimized URLs when component unmounts
  useEffect(() => {
    return () => {
      optimizedUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [optimizedUrls]);

  // Cleanup function for URLs
  const cleanupUrls = useCallback((urls: string[]) => {
    urls.forEach(url => {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        console.warn('Failed to revoke URL:', url, error);
      }
    });
  }, []);

  // Cleanup URLs when component unmounts or URLs change
  useEffect(() => {
    return () => cleanupUrls(optimizedUrls);
  }, [optimizedUrls, cleanupUrls]);

  const optimizeImages = async (element: HTMLElement): Promise<string[]> => {
    const newOptimizedUrls: string[] = [];
    const images = element.getElementsByTagName('img');
    
    if (images.length === 0) {
      setOptimizationStatus('completed');
      return newOptimizedUrls;
    }
    
    setOptimizationStatus('processing');

    let hasError = false;
    let errorMessage: string | undefined;

    try {
      for (const img of Array.from(images)) {
        try {
          const optimizedUrl = await optimizeImage(img.src);
          img.src = optimizedUrl;
          newOptimizedUrls.push(optimizedUrl);
        } catch (error) {
          hasError = true;
          const errorMsg = error instanceof Error ? error.message : 'Image optimization failed';
          setOptimizationError(errorMsg);
          setOptimizationStatus('failed');
          console.error(`Failed to optimize image: ${img.src}`, error);
          cleanupUrls(newOptimizedUrls);
          newOptimizedUrls.length = 0;
          break;
        }
      }

      if (!hasError) {
        setOptimizedUrls(prev => {
          // Cleanup old URLs
          cleanupUrls(prev);
          return newOptimizedUrls;
        });
      } else if (errorMessage) {
        throw new Error(`Image optimization failed: ${errorMessage}`);
      }

      return newOptimizedUrls;
    } catch (error) {
      cleanupUrls(newOptimizedUrls);
      throw error;
    }
  };

  const exportToPDF = async (element: HTMLElement): Promise<ExportResult> => {
    try {
      if (options.optimizeAssets) {
        await optimizeImages(element);
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      } as any);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Set completed status only if optimization was enabled and successful
      if (options.optimizeAssets) {
        setOptimizationStatus('completed');
      }

      const result: ExportResult = {
        url: pdfUrl,
        format: 'pdf',
        optimizedUrls,
        optimizationStatus: options.optimizeAssets ? optimizationStatus : undefined
      };
      onExportComplete?.(result);
      return result;
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  };

  const exportToHTML = async (element: HTMLElement): Promise<ExportResult> => {
    try {
      const clone = element.cloneNode(true) as HTMLElement;
      
      if (options.optimizeAssets) {
        await optimizeImages(clone);
      }
      const styles = Array.from(document.styleSheets)
        .map(sheet => {
          try {
            return Array.from(sheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          } catch {
            return '';
          }
        })
        .join('\n');

      const styleElement = document.createElement('style');
      styleElement.textContent = styles;
      clone.insertBefore(styleElement, clone.firstChild);

      const htmlBlob = new Blob([clone.outerHTML], { type: 'text/html' });
      const htmlUrl = URL.createObjectURL(htmlBlob);

      // Set completed status only if optimization was enabled and successful
      if (options.optimizeAssets) {
        setOptimizationStatus('completed');
      }

      const result: ExportResult = {
        url: htmlUrl,
        format: 'html',
        optimizedUrls,
        optimizationStatus: options.optimizeAssets ? optimizationStatus : undefined
      };
      onExportComplete?.(result);
      return result;
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  };

  const exportToMarkdown = async (element: HTMLElement): Promise<ExportResult> => {
    try {
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced'
      });

      const markdown = turndownService.turndown(element.innerHTML);
      const markdownBlob = new Blob([markdown], { type: 'text/markdown' });
      const markdownUrl = URL.createObjectURL(markdownBlob);

      const result: ExportResult = {
        url: markdownUrl,
        format: 'markdown',
        optimizedUrls: [],
        optimizationStatus: options.optimizeAssets ? optimizationStatus : undefined
      };
      onExportComplete?.(result);
      return result;
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  };

  const handleExportError = (error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'Export failed';
    console.error('Export failed:', error);
    // Cleanup on export failure
    cleanupUrls(optimizedUrls);
    setOptimizedUrls([]);
    setOptimizationStatus('failed');
    setOptimizationError(errorMessage);
    onError?.(error instanceof Error ? error : new Error(errorMessage));
  };

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    let result: ExportResult | undefined;
    
    try {
      const element = document.getElementById('export-content');
      if (!element) {
        throw new Error('Export content element not found');
      }

      // Reset states when starting new export
      setOptimizedUrls([]);
      setOptimizationStatus('pending');
      setOptimizationError(null);
      
      switch (options.format) {
        case 'pdf':
          result = await exportToPDF(element);
          break;
        case 'html':
          result = await exportToHTML(element);
          break;
        case 'markdown':
          result = await exportToMarkdown(element);
          break;
        default:
          throw new Error(`Unsupported format: ${options.format}`);
      }
    } catch (error) {
      handleExportError(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <select
          value={options.format}
          onChange={(e) => {
            // Cleanup URLs when format changes
            cleanupUrls(optimizedUrls);
            setOptimizedUrls([]);
            setOptions({ ...options, format: e.target.value as ExportOptions['format'] });
          }}
          className="px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="pdf">PDF</option>
          <option value="html">HTML</option>
          <option value="markdown">Markdown</option>
        </select>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={options.includeAssets}
            onChange={(e) => setOptions({ ...options, includeAssets: e.target.checked })}
            className="rounded dark:bg-gray-800"
          />
          <span>Include Assets</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={options.optimizeAssets}
          onChange={(e) => {
            setOptions({ ...options, optimizeAssets: e.target.checked });
            if (!e.target.checked) {
              // Cleanup when optimization is disabled
              cleanupUrls(optimizedUrls);
              setOptimizedUrls([]);
              setOptimizationStatus('pending');
              setOptimizationError(null);
            }
          }}
            className="rounded dark:bg-gray-800"
          />
          <span>Optimize Assets</span>
          {options.optimizeAssets && optimizationStatus && (
            <span className={`ml-2 text-sm ${
              optimizationStatus === 'completed' ? 'text-green-600' :
              optimizationStatus === 'processing' ? 'text-blue-600' :
              optimizationStatus === 'failed' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              ({optimizationStatus})
              {optimizationError && optimizationStatus === 'failed' && (
                <span className="ml-1">- {optimizationError}</span>
              )}
            </span>
          )}
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={options.applyBranding}
            onChange={(e) => setOptions({ ...options, applyBranding: e.target.checked })}
            className="rounded dark:bg-gray-800"
          />
          <span>Apply Branding</span>
        </label>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isExporting ? 'Exporting...' : 'Export'}
        </button>
      </div>

      <div id="export-content" className="mt-4">
        {content}
      </div>
    </div>
  );
}
