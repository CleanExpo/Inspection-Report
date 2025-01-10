import React, { useState } from "react";
import SignaturePad from "react-signature-canvas";

interface SafetyDocumentsProps {
  jobNumber: string;
}

const SafetyDocuments: React.FC<SafetyDocumentsProps> = ({ jobNumber }) => {
  const [jsaFile, setJsaFile] = useState<File | null>(null);
  const [swmsFile, setSwmsFile] = useState<File | null>(null);
  const [safetyNotes, setSafetyNotes] = useState<string>("");
  const [signature, setSignature] = useState<string | null>(null);

  let sigPad: any;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: Function) => {
    const file = e.target.files && e.target.files[0];
    setFile(file);
  };

  const clearSignature = () => {
    sigPad.clear();
    setSignature(null);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("jobNumber", jobNumber);
      if (jsaFile) formData.append("jsaFile", jsaFile);
      if (swmsFile) formData.append("swmsFile", swmsFile);
      formData.append("safetyNotes", safetyNotes);
      if (signature) formData.append("signature", signature);

      const response = await fetch("/api/saveSafetyDocuments", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to save safety documents");
      }

      alert("Safety documents saved successfully!");
    } catch (error) {
      console.error("Error saving safety documents:", error);
      alert("Error saving safety documents. Please try again.");
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Safety Documents</h2>

      {/* JSA Upload */}
      <div className="mb-4">
        <label className="block mb-2">
          Upload Job Safety Analysis (JSA):
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileChange(e, setJsaFile)}
            className="border px-2 py-1 w-full"
          />
        </label>
      </div>

      {/* SWMS Upload */}
      <div className="mb-4">
        <label className="block mb-2">
          Upload Safe Work Method Statement (SWMS):
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileChange(e, setSwmsFile)}
            className="border px-2 py-1 w-full"
          />
        </label>
      </div>

      {/* Additional Safety Notes */}
      <label className="block mb-4">
        Additional Safety Notes:
        <textarea
          value={safetyNotes}
          onChange={(e) => setSafetyNotes(e.target.value)}
          className="border rounded px-2 py-1 w-full"
          rows={4}
          placeholder="Enter any additional safety notes"
        />
      </label>

      {/* Digital Signature */}
      <div className="mb-4">
        <h3 className="font-bold">Staff Acknowledgment Signature:</h3>
        <SignaturePad
          ref={(ref) => {
            sigPad = ref;
          }}
          canvasProps={{ width: 500, height: 200, className: "border" }}
          onEnd={() => setSignature(sigPad.getTrimmedCanvas().toDataURL())}
        />
        <button
          type="button"
          onClick={clearSignature}
          className="bg-red-500 text-white px-4 py-2 rounded mt-2"
        >
          Clear Signature
        </button>
      </div>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Save Safety Documents
      </button>
    </div>
  );
};

export default SafetyDocuments;
