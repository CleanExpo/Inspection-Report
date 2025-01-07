import {
  validateClientFields,
  validateRequiredFields,
  validateRelationships,
  validateBusinessRules,
  ClientField,
  ValidationResult,
  BusinessRule
} from '../../app/utils/clientValidation';

describe('Client Validation Tests', () => {
  // Test data
  const validClientFields: ClientField[] = [
    {
      name: 'name',
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 100
    },
    {
      name: 'email',
      type: 'email',
      required: false,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    {
      name: 'phone',
      type: 'string',
      required: false,
      pattern: /^\+?[\d\s-()]{10,20}$/
    }
  ];

  describe('validateClientFields', () => {
    it('should validate valid client data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1-234-567-8900'
      };

      const result = validateClientFields(validData, validClientFields);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for missing required field', () => {
      const invalidData = {
        email: 'john@example.com',
        phone: '+1-234-567-8900'
      };

      const result = validateClientFields(invalidData, validClientFields);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('name');
    });

    it('should fail validation for invalid email format', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        phone: '+1-234-567-8900'
      };

      const result = validateClientFields(invalidData, validClientFields);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('email');
    });

    it('should fail validation for invalid phone format', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: 'invalid-phone'
      };

      const result = validateClientFields(invalidData, validClientFields);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('phone');
    });
  });

  describe('validateRequiredFields', () => {
    it('should validate when all required fields are present', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const result = validateRequiredFields(data, validClientFields);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when required field is missing', () => {
      const data = {
        email: 'john@example.com'
      };

      const result = validateRequiredFields(data, validClientFields);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('name');
    });

    it('should fail when required field is empty string', () => {
      const data = {
        name: '',
        email: 'john@example.com'
      };

      const result = validateRequiredFields(data, validClientFields);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('name');
    });
  });

  describe('validateRelationships', () => {
    const fieldsWithRelationships: ClientField[] = [
      {
        name: 'startDate',
        type: 'date',
        relationships: [
          {
            field: 'endDate',
            rule: 'before',
            message: 'Start date must be before end date'
          }
        ]
      },
      {
        name: 'endDate',
        type: 'date'
      }
    ];

    it('should validate valid date relationships', () => {
      const data = {
        startDate: '2024-01-01',
        endDate: '2024-01-02'
      };

      const result = validateRelationships(data, fieldsWithRelationships);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when dates are in wrong order', () => {
      const data = {
        startDate: '2024-01-02',
        endDate: '2024-01-01'
      };

      const result = validateRelationships(data, fieldsWithRelationships);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('startDate');
    });
  });

  describe('validateBusinessRules', () => {
    const businessRules: BusinessRule[] = [
      {
        name: 'validAge',
        condition: (data) => {
          const age = parseInt(data.age);
          return !isNaN(age) && age >= 18 && age <= 120;
        },
        message: 'Age must be between 18 and 120'
      }
    ];

    it('should validate valid business rules', () => {
      const data = {
        age: '25'
      };

      const result = validateBusinessRules(data, businessRules);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when business rule is violated', () => {
      const data = {
        age: '15'
      };

      const result = validateBusinessRules(data, businessRules);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('validAge');
    });

    it('should handle invalid data gracefully', () => {
      const data = {
        age: 'invalid'
      };

      const result = validateBusinessRules(data, businessRules);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });
});
