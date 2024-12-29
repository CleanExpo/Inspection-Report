import React, { useEffect, useCallback, useState } from 'react';
import { Formik, Form, FormikHelpers } from 'formik';
import { getValidationSchema, completeValidationSchema } from '../../../validation/formSchemas';
import { useFormContext } from '../../../context/FormContext';
import { useToast } from '../../../context/ToastContext';
import { ToastProvider } from '../../../context/ToastContext';
import { useFormSection, useSectionNavigation } from '../../../hooks/useFormSection';
import { useFormDraft } from '../../../hooks/useFormDraft';
import styles from './FormContainer.module.css';
import ConfirmDialog from '../../ConfirmDialog/ConfirmDialog';
import FormSectionWrapper from './FormSectionWrapper';

// Import form sections
import ClientInfo from './sections/ClientInfo';
import PropertyDetails from './sections/PropertyDetails';
import DamageAssessment from './sections/DamageAssessment';
import Photos from './sections/Photos';

import { InspectionFormValues, FormSection } from '../../../types/form';

const initialValues: InspectionFormValues = {
  clientInfo: {
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    preferredContact: '',
  },
  propertyDetails: {
    address: '',
    propertyType: '',
    dateOfLoss: '',
    typeOfLoss: '',
    buildingAge: undefined,
    squareFootage: undefined,
  },
  damageAssessment: {
    description: '',
    severity: 'low',
    affectedAreas: [],
    recommendations: '',
    estimatedArea: undefined,
    notes: '',
  },
  photos: [],
};

interface FormContainerProps {
  currentSection: FormSection;
  onSectionComplete: (sectionId: FormSection, isComplete: boolean) => void;
}

const sectionComponents = {
  clientInfo: ClientInfo,
  propertyDetails: PropertyDetails,
  damageAssessment: DamageAssessment,
  photos: Photos,
} as const;

function FormContainerInner({ onSectionComplete }: FormContainerProps) {
  const { currentSection, setSectionValidity } = useFormContext();
  const { showToast } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const {
    saveDraft,
    loadDraft,
    clearDraft,
    setupAutosave,
    saveFormProgress,
    loadFormProgress,
    clearFormProgress,
  } = useFormDraft({
    onError: (error) => {
      console.error('Form storage error:', error);
      showToast('Failed to save form data', 'error');
    },
  });

  const {
    isValid: isSectionValid,
    validateSection,
  } = useFormSection({
    section: currentSection,
    onComplete: (isComplete) => onSectionComplete(currentSection, isComplete),
  });

  const {
    pendingSection,
    handleNavigate,
    confirmNavigation,
    cancelNavigation,
  } = useSectionNavigation();

  // Load initial form data
  const initialFormData = loadFormProgress() || loadDraft() || initialValues;

  // Handle beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const formData = loadFormProgress();
      if (formData && !isSectionValid) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSectionValid, loadFormProgress]);

  const handleSubmit = useCallback(
    async (values: InspectionFormValues, helpers: FormikHelpers<InspectionFormValues>) => {
      const { setSubmitting, setFieldError } = helpers;

      try {
        const isValid = await validateSection(values);
        if (!isValid) {
          setSubmitting(false);
          return;
        }

        saveFormProgress(values);

        if (currentSection === 'photos') {
          await completeValidationSchema.validate(values, { abortEarly: false });
          clearFormProgress();
          clearDraft();
          showToast('Inspection report submitted successfully', 'success');
          console.log('Form submitted:', values);
        } else {
          showToast('Section saved successfully', 'success');
        }
      } catch (error: any) {
        onSectionComplete(currentSection, false);
        setSectionValidity(currentSection, false);

        if (error.inner) {
          error.inner.forEach((err: any) => {
            setFieldError(err.path, err.message);
          });
        }
        showToast('Please fix the validation errors', 'error');
      } finally {
        setSubmitting(false);
      }
    },
    [
      currentSection,
      validateSection,
      saveFormProgress,
      clearFormProgress,
      clearDraft,
      showToast,
      onSectionComplete,
      setSectionValidity,
    ]
  );

  const renderSection = () => {
    const SectionComponent = sectionComponents[currentSection];
    return SectionComponent ? <SectionComponent /> : null;
  };

  return (
    <div className={styles.container}>
      <Formik
        initialValues={initialFormData}
        validationSchema={currentSection === 'photos' ? completeValidationSchema : getValidationSchema(currentSection)}
        validateOnMount={false}
        validateOnChange={true}
        validateOnBlur={true}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ isSubmitting, values, dirty }) => {
          useEffect(() => {
            if (dirty) {
              return setupAutosave(values, dirty);
            }
          }, [values, dirty]);

          return (
            <Form className={styles.form}>
              <FormSectionWrapper>
                <div className={styles.sectionAnimationWrapper}>
                  {renderSection()}
                </div>
              </FormSectionWrapper>
              
              <div className={styles.actions}>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Create Inspection'}
                </button>
                <button
                  type="button"
                  className={styles.saveButton}
                  onClick={() => saveDraft(values)}
                >
                  Save as Draft
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Unsaved Changes"
        message="You have unsaved changes. Do you want to save your changes before continuing?"
        confirmLabel="Save & Continue"
        cancelLabel="Discard Changes"
        onConfirm={confirmNavigation}
        onCancel={cancelNavigation}
      />
    </div>
  );
}

export default function FormContainer(props: FormContainerProps) {
  return (
    <ToastProvider>
      <FormContainerInner {...props} />
    </ToastProvider>
  );
}
