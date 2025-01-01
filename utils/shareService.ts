import { VoiceNote, PhotoAttachment } from '../types/voice';

interface ShareSettings {
  expiresIn: number;
  allowDownload: boolean;
  allowComments: boolean;
  password?: string;
  watermark?: string;
}

interface ShareData {
  id: string;
  notes: VoiceNote[];
  settings: ShareSettings;
  createdAt: string;
  expiresAt: string;
  accessCount: number;
  accessLog: {
    timestamp: string;
    ip: string;
    userAgent: string;
  }[];
}

// In-memory storage for development
// In production, this would be a database
const shareStore = new Map<string, ShareData>();

// Clean up expired shares periodically
setInterval(() => {
  const now = Date.now();
  for (const [id, data] of shareStore.entries()) {
    if (new Date(data.expiresAt).getTime() < now) {
      shareStore.delete(id);
    }
  }
}, 60000); // Check every minute

// Generate a secure random ID
function generateShareId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Create a share link
export async function createShare(
  notes: VoiceNote[],
  settings: ShareSettings
): Promise<string> {
  // Process photos for sharing
  const processedNotes = await Promise.all(
    notes.map(async note => {
      if (!note.photos) return note;

      // Convert photos to optimized format for sharing
      const processedPhotos = await Promise.all(
        note.photos.map(async photo => {
          // Add watermark if specified
          const processedDataUrl = settings.watermark
            ? await addWatermark(photo.dataUrl, settings.watermark)
            : photo.dataUrl;

          return {
            ...photo,
            dataUrl: processedDataUrl
          };
        })
      );

      return {
        ...note,
        photos: processedPhotos
      };
    })
  );

  const shareId = generateShareId();
  const now = new Date();
  const shareData: ShareData = {
    id: shareId,
    notes: processedNotes,
    settings,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + settings.expiresIn * 3600000).toISOString(),
    accessCount: 0,
    accessLog: []
  };

  shareStore.set(shareId, shareData);
  return `${window.location.origin}/share/${shareId}`;
}

// Get shared notes
export async function getSharedNotes(
  shareId: string,
  password?: string
): Promise<{ notes: VoiceNote[]; settings: ShareSettings } | null> {
  const shareData = shareStore.get(shareId);
  if (!shareData) return null;

  // Check if expired
  if (new Date(shareData.expiresAt).getTime() < Date.now()) {
    shareStore.delete(shareId);
    return null;
  }

  // Check password if set
  if (shareData.settings.password && shareData.settings.password !== password) {
    throw new Error('Invalid password');
  }

  // Log access
  shareData.accessCount++;
  shareData.accessLog.push({
    timestamp: new Date().toISOString(),
    ip: 'unknown', // Would be set by server
    userAgent: navigator.userAgent
  });

  return {
    notes: shareData.notes,
    settings: shareData.settings
  };
}

// Revoke share access
export async function revokeShare(shareId: string): Promise<void> {
  shareStore.delete(shareId);
}

// Get share statistics
export async function getShareStats(shareId: string): Promise<{
  accessCount: number;
  accessLog: ShareData['accessLog'];
} | null> {
  const shareData = shareStore.get(shareId);
  if (!shareData) return null;

  return {
    accessCount: shareData.accessCount,
    accessLog: shareData.accessLog
  };
}

// Add watermark to image
async function addWatermark(
  dataUrl: string,
  text: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Set canvas size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Add watermark
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = `${Math.max(20, img.width / 20)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(text, 0, 0);

      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}
