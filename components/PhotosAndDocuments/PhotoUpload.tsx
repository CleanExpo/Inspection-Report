import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface Photo {
  file: File;
  preview: string;
  annotation: string;
  category: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const PhotoUpload = ({ jobNumber }: { jobNumber: string }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState<number | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newPhotos = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      annotation: "",
      category: "",
    }));
    setPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const handleAnnotationChange = (index: number, value: string) => {
    const updatedPhotos = [...photos];
    updatedPhotos[index].annotation = value;
    setPhotos(updatedPhotos);
  };

  const handleCategoryChange = (index: number, value: string) => {
    const updatedPhotos = [...photos];
    updatedPhotos[index].category = value;
    setPhotos(updatedPhotos);
  };

  const startVoiceRecognition = (index: number) => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(index);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      const updatedPhotos = [...photos];
      updatedPhotos[index].annotation = updatedPhotos[index].annotation
        ? `${updatedPhotos[index].annotation} ${speechToText}`
        : speechToText;
      setPhotos(updatedPhotos);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setError("Voice input failed. Please try again or use text input.");
      setIsRecording(null);
    };

    recognition.onend = () => {
      setIsRecording(null);
    };

    recognition.start();
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      setError("Please add at least one photo");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("jobNumber", jobNumber);

      // Append each photo file
      photos.forEach((photo, index) => {
        formData.append("photos", photo.file);
      });

      // Append annotations and categories as JSON strings
      const annotations = photos.map(photo => photo.annotation);
      const categories = photos.map(photo => photo.category);
      formData.append("annotations", JSON.stringify(annotations));
      formData.append("categories", JSON.stringify(categories));

      const response = await fetch("/api/uploadPhotos", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Clear form after successful upload
      setPhotos([]);
      alert("Photos uploaded successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photos");
    } finally {
      setIsUploading(false);
    }
  };

  // Clean up object URLs on unmount
  React.useEffect(() => {
    return () => {
      photos.forEach(photo => URL.revokeObjectURL(photo.preview));
    };
  }, [photos]);

  return (
    <div className="p-4 border rounded shadow">
      <div
        {...getRootProps()}
        className={`p-4 border-dashed border-2 rounded text-center mb-4 cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
      >
        <input {...getInputProps()} />
        <p>{isDragActive ? 'Drop the files here...' : 'Drag and drop photos here, or click to select files'}</p>
        <p className="text-sm text-gray-500 mt-1">Maximum file size: 5MB</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="border p-2 rounded">
            <img
              src={photo.preview}
              alt={`Uploaded Preview ${index + 1}`}
              className="w-full h-32 object-cover mb-2"
            />
            <div className="space-y-2">
              <div className="flex gap-2">
                <textarea
                  placeholder="Add annotation"
                  value={photo.annotation}
                  onChange={(e) => handleAnnotationChange(index, e.target.value)}
                  className="w-full border rounded p-2"
                  rows={3}
                />
                <button
                  type="button"
                  onClick={() => startVoiceRecognition(index)}
                  disabled={isRecording !== null}
                  className={`px-3 py-1 rounded-full flex-shrink-0 ${
                    isRecording === index
                      ? 'bg-red-500 text-white'
                      : isRecording !== null
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                  title="Start voice input"
                >
                  {isRecording === index ? '🎤 Recording...' : '🎤'}
                </button>
              </div>
              <select
                value={photo.category}
                onChange={(e) => handleCategoryChange(index, e.target.value)}
                className="w-full border rounded p-2"
              >
                <option value="">Select Category</option>
                <option value="Water Damage">Water Damage</option>
                <option value="Structural Damage">Structural Damage</option>
                <option value="Personal Belongings">Personal Belongings</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-red-500 mt-2">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={isUploading || photos.length === 0}
        className={`px-4 py-2 rounded mt-4 ${
          isUploading || photos.length === 0
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isUploading ? 'Uploading...' : 'Upload Photos'}
      </button>
    </div>
  );
};

export default PhotoUpload;
