import React, { useCallback, useState } from 'react';
import { InspectionImage } from '../types/inspection';

export interface ImageUploaderProps {
  onUpload: (images: InspectionImage[]) => void;
  maxFiles: number;
  acceptedTypes: string[];
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUpload,
  maxFiles,
  acceptedTypes,
  className = ""
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const uploadedImages: InspectionImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!acceptedTypes.includes(file.type)) {
          throw new Error(`File type ${file.type} not supported`);
        }

        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to upload image');
        }

        const data = await response.json();
        uploadedImages.push({
          id: `img-${Date.now()}-${i}`,
          url: data.url,
          uploadedAt: new Date().toISOString(),
          caption: file.name
        });
      }

      onUpload(uploadedImages);
    } catch (error) {
      console.error('Error uploading images:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  }, [maxFiles, acceptedTypes, onUpload]);

  return (
    <div className={className}>
      <div className="flex flex-col items-center p-6 border-2 border-dashed rounded-lg">
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
          id="file-upload"
        />
        
        <label
          htmlFor="file-upload"
          className={`
            flex flex-col items-center justify-center
            cursor-pointer
            ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
          `}
        >
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          
          <p className="mt-2 text-sm text-gray-600">
            {isUploading ? 'Uploading...' : `Click to upload (max ${maxFiles} files)`}
          </p>
          
          <p className="mt-1 text-xs text-gray-500">
            {acceptedTypes.join(', ')} files supported
          </p>
        </label>

        {error && (
          <div className="mt-4 p-3 bg-red-50 rounded-md border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
