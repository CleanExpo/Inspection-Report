import React from "react";
import EquipmentRecommendations from "./EquipmentRecommendations";

const EquipmentRecommendationsSection = ({ jobNumber }: { jobNumber: string }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Equipment Recommendations</h1>
      <EquipmentRecommendations jobNumber={jobNumber} />
    </div>
  );
};

export default EquipmentRecommendationsSection;
