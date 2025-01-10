import React, { useState } from "react";

interface SanitisationProps {
  jobNumber: string;
}

const Sanitisation: React.FC<SanitisationProps> = ({ jobNumber }) => {
  const [chemicalsUsed, setChemicalsUsed] = useState<string[]>([]);
  const [areasSanitised, setAreasSanitised] = useState<string>("");
  const [isValidated, setIsValidated] = useState(false);

  const availableChemicals = [
    "Bleach",
    "Disinfectant",
    "Alcohol",
    "Hydrogen Peroxide",
    "Other",
  ];

  const handleChemicalChange = (chemical: string) => {
    setChemicalsUsed((prev) =>
      prev.includes(chemical)
        ? prev.filter((c) => c !== chemical)
        : [...prev, chemical]
    );
  };

  const handleSave = async () => {
    try {
      const response = await fetch("/api/saveSanitisation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobNumber,
          chemicalsUsed,
          areasSanitised,
          isValidated,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save sanitisation details");
      }

      alert("Sanitisation details saved successfully!");
    } catch (error) {
      console.error("Error saving sanitisation details:", error);
      alert("Error saving sanitisation details. Please try again.");
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Sanitisation Details</h2>

      {/* Chemicals Used */}
      <div className="mb-4">
        <h3 className="font-bold">Chemicals Used:</h3>
        <div className="flex flex-wrap gap-2">
          {availableChemicals.map((chemical) => (
            <label key={chemical} className="flex items-center">
              <input
                type="checkbox"
                value={chemical}
                checked={chemicalsUsed.includes(chemical)}
                onChange={() => handleChemicalChange(chemical)}
                className="mr-2"
              />
              {chemical}
            </label>
          ))}
        </div>
      </div>

      {/* Areas Sanitised */}
      <label className="block mb-4">
        Areas Sanitised:
        <input
          type="text"
          value={areasSanitised}
          onChange={(e) => setAreasSanitised(e.target.value)}
          className="border rounded px-2 py-1 w-full"
          placeholder="Enter areas sanitised (e.g., kitchen, bathroom)"
        />
      </label>

      {/* Validation */}
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isValidated}
            onChange={(e) => setIsValidated(e.target.checked)}
            className="mr-2"
          />
          Sanitisation validated as per standards
        </label>
      </div>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Save Sanitisation Details
      </button>
    </div>
  );
};

export default Sanitisation;
