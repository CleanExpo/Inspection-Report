'use client';

import { useState, useEffect, useRef } from 'react';

interface Annotation {
  id: string;
  type: 'TEXT' | 'ARROW' | 'RECTANGLE' | 'CIRCLE';
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  color: string;
}

interface AnnotationEditorProps {
  annotation: Annotation;
  onSave: (id: string, updates: Partial<Annotation>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

export default function AnnotationEditor({
  annotation,
  onSave,
  onDelete,
  onClose
}: AnnotationEditorProps) {
  const [content, setContent] = useState(annotation.content);
  const [color, setColor] = useState(annotation.color);
  const [width, setWidth] = useState(annotation.width?.toString() || '');
  const [height, setHeight] = useState(annotation.height?.toString() || '');
  const [rotation, setRotation] = useState(annotation.rotation?.toString() || '0');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    contentRef.current?.focus();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const updates: Partial<Annotation> = {
        content,
        color
      };

      if (annotation.type !== 'TEXT') {
        updates.width = width ? parseFloat(width) : undefined;
        updates.height = height ? parseFloat(height) : undefined;
        updates.rotation = rotation ? parseFloat(rotation) : undefined;
      }

      await onSave(annotation.id, updates);
      onClose();
    } catch (err) {
      setError('Failed to save annotation');
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await onDelete(annotation.id);
      onClose();
    } catch (err) {
      setError('Failed to delete annotation');
      console.error('Delete error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Edit {annotation.type.charAt(0) + annotation.type.slice(1).toLowerCase()}
          </h3>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Content */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700"
            >
              Content
            </label>
            <textarea
              ref={contentRef}
              id="content"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* Color */}
          <div>
            <label
              htmlFor="color"
              className="block text-sm font-medium text-gray-700"
            >
              Color
            </label>
            <input
              type="color"
              id="color"
              className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>

          {/* Size and Rotation (for non-text annotations) */}
          {annotation.type !== 'TEXT' && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="width"
                  className="block text-sm font-medium text-gray-700"
                >
                  Width (%)
                </label>
                <input
                  type="number"
                  id="width"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div>
                <label
                  htmlFor="height"
                  className="block text-sm font-medium text-gray-700"
                >
                  Height (%)
                </label>
                <input
                  type="number"
                  id="height"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div>
                <label
                  htmlFor="rotation"
                  className="block text-sm font-medium text-gray-700"
                >
                  Rotation (°)
                </label>
                <input
                  type="number"
                  id="rotation"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={rotation}
                  onChange={(e) => setRotation(e.target.value)}
                  min="-180"
                  max="180"
                  step="1"
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-gray-50 flex justify-between rounded-b-lg">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            Delete
          </button>
          <div className="space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
