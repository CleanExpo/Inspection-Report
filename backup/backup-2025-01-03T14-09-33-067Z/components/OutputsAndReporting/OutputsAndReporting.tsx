import React, { useEffect, useState, useRef } from "react";
import { PDFExport, HTMLExport, MarkdownExport } from "./";
import { Stack } from "@mui/material";

interface OutputsAndReportingProps {
  jobNumber: string;
}

const OutputsAndReporting: React.FC<OutputsAndReportingProps> = ({ jobNumber }) => {
  const [reportData, setReportData] = useState<any>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/getReportData?jobNumber=${jobNumber}`);
        const data = await response.json();
        setReportData(data);
      } catch (error) {
        console.error("Error fetching report data:", error);
      }
    };

    fetchData();
  }, [jobNumber]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  return (
    <div className="p-4 border rounded shadow">
      {reportData ? (
        <div>
          <div ref={reportRef} className="p-4 bg-white space-y-8">
            <h1 className="text-2xl font-bold mb-4">Job Report</h1>

            {/* Branding */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold">Disaster Recovery QLD</h2>
              <p className="text-gray-600">Contact: 1300-309-361</p>
              <p className="text-gray-600">Email: admin@disasterrecovery.com.au</p>
            </div>

            {/* Administration Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Administration</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Job Number:</span> {reportData.administration.jobNumber}</p>
                <p><span className="font-medium">Client Name:</span> {reportData.administration.clientName}</p>
                <p><span className="font-medium">Site Address:</span> {reportData.administration.siteAddress}</p>
              </div>
            </div>

            {/* Loss and Damage Assessment */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Loss and Damage Assessment</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Cause of Loss:</span> {reportData.lossDetails.causeOfLoss}</p>
                <p><span className="font-medium">Claim Type:</span> {reportData.lossDetails.claimType}</p>
                <p><span className="font-medium">Classification:</span> {reportData.lossDetails.classification}</p>
                <p><span className="font-medium">Category:</span> {reportData.lossDetails.category}</p>
              </div>
            </div>

            {/* Photos Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Photos and Documentation</h3>
              <div className="grid gap-8">
                {reportData.photos.map((photo: any, index: number) => (
                  <div key={index} className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200 transition-shadow hover:shadow-xl">
                    <div className="aspect-w-2 aspect-h-1 bg-gray-50">
                      <img 
                        src={photo.url} 
                        alt={photo.annotation}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="p-6 space-y-3 bg-gradient-to-b from-white to-gray-50">
                      <h4 className="text-lg font-semibold text-gray-900">{photo.location}</h4>
                      <p className="text-gray-600">{photo.annotation}</p>
                      {photo.timestamp && (
                        <p className="text-sm text-gray-500 pt-2 border-t">
                          Captured: {formatDate(photo.timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Export Buttons */}
          <Stack direction="row" spacing={2} className="mt-8">
            <PDFExport
              contentRef={reportRef}
              filename={`JobReport_${jobNumber}.pdf`}
              paperSize="a4"
              orientation="portrait"
            />
            <HTMLExport
              contentRef={reportRef}
              filename={`JobReport_${jobNumber}`}
              includeAssets={true}
            />
            <MarkdownExport
              contentRef={reportRef}
              filename={`JobReport_${jobNumber}`}
              includeAssets={true}
            />
          </Stack>
        </div>
      ) : (
        <div className="py-12 text-center text-gray-600">
          <div className="animate-pulse">Loading report data...</div>
        </div>
      )}
    </div>
  );
};

export default OutputsAndReporting;
