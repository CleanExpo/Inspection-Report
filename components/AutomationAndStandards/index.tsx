import React from "react";
import AutomationStandards from "./AutomationStandards";

const AutomationStandardsSection = ({
  jobNumber,
  claimType,
  classification,
  category,
}: {
  jobNumber: string;
  claimType: string;
  classification: string;
  category: string;
}) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Automation and Standards</h1>
      <AutomationStandards
        jobNumber={jobNumber}
        claimType={claimType}
        classification={classification}
        category={category}
      />
    </div>
  );
};

export default AutomationStandardsSection;
