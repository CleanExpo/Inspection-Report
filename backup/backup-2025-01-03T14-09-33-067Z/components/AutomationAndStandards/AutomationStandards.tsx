import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface AutomationStandardsProps {
  jobNumber: string;
  claimType: string;
  classification: string;
  category: string;
}

const AutomationStandards: React.FC<AutomationStandardsProps> = ({
  jobNumber,
  claimType,
  classification,
  category,
}) => {
  const [standards, setStandards] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Automatically apply standards and generate recommendations
    const applyStandards = () => {
      const newStandards: string[] = [];
      const newRecommendations: string[] = [];

      // Example: Add standards based on claim type
      if (claimType === "Water") {
        newStandards.push("Follow IICRC S500 standards for water damage restoration.");
        newRecommendations.push(
          "Use dehumidifiers and air movers to control humidity.",
          "Inspect for hidden moisture."
        );
      }

      if (classification === "Class 3 (Major Damage)") {
        newStandards.push("Use specialty drying equipment for large-scale water loss.");
      }

      if (category === "Category 3 (Black Water)") {
        newRecommendations.push(
          "Ensure all technicians wear full PPE.",
          "Sanitize affected areas thoroughly using industry-approved chemicals."
        );
      }

      setStandards(newStandards);
      setRecommendations(newRecommendations);
    };

    applyStandards();
  }, [claimType, classification, category]);

  const handleSave = async () => {
    try {
      const response = await fetch("/api/saveAutomationStandards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobNumber,
          standards,
          recommendations,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save automation standards");
      }

      alert("Automation standards saved successfully!");
    } catch (error) {
      console.error("Error saving automation standards:", error);
      alert("Error saving automation standards. Please try again.");
    }
  };

  const generatePDF = async () => {
    if (!contentRef.current) return;

    try {
      const canvas = await html2canvas(contentRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      // Add header
      pdf.setFontSize(16);
      pdf.text(`Standards Report - Job ${jobNumber}`, pdfWidth / 2, 20, { align: 'center' });

      // Add content
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      // Add footer
      pdf.setFontSize(10);
      const today = new Date().toLocaleDateString();
      pdf.text(`Generated on ${today}`, pdfWidth / 2, pdfHeight - 10, { align: 'center' });

      pdf.save(`standards-report-${jobNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <div ref={contentRef}>
        <h2 className="text-xl font-bold mb-4">Automation and Standards Application</h2>

        {/* Standards Section */}
        <div className="mb-4">
          <h3 className="font-bold">Standards Applied:</h3>
          <ul className="list-disc pl-6">
            {standards.map((standard, index) => (
              <li key={index}>{standard}</li>
            ))}
          </ul>
        </div>

        {/* Recommendations Section */}
        <div className="mb-4">
          <h3 className="font-bold">Recommendations:</h3>
          <ul className="list-disc pl-6">
            {recommendations.map((recommendation, index) => (
              <li key={index}>{recommendation}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex gap-2">
        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save Automation Standards
        </button>

        {/* Export PDF Button */}
        <button
          type="button"
          onClick={generatePDF}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Export PDF
        </button>
      </div>
    </div>
  );
};

export default AutomationStandards;
