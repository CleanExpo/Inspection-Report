'use client';

import React, { useState } from 'react';
import ExportManager from '../../../components/export/ExportManager';
import BatchExportQueue from '../../../components/export/BatchExportQueue';
import ExportOptimizer from '../../../components/export/ExportOptimizer';

export default function ExportDemo() {
  const [exportedUrls, setExportedUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  type CacheStrategy = 'memory' | 'persistent' | 'none';
  
  interface OptimizationSettings {
    imageQuality: number;
    maxWidth: number;
    maxHeight: number;
    enableCompression: boolean;
    cacheStrategy: CacheStrategy;
  }

  const [optimizationSettings, setOptimizationSettings] = useState<OptimizationSettings>({
    imageQuality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
    enableCompression: true,
    cacheStrategy: 'memory' as const
  });

  // Sample content for demonstration
  const sampleContent = (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Sample Document</h1>
      <p className="text-gray-700 dark:text-gray-300">
        This is a sample document demonstrating our export functionality.
        It includes text, images, and different formatting options.
      </p>
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Features</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Export to multiple formats (PDF, HTML, Markdown)</li>
          <li>Batch processing capabilities</li>
          <li>Asset optimization and caching</li>
          <li>Customizable export settings</li>
        </ul>
      </div>
      <img 
        src="https://via.placeholder.com/800x400"
        alt="Sample content"
        className="w-full rounded-lg shadow-md"
      />
    </div>
  );

  // Sample batch export items
  const batchItems = [
    {
      id: '1',
      title: 'Document 1',
      content: sampleContent,
      format: 'pdf' as const
    },
    {
      id: '2',
      title: 'Document 2',
      content: sampleContent,
      format: 'html' as const
    },
    {
      id: '3',
      title: 'Document 3',
      content: sampleContent,
      format: 'markdown' as const
    }
  ];

  const handleExportComplete = (url: string) => {
    setExportedUrls(prev => [...prev, url]);
    setError(null);
  };

  const handleError = (error: Error) => {
    setError(error.message);
    console.error('Export error:', error);
  };

  interface BatchExportResult {
    id: string;
    title: string;
    content: React.ReactNode;
    format: 'pdf' | 'html' | 'markdown';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    url?: string;
    error?: string;
    optimizedUrls?: string[];
  }

  const handleBatchComplete = (results: BatchExportResult[]) => {
    const urls = results
      .filter(result => result.status === 'completed' && result.url)
      .map(result => result.url as string);
    setExportedUrls(prev => [...prev, ...urls]);

    // Cleanup any failed exports' optimized URLs
    results
      .filter(result => result.status === 'failed')
      .forEach(result => {
        result.optimizedUrls?.forEach(url => URL.revokeObjectURL(url));
      });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Export System Demo</h1>
        <p className="text-gray-600 dark:text-gray-400">
          This demo showcases our document export system with optimization capabilities.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Single Export</h2>
          <div className="border rounded-lg p-6 dark:border-gray-700">
            <ExportManager
              content={sampleContent}
              title="Sample Document"
              onExportComplete={handleExportComplete}
              onError={handleError}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Batch Export</h2>
          <div className="border rounded-lg p-6 dark:border-gray-700">
            <BatchExportQueue
              items={batchItems}
              onComplete={handleBatchComplete}
              onError={handleError}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Export Optimization</h2>
          <div className="border rounded-lg p-6 dark:border-gray-700">
            <ExportOptimizer
              settings={optimizationSettings}
              onSettingsChange={settings => {
                setOptimizationSettings(settings);
                // Re-render sample content to reflect optimization changes
                const content = document.getElementById('export-content');
                if (content) {
                  content.style.opacity = '0.5';
                  setTimeout(() => {
                    content.style.opacity = '1';
                  }, 300);
                }
              }}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Current Settings</h2>
          <div className="border rounded-lg p-6 dark:border-gray-700 space-y-2">
            <p>Image Quality: {optimizationSettings.imageQuality * 100}%</p>
            <p>Max Dimensions: {optimizationSettings.maxWidth}x{optimizationSettings.maxHeight}px</p>
            <p>Compression: {optimizationSettings.enableCompression ? 'Enabled' : 'Disabled'}</p>
            <p>Cache Strategy: {optimizationSettings.cacheStrategy}</p>
          </div>
        </section>

        {exportedUrls.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Exported Files</h2>
            <div className="border rounded-lg p-6 dark:border-gray-700">
              <ul className="space-y-2">
                {exportedUrls.map((url, index) => (
                  <li key={index} className="flex items-center space-x-4">
                    <span className="text-gray-600 dark:text-gray-400">
                      Export {index + 1}:
                    </span>
                    <a
                      href={url}
                      download={`export-${index + 1}`}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
