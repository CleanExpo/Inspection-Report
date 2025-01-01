# Form Handling and Validation Workflows

## Overview
This guide covers essential form handling and validation patterns implemented in the inspection report system. These workflows ensure data integrity and provide a smooth user experience when working with forms.

## Key Components

### 1. Form State Management
```typescript
// Using React's useState for basic form management
const [formData, setFormData] = useState({
  fieldName: '',
  value: ''
});

// For complex forms, using custom hooks
const { 
  data, 
  handleChange, 
  validate, 
  errors 
} = useAdminForm();
```

### 2. Validation Patterns

#### Client-Side Validation
```typescript
const validateField = (name: string, value: any): string[] => {
  const errors: string[] = [];
  
  switch (name) {
    case 'email':
      if (!value.includes('@')) {
        errors.push('Invalid email format');
      }
      break;
    case 'phone':
      if (!/^\d{10}$/.test(value)) {
        errors.push('Phone must be 10 digits');
      }
      break;
  }
  
  return errors;
};
```

#### Form-Level Validation
```typescript
const validateForm = (data: FormData): ValidationResult => {
  const errors: ValidationErrors = {};
  
  // Required fields check
  const requiredFields = ['name', 'email', 'phone'];
  requiredFields.forEach(field => {
    if (!data[field]) {
      errors[field] = ['This field is required'];
    }
  });
  
  // Field-specific validation
  Object.entries(data).forEach(([field, value]) => {
    const fieldErrors = validateField(field, value);
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

### 3. Error Handling and Display

```typescript
const ErrorDisplay = ({ errors }: { errors: string[] }) => {
  if (!errors || errors.length === 0) return null;
  
  return (
    <div className="error-messages">
      {errors.map((error, index) => (
        <div key={index} className="error-message">
          {error}
        </div>
      ))}
    </div>
  );
};
```

### 4. Form Submission Workflow

```typescript
const handleSubmit = async (event: FormEvent) => {
  event.preventDefault();
  
  // Validate form
  const validation = validateForm(formData);
  if (!validation.isValid) {
    setErrors(validation.errors);
    return;
  }
  
  try {
    // Submit data
    const response = await submitFormData(formData);
    
    // Handle success
    handleSuccess(response);
    
  } catch (error) {
    // Handle error
    handleError(error);
  }
};
```

## Best Practices

1. **Progressive Enhancement**
   - Implement both client-side and server-side validation
   - Use HTML5 validation attributes as first line of defense
   - Apply custom validation logic for complex rules

2. **User Experience**
   - Provide immediate feedback on validation errors
   - Clear error messages with actionable guidance
   - Maintain form state during validation

3. **Performance**
   - Debounce validation for real-time checks
   - Optimize validation logic for large forms
   - Cache validation results when appropriate

4. **Accessibility**
   - Use ARIA attributes for error states
   - Ensure keyboard navigation
   - Provide clear focus indicators

## Implementation Examples

### Basic Form Implementation
```typescript
const InspectionForm = () => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="location">Location</label>
        <input
          id="location"
          name="location"
          value={formData.location || ''}
          onChange={handleChange}
          aria-invalid={!!errors.location}
        />
        <ErrorDisplay errors={errors.location} />
      </div>
      {/* Additional form fields */}
    </form>
  );
};
```

### Complex Validation Example
```typescript
const validateInspectionData = (data: InspectionFormData): ValidationResult => {
  const errors: ValidationErrors = {};
  
  // Location validation
  if (!data.location?.trim()) {
    errors.location = ['Location is required'];
  }
  
  // Date validation
  if (data.inspectionDate) {
    const date = new Date(data.inspectionDate);
    if (isNaN(date.getTime())) {
      errors.inspectionDate = ['Invalid date format'];
    } else if (date > new Date()) {
      errors.inspectionDate = ['Inspection date cannot be in the future'];
    }
  }
  
  // Moisture readings validation
  if (data.moistureReadings?.length > 0) {
    const readingErrors = data.moistureReadings.map(validateMoistureReading);
    if (readingErrors.some(e => e.length > 0)) {
      errors.moistureReadings = readingErrors;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

## Integration Points

- Forms integrate with the global state management system
- Validation rules can be customized per form instance
- Error handling coordinates with the notification system
- Form data connects to the API layer for persistence

## Common Patterns

1. **Field-Level Validation**
   - Immediate feedback on field blur
   - Real-time validation for specific fields
   - Custom validation rules per field type

2. **Form-Level Validation**
   - Cross-field validation rules
   - Business logic validation
   - Submission preparation checks

3. **Error Management**
   - Centralized error state
   - Hierarchical error structure
   - Error message templating

4. **State Management**
   - Form data normalization
   - State persistence between sessions
   - Undo/redo capability for complex forms
