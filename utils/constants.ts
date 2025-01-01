export const BUSINESS_DETAILS = {
  name: 'Disaster Recovery QLD',
  address: '4/17 Tile St Wacol, Qld. Australia 4076',
  phone: '1300 309 361',
  email: 'admin@disasterrecovery.com.au',
  abn: '426 330 623 07',
  iicrcNumber: '47496',
  benchmarkMoisture: '12%wme (Wood Moisture Equivalent)'
} as const;

export const MOISTURE_STANDARDS = {
  BENCHMARK_WME: 12, // Wood Moisture Equivalent in percentage
  ACCEPTABLE_RANGES: {
    wood: {
      min: 8,
      max: 15,
      critical: 20
    },
    plasterboard: {
      min: 8,
      max: 12,
      critical: 16
    },
    concrete: {
      min: 2,
      max: 4,
      critical: 6
    },
    carpet: {
      min: 8,
      max: 12,
      critical: 15
    }
  }
} as const;

// Standard amperage requirements for common restoration equipment
export const EQUIPMENT_AMPS = [
  { name: "Air Movers - Low", amps: 1 },
  { name: "Air Movers - High", amps: 1.5 },
  { name: "LGR Dehumidifiers", amps: 3.4 },
  { name: "Desiccant Dehumidifiers", amps: 8.5 },
  { name: "Air Scrubber (AFD's)", amps: 1.5 },
  { name: "Heat Box", amps: 6.5 },
] as const;

export const REPORT_DEFAULTS = {
  title: 'Inspection Report',
  subtitle: 'Property Damage Assessment',
  footer: {
    text: `© ${new Date().getFullYear()} ${BUSINESS_DETAILS.name}. All rights reserved.`,
    disclaimer: 'This report is prepared in accordance with IICRC standards and Australian building codes.'
  },
  sections: {
    introduction: 'Initial Assessment',
    methodology: 'Inspection Methodology',
    findings: 'Inspection Findings',
    recommendations: 'Recommendations',
    photos: 'Photo Documentation',
    moisture: 'Moisture Readings',
    certification: 'Certification'
  }
} as const;

export const VALIDATION_THRESHOLDS = {
  moisture: {
    warning: MOISTURE_STANDARDS.BENCHMARK_WME + 2, // 14%
    critical: MOISTURE_STANDARDS.BENCHMARK_WME + 5  // 17%
  },
  temperature: {
    min: 18, // Celsius
    max: 28  // Celsius
  },
  humidity: {
    min: 30, // Percentage
    max: 60  // Percentage
  }
} as const;
