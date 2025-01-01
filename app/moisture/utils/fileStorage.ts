import { File } from 'formidable';

// Function to get public URL for uploaded file
export function getFileUrl(filename: string): string {
  return `/uploads/${filename}`;
}

// Function to get file extension
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

// Function to validate file type
export function validateFileType(
  file: File,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif']
): boolean {
  return allowedTypes.includes(file.mimetype || '');
}

// Function to validate file size
export function validateFileSize(
  file: File,
  maxSize: number = 10 * 1024 * 1024 // 10MB default
): boolean {
  return file.size <= maxSize;
}

// Function to format file size for display
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
