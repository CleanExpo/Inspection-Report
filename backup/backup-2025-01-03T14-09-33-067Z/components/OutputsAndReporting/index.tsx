import React from "react";
import OutputsAndReporting from "./OutputsAndReporting";
export { default as PDFExport } from './PDFExport';
export { default as HTMLExport } from './HTMLExport';
export { default as MarkdownExport } from './MarkdownExport';

const OutputsAndReportingSection = ({ jobNumber }: { jobNumber: string }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Outputs and Reporting</h1>
      <OutputsAndReporting jobNumber={jobNumber} />
    </div>
  );
};

export default OutputsAndReportingSection;
