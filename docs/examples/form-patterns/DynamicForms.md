# Dynamic Form Generation Patterns

This guide demonstrates patterns for generating dynamic forms in React, including JSON-driven forms, conditional fields, and multi-step forms.

## JSON-Driven Forms

### Form Schema Definition

```tsx
interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'radio';
  options?: { label: string; value: string }[];
  validation?: {
    required?: boolean;
    pattern?: RegExp;
    min?: number;
    max?: number;
    custom?: (value: any) => string | undefined;
  };
}

interface FormSchema {
  fields: FormField[];
  submitLabel: string;
}

// Example schema
const contactFormSchema: FormSchema = {
  fields: [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      validation: {
        required: true,
        pattern: /^[a-zA-Z\s]{2,}$/
      }
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'text',
      validation: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      }
    },
    {
      name: 'preferredContact',
      label: 'Preferred Contact Method',
      type: 'select',
      options: [
        { label: 'Email', value: 'email' },
        { label: 'Phone', value: 'phone' }
      ]
    }
  ],
  submitLabel: 'Submit Contact Form'
};
```

### Dynamic Form Generator

```tsx
const DynamicForm: React.FC<{
  schema: FormSchema;
  onSubmit: (values: Record<string, any>) => void;
}> = ({ schema, onSubmit }) => {
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: FormField, value: any): string | undefined => {
    const { validation } = field;
    if (!validation) return undefined;

    if (validation.required && !value) {
      return `${field.label} is required`;
    }

    if (validation.pattern && !validation.pattern.test(value)) {
      return `${field.label} format is invalid`;
    }

    if (validation.custom) {
      return validation.custom(value);
    }

    return undefined;
  };

  const handleChange = (field: FormField, value: any) => {
    setValues(prev => ({ ...prev, [field.name]: value }));
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field.name]: error }));
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'select':
        return (
          <FormControl error={!!errors[field.name]}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={values[field.name] || ''}
              onChange={e => handleChange(field, e.target.value)}
            >
              {field.options?.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {errors[field.name] && (
              <FormHelperText>{errors[field.name]}</FormHelperText>
            )}
          </FormControl>
        );
      default:
        return (
          <TextField
            label={field.label}
            type={field.type}
            value={values[field.name] || ''}
            onChange={e => handleChange(field, e.target.value)}
            error={!!errors[field.name]}
            helperText={errors[field.name]}
          />
        );
    }
  };

  return (
    <form onSubmit={e => {
      e.preventDefault();
      onSubmit(values);
    }}>
      {schema.fields.map(field => (
        <Box key={field.name} sx={{ mb: 2 }}>
          {renderField(field)}
        </Box>
      ))}
      <Button type="submit">{schema.submitLabel}</Button>
    </form>
  );
};
```

## Conditional Fields

### Dependency-Based Fields

```tsx
interface ConditionalField extends FormField {
  dependsOn?: {
    field: string;
    value: any;
  };
}

const ConditionalForm: React.FC<{
  fields: ConditionalField[];
  onSubmit: (values: Record<string, any>) => void;
}> = ({ fields, onSubmit }) => {
  const [values, setValues] = useState<Record<string, any>>({});

  const isFieldVisible = (field: ConditionalField): boolean => {
    if (!field.dependsOn) return true;
    return values[field.dependsOn.field] === field.dependsOn.value;
  };

  return (
    <form>
      {fields.map(field => (
        isFieldVisible(field) && (
          <FormField
            key={field.name}
            field={field}
            value={values[field.name]}
            onChange={value => setValues(prev => ({
              ...prev,
              [field.name]: value
            }))}
          />
        )
      ))}
    </form>
  );
};

// Usage example
const fields: ConditionalField[] = [
  {
    name: 'hasPhone',
    label: 'Do you have a phone number?',
    type: 'checkbox'
  },
  {
    name: 'phoneNumber',
    label: 'Phone Number',
    type: 'text',
    dependsOn: {
      field: 'hasPhone',
      value: true
    }
  }
];
```

## Multi-Step Forms

### Step Management

```tsx
interface FormStep {
  title: string;
  fields: FormField[];
  validation?: (values: Record<string, any>) => Record<string, string>;
}

const MultiStepForm: React.FC<{
  steps: FormStep[];
  onComplete: (values: Record<string, any>) => void;
}> = ({ steps, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: FormStep): boolean => {
    if (!step.validation) return true;
    
    const stepErrors = step.validation(values);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    const currentStepData = steps[currentStep];
    if (validateStep(currentStepData)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleComplete = () => {
    const finalStep = steps[currentStep];
    if (validateStep(finalStep)) {
      onComplete(values);
    }
  };

  return (
    <Box>
      <Stepper activeStep={currentStep}>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepLabel>{step.title}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 2 }}>
        {steps[currentStep].fields.map(field => (
          <FormField
            key={field.name}
            field={field}
            value={values[field.name]}
            error={errors[field.name]}
            onChange={value => setValues(prev => ({
              ...prev,
              [field.name]: value
            }))}
          />
        ))}
      </Box>

      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        {currentStep > 0 && (
          <Button onClick={handleBack}>
            Back
          </Button>
        )}
        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button onClick={handleComplete}>
            Complete
          </Button>
        )}
      </Box>
    </Box>
  );
};
```

## Best Practices

1. **Schema Design**
   - Keep schemas simple and flat
   - Use clear naming conventions
   - Document validation rules

2. **Conditional Logic**
   - Keep conditions simple
   - Cache condition results
   - Handle edge cases

3. **Multi-Step Forms**
   - Save progress between steps
   - Validate before proceeding
   - Allow back navigation

4. **Performance**
   - Memoize form renderers
   - Optimize validation
   - Use controlled inputs wisely
