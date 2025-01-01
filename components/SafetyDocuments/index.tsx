import React from "react";
import SafetyDocuments from "./SafetyDocuments";

const SafetyDocumentsSection = ({ jobNumber }: { jobNumber: string }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Safety Documents</h1>
      <SafetyDocuments jobNumber={jobNumber} />
    </div>
  );
};

export default SafetyDocumentsSection;
