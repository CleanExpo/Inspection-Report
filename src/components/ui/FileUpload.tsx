import React, { useRef, useState } from 'react';
import { BaseProps } from '../../types/ui';

interface FileUploadProps extends BaseProps {
  /**
   * Callback when files are selected
   */
  onChange?: (files: File[]) => void;

  /**
   * Whether to accept multiple files
   */
  multiple?: boolean;

  /**
   * Accepted file types
   */
  accept?: string;

  /**
   * Maximum file size in bytes
   */
  maxSize?: number;

  /**
   * Maximum number of files
   */
  maxFiles?: number;

  /**
   * Whether to show file preview
   */
  preview?: boolean;

  /**
   * Whether to show file list
   */
  showList?: boolean;

  /**
   * Whether to enable drag and drop
   */
  dragDrop?: boolean;

  /**
   * Custom drag and drop text
   */
  dragDropText?: string;

  /**
   * Whether the uploader is disabled
   */
  disabled?: boolean;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Helper text to display
   */
  helperText?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onChange,
  multiple = false,
  accept,
  maxSize,
  maxFiles = 10,
  preview = true,
  showList = true,
  dragDrop = true,
  dragDropText = 'Drag and drop files here, or click to select files',
  disabled = false,
  error,
  helperText,
  className = '',
  ...props
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const validFiles = Array.from(newFiles).filter(file => {
      // Check file type
      if (accept) {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const fileType = file.type || `application/${file.name.split('.').pop()}`;
        if (!acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          if (type.endsWith('/*')) {
            return fileType.startsWith(type.slice(0, -2));
          }
          return fileType === type;
        })) {
          return false;
        }
      }

      // Check file size
      if (maxSize && file.size > maxSize) {
        return false;
      }

      return true;
    });

    const newValidFiles = [...files, ...validFiles].slice(0, maxFiles);
    setFiles(newValidFiles);
    onChange?.(newValidFiles);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onChange?.(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const isImage = (file: File) => {
    return file.type.startsWith('image/');
  };

  return (
    <div className={className} {...props}>
      {/* File input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple={multiple}
        accept={accept}
        disabled={disabled}
        onChange={(e) => handleFileChange(e.target.files)}
      />

      {/* Drag drop area */}
      <div
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative
          border-2 border-dashed
          rounded-lg
          p-8
          text-center
          transition-colors
          ${disabled
            ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
            : isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-500 cursor-pointer'
          }
        `}
      >
        <div className="space-y-2">
          <svg
            className={`mx-auto h-12 w-12 ${disabled ? 'text-gray-400' : 'text-gray-400'}`}
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-sm text-gray-600">
            {dragDropText}
          </div>
          {accept && (
            <div className="text-xs text-gray-500">
              Allowed types: {accept}
            </div>
          )}
          {maxSize && (
            <div className="text-xs text-gray-500">
              Maximum size: {formatFileSize(maxSize)}
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-1 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <div className="mt-1 text-sm text-gray-500">
          {helperText}
        </div>
      )}

      {/* File list */}
      {showList && files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <div className="flex items-center space-x-2">
                {preview && isImage(file) && (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-8 h-8 object-cover rounded"
                  />
                )}
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {file.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRemoveFile(index)}
                className="p-1 hover:bg-gray-200 rounded-full"
                disabled={disabled}
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;

/**
 * FileUpload Component Usage Guide:
 * 
 * 1. Basic file upload:
 *    <FileUpload
 *      onChange={(files) => console.log(files)}
 *    />
 * 
 * 2. Multiple files:
 *    <FileUpload
 *      multiple
 *      onChange={(files) => console.log(files)}
 *    />
 * 
 * 3. Accepted file types:
 *    <FileUpload
 *      accept=".jpg,.png,.pdf"
 *      onChange={(files) => console.log(files)}
 *    />
 * 
 * 4. Maximum file size:
 *    <FileUpload
 *      maxSize={5 * 1024 * 1024} // 5MB
 *      onChange={(files) => console.log(files)}
 *    />
 * 
 * 5. Maximum number of files:
 *    <FileUpload
 *      multiple
 *      maxFiles={5}
 *      onChange={(files) => console.log(files)}
 *    />
 * 
 * 6. Without preview:
 *    <FileUpload
 *      preview={false}
 *      onChange={(files) => console.log(files)}
 *    />
 * 
 * 7. Without file list:
 *    <FileUpload
 *      showList={false}
 *      onChange={(files) => console.log(files)}
 *    />
 * 
 * 8. Without drag and drop:
 *    <FileUpload
 *      dragDrop={false}
 *      onChange={(files) => console.log(files)}
 *    />
 * 
 * 9. Custom drag drop text:
 *    <FileUpload
 *      dragDropText="Drop files here!"
 *      onChange={(files) => console.log(files)}
 *    />
 * 
 * 10. With error:
 *     <FileUpload
 *       error="Invalid file type"
 *       onChange={(files) => console.log(files)}
 *     />
 * 
 * Notes:
 * - Drag and drop support
 * - Multiple file support
 * - File type validation
 * - File size validation
 * - File preview
 * - File list
 * - Error handling
 * - Helper text
 * - Disabled state
 * - Accessible
 */
