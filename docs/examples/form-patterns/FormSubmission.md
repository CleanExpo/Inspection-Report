# Form Submission Patterns

This guide covers best practices and patterns for handling form submissions in React applications, focusing on asynchronous submission, progress tracking, and error handling.

## Async Form Submission

### Basic Async Submission
```tsx
const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  
  try {
    setSubmitting(true);
    const response = await api.submitForm(formData);
    handleSuccess(response);
  } catch (error) {
    handleError(error);
  } finally {
    setSubmitting(false);
  }
};
```

### With Progress Tracking
```tsx
const ProgressForm = () => {
  const [progress, setProgress] = useState(0);
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      const formData = new FormData(event.currentTarget as HTMLFormElement);
      
      await axios.post('/api/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      });
      
      handleSuccess();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {progress > 0 && <ProgressBar value={progress} />}
      <button type="submit">Submit</button>
    </form>
  );
};
```

## Success/Error Handling

### Success State Management
```tsx
const SuccessHandlingForm = () => {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSuccess = (response: any) => {
    setStatus('success');
    setMessage('Form submitted successfully!');
    // Additional success actions (e.g., redirect, reset form)
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <button 
          type="submit" 
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      
      {status === 'success' && (
        <div className="success-message">
          {message}
        </div>
      )}
    </div>
  );
};
```

### Error Handling
```tsx
const ErrorHandlingForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleError = (error: any) => {
    if (error.response?.data?.errors) {
      // Handle field-specific errors
      setErrors(error.response.data.errors);
    } else {
      // Handle general error
      setErrors({
        general: error.message || 'An unexpected error occurred'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {errors.general && (
        <div className="error-message">
          {errors.general}
        </div>
      )}
      
      <div>
        <input
          type="text"
          name="email"
          className={errors.email ? 'error' : ''}
        />
        {errors.email && (
          <span className="field-error">{errors.email}</span>
        )}
      </div>
      
      <button type="submit">Submit</button>
    </form>
  );
};
```

## Complete Example with All Patterns

```tsx
interface FormData {
  email: string;
  password: string;
}

const CompleteForm = () => {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('submitting');
    setErrors({});
    
    try {
      const formData = new FormData(event.currentTarget as HTMLFormElement);
      
      const response = await axios.post('/api/submit', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      });
      
      handleSuccess(response);
    } catch (error) {
      handleError(error);
    }
  };

  const handleSuccess = (response: any) => {
    setStatus('success');
    setMessage('Form submitted successfully!');
    // Reset form or redirect
  };

  const handleError = (error: any) => {
    setStatus('error');
    if (error.response?.data?.errors) {
      setErrors(error.response.data.errors);
    } else {
      setErrors({
        general: error.message || 'An unexpected error occurred'
      });
    }
  };

  return (
    <div className="form-container">
      {status === 'success' ? (
        <div className="success-message">
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="error-message">
              {errors.general}
            </div>
          )}
          
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              className={errors.email ? 'error' : ''}
              disabled={status === 'submitting'}
            />
            {errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              className={errors.password ? 'error' : ''}
              disabled={status === 'submitting'}
            />
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>

          {status === 'submitting' && progress > 0 && (
            <ProgressBar value={progress} />
          )}

          <button 
            type="submit" 
            disabled={status === 'submitting'}
            className="submit-button"
          >
            {status === 'submitting' ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      )}
    </div>
  );
};
```

This complete example demonstrates:
- Async form submission with progress tracking
- Comprehensive error handling (field-level and general errors)
- Success state management
- Form state management
- Loading states and disabled controls
- TypeScript integration
- Proper event handling and type safety

The patterns shown here can be adapted and extended based on specific requirements while maintaining a solid foundation for form submission handling.
