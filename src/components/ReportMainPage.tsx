import React from "react";

interface ReportProps {
  propertyImage: string;
  claimImage: string;
}

const ReportMainPage: React.FC<ReportProps> = ({ propertyImage, claimImage }) => {
  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Inspection Report</h1>

      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-700">Property Front</h2>
          <div className="relative group">
            <img 
              src={propertyImage} 
              alt="Property Front" 
              className="w-full h-auto rounded-lg shadow-sm"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-700">Cause of Claim</h2>
          <div className="relative group">
            <img 
              src={claimImage} 
              alt="Cause of Claim" 
              className="w-full h-auto rounded-lg shadow-sm"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportMainPage;
