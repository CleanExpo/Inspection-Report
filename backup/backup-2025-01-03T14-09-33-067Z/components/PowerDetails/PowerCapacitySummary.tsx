import React from 'react';

interface PowerCapacitySummaryProps {
  totalPowerCapacity: number;
  totalEquipmentPower: number;
  isPowerSufficient: boolean;
}

const PowerCapacitySummary: React.FC<PowerCapacitySummaryProps> = ({
  totalPowerCapacity,
  totalEquipmentPower,
  isPowerSufficient,
}) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-blue-800 mb-6 flex items-center gap-2">
        <span>⚡</span>
        Power Capacity Summary
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Total Power Capacity</div>
          <div className="text-2xl font-bold">{totalPowerCapacity} amps</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Required Equipment Power</div>
          <div className="text-2xl font-bold">{totalEquipmentPower} amps</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Power Status</div>
          <div className={`text-2xl font-bold ${isPowerSufficient ? 'text-green-500' : 'text-red-500'}`}>
            {isPowerSufficient ? 'Sufficient ✓' : 'Insufficient ⚠️'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerCapacitySummary;
