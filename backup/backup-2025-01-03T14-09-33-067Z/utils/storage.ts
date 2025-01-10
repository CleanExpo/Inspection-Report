import { Storage } from '@google-cloud/storage';
import type { PhotoAttachment, PhotoUploadResponse } from '../types/photo';

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

const bucket = storage.bucket(process.env.GOOGLE_STORAGE_BUCKET || '');

export const uploadPhoto = async (
  file: File,
  jobNumber: string
): Promise<PhotoUploadResponse> => {
  try {
    // Generate a unique filename
    const timestamp = Date.now();
    const fileName = `${jobNumber}/${timestamp}-${file.name}`;
    const blob = bucket.file(fileName);

    // Create a write stream and upload the file
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.type,
        metadata: {
          jobNumber,
          originalName: file.name,
          uploadTimestamp: timestamp.toString()
        }
      }
    });

    // Wait for the upload to complete
    await new Promise((resolve, reject) => {
      blobStream.on('error', reject);
      blobStream.on('finish', resolve);
      blobStream.end(file);
    });

    // Make the file publicly accessible
    await blob.makePublic();

    // Create the photo attachment
    const photo: PhotoAttachment = {
      id: `photo-${timestamp}`,
      url: `https://storage.googleapis.com/${bucket.name}/${fileName}`,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
      metadata: {
        // Add any additional metadata here
      }
    };

    return {
      success: true,
      message: 'Photo uploaded successfully',
      photo
    };
  } catch (error) {
    console.error('Error uploading photo:', error);
    return {
      success: false,
      message: 'Failed to upload photo',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const deletePhoto = async (fileName: string): Promise<boolean> => {
  try {
    const file = bucket.file(fileName);
    await file.delete();
    return true;
  } catch (error) {
    console.error('Error deleting photo:', error);
    return false;
  }
};

export const getSignedUrl = async (
  fileName: string,
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    const file = bucket.file(fileName);
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expiresIn * 1000
    });
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
};

export const listPhotos = async (
  jobNumber: string,
  prefix?: string
): Promise<PhotoAttachment[]> => {
  try {
    const options = {
      prefix: prefix ? `${jobNumber}/${prefix}` : jobNumber
    };

    const [files] = await bucket.getFiles(options);
    const photos: PhotoAttachment[] = [];

    for (const file of files) {
      const [metadata] = await file.getMetadata();
      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 3600 * 1000 // 1 hour
      });

      photos.push({
        id: `photo-${metadata.generation}`,
        url,
        fileName: metadata.name,
        fileSize: parseInt(metadata.size),
        mimeType: metadata.contentType,
        uploadedAt: metadata.timeCreated,
        metadata: metadata.metadata
      });
    }

    return photos;
  } catch (error) {
    console.error('Error listing photos:', error);
    return [];
  }
};
