export interface HazardousMaterial {
  id: string;
  name: string;
  category: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  precautions: string[];
  requiredPPE: string[];
  disposalInstructions: string;
}

export const HAZARDOUS_MATERIALS: HazardousMaterial[] = [
  {
    id: 'asbestos',
    name: 'Asbestos',
    category: 'Building Material',
    description: 'Fibrous mineral commonly used in building materials before 1990',
    riskLevel: 'high',
    precautions: [
      'Do not disturb material',
      'Keep material wet when handling',
      'Use proper containment methods'
    ],
    requiredPPE: [
      'P2/P3 respirator',
      'Disposable coveralls',
      'Gloves',
      'Safety goggles'
    ],
    disposalInstructions: 'Must be disposed of at licensed asbestos waste facility'
  },
  {
    id: 'lead-paint',
    name: 'Lead Paint',
    category: 'Paint',
    description: 'Paint containing lead, common in buildings before 1978',
    riskLevel: 'high',
    precautions: [
      'Avoid creating dust',
      'Use wet methods for removal',
      'Contain work area'
    ],
    requiredPPE: [
      'Respirator with P100 filters',
      'Protective clothing',
      'Gloves',
      'Eye protection'
    ],
    disposalInstructions: 'Must be disposed of as hazardous waste'
  },
  {
    id: 'mold',
    name: 'Mold',
    category: 'Biological',
    description: 'Various types of fungi that can grow on damp building materials',
    riskLevel: 'medium',
    precautions: [
      'Identify and fix water source',
      'Use proper containment',
      'Use HEPA air filtration'
    ],
    requiredPPE: [
      'N95 respirator',
      'Gloves',
      'Eye protection',
      'Protective clothing'
    ],
    disposalInstructions: 'Double-bag and seal before disposal'
  },
  {
    id: 'sewage',
    name: 'Sewage',
    category: 'Biological',
    description: 'Contaminated water containing harmful bacteria and pathogens',
    riskLevel: 'high',
    precautions: [
      'Avoid direct contact',
      'Use proper disinfectants',
      'Ensure proper ventilation'
    ],
    requiredPPE: [
      'Full face respirator',
      'Waterproof boots',
      'Chemical resistant gloves',
      'Full body suit'
    ],
    disposalInstructions: 'Must be properly treated before disposal'
  },
  {
    id: 'chemical-residue',
    name: 'Chemical Residue',
    category: 'Chemical',
    description: 'Residual chemicals from cleaning products or industrial processes',
    riskLevel: 'medium',
    precautions: [
      'Identify chemical type',
      'Use appropriate neutralizers',
      'Ensure proper ventilation'
    ],
    requiredPPE: [
      'Chemical resistant gloves',
      'Respirator with appropriate cartridges',
      'Face shield',
      'Chemical resistant clothing'
    ],
    disposalInstructions: 'Dispose according to specific chemical requirements'
  }
];
