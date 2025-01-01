import React, { useState, useEffect } from "react";
import { fetchJobDetails, saveJobDetails } from "../../utils/ascoraService";

interface LossInformationProps {
  jobNumber: string;
}

const LossInformation: React.FC<LossInformationProps> = ({ jobNumber }) => {
  const [formData, setFormData] = useState({
    causeOfLoss: "",
    claimType: "",
    classification: "",
    category: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const claimTypes = ["Water", "Fire", "Mould", "Bio-hazard", "Vandalism", "Sewage", "Other"];
  const classifications = ["Class 1 (Minimal Damage)", "Class 2 (Moderate Damage)", "Class 3 (Major Damage)", "Class 4 (Specialty Drying Situations)"];
  const categories = ["Category 1 (Clean Water)", "Category 2 (Grey Water)", "Category 3 (Black Water)"];

  // Fetch Job Details for Prefill
  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobDetails = await fetchJobDetails(jobNumber);
        setFormData({
          causeOfLoss: jobDetails.causeOfLoss || "",
          claimType: jobDetails.claimType || "",
          classification: jobDetails.classification || "",
          category: jobDetails.category || "",
        });
      } catch (error) {
        console.error("Error fetching job details:", error);
      }
    };

    fetchData();
  }, [jobNumber]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear any previous save message when form is modified
    setSaveMessage("");
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");
    
    try {
      await saveJobDetails(jobNumber, formData);
      setSaveMessage("Changes saved successfully");
    } catch (error) {
      console.error("Error saving job details:", error);
      setSaveMessage("Error saving changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Loss Information</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        {/* Cause of Loss */}
        <label className="block mb-2">
          Cause of Loss (Short Description):
          <input
            type="text"
            name="causeOfLoss"
            value={formData.causeOfLoss}
            onChange={handleInputChange}
            className="border rounded px-2 py-1 w-full"
            placeholder="Describe the cause of loss"
          />
        </label>

        {/* Claim Type */}
        <label className="block mb-2">
          Claim Type:
          <select
            name="claimType"
            value={formData.claimType}
            onChange={handleInputChange}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">Select Claim Type</option>
            {claimTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        {/* Classification */}
        <label className="block mb-2">
          Classification (IICRC S500):
          <select
            name="classification"
            value={formData.classification}
            onChange={handleInputChange}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">Select Classification</option>
            {classifications.map((classification) => (
              <option key={classification} value={classification}>
                {classification}
              </option>
            ))}
          </select>
        </label>

        {/* Category */}
        <label className="block mb-2">
          Category (IICRC S500):
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        {/* Save Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 rounded ${
              isSaving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          
          {/* Save Message */}
          {saveMessage && (
            <p className={`mt-2 ${
              saveMessage.includes('Error') ? 'text-red-500' : 'text-green-500'
            }`}>
              {saveMessage}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LossInformation;
