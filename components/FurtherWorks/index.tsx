import React from "react";
import FurtherWorks from "./FurtherWorks";

const FurtherWorksSection = ({ jobNumber }: { jobNumber: string }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Further Works</h1>
      <FurtherWorks jobNumber={jobNumber} />
    </div>
  );
};

export default FurtherWorksSection;
