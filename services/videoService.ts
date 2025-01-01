export const validateVideoFile = (file: File): string | null => {
  // Check if it's a video file
  if (!file.type.startsWith('video/')) {
    return "Please select a valid video file";
  }

  // Check file size (100MB limit)
  const maxSize = 100 * 1024 * 1024; // 100MB in bytes
  if (file.size > maxSize) {
    return "Video file must be smaller than 100MB";
  }

  return null;
};

export const uploadVideo = async (file: File): Promise<void> => {
  const error = validateVideoFile(file);
  if (error) {
    throw new Error(error);
  }

  const formData = new FormData();
  formData.append("video", file);

  const response = await fetch("/api/uploadVideo", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to upload video");
  }
};

export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = parseFloat((bytes / Math.pow(1024, i)).toFixed(2));
  
  return `${size} ${sizes[i]}`;
};
