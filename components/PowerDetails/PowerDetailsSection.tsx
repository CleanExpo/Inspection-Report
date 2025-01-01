"use client";

import React from 'react';
import PowerDetails from './PowerDetails';
import type { PowerReading } from './PowerDetails';

interface PowerDetailsSectionProps {
  jobNumber: string;
  totalEquipmentPower: number;
  onSave?: (readings: PowerReading[]) => void;
  className?: string;
}

const PowerDetailsSection: React.FC<PowerDetailsSectionProps> = ({
  jobNumber,
  totalEquipmentPower,
  onSave,
  className = ""
}) => {
  return (
    <div className={className}>
      <PowerDetails
        jobNumber={jobNumber}
        totalEquipmentPower={totalEquipmentPower}
        onSave={onSave}
      />
    </div>
  );
};

export default PowerDetailsSection;
