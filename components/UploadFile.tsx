import React, { useState } from "react";

const UploadFile: React.FC = () => {
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");

  const handleFileUpload = async () => {
    if (!fileName || !fileContent) {
      alert("File name and content are required.");
      return;
    }

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, fileContent }),
      });

      if (response.ok) {
        alert("File uploaded successfully!");
        // Clear form after successful upload
        setFileName("");
        setFileContent("");
      } else {
        const data = await response.json();
        alert(`File upload failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed. Please try again.");
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Upload File</h2>
      <input
        type="text"
        placeholder="File Name"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
        className="border px-2 py-1 w-full mb-4 rounded"
      />
      <textarea
        placeholder="Base64 File Content"
        value={fileContent}
        onChange={(e) => setFileContent(e.target.value)}
        className="border px-2 py-1 w-full mb-4 rounded min-h-[100px]"
      />
      <button
        onClick={handleFileUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
      >
        Upload
      </button>
    </div>
  );
};

export default UploadFile;
