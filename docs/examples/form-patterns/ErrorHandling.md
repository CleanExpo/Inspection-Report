# Form Error Handling Patterns

This guide demonstrates various patterns for handling errors in React forms, including field-level errors, form-level errors, and API error handling.

## Field-Level Errors

### Individual Field Error Handling

```tsx
interface FieldError {
  message: string;
  type: 'required' | 'pattern' | 'custom';
}

const FormField: React.FC<{
  name: string;
  value: string;
  error?: FieldError;
  onChange: (value: string) => void;
  onBlur: () => void;
}> = ({ name, value, error, onChange, onBlur }) => {
  return (
    <FormControl error={!!error}>
      <TextField
        name={name}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        error={!!error}
        helperText={error?.message}
        FormHelperTextProps={{
          role: error ? 'alert' : undefined
        }}
      />
    </FormControl>
  );
};
```

### Error State Management Hook

```tsx
const useFieldErrors = <T extends Record<string, any>>(initialValues: T) => {
  const [errors, setErrors] = useState<Partial<Record<keyof T, FieldError>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setFieldError = (field: keyof T, error?: FieldError) => {
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const setFieldTouched = (field: keyof T, isTouched: boolean = true) => {
    setTouched(prev => ({
      ...prev,
      [field]: isTouched
    }));
  };

  const clearErrors = () => {
    setErrors({});
    setTouched({});
  };

  return {
    errors,
    touched,
    setFieldError,
    setFieldTouched,
    clearErrors,
    hasErrors: Object.keys(errors).length > 0
  };
};
```

## Form-Level Errors

### Form Error Context

```tsx
interface FormErrorContext {
  formError: string | null;
  setFormError: (error: string | null) => void;
  clearFormError: () => void;
}

const FormErrorContext = createContext<FormErrorContext | undefined>(undefined);

const FormErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formError, setFormError] = useState<string | null>(null);

  const clearFormError = useCallback(() => {
    setFormError(null);
  }, []);

  return (
    <FormErrorContext.Provider value={{ formError, setFormError, clearFormError }}>
      {formError && (
        <Alert severity="error" onClose={clearFormError}>
          {formError}
        </Alert>
      )}
      {children}
    </FormErrorContext.Provider>
  );
};
```

### Form Error Boundary

```tsx
class FormErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error">
          <AlertTitle>Form Error</AlertTitle>
          {this.state.error?.message || 'An unexpected error occurred'}
          <Button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </Button>
        </Alert>
      );
    }

    return this.props.children;
  }
}
```

## API Error Handling

### API Error Integration

```tsx
interface ApiError {
  code: string;
  message: string;
  field?: string;
}

const useApiErrorHandler = () => {
  const [apiErrors, setApiErrors] = useState<ApiError[]>([]);
  const { setFieldError } = useFieldErrors();
  const { setFormError } = useContext(FormErrorContext);

  const handleApiError = useCallback((error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.data?.errors) {
      const errors: ApiError[] = error.response.data.errors;
      setApiErrors(errors);

      // Handle field-specific errors
      errors.forEach(err => {
        if (err.field) {
          setFieldError(err.field, {
            message: err.message,
            type: 'custom'
          });
        }
      });

      // Set form-level error if any
      const generalErrors = errors.filter(err => !err.field);
      if (generalErrors.length > 0) {
        setFormError(generalErrors.map(err => err.message).join('. '));
      }
    } else {
      setFormError('An unexpected error occurred');
    }
  }, [setFieldError, setFormError]);

  return {
    apiErrors,
    handleApiError,
    clearApiErrors: () => setApiErrors([])
  };
};
```

### Error Recovery Pattern

```tsx
const SubmitForm: React.FC = () => {
  const { handleApiError, clearApiErrors } = useApiErrorHandler();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleSubmit = async (data: FormData) => {
    clearApiErrors();
    try {
      await api.submitForm(data);
    } catch (error) {
      handleApiError(error);
      setIsRetrying(true);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(false);
    // Implement retry logic
  };

  return (
    <FormErrorBoundary>
      <FormErrorProvider>
        <form onSubmit={handleSubmit}>
          {/* Form fields */}
          <Button
            type="submit"
            disabled={isRetrying}
          >
            {isRetrying ? 'Retry' : 'Submit'}
          </Button>
        </form>
      </FormErrorProvider>
    </FormErrorBoundary>
  );
};
```

## Best Practices

1. **Error Hierarchy**
   - Handle field-level errors closest to inputs
   - Use form-level errors for general issues
   - Implement error boundaries for unexpected errors

2. **User Experience**
   - Show errors at appropriate times
   - Provide clear error messages
   - Offer recovery options when possible

3. **Error Management**
   - Centralize error handling logic
   - Use typed error interfaces
   - Implement proper error cleanup

4. **Accessibility**
   - Use proper ARIA attributes
   - Ensure error messages are announced
   - Maintain keyboard navigation
