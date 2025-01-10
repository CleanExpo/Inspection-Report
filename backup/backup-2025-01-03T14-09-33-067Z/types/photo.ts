export interface PhotoAttachment {
  id: string;
  url: string;
  dataUrl?: string;
  caption?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  metadata?: {
    width?: number;
    height?: number;
    location?: {
      lat?: number;
      lng?: number;
    };
    deviceInfo?: {
      make?: string;
      model?: string;
    };
  };
  tags?: string[];
}

export interface PhotoUploadResponse {
  success: boolean;
  message: string;
  photo?: PhotoAttachment;
  error?: string;
}

export interface PhotoGalleryState {
  photos: PhotoAttachment[];
  selectedPhoto: PhotoAttachment | null;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
}

export interface PhotoDisplayOptions {
  showCaption?: boolean;
  showMetadata?: boolean;
  showTags?: boolean;
  allowDownload?: boolean;
  allowDelete?: boolean;
  maxHeight?: number;
  maxWidth?: number;
}
