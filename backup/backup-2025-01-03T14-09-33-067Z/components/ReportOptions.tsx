import React from "react";

interface ReportOptionsProps {
  includeSops: boolean;
  setIncludeSops: (value: boolean) => void;
  includeGuidelines: boolean;
  setIncludeGuidelines: (value: boolean) => void;
}

const ReportOptions: React.FC<ReportOptionsProps> = ({
  includeSops,
  setIncludeSops,
  includeGuidelines,
  setIncludeGuidelines
}) => {
  return (
    <div className="mb-4">
      <label className="flex items-center mb-2">
        <input
          type="checkbox"
          checked={includeSops}
          onChange={() => setIncludeSops(!includeSops)}
          className="mr-2"
        />
        Include SOPs in the Report
      </label>
      
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={includeGuidelines}
          onChange={() => setIncludeGuidelines(!includeGuidelines)}
          className="mr-2"
        />
        Include Australian Guidelines in the Report
      </label>
    </div>
  );
};

export default ReportOptions;
