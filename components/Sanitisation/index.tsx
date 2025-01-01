import React from "react";
import Sanitisation from "./Sanitisation";

const SanitisationSection = ({ jobNumber }: { jobNumber: string }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Sanitisation</h1>
      <Sanitisation jobNumber={jobNumber} />
    </div>
  );
};

export default SanitisationSection;
