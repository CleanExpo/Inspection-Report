interface SimplificationRules {
  pattern: RegExp;
  replacement: string;
}

const technicalTerms: SimplificationRules[] = [
  {
    pattern: /electrical installation/gi,
    replacement: "wiring"
  },
  {
    pattern: /ventilation system/gi,
    replacement: "air flow"
  },
  {
    pattern: /sanitisation/gi,
    replacement: "cleaning"
  },
  {
    pattern: /structural integrity/gi,
    replacement: "building strength"
  },
  {
    pattern: /moisture mitigation/gi,
    replacement: "water control"
  },
  {
    pattern: /thermal efficiency/gi,
    replacement: "heat control"
  }
];

const standardsTerms: SimplificationRules[] = [
  {
    pattern: /AS\/NZS \d+/g,
    replacement: "Australian Standard"
  },
  {
    pattern: /in accordance with/gi,
    replacement: "following"
  },
  {
    pattern: /compliance with/gi,
    replacement: "meets"
  },
  {
    pattern: /pursuant to/gi,
    replacement: "according to"
  }
];

export const simplifyText = (text: string, level: 'basic' | 'detailed' = 'basic'): string => {
  let simplified = text;

  // Always apply basic simplification
  technicalTerms.forEach(({ pattern, replacement }) => {
    simplified = simplified.replace(pattern, replacement);
  });

  // Only simplify standards terminology if basic level is requested
  if (level === 'basic') {
    standardsTerms.forEach(({ pattern, replacement }) => {
      simplified = simplified.replace(pattern, replacement);
    });
  }

  return simplified;
};

export const simplifyReport = (reportText: string, includeStandards: boolean): string => {
  const level = includeStandards ? 'detailed' : 'basic';
  return simplifyText(reportText, level);
};
