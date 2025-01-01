import React from "react";
import { useAppContext } from "../context/AppContext";

interface StandardsCheckboxProps {
  className?: string;
}

const StandardsCheckbox: React.FC<StandardsCheckboxProps> = ({ className = "" }) => {
  const { includeStandards, setIncludeStandards, isSyncing } = useAppContext();

  const handleCheckboxChange = () => {
    setIncludeStandards(!includeStandards);
  };

  return (
    <div className={`mb-4 ${className}`}>
      <label className="flex items-center cursor-pointer group">
        <input
          type="checkbox"
          checked={includeStandards}
          onChange={handleCheckboxChange}
          className="
            mr-2 h-4 w-4
            rounded border-gray-300
            text-blue-600
            focus:ring-blue-500
            transition-colors
            cursor-pointer
          "
          aria-label="Include Australian Standards"
          disabled={isSyncing}
        />
        <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
          Include Australian Codes and Best Practices in the Report
        </span>
        {isSyncing && (
          <svg 
            className="animate-spin ml-2 h-4 w-4 text-blue-500" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
      </label>
      {includeStandards && (
        <p className="mt-2 text-sm text-gray-500 ml-6">
          This will include relevant Australian standards and industry best practices in your report
        </p>
      )}
    </div>
  );
};

export default StandardsCheckbox;
