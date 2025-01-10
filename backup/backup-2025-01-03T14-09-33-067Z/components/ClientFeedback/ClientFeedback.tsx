import React, { useState } from "react";
import SignaturePad from "react-signature-canvas";

interface ClientFeedbackProps {
  jobNumber: string;
}

const ClientFeedback: React.FC<ClientFeedbackProps> = ({ jobNumber }) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comments, setComments] = useState<string>("");
  const [signature, setSignature] = useState<string | null>(null);

  let sigPad: any;

  const clearSignature = () => {
    sigPad.clear();
    setSignature(null);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/saveClientFeedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobNumber,
          rating,
          comments,
          signature,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save client feedback");
      }

      alert("Client feedback saved successfully!");
    } catch (error) {
      console.error("Error saving client feedback:", error);
      alert("Error saving client feedback. Please try again.");
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Client Feedback and Final Steps</h2>

      {/* Rating */}
      <div className="mb-4">
        <h3 className="font-bold">Rate Your Experience:</h3>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`px-4 py-2 border rounded ${
                rating === star ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setRating(star)}
            >
              {star} Star{star > 1 ? "s" : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Comments */}
      <label className="block mb-4">
        Comments or Suggestions:
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="border rounded px-2 py-1 w-full"
          rows={4}
          placeholder="Enter your comments here"
        />
      </label>

      {/* Signature */}
      <div className="mb-4">
        <h3 className="font-bold">Work Completion Acknowledgment:</h3>
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

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Submit Feedback
      </button>
    </div>
  );
};

export default ClientFeedback;
