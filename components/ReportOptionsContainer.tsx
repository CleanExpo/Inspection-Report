import React, { useState } from 'react';
import ReportOptions from './ReportOptions';
import SOPContainer from './SOPContainer';

const ReportOptionsContainer: React.FC = () => {
  const [includeSops, setIncludeSops] = useState(false);
  const [includeGuidelines, setIncludeGuidelines] = useState(false);

  return (
    <div className="space-y-4">
      <ReportOptions
        includeSops={includeSops}
        setIncludeSops={setIncludeSops}
        includeGuidelines={includeGuidelines}
        setIncludeGuidelines={setIncludeGuidelines}
      />

      {includeSops && (
        <SOPContainer
          isEditable={true}
        />
      )}
    </div>
  );
};

export default ReportOptionsContainer;
