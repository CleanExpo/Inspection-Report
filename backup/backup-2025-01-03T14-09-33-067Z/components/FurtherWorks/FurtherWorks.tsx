import React, { useState } from "react";

interface FurtherWorksProps {
  jobNumber: string;
}

const FurtherWorks: React.FC<FurtherWorksProps> = ({ jobNumber }) => {
  const [additionalWork, setAdditionalWork] = useState<string>("");
  const [specializedTrades, setSpecializedTrades] = useState<string[]>([]);
  const [completionTime, setCompletionTime] = useState<string>("");

  const tradeOptions = ["Plumber", "Electrician", "Builder", "Mold Specialist", "Other"];

  const handleTradeChange = (trade: string) => {
    setSpecializedTrades((prev) =>
      prev.includes(trade) ? prev.filter((t) => t !== trade) : [...prev, trade]
    );
  };

  const handleSave = async () => {
    try {
      const response = await fetch("/api/saveFurtherWorks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobNumber,
          additionalWork,
          specializedTrades,
          completionTime,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save further works details");
      }

      alert("Further works details saved successfully!");
    } catch (error) {
      console.error("Error saving further works details:", error);
      alert("Error saving further works details. Please try again.");
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Further Works</h2>

      {/* Recommendations for Additional Work */}
      <label className="block mb-4">
        Recommendations for Additional Work:
        <textarea
          value={additionalWork}
          onChange={(e) => setAdditionalWork(e.target.value)}
          className="border rounded px-2 py-1 w-full"
          rows={4}
          placeholder="Describe additional work needed"
        />
      </label>

      {/* Specialized Trades */}
      <div className="mb-4">
        <h3 className="font-bold">Specialized Trades/Equipment Needed:</h3>
        <div className="flex flex-wrap gap-2">
          {tradeOptions.map((trade) => (
            <label key={trade} className="flex items-center">
              <input
                type="checkbox"
                value={trade}
                checked={specializedTrades.includes(trade)}
                onChange={() => handleTradeChange(trade)}
                className="mr-2"
              />
              {trade}
            </label>
          ))}
        </div>
      </div>

      {/* Estimated Completion Time */}
      <label className="block mb-4">
        Estimated Completion Time (Days):
        <input
          type="number"
          value={completionTime}
          onChange={(e) => setCompletionTime(e.target.value)}
          className="border rounded px-2 py-1 w-full"
          min={1}
          placeholder="Enter estimated time in days"
        />
      </label>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Save Further Works Details
      </button>
    </div>
  );
};

export default FurtherWorks;
