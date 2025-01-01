import { JobDetails } from '../types/job';

interface StandardValidation {
  code: string;
  description: string;
  validate: (data: JobDetails) => boolean;
}

const australianStandards: StandardValidation[] = [
  {
    code: 'AS/NZS 3000',
    description: 'Electrical installations (known as the Australian/New Zealand Wiring Rules)',
    validate: (data) => {
      if (!data.powerDetails?.capacity) return false;
      if (!data.powerDetails?.details.includes('compliance')) return false;
      return true;
    }
  },
  {
    code: 'AS/NZS 3500',
    description: 'Plumbing and drainage',
    validate: (data) => {
      const sanitisationNotes = data.sanitisationDetails?.notes?.toLowerCase() || '';
      return sanitisationNotes.includes('water') || sanitisationNotes.includes('drainage');
    }
  },
  {
    code: 'AS/NZS 3666',
    description: 'Air-handling and water systems of buildings - Microbial control',
    validate: (data) => {
      const notes = data.notes?.some(note => 
        note.content.toLowerCase().includes('ventilation') || 
        note.content.toLowerCase().includes('air quality')
      );
      return !!notes;
    }
  },
  {
    code: 'ABC',
    description: 'Australian Building Code',
    validate: (data) => {
      // Check if any notes mention building code compliance
      return data.notes?.some(note => 
        note.content.toLowerCase().includes('building code') || 
        note.content.toLowerCase().includes('abc compliance')
      ) ?? false;
    }
  }
];

export const validateAgainstStandards = (data: JobDetails): string[] => {
  const errors: string[] = [];
  
  australianStandards.forEach(standard => {
    if (!standard.validate(data)) {
      errors.push(`Does not meet ${standard.code} (${standard.description})`);
    }
  });

  return errors;
};

export const getApplicableStandards = (data: JobDetails): string[] => {
  return australianStandards
    .filter(standard => standard.validate(data))
    .map(standard => `${standard.code} - ${standard.description}`);
};
