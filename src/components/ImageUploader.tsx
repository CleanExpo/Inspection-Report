import React, { useState } from "react";

interface ImageUploaderProps {
  onImageUploaded: (type: 'property' | 'claim', url: string) => void;
  currentImages: {
    propertyImage: string | null;
    claimImage: string | null;
  };
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUploaded, currentImages }) => {
  const [uploading, setUploading] = useState<string | null>(null);

  const handleImageUpload = async (image: File, imageType: 'property' | 'claim') => {
    // Validate file size (5MB limit)
    if (image.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploading(imageType);
    const reader = new FileReader();

    reader.onload = async (event) => {
      const base64 = event.target?.result as string;

      try {
        const response = await fetch("/api/uploadImage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64.split(",")[1],
            imageName: imageType === "property" ? "property-front.jpg" : "claim-cause.jpg",
          }),
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        onImageUploaded(imageType, data.imageUrl);

        alert("Image uploaded successfully!");
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image. Please try again.");
      } finally {
        setUploading(null);
      }
    };

    reader.readAsDataURL(image);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6">Upload Images</h2>

      <div className="space-y-8">
        {/* Property Front Image */}
        <div className="space-y-4">
          <label className="block font-semibold text-gray-700">Property Front Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], "property")}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            disabled={!!uploading}
          />
          {uploading === "property" && (
            <div className="text-sm text-blue-600">Uploading...</div>
          )}
          {currentImages.propertyImage && (
            <div className="relative group">
              <img 
                src={currentImages.propertyImage} 
                alt="Property Front" 
                className="max-w-full h-auto rounded-lg shadow-sm"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg" />
            </div>
          )}
        </div>

        {/* Cause of Claim Image */}
        <div className="space-y-4">
          <label className="block font-semibold text-gray-700">Cause of Claim Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], "claim")}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            disabled={!!uploading}
          />
          {uploading === "claim" && (
            <div className="text-sm text-blue-600">Uploading...</div>
          )}
          {currentImages.claimImage && (
            <div className="relative group">
              <img 
                src={currentImages.claimImage} 
                alt="Cause of Claim" 
                className="max-w-full h-auto rounded-lg shadow-sm"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
