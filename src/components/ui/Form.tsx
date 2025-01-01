import React, { createContext, useContext, useState } from 'react';
import { BaseProps } from '../../types/ui';

interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
}

interface FormContext extends FormState {
  setFieldValue: (name: string, value: any) => void;
  setFieldError: (name: string, error: string) => void;
  setFieldTouched: (name: string, touched: boolean) => void;
  validateField: (name: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
}

interface FormProps extends BaseProps {
  initialValues: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  validate?: (values: Record<string, any>) => Record<string, string>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface FormFieldProps extends BaseProps {
  name: string;
  validate?: (value: any) => string | undefined;
}

const FormContext = createContext<FormContext | undefined>(undefined);

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a Form component');
  }
  return context;
};

interface FormComposition {
  Field: React.FC<FormFieldProps>;
  ErrorMessage: React.FC<{ name: string }>;
}

const Form: React.FC<FormProps> & FormComposition = ({
  children,
  initialValues,
  onSubmit,
  validate,
  validateOnChange = true,
  validateOnBlur = true,
  className = '',
}) => {
  const [formState, setFormState] = useState<FormState>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
  });

  const validateForm = () => {
    if (validate) {
      const errors = validate(formState.values);
      setFormState(state => ({ ...state, errors }));
      return Object.keys(errors).length === 0;
    }
    return true;
  };

  const validateField = (name: string) => {
    const field = React.Children.toArray(children).find(
      (child): child is React.ReactElement<FormFieldProps> =>
        React.isValidElement(child) &&
        child.props.name === name &&
        child.props.validate
    );

    if (field?.props.validate) {
      const error = field.props.validate(formState.values[name]);
      setFormState(state => ({
        ...state,
        errors: {
          ...state.errors,
          [name]: error || '',
        },
      }));
    }
  };

  const setFieldValue = (name: string, value: any) => {
    setFormState(state => ({
      ...state,
      values: { ...state.values, [name]: value },
    }));

    if (validateOnChange) {
      validateField(name);
    }
  };

  const setFieldError = (name: string, error: string) => {
    setFormState(state => ({
      ...state,
      errors: { ...state.errors, [name]: error },
    }));
  };

  const setFieldTouched = (name: string, touched: boolean) => {
    setFormState(state => ({
      ...state,
      touched: { ...state.touched, [name]: touched },
    }));

    if (validateOnBlur && touched) {
      validateField(name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setFormState(state => ({ ...state, isSubmitting: true }));

    try {
      await onSubmit(formState.values);
    } finally {
      setFormState(state => ({ ...state, isSubmitting: false }));
    }
  };

  const resetForm = () => {
    setFormState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
    });
  };

  return (
    <FormContext.Provider
      value={{
        ...formState,
        setFieldValue,
        setFieldError,
        setFieldTouched,
        validateField,
        handleSubmit,
        resetForm,
      }}
    >
      <form onSubmit={handleSubmit} className={className}>
        {children}
      </form>
    </FormContext.Provider>
  );
};

const Field: React.FC<FormFieldProps> = ({
  name,
  validate,
  children,
}) => {
  const form = useForm();

  const childProps = {
    name,
    value: form.values[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      form.setFieldValue(name, e.target.value);
    },
    onBlur: () => {
      form.setFieldTouched(name, true);
    },
    error: form.touched[name] ? form.errors[name] : undefined,
  };

  return (
    <>
      {React.isValidElement(children)
        ? React.cloneElement(children, childProps)
        : children}
    </>
  );
};

const ErrorMessage: React.FC<{ name: string }> = ({ name }) => {
  const form = useForm();
  const error = form.touched[name] && form.errors[name];

  if (!error) return null;

  return (
    <p className="mt-1 text-sm text-red-600">
      {error}
    </p>
  );
};

Form.Field = Field;
Form.ErrorMessage = ErrorMessage;

export default Form;

/**
 * Form Component Usage Guide:
 * 
 * 1. Basic Form Setup:
 *    - Wrap form content with Form component
 *    - Provide initialValues and onSubmit handler
 *    - Use Form.Field to wrap input components
 *    - Add Form.ErrorMessage for field errors
 * 
 * 2. Form Validation:
 *    - Use validate prop for form-level validation
 *    - Add validate prop to individual fields
 *    - Configure validateOnChange and validateOnBlur
 * 
 * 3. Form Context:
 *    - Access form state with useForm hook
 *    - Get values, errors, and touched states
 *    - Use form methods like setFieldValue
 * 
 * 4. Async Submission:
 *    - Return Promise from onSubmit
 *    - Form handles loading state
 *    - Access isSubmitting from form context
 * 
 * 5. Form Reset:
 *    - Use resetForm method from form context
 *    - Resets values, errors, and touched states
 * 
 * 6. Field Components:
 *    - Wrap inputs with Form.Field
 *    - Automatically connects to form context
 *    - Handles value, onChange, and validation
 * 
 * 7. Error Display:
 *    - Use Form.ErrorMessage component
 *    - Shows errors when field is touched
 *    - Customizable error styling
 */
