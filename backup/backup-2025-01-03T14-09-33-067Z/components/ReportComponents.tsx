"use client";

import React from 'react';
import GenerateReport from './GenerateReport';
import type { InspectionReport } from '../types/inspection';

interface ReportComponentsProps {
  report: InspectionReport;
  includeStandards?: boolean;
  className?: string;
}

const ReportComponents: React.FC<ReportComponentsProps> = ({
  report,
  includeStandards = false,
  className = ""
}) => {
  return (
    <div className={className}>
      <GenerateReport
        report={report}
        className={includeStandards ? 'mb-6' : undefined}
      />

      {includeStandards && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Industry Standards</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>IICRC S500 - Water Damage Restoration</li>
            <li>IICRC S520 - Mold Remediation</li>
            <li>AS/NZS 3733:2018 - Textile Floor Coverings</li>
            <li>AS 3740:2010 - Waterproofing of Wet Areas</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReportComponents;
