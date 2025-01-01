import React from 'react';

interface LossDamageAssessmentProps {
  jobNumber: string;
}

const LossDamageAssessment: React.FC<LossDamageAssessmentProps> = ({ jobNumber }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Loss Information</h3>
          <form className="space-y-4">
            {/* Cause of Loss */}
            <div>
              <label className="block mb-1">
                Cause of Loss (Short Description):
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Describe the cause of loss"
                defaultValue="Burst pipe in kitchen"
              />
            </div>

            {/* Claim Type */}
            <div>
              <label className="block mb-1">
                Claim Type:
              </label>
              <select className="w-full p-2 border rounded">
                <option>Water</option>
                <option>Fire</option>
                <option>Mould</option>
                <option>Bio-hazard</option>
                <option>Vandalism</option>
                <option>Sewage</option>
                <option>Other</option>
              </select>
            </div>

            {/* Classification */}
            <div>
              <label className="block mb-1">
                Classification (IICRC S500):
              </label>
              <select className="w-full p-2 border rounded">
                <option>Class 1 (Minimal Damage)</option>
                <option>Class 2 (Moderate Damage)</option>
                <option>Class 3 (Major Damage)</option>
                <option>Class 4 (Specialty Drying Situations)</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block mb-1">
                Category (IICRC S500):
              </label>
              <select className="w-full p-2 border rounded">
                <option>Category 1 (Clean Water)</option>
                <option>Category 2 (Grey Water)</option>
                <option>Category 3 (Black Water)</option>
              </select>
            </div>

            {/* Save Button */}
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LossDamageAssessment;
