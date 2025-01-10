import React, { useEffect, useState } from "react";

interface FinalReviewSubmissionProps {
  jobNumber: string;
}

const FinalReviewSubmission: React.FC<FinalReviewSubmissionProps> = ({ jobNumber }) => {
  const [consolidatedData, setConsolidatedData] = useState<any>(null);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Fetch all data for review
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/getReportData?jobNumber=${jobNumber}`);
        const data = await response.json();
        setConsolidatedData(data);

        // Validate the data
        validateData(data);
      } catch (error) {
        console.error("Error fetching consolidated data:", error);
      }
    };

    fetchData();
  }, [jobNumber]);

  const validateData = (data: any) => {
    const errors: string[] = [];

    // Example validation
    if (!data.administration?.clientName) {
      errors.push("Client Name is missing.");
    }
    if (!data.lossDetails?.causeOfLoss) {
      errors.push("Cause of Loss is missing.");
    }
    if (!data.photos || data.photos.length === 0) {
      errors.push("No photos have been uploaded.");
    }

    setValidationErrors(errors);
    setIsValid(errors.length === 0);
  };

  const handleSubmit = async () => {
    if (!isValid) {
      alert("Please fix the validation errors before submitting.");
      return;
    }

    try {
      const response = await fetch("/api/submitFinalReport", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobNumber,
          consolidatedData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit the final report");
      }

      alert("Report submitted successfully!");
    } catch (error) {
      console.error("Error submitting the report:", error);
      alert("Error submitting the report. Please try again.");
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Final Review and Submission</h2>

      {consolidatedData ? (
        <div>
          {/* Validation Errors */}
          {!isValid && (
            <div className="mb-4 text-red-500">
              <h3 className="font-bold">Validation Errors:</h3>
              <ul>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Consolidated Data */}
          <div className="mb-4">
            <h3 className="font-bold">Review Data:</h3>
            <pre className="bg-gray-100 p-4 rounded">
              {JSON.stringify(consolidatedData, null, 2)}
            </pre>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Submit Final Report
          </button>
        </div>
      ) : (
        <p>Loading consolidated data...</p>
      )}
    </div>
  );
};

export default FinalReviewSubmission;
