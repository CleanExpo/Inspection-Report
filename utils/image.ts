import type { ImageProcessingOptions, ImageUploadResponse } from '@/types/inspection';

const DEFAULT_OPTIONS: ImageProcessingOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  format: 'jpeg',
  preserveExif: true,
  autoRotate: true
};

export async function processImage(
  file: File,
  options: ImageProcessingOptions = {}
): Promise<Blob> {
  try {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    // Here you would typically:
    // 1. Load image into canvas
    // 2. Process according to options
    // 3. Convert to blob
    
    // For now, just return the original file
    return file;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
}

export async function uploadImage(
  file: File,
  options?: ImageProcessingOptions
): Promise<ImageUploadResponse> {
  try {
    const processedImage = await processImage(file, options);
    
    // Here you would typically:
    // 1. Create form data
    // 2. Send to your API
    // 3. Handle response
    
    // For now, return mock response
    return {
      success: true,
      message: 'Image uploaded successfully',
      url: URL.createObjectURL(processedImage)
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      message: 'Failed to upload image',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
}

export function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      const { width: originalWidth, height: originalHeight } = await getImageDimensions(file);
      
      // Calculate new dimensions while maintaining aspect ratio
      let newWidth = originalWidth;
      let newHeight = originalHeight;
      
      if (newWidth > maxWidth) {
        newHeight = (maxWidth * newHeight) / newWidth;
        newWidth = maxWidth;
      }
      
      if (newHeight > maxHeight) {
        newWidth = (maxHeight * newWidth) / newHeight;
        newHeight = maxHeight;
      }
      
      // Create canvas with new dimensions
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      // Draw image on canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            resolve(blob);
          },
          'image/jpeg',
          0.8
        );
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = URL.createObjectURL(file);
    } catch (error) {
      reject(error);
    }
  });
}
