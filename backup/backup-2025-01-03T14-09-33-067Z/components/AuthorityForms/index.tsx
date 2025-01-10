import React, { useState } from 'react';
import AuthorityToCommenceRestoration from './AuthorityToCommenceRestoration';
import type { AuthorityFormData } from '../../types/authority';

interface AuthorityFormsProps {
  jobNumber?: string;
  className?: string;
}

const AuthorityForms: React.FC<AuthorityFormsProps> = ({
  jobNumber,
  className = ""
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: AuthorityFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Here you would typically:
      // 1. Validate the data
      // 2. Submit to your API
      // 3. Handle the response

      console.log('Form submitted:', data);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit form');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const initialData: Partial<AuthorityFormData> = jobNumber ? {
    jobNumber,
    authorizedDate: new Date().toISOString().split('T')[0]
  } : {};

  return (
    <div className={className}>
      <AuthorityToCommenceRestoration
        onSubmit={handleSubmit}
        initialData={initialData}
      />
    </div>
  );
};

export default AuthorityForms;
