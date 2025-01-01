# Form Validation Patterns

This guide demonstrates various form validation patterns in React applications, including client-side validation, server-side validation, and real-time validation approaches.

## Client-Side Validation

### Basic Form Validation

```tsx
interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const SignupForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Proceed with form submission
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        error={!!errors.email}
        helperText={errors.email}
        value={formData.email}
        onChange={e => setFormData(prev => ({
          ...prev,
          email: e.target.value
        }))}
      />
      {/* Other fields */}
    </form>
  );
};
```

### Schema-Based Validation

```tsx
import * as yup from 'yup';
import { useFormik } from 'formik';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password should be at least 8 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm your password')
});

const SchemaValidatedForm: React.FC = () => {
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema,
    onSubmit: values => {
      // Handle submission
    }
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <TextField
        name="email"
        value={formik.values.email}
        onChange={formik.handleChange}
        error={formik.touched.email && !!formik.errors.email}
        helperText={formik.touched.email && formik.errors.email}
      />
      {/* Other fields */}
    </form>
  );
};
```

## Server-Side Validation

### API Validation Integration

```tsx
interface ServerErrors {
  field: string;
  message: string;
}

const RegistrationForm: React.FC = () => {
  const [serverErrors, setServerErrors] = useState<ServerErrors[]>([]);

  const handleSubmit = async (values: FormData) => {
    try {
      const response = await api.register(values);
      // Handle success
    } catch (error) {
      if (error.response?.data?.errors) {
        setServerErrors(error.response.data.errors);
        // Map server errors to form fields
        const fieldErrors = error.response.data.errors.reduce(
          (acc: FormErrors, curr: ServerErrors) => ({
            ...acc,
            [curr.field]: curr.message
          }),
          {}
        );
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {serverErrors.length > 0 && (
        <Alert severity="error">
          {serverErrors.map(error => (
            <div key={error.field}>{error.message}</div>
          ))}
        </Alert>
      )}
      {/* Form fields */}
    </form>
  );
};
```

## Real-Time Validation

### Debounced Validation

```tsx
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

const RealTimeValidationForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const debouncedEmail = useDebounce(email, 500);

  useEffect(() => {
    const validateEmail = async () => {
      if (!debouncedEmail) return;

      try {
        await api.checkEmailAvailability(debouncedEmail);
        setError('');
      } catch {
        setError('Email already taken');
      }
    };

    validateEmail();
  }, [debouncedEmail]);

  return (
    <TextField
      value={email}
      onChange={e => setEmail(e.target.value)}
      error={!!error}
      helperText={error}
    />
  );
};
```

### Field-Level Validation

```tsx
const useFieldValidation = (value: string, validate: (value: string) => string | undefined) => {
  const [error, setError] = useState<string>();
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (dirty) {
      const error = validate(value);
      setError(error);
    }
  }, [value, dirty, validate]);

  return {
    error,
    setDirty,
    isValid: !error
  };
};

const PasswordField: React.FC = () => {
  const [password, setPassword] = useState('');
  const validation = useFieldValidation(password, value => {
    if (!value) return 'Required';
    if (value.length < 8) return 'Too short';
    if (!/[A-Z]/.test(value)) return 'Need uppercase';
    return undefined;
  });

  return (
    <TextField
      type="password"
      value={password}
      onChange={e => setPassword(e.target.value)}
      onBlur={() => validation.setDirty(true)}
      error={!!validation.error}
      helperText={validation.error}
    />
  );
};
```

## Best Practices

1. **Validation Strategy**
   - Use client-side validation for immediate feedback
   - Always validate on server-side for security
   - Consider real-time validation for better UX

2. **Error Handling**
   - Provide clear error messages
   - Show errors at appropriate times
   - Handle both client and server errors

3. **Performance**
   - Debounce real-time validations
   - Optimize validation logic
   - Cache validation results when possible

4. **Accessibility**
   - Use ARIA attributes for errors
   - Ensure keyboard navigation
   - Provide clear error feedback
