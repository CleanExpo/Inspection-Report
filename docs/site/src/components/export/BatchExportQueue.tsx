'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useExportOptimizer } from './ExportOptimizer';

interface ExportItem {
  id: string;
  title: string;
  content: React.ReactNode;
  format: 'pdf' | 'html' | 'markdown';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  url?: string;
  error?: string;
}

interface BatchExportResult extends ExportItem {
  optimizedUrls: string[]; // Track optimized image URLs for cleanup
  optimizationStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  optimizationError?: string;
}

// Type definitions for export functions
type ExportFunction = (element: HTMLElement) => Promise<string>;
interface ExportFunctions {
  pdf: ExportFunction;
  html: ExportFunction;
  markdown: ExportFunction;
}

interface BatchExportQueueProps {
  items: Omit<ExportItem, 'status' | 'url' | 'error'>[];
  onComplete?: (results: BatchExportResult[]) => void;
  onError?: (error: Error) => void;
}

export default function BatchExportQueue({
  items,
  onComplete,
  onError
}: BatchExportQueueProps) {
  const [queue, setQueue] = useState<BatchExportResult[]>(
    items.map(item => ({ ...item, status: 'pending', optimizedUrls: [] }))
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const { optimizeImage } = useExportOptimizer();

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

  // Cleanup URLs when component unmounts or queue changes
  useEffect(() => {
    const currentUrls = new Set<string>();
    
    // Track current URLs
    queue.forEach(item => {
      item.optimizedUrls?.forEach(url => currentUrls.add(url));
      if (item.url) currentUrls.add(item.url);
    });

    // Cleanup function
    return () => {
      currentUrls.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          console.warn('Failed to revoke URL:', url, error);
        }
      });
    };
  }, [queue]);

  const updateItemStatus = useCallback((id: string, updates: Partial<BatchExportResult>) => {
    setQueue(currentQueue =>
      currentQueue.map(item => {
        if (item.id !== id) return item;
        
        // Cleanup old URLs if they're being replaced
        if (updates.optimizedUrls) {
          cleanupUrls(item.optimizedUrls || []);
        }
        if (updates.url && item.url) {
          URL.revokeObjectURL(item.url);
        }
        
        return { ...item, ...updates };
      })
    );
  }, [cleanupUrls]);

  const optimizeImages = useCallback(async (element: HTMLElement, itemId: string): Promise<string[]> => {
    const optimizedUrls: string[] = [];
    const images = element.getElementsByTagName('img');
    
    if (images.length > 0) {
      updateItemStatus(itemId, { optimizationStatus: 'processing' });
    }
    
    for (const img of Array.from(images)) {
      try {
        const optimizedUrl = await optimizeImage(img.src);
        img.src = optimizedUrl;
        optimizedUrls.push(optimizedUrl);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Image optimization failed';
        updateItemStatus(itemId, { 
          optimizationStatus: 'failed',
          optimizationError: errorMessage
        });
        console.error(`Failed to optimize image: ${img.src}`, error);
      }
    }
    
    if (images.length > 0) {
      updateItemStatus(itemId, { 
        optimizationStatus: 'completed',
        optimizationError: undefined
      });
    }
    
    return optimizedUrls;
  }, [optimizeImage, updateItemStatus]);

  const processQueue = async (): Promise<void> => {
    if (isProcessing) return;
    setIsProcessing(true);

    const results: BatchExportResult[] = [];
    let hasErrors = false;

    for (const item of queue) {
      if (item.status !== 'pending') continue;

      try {
        // Reset any previous errors
        updateItemStatus(item.id, { 
          error: undefined, 
          optimizationError: undefined 
        });
        updateItemStatus(item.id, { status: 'processing' });

        // Create a container for the content
        const container = document.createElement('div');
        container.id = `export-content-${item.id}`;
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        document.body.appendChild(container);

        // Render content into container
        const root = document.createElement('div');
        root.appendChild(container);
        
        // Process export based on format
        let url: string;
        let optimizedUrls: string[] = [];

        switch (item.format) {
          case 'pdf':
            optimizedUrls = await optimizeImages(container, item.id);
            url = await exportToPDF(container);
            break;
          case 'html':
            optimizedUrls = await optimizeImages(container, item.id);
            url = await exportToHTML(container);
            break;
          case 'markdown':
            url = await exportToMarkdown(container);
            break;
          default:
            throw new Error(`Unsupported format: ${item.format}`);
        }

        // Cleanup
        document.body.removeChild(container);

        const result: BatchExportResult = {
          ...item,
          status: 'completed',
          url,
          optimizedUrls
        };

        updateItemStatus(item.id, result);
        results.push(result);
      } catch (error) {
        hasErrors = true;
        const errorMessage = error instanceof Error ? error.message : 'Export failed';
        console.error(`Export failed for ${item.title}:`, error);
        
        const failedResult: BatchExportResult = {
          ...item,
          status: 'failed',
          error: errorMessage,
          optimizedUrls: [] // Reset optimized URLs on failure
        };
        
        updateItemStatus(item.id, failedResult);
        results.push(failedResult);
        
        // Notify through onError callback
        onError?.(error instanceof Error ? error : new Error(errorMessage));
      }
    }

    setIsProcessing(false);
    
    // Only call onComplete if there were no errors
    if (!hasErrors) {
      onComplete?.(results);
    }
  };

const exportToPDF: ExportFunction = async (element: HTMLElement): Promise<string> => {
    const { default: html2canvas } = await import('html2canvas');
    const jsPDF = (await import('jspdf')).default;

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
    return URL.createObjectURL(pdfBlob);
  };

const exportToHTML: ExportFunction = async (element: HTMLElement): Promise<string> => {
    const clone = element.cloneNode(true) as HTMLElement;
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
    return URL.createObjectURL(htmlBlob);
  };

const exportToMarkdown: ExportFunction = async (element: HTMLElement): Promise<string> => {
    const { default: TurndownService } = await import('turndown');
    
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    });

    const markdown = turndownService.turndown(element.innerHTML);
    const markdownBlob = new Blob([markdown], { type: 'text/markdown' });
    return URL.createObjectURL(markdownBlob);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Batch Export Queue</h2>
        <button
          onClick={processQueue}
          disabled={isProcessing || queue.every(item => item.status !== 'pending')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Start Export'}
        </button>
      </div>

      <div className="space-y-2">
        {queue.map(item => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 border rounded-md dark:border-gray-700"
          >
            <div className="flex items-center space-x-4">
              <span className="font-medium">{item.title}</span>
              <span className="text-sm text-gray-500">{item.format}</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-sm rounded-full ${
                      item.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : item.status === 'failed'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : item.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}
                  >
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>

                  {item.optimizationStatus && item.optimizationStatus !== 'pending' && (
                    <span
                      className={`px-2 py-1 text-sm rounded-full ${
                        item.optimizationStatus === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : item.optimizationStatus === 'failed'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}
                    >
                      {`Images ${item.optimizationStatus}`}
                    </span>
                  )}
                </div>

                {item.url && (
                  <a
                    href={item.url}
                    download={`${item.title}.${item.format}`}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Download
                  </a>
                )}

                {(item.error || item.optimizationError) && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {item.error && <div>{item.error}</div>}
                    {item.optimizationError && (
                      <div>Image optimization: {item.optimizationError}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
