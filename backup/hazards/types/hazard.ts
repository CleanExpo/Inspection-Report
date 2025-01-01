export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface HazardousMaterial {
  id: string;
  name: string;
  description: string;
  riskLevel: RiskLevel;
  controlMeasures: string[];
  ppe: string[];
  handlingProcedures: string[];
  disposalRequirements: string[];
  regulatoryInfo: {
    code: string;
    regulations: string[];
    permits: string[];
  };
  warningSymbols: string[];
  emergencyProcedures: {
    firstAid: string[];
    spillage: string[];
    fire: string[];
  };
}

export interface HazardAssessment {
  id: string;
  inspectionId: string;
  materials: HazardousMaterial[];
  assessmentDate: string;
  assessedBy: string;
  notes: string;
  recommendations: string[];
  photos: string[];
  status: 'draft' | 'completed' | 'reviewed';
  reviewedBy?: string;
  reviewDate?: string;
}

export type SafetyMeasureType = 'containment' | 'ppe' | 'procedure' | 'training' | 'monitoring';
export type ImplementationStatus = 'pending' | 'implemented' | 'verified';
export type Effectiveness = 'effective' | 'partially_effective' | 'ineffective';

export interface SafetyMeasure {
  id: string;
  hazardAssessmentId: string;
  type: SafetyMeasureType;
  description: string;
  implementationStatus: ImplementationStatus;
  verificationDate?: string;
  verifiedBy?: string;
  effectiveness: Effectiveness;
  notes: string;
}

export interface HazardReport {
  id: string;
  assessmentId: string;
  reportDate: string;
  summary: string;
  findings: {
    materialId: string;
    riskLevel: RiskLevel;
    observations: string[];
    recommendations: string[];
  }[];
  photos: {
    url: string;
    caption: string;
    location: string;
  }[];
  safetyMeasures: SafetyMeasure[];
  approvals: {
    role: string;
    name: string;
    date: string;
    approved: boolean;
    comments?: string;
  }[];
}

export const RISK_LEVEL_INFO = {
  low: {
    color: 'success',
    label: 'Low Risk',
    description: 'Minimal hazard with standard safety measures required',
    requirements: [
      'Basic PPE',
      'Standard handling procedures',
      'Regular monitoring'
    ]
  },
  medium: {
    color: 'info',
    label: 'Medium Risk',
    description: 'Moderate hazard requiring specific safety protocols',
    requirements: [
      'Specific PPE',
      'Trained personnel only',
      'Regular monitoring',
      'Emergency procedures in place'
    ]
  },
  high: {
    color: 'warning',
    label: 'High Risk',
    description: 'Significant hazard requiring strict controls',
    requirements: [
      'Specialised PPE',
      'Expert handling only',
      'Continuous monitoring',
      'Emergency team on standby',
      'Detailed documentation'
    ]
  },
  critical: {
    color: 'error',
    label: 'Critical Risk',
    description: 'Extreme hazard requiring maximum precautions',
    requirements: [
      'Full protective equipment',
      'Expert team required',
      'Continuous monitoring',
      'Emergency response team',
      'Detailed documentation',
      'Regulatory compliance',
      'Special permits required'
    ]
  }
} as const;

