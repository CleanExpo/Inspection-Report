import React from "react";
import PhotoUpload from "./PhotoUpload";

const PhotosAndDocuments = ({ jobNumber }: { jobNumber: string }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Photos and Documentation</h1>
      <PhotoUpload jobNumber={jobNumber} />
    </div>
  );
};

export default PhotosAndDocuments;
