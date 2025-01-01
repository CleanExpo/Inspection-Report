// IICRC S500 Standard Moisture Content Guidelines
export const moistureThresholds = {
  // Wood/Timber materials
  wood: {
    dry: { min: 0, max: 15 },    // Normal moisture content
    affected: { min: 16, max: 19 }, // Requires monitoring
    wet: { min: 20, max: 24 },    // Requires drying
    saturated: { min: 25, max: 100 } // Immediate action required
  },
  
  // Plasterboard/Drywall
  drywall: {
    dry: { min: 0, max: 12 },
    affected: { min: 13, max: 16 },
    wet: { min: 17, max: 20 },
    saturated: { min: 21, max: 100 }
  },
  
  // Concrete/Masonry
  concrete: {
    dry: { min: 0, max: 14 },
    affected: { min: 15, max: 18 },
    wet: { min: 19, max: 24 },
    saturated: { min: 25, max: 100 }
  }
};

// IICRC S500 Drying Goals
export const dryingGoals = {
  // Maximum days to reach dry standard
  maxDryingDays: 5,
  
  // Required daily moisture reduction percentage
  dailyReductionTarget: 10, // 10% reduction per day
  
  // Temperature range for effective drying (Celsius)
  temperature: {
    min: 21, // 21°C
    max: 29  // 29°C
  },
  
  // Relative humidity range for effective drying
  humidity: {
    min: 30, // 30% RH
    max: 50  // 50% RH
  }
};

// Validation functions
export function validateMoistureReading(value: number, materialType: string) {
  const thresholds = moistureThresholds[materialType as keyof typeof moistureThresholds];
  if (!thresholds) {
    return {
      isValid: false,
      status: 'unknown',
      message: `Unknown material type: ${materialType}`
    };
  }

  // Find the appropriate range
  for (const [status, range] of Object.entries(thresholds)) {
    if (value >= range.min && value <= range.max) {
      return {
        isValid: true,
        status,
        message: getStatusMessage(status, value, materialType)
      };
    }
  }

  return {
    isValid: false,
    status: 'invalid',
    message: `Invalid reading: ${value} for ${materialType}`
  };
}

export function validateDryingProgress(
  readings: { value: number; timestamp: Date; materialType: string }[]
) {
  if (readings.length < 2) {
    return {
      isValid: true,
      warnings: [],
      message: 'Not enough readings to evaluate drying progress'
    };
  }

  const warnings = [];
  const daysSinceStart = (
    readings[readings.length - 1].timestamp.getTime() - 
    readings[0].timestamp.getTime()
  ) / (1000 * 60 * 60 * 24);

  // Check if exceeding maximum drying days
  if (daysSinceStart > dryingGoals.maxDryingDays) {
    warnings.push(
      `Drying time (${Math.round(daysSinceStart)} days) exceeds IICRC recommended maximum of ${dryingGoals.maxDryingDays} days`
    );
  }

  // Calculate daily reduction percentage
  const firstReading = readings[0].value;
  const lastReading = readings[readings.length - 1].value;
  const totalReduction = ((firstReading - lastReading) / firstReading) * 100;
  const dailyReduction = totalReduction / daysSinceStart;

  if (dailyReduction < dryingGoals.dailyReductionTarget) {
    warnings.push(
      `Daily moisture reduction (${Math.round(dailyReduction)}%) is below IICRC target of ${dryingGoals.dailyReductionTarget}%`
    );
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    message: warnings.length === 0 
      ? 'Drying progress meets IICRC standards'
      : 'Drying progress requires attention'
  };
}

function getStatusMessage(status: string, value: number, materialType: string): string {
  switch (status) {
    case 'dry':
      return `Normal moisture content for ${materialType}`;
    case 'affected':
      return `Monitor ${materialType} - slightly elevated moisture`;
    case 'wet':
      return `Drying required - ${materialType} moisture content too high`;
    case 'saturated':
      return `Immediate action required - ${materialType} severely wet`;
    default:
      return `Unknown status for ${materialType}`;
  }
}