export const DEFAULT_HAZARDOUS_MATERIALS: HazardousMaterial[] = [
  {
    id: 'asbestos',
    name: 'Asbestos',
    description: 'Fibrous mineral used in building materials, known carcinogen',
    riskLevel: 'critical',
    controlMeasures: [
      'Full containment',
      'Negative air pressure',
      'HEPA filtration',
      'Decontamination unit'
    ],
    ppe: [
      'Full-face respirator',
      'Disposable coveralls',
      'Gloves',
      'Boot covers'
    ],
    handlingProcedures: [
      'Wet methods only',
      'Double bagging',
      'Licensed removal only',
      'Air monitoring required'
    ],
    disposalRequirements: [
      'Licensed disposal facility',
      'Special waste containers',
      'Documented chain of custody'
    ],
    regulatoryInfo: {
      code: 'ASB-001',
      regulations: [
        'Work Health and Safety Regulation 2011',
        'Code of Practice for the Safe Removal of Asbestos'
      ],
      permits: [
        'Asbestos removal licence',
        'Waste transport certificate'
      ]
    },
    warningSymbols: [
      'health-hazard',
      'toxic'
    ],
    emergencyProcedures: {
      firstAid: [
        'Seek immediate medical attention',
        'Do not brush off clothes',
        'Record exposure details'
      ],
      spillage: [
        'Evacuate area',
        'Wet down material',
        'Contact licensed removalist'
      ],
      fire: [
        'Evacuate immediately',
        'Contact emergency services',
        'Inform of asbestos presence'
      ]
    }
  },
  {
    id: 'methamphetamine',
    name: 'Methamphetamine',
    description: 'Residual contamination from drug manufacturing or use',
    riskLevel: 'critical',
    controlMeasures: [
      'Full containment',
      'Negative air pressure',
      'HEPA filtration',
      'Chemical decontamination'
    ],
    ppe: [
      'Full-face respirator with appropriate cartridges',
      'Chemical-resistant coveralls',
      'Double gloves',
      'Chemical-resistant boots'
    ],
    handlingProcedures: [
      'Surface testing required',
      'Specialized cleaning protocols',
      'Licensed remediation only',
      'Air quality monitoring'
    ],
    disposalRequirements: [
      'Hazardous waste facility',
      'Secure containment',
      'Documentation required'
    ],
    regulatoryInfo: {
      code: 'MET-001',
      regulations: [
        'Clandestine Drug Lab Remediation Guidelines',
        'Illicit Drug Premises Act'
      ],
      permits: [
        'Hazardous materials handling licence',
        'Remediation certification'
      ]
    },
    warningSymbols: [
      'toxic',
      'chemical-hazard'
    ],
    emergencyProcedures: {
      firstAid: [
        'Remove from area immediately',
        'Seek medical attention',
        'Document exposure'
      ],
      spillage: [
        'Evacuate area',
        'Contact hazmat team',
        'Document incident'
      ],
      fire: [
        'Evacuate immediately',
        'Contact emergency services',
        'Inform of chemical presence'
      ]
    }
  },
  {
    id: 'coronavirus',
    name: 'Corona Virus',
    description: 'SARS-CoV-2 virus contamination requiring specialized cleaning',
    riskLevel: 'high',
    controlMeasures: [
      'Ventilation control',
      'Surface disinfection',
      'UV treatment',
      'Isolation periods'
    ],
    ppe: [
      'N95/P2 respirator',
      'Disposable coveralls',
      'Nitrile gloves',
      'Face shield',
      'Boot covers'
    ],
    handlingProcedures: [
      'EPA-approved disinfectants only',
      'Proper dwell times',
      'Regular air exchange',
      'Surface testing'
    ],
    disposalRequirements: [
      'Biohazard waste bags',
      'Licensed medical waste disposal',
      'Proper documentation'
    ],
    regulatoryInfo: {
      code: 'COV-001',
      regulations: [
        'Public Health Orders',
        'WHO Guidelines',
        'CDC Recommendations'
      ],
      permits: [
        'Biohazard cleaning certification'
      ]
    },
    warningSymbols: [
      'biohazard'
    ],
    emergencyProcedures: {
      firstAid: [
        'Isolate exposed person',
        'Contact medical authorities',
        'Document exposure'
      ],
      spillage: [
        'Ventilate area',
        'Apply disinfectant',
        'Wait required dwell time'
      ],
      fire: [
        'Standard fire procedures',
        'Maintain PPE protocols'
      ]
    }
  },
  {
    id: 'blood',
    name: 'Blood',
    description: 'Biological contamination requiring specialized cleaning',
    riskLevel: 'high',
    controlMeasures: [
      'Containment barriers',
      'Surface disinfection',
      'Proper ventilation',
      'Biohazard controls'
    ],
    ppe: [
      'Face shield',
      'N95 respirator',
      'Double gloves',
      'Fluid-resistant coveralls',
      'Boot covers'
    ],
    handlingProcedures: [
      'EPA-registered disinfectants',
      'Proper dwell times',
      'Bloodborne pathogen protocols',
      'Documentation required'
    ],
    disposalRequirements: [
      'Biohazard containers',
      'Medical waste disposal',
      'Chain of custody'
    ],
    regulatoryInfo: {
      code: 'BLD-001',
      regulations: [
        'Bloodborne Pathogens Standard',
        'Biohazard Cleanup Regulations'
      ],
      permits: [
        'Biohazard cleaning certification',
        'Medical waste handling'
      ]
    },
    warningSymbols: [
      'biohazard'
    ],
    emergencyProcedures: {
      firstAid: [
        'Clean exposed area',
        'Seek medical attention',
        'Document exposure'
      ],
      spillage: [
        'Contain spill',
        'Apply absorbent',
        'Disinfect area'
      ],
      fire: [
        'Standard fire procedures',
        'Maintain PPE protocols'
      ]
    }
  },
  {
    id: 'fentanyl',
    name: 'Fentanyl',
    description: 'Highly potent synthetic opioid requiring specialized handling',
    riskLevel: 'critical',
    controlMeasures: [
      'Full containment',
      'Negative air pressure',
      'HEPA filtration',
      'Chemical neutralization'
    ],
    ppe: [
      'Full-face respirator with P100 filters',
      'Chemical-resistant suit',
      'Multiple layers of gloves',
      'Chemical-resistant boots'
    ],
    handlingProcedures: [
      'Surface testing required',
      'Specialized decontamination',
      'Licensed handling only',
      'Continuous monitoring'
    ],
    disposalRequirements: [
      'DEA-approved disposal',
      'Secure containment',
      'Chain of custody',
      'Documentation required'
    ],
    regulatoryInfo: {
      code: 'FEN-001',
      regulations: [
        'DEA Guidelines',
        'Hazardous Substance Regulations',
        'Controlled Substances Act'
      ],
      permits: [
        'Hazardous materials licence',
        'Controlled substance handling'
      ]
    },
    warningSymbols: [
      'toxic',
      'chemical-hazard',
      'lethal'
    ],
    emergencyProcedures: {
      firstAid: [
        'Administer Naloxone if available',
        'Call emergency services immediately',
        'Do not touch exposed person without PPE'
      ],
      spillage: [
        'Evacuate area immediately',
        'Contact hazmat team',
        'Secure scene'
      ],
      fire: [
        'Evacuate immediately',
        'Contact emergency services',
        'Inform of fentanyl presence'
      ]
    }
  }
];
