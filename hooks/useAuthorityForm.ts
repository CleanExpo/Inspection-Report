import React, { useState, useCallback, useRef } from 'react';
import { AuthorityFormData, ValidationErrors, validateAuthorityForm } from '@/types/authority';
import type SignaturePad from 'react-signature-canvas';

interface UseAuthorityFormReturn {
  formData: AuthorityFormData;
  errors: ValidationErrors;
  isSubmitting: boolean;
  handleChange: (field: keyof AuthorityFormData, value: string) => void;
  handleSignatureEnd: () => void;
  handleSubmit: () => Promise<void>;
  handleClear: () => void;
  signaturePadRef: React.RefObject<SignaturePad>;
}

interface UseAuthorityFormProps {
  initialData?: Partial<AuthorityFormData>;
  onSubmit: (data: AuthorityFormData) => Promise<void>;
}

export const useAuthorityForm = ({
  initialData,
  onSubmit
}: UseAuthorityFormProps): UseAuthorityFormReturn => {
  const [formData, setFormData] = useState<AuthorityFormData>({
    jobNumber: '',
    clientName: '',
    propertyAddress: '',
    authorizedBy: '',
    authorizedDate: new Date().toISOString().split('T')[0],
    scope: '',
    conditions: '',
    signature: '',
    ...initialData
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const signaturePadRef = useRef<SignaturePad>(null);

  const handleChange = useCallback((field: keyof AuthorityFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const handleSignatureEnd = useCallback(() => {
    if (signaturePadRef.current) {
      const signatureData = signaturePadRef.current.toDataURL();
      setFormData(prev => ({ ...prev, signature: signatureData }));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.signature;
        return newErrors;
      });
    }
  }, []);

  const handleSubmit = async () => {
    try {
      const validation = validateAuthorityForm(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      setIsSubmitting(true);
      await onSubmit(formData);
      setErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({
        submit: [error instanceof Error ? error.message : 'Failed to submit form']
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = useCallback(() => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setFormData(prev => ({ ...prev, signature: '' }));
    }
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSignatureEnd,
    handleSubmit,
    handleClear,
    signaturePadRef
  };
};
