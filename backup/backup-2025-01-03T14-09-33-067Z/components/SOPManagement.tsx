import React, { useState } from "react";

interface SOPManagementProps {
  sops: string[];
  onAdd: (sop: string) => void;
  onRemove: (index: number) => void;
  className?: string;
}

const SOPManagement: React.FC<SOPManagementProps> = ({ 
  sops, 
  onAdd, 
  onRemove, 
  className = "" 
}) => {
  const [newSop, setNewSop] = useState("");

  const handleAddSop = () => {
    if (newSop.trim()) {
      onAdd(newSop.trim());
      setNewSop("");
    }
  };

  return (
    <div className={`p-4 border rounded shadow ${className}`}>
      <h2 className="text-xl font-bold mb-4">SOP Management</h2>
      
      <div className="mb-4">
        <label className="block mb-2">Add a new SOP:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSop}
            onChange={(e) => setNewSop(e.target.value)}
            className="flex-1 border rounded px-2 py-1"
            placeholder="Enter SOP content"
          />
          <button
            onClick={handleAddSop}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded transition-colors"
            disabled={!newSop.trim()}
          >
            Add SOP
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-2">Existing SOPs:</h3>
        {sops.length === 0 ? (
          <p className="text-gray-500 italic">No SOPs added yet</p>
        ) : (
          <ul className="space-y-2">
            {sops.map((sop, index) => (
              <li 
                key={index} 
                className="flex justify-between items-center p-2 bg-gray-50 rounded hover:bg-gray-100"
              >
                <span>{sop}</span>
                <button
                  onClick={() => onRemove(index)}
                  className="ml-4 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors"
                  title="Remove SOP"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SOPManagement;
