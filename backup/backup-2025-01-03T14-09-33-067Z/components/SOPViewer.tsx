import React from "react";

interface SOPViewerProps {
  sops: string[];
  className?: string;
}

const SOPViewer: React.FC<SOPViewerProps> = ({ sops, className = "" }) => {
  return (
    <div className={`p-4 border rounded shadow ${className}`}>
      <h2 className="text-xl font-bold mb-4">Standard Operating Procedures</h2>
      {sops.length > 0 ? (
        <ul className="space-y-2">
          {sops.map((sop, index) => (
            <li 
              key={index} 
              className="p-2 bg-gray-50 rounded"
            >
              {sop}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">No SOPs available.</p>
      )}
    </div>
  );
};

export default SOPViewer;
