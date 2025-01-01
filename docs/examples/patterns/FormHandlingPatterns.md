# Form Handling Patterns

This guide demonstrates common patterns for handling forms in React applications.

## Form Validation Examples

### Client-Side Validation
```tsx
const useFormValidation = (initialValues) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const validate = (fieldValues = values) => {
    let tempErrors = { ...errors };

    if ('email' in fieldValues)
      tempErrors.email = fieldValues.email ? 
        (/^[^@\s]+@[^@\s]+\.[^@\s]+$/).test(fieldValues.email) ? "" : "Invalid email" 
        : "Email is required";

    if ('password' in fieldValues)
      tempErrors.password = fieldValues.password ? 
        fieldValues.password.length >= 8 ? "" : "Password must be at least 8 characters" 
        : "Password is required";

    setErrors(tempErrors);
    return Object.values(tempErrors).every(x => x === "");
  };

  return { values, setValues, errors, validate };
};

// Usage example
const SignupForm = () => {
  const { values, setValues, errors, validate } = useFormValidation({
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Submit form
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={values.email}
        onChange={e => setValues({...values, email: e.target.value})}
      />
      {errors.email && <span>{errors.email}</span>}
      
      <input
        type="password"
        value={values.password}
        onChange={e => setValues({...values, password: e.target.value})}
      />
      {errors.password && <span>{errors.password}</span>}
      
      <button type="submit">Submit</button>
    </form>
  );
};
```

### Server-Side Validation
```tsx
const RegistrationForm = () => {
  const [serverErrors, setServerErrors] = useState({});
  
  const handleSubmit = async (values) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      
      if (!response.ok) {
        const errors = await response.json();
        setServerErrors(errors);
        return;
      }
      
      // Handle success
    } catch (error) {
      setServerErrors({ general: 'An error occurred' });
    }
  };

  return (
    <form>
      {/* Form fields */}
      {serverErrors.general && (
        <div className="error">{serverErrors.general}</div>
      )}
    </form>
  );
};
```

### Real-Time Validation
```tsx
const useRealTimeValidation = (value, validateFn) => {
  const [error, setError] = useState('');
  const [debouncedValue] = useDebounce(value, 500);

  useEffect(() => {
    const error = validateFn(debouncedValue);
    setError(error);
  }, [debouncedValue, validateFn]);

  return error;
};

// Usage example
const EmailField = () => {
  const [email, setEmail] = useState('');
  const error = useRealTimeValidation(email, (value) => {
    if (!value) return 'Email is required';
    if (!(/^[^@\s]+@[^@\s]+\.[^@\s]+$/).test(value)) return 'Invalid email';
    return '';
  });

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      {error && <span className="error">{error}</span>}
    </div>
  );
};
```

## Error Handling in Forms

### Field-Level Errors
```tsx
const FormField = ({ name, value, onChange, validate }) => {
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const newValue = e.target.value;
    const error = validate(newValue);
    setError(error);
    onChange(newValue);
  };

  return (
    <div>
      <input
        name={name}
        value={value}
        onChange={handleChange}
        className={error ? 'error' : ''}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};
```

### Form-Level Errors
```tsx
const useFormErrors = (initialValues) => {
  const [formErrors, setFormErrors] = useState({});
  
  const validateForm = (values) => {
    const errors = {};
    
    // Cross-field validation
    if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // Complex business rules
    if (values.endDate && values.startDate && new Date(values.endDate) <= new Date(values.startDate)) {
      errors.endDate = 'End date must be after start date';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return { formErrors, validateForm };
};
```

### API Error Handling
```tsx
const useApiErrors = () => {
  const [apiErrors, setApiErrors] = useState({});

  const handleApiError = async (error) => {
    if (error.response?.status === 422) {
      // Validation errors
      setApiErrors(error.response.data.errors);
    } else if (error.response?.status === 401) {
      // Authentication errors
      setApiErrors({ auth: 'Please login again' });
    } else {
      // Generic error
      setApiErrors({ general: 'An unexpected error occurred' });
    }
  };

  return { apiErrors, handleApiError, setApiErrors };
};
```

