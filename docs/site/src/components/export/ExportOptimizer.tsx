'use client';

import React, { useCallback } from 'react';
import { useEffect, useState } from 'react';

interface OptimizationSettings {
  imageQuality: number;
  maxWidth: number;
  maxHeight: number;
  enableCompression: boolean;
  cacheStrategy: 'memory' | 'persistent' | 'none';
}

interface ExportOptimizerProps {
  settings?: Partial<OptimizationSettings>;
  onSettingsChange?: (settings: OptimizationSettings) => void;
}

const defaultSettings: OptimizationSettings = {
  imageQuality: 0.8,
  maxWidth: 1920,
  maxHeight: 1080,
  enableCompression: true,
  cacheStrategy: 'memory'
};

const cache = new Map<string, string>();

export default function ExportOptimizer({
  settings: initialSettings,
  onSettingsChange
}: ExportOptimizerProps) {
  const [settings, setSettings] = useState<OptimizationSettings>({
    ...defaultSettings,
    ...initialSettings
  });

  // Optimize image using canvas
  const optimizeImage = useCallback(async (imageUrl: string): Promise<string> => {
    // Check cache first
    if (settings.cacheStrategy === 'memory' && cache.has(imageUrl)) {
      return cache.get(imageUrl)!;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    return new Promise((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Calculate dimensions while maintaining aspect ratio
        let { width, height } = img;
        if (width > settings.maxWidth) {
          height = (height * settings.maxWidth) / width;
          width = settings.maxWidth;
        }
        if (height > settings.maxHeight) {
          width = (width * settings.maxHeight) / height;
          height = settings.maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and optimize
        ctx.drawImage(img, 0, 0, width, height);
        const optimizedUrl = canvas.toDataURL('image/jpeg', settings.imageQuality);

        // Cache if enabled
        if (settings.cacheStrategy === 'memory') {
          cache.set(imageUrl, optimizedUrl);
        }

        resolve(optimizedUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  }, [settings]);

  // Update settings
  const updateSettings = useCallback((updates: Partial<OptimizationSettings>) => {
    setSettings(current => {
      const newSettings = { ...current, ...updates };
      onSettingsChange?.(newSettings);
      return newSettings;
    });
  }, [onSettingsChange]);

  // Clear cache when strategy changes
  useEffect(() => {
    if (settings.cacheStrategy === 'none') {
      cache.clear();
    }
  }, [settings.cacheStrategy]);

  return (
    <div className="space-y-6 p-4 border rounded-lg dark:border-gray-700">
      <h3 className="text-lg font-semibold">Export Optimization Settings</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Image Quality ({settings.imageQuality * 100}%)
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={settings.imageQuality}
            onChange={e => updateSettings({ imageQuality: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Max Width (px)
          </label>
          <input
            type="number"
            value={settings.maxWidth}
            onChange={e => updateSettings({ maxWidth: parseInt(e.target.value, 10) })}
            className="w-full px-3 py-2 border rounded-md dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Max Height (px)
          </label>
          <input
            type="number"
            value={settings.maxHeight}
            onChange={e => updateSettings({ maxHeight: parseInt(e.target.value, 10) })}
            className="w-full px-3 py-2 border rounded-md dark:border-gray-600"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableCompression"
            checked={settings.enableCompression}
            onChange={e => updateSettings({ enableCompression: e.target.checked })}
            className="mr-2"
          />
          <label htmlFor="enableCompression" className="text-sm font-medium">
            Enable Compression
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Cache Strategy
          </label>
          <select
            value={settings.cacheStrategy}
            onChange={e => updateSettings({ cacheStrategy: e.target.value as OptimizationSettings['cacheStrategy'] })}
            className="w-full px-3 py-2 border rounded-md dark:border-gray-600"
          >
            <option value="memory">Memory Cache</option>
            <option value="persistent">Persistent Cache</option>
            <option value="none">No Cache</option>
          </select>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>Current optimization settings will be applied to all exported images.</p>
        <p>Memory cache: {cache.size} items stored</p>
      </div>
    </div>
  );
}

// Export the optimizeImage function to be used by other components
export function useExportOptimizer(settings?: Partial<OptimizationSettings>) {
  const [optimizerSettings] = useState<OptimizationSettings>({
    ...defaultSettings,
    ...settings
  });

  const optimizeImage = useCallback(async (imageUrl: string): Promise<string> => {
    if (optimizerSettings.cacheStrategy === 'memory' && cache.has(imageUrl)) {
      return cache.get(imageUrl)!;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    return new Promise((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        let { width, height } = img;
        if (width > optimizerSettings.maxWidth) {
          height = (height * optimizerSettings.maxWidth) / width;
          width = optimizerSettings.maxWidth;
        }
        if (height > optimizerSettings.maxHeight) {
          width = (width * optimizerSettings.maxHeight) / height;
          height = optimizerSettings.maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const optimizedUrl = canvas.toDataURL('image/jpeg', optimizerSettings.imageQuality);
        
        if (optimizerSettings.cacheStrategy === 'memory') {
          cache.set(imageUrl, optimizedUrl);
        }

        resolve(optimizedUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  }, [optimizerSettings]);

  return { optimizeImage };
}
