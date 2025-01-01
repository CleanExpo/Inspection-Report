import React, { useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import ReportMainPage from '../components/ReportMainPage';
import ReportForm from '../components/ReportForm';

interface ReportFormData {
  jobNumber: string;
  inspectionDate: string;
  clientName: string;
  propertyAddress: string;
  damageType: string;
  description: string;
  recommendations: string;
  inspectorName: string;
}

const Home: React.FC = () => {
  const [images, setImages] = useState<{
    propertyImage: string | null;
    claimImage: string | null;
  }>({
    propertyImage: null,
    claimImage: null
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const handleImagesUploaded = (type: 'property' | 'claim', url: string) => {
    setImages(prev => ({
      ...prev,
      [type === 'property' ? 'propertyImage' : 'claimImage']: url
    }));
  };

  const handleReportGeneration = async (formData: ReportFormData) => {
    if (!images.propertyImage || !images.claimImage) {
      alert('Please upload both property and claim images before generating the report.');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generateReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          propertyImage: images.propertyImage,
          claimImage: images.claimImage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      setGeneratedReport(data);
      alert('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 space-y-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Inspection Report Generator
        </h1>

        {/* Upload Section */}
        <ImageUploader 
          onImageUploaded={handleImagesUploaded}
          currentImages={images}
        />

        {/* Report Form */}
        {(images.propertyImage || images.claimImage) && (
          <div className="mt-12">
            <ReportForm
              onSubmit={handleReportGeneration}
              isSubmitting={isGenerating}
            />
          </div>
        )}

        {/* Report Preview */}
        {generatedReport && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Report Preview</h2>
            <ReportMainPage
              propertyImage={images.propertyImage!}
              claimImage={images.claimImage!}
            />
            <div className="mt-6 text-center">
              <p className="text-gray-600 mb-4">
                Report ID: {generatedReport.reportId}
                <br />
                Generated at: {new Date(generatedReport.generatedAt).toLocaleString()}
              </p>
              <button
                onClick={() => {
                  // TODO: Add download functionality
                  console.log('Downloading report:', generatedReport);
                }}
                className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                Download Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
