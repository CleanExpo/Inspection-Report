export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateJobNumber = (jobNumber: string): ValidationResult => {
  const errors: string[] = [];

  if (!jobNumber) {
    errors.push("Job number is required");
  } else if (!/^\d{6}-\d{2}$/.test(jobNumber)) {
    errors.push("Invalid job number format. Expected format: XXXXXX-XX");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateDate = (date: string): ValidationResult => {
  const errors: string[] = [];

  if (!date) {
    errors.push("Date is required");
  } else {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      errors.push("Invalid date format");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];

  if (!email) {
    errors.push("Email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Invalid email format");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePhoneNumber = (phone: string): ValidationResult => {
  const errors: string[] = [];

  if (!phone) {
    errors.push("Phone number is required");
  } else if (!/^\+?[\d\s-]{10,}$/.test(phone)) {
    errors.push("Invalid phone number format");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateRequired = (value: any, fieldName: string): ValidationResult => {
  const errors: string[] = [];

  if (value === undefined || value === null || value === '') {
    errors.push(`${fieldName} is required`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateLength = (
  value: string,
  fieldName: string,
  min?: number,
  max?: number
): ValidationResult => {
  const errors: string[] = [];

  if (min !== undefined && value.length < min) {
    errors.push(`${fieldName} must be at least ${min} characters`);
  }

  if (max !== undefined && value.length > max) {
    errors.push(`${fieldName} must not exceed ${max} characters`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateNumericRange = (
  value: number,
  fieldName: string,
  min?: number,
  max?: number
): ValidationResult => {
  const errors: string[] = [];

  if (min !== undefined && value < min) {
    errors.push(`${fieldName} must be at least ${min}`);
  }

  if (max !== undefined && value > max) {
    errors.push(`${fieldName} must not exceed ${max}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateIICRC = (certification: string): ValidationResult => {
  const errors: string[] = [];

  if (!certification) {
    errors.push("IICRC certification number is required");
  } else if (!/^[A-Z]\d{8}$/.test(certification)) {
    errors.push("Invalid IICRC certification format. Expected format: L12345678");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const combineValidations = (...validations: ValidationResult[]): ValidationResult => {
  const combinedErrors = validations.reduce(
    (allErrors, validation) => [...allErrors, ...validation.errors],
    [] as string[]
  );

  return {
    isValid: combinedErrors.length === 0,
    errors: combinedErrors
  };
};