## Dynamic Form Generation

### JSON-Driven Forms
```tsx
const DynamicForm = ({ formConfig, onSubmit }) => {
  const [values, setValues] = useState({});

  const renderField = (field) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
        return (
          <input
            type={field.type}
            name={field.name}
            value={values[field.name] || ''}
            onChange={e => setValues({...values, [field.name]: e.target.value})}
          />
        );
      case 'select':
        return (
          <select
            name={field.name}
            value={values[field.name] || ''}
            onChange={e => setValues({...values, [field.name]: e.target.value})}
          >
            {field.options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      // Add more field types as needed
    }
  };

  return (
    <form onSubmit={e => {
      e.preventDefault();
      onSubmit(values);
    }}>
      {formConfig.fields.map(field => (
        <div key={field.name}>
          <label>{field.label}</label>
          {renderField(field)}
        </div>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
};
```

### Conditional Fields
```tsx
const ConditionalForm = () => {
  const [formData, setFormData] = useState({
    employmentStatus: '',
    companyName: '',
    schoolName: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  return (
    <form>
      <select
        name="employmentStatus"
        value={formData.employmentStatus}
        onChange={handleChange}
      >
        <option value="">Select status</option>
        <option value="employed">Employed</option>
        <option value="student">Student</option>
      </select>

      {formData.employmentStatus === 'employed' && (
        <input
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          placeholder="Company name"
        />
      )}

      {formData.employmentStatus === 'student' && (
        <input
          name="schoolName"
          value={formData.schoolName}
          onChange={handleChange}
          placeholder="School name"
        />
      )}
    </form>
  );
};
```

### Multi-Step Forms
```tsx
const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2>Personal Information</h2>
            <input
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
            />
            <button onClick={nextStep}>Next</button>
          </div>
        );
      case 2:
        return (
          <div>
            <h2>Contact Information</h2>
            <input
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
            />
            <button onClick={prevStep}>Back</button>
            <button onClick={nextStep}>Next</button>
          </div>
        );
      case 3:
        return (
          <div>
            <h2>Review</h2>
            <pre>{JSON.stringify(formData, null, 2)}</pre>
            <button onClick={prevStep}>Back</button>
            <button onClick={handleSubmit}>Submit</button>
          </div>
        );
    }
  };

  const handleSubmit = () => {
    // Submit form data
  };

  return (
    <div>
      <div className="progress-bar">
        Step {step} of 3
      </div>
      {renderStep()}
    </div>
  );
};
```

## Form Submission Patterns

### Async Submission
```tsx
const AsyncForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await submitForm(formData);
      // Handle success
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};
```

### Progress Tracking
```tsx
const FileUploadForm = () => {
  const [progress, setProgress] = useState(0);

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentage);
        }
      });
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      <input type="file" onChange={e => handleUpload(e.target.files[0])} />
      {progress > 0 && (
        <div className="progress-bar">
          <div 
            className="progress"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};
```

### Success/Error Handling
```tsx
const SubmissionForm = () => {
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [error, setError] = useState(null);

  const handleSubmit = async (data) => {
    setStatus('submitting');
    setError(null);

    try {
      await submitForm(data);
      setStatus('success');
      
      // Reset form after delay
      setTimeout(() => {
        setStatus('idle');
        // Reset form data
      }, 3000);
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <button 
          type="submit" 
          disabled={status === 'submitting'}
        >
          Submit
        </button>
      </form>

      {status === 'success' && (
        <div className="success">
          Form submitted successfully!
        </div>
      )}

      {status === 'error' && (
        <div className="error">
          Error: {error}
        </div>
      )}
    </div>
  );
};
```

## Best Practices and Tips

1. Always validate both client-side and server-side
2. Use controlled components for form inputs
3. Implement proper error handling at all levels
4. Show clear feedback during form submission
5. Use proper HTML5 input types and attributes
6. Implement proper form accessibility
7. Handle edge cases and loading states
8. Use proper form state management
9. Implement proper form security measures
10. Use proper form validation libraries when needed
