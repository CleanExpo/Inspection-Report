import React from "react";
import FinalReviewSubmission from "./FinalReviewSubmission";

const FinalReviewSubmissionSection = ({ jobNumber }: { jobNumber: string }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Final Review and Submission</h1>
      <FinalReviewSubmission jobNumber={jobNumber} />
    </div>
  );
};

export default FinalReviewSubmissionSection;
