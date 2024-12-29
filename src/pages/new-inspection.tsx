import React from 'react';
import FormContainer from '../components/NewInspection/Form/FormContainer';
import FormNavigation from '../components/NewInspection/Form/FormNavigation';
import FormProgress from '../components/NewInspection/Form/FormProgress';
import { FormProvider, useFormContext } from '../context/FormContext';
import { ToastProvider } from '../context/ToastContext';
import styles from '../styles/NewInspection.module.css';

function InspectionForm() {
  const { 
    sections, 
    currentSection,
    setCurrentSection, 
    handleNext, 
    handlePrevious,
    canNavigateNext,
    canNavigatePrevious,
    handleSectionComplete
  } = useFormContext();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>New Inspection</h1>
        <p className={styles.subtitle}>
          Create a new inspection report by filling out the required information in each section.
        </p>
      </div>

      <FormProgress 
        sections={sections}
        currentSection={currentSection}
      />
      <FormNavigation 
        sections={sections}
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
      />

      <div className={styles.formWrapper}>
        <FormContainer 
          currentSection={currentSection}
          onSectionComplete={handleSectionComplete}
        />

        <div className={styles.navigationButtons}>
          <button
            type="button"
            className={styles.prevButton}
            onClick={handlePrevious}
            disabled={!canNavigatePrevious}
          >
            ← Previous
          </button>
          <button
            type="button"
            className={styles.nextButton}
            onClick={handleNext}
            disabled={!canNavigateNext}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NewInspection() {
  return (
    <ToastProvider>
      <FormProvider>
        <InspectionForm />
      </FormProvider>
    </ToastProvider>
  );
}
