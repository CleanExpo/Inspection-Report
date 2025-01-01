import React, { useState } from 'react';
import SOPManagement from './SOPManagement';
import SOPViewer from './SOPViewer';

interface SOPContainerProps {
  initialSops?: string[];
  isEditable?: boolean;
  className?: string;
}

const SOPContainer: React.FC<SOPContainerProps> = ({ 
  initialSops = [], 
  isEditable = false,
  className = "" 
}) => {
  const [sops, setSops] = useState<string[]>(initialSops);

  const handleAddSop = (sop: string) => {
    setSops([...sops, sop]);
  };

  const handleRemoveSop = (index: number) => {
    setSops(sops.filter((_, i) => i !== index));
  };

  return (
    <div className={className}>
      {isEditable ? (
        <SOPManagement
          sops={sops}
          onAdd={handleAddSop}
          onRemove={handleRemoveSop}
        />
      ) : (
        <SOPViewer sops={sops} />
      )}
    </div>
  );
};

export default SOPContainer;

// Example usage:
/*
// View mode
<SOPContainer initialSops={['SOP 1', 'SOP 2']} />

// Edit mode
<SOPContainer 
  initialSops={['SOP 1', 'SOP 2']} 
  isEditable={true}
/>
*/
