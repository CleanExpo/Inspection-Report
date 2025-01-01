import React from "react";
import ClientFeedback from "./ClientFeedback";

const ClientFeedbackSection = ({ jobNumber }: { jobNumber: string }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Client Feedback and Final Steps</h1>
      <ClientFeedback jobNumber={jobNumber} />
    </div>
  );
};

export default ClientFeedbackSection;
