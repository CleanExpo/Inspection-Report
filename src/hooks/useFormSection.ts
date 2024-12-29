import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from '../context/FormContext';
import { useToast } from '../context/ToastContext';
import { FormSection, InspectionFormValues } from '../types/form';
import { getValidationSchema } from '../validation/formSchemas';

interface UseFormSectionProps {
  section: FormSection;
  onComplete: (isComplete: boolean) => void;
}

export function useFormSection({ section, onComplete }: UseFormSectionProps) {
  const { setSectionValidity } = useFormContext();
  const { showToast } = useToast();
  const [isValid, setIsValid] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const validateSection = useCallback(async (values: InspectionFormValues) => {
    try {
      await getValidationSchema(section).validate(values[section], { abortEarly: false });
      setIsValid(true);
      setSectionValidity(section, true);
      onComplete(true);
      return true;
    } catch (error) {
      setIsValid(false);
      setSectionValidity(section, false);
      onComplete(false);
      return false;
    }
  }, [section, setSectionValidity, onComplete]);

  const handleChange = useCallback(() => {
    if (!isDirty) {
      setIsDirty(true);
    }
  }, [isDirty]);

  const handleBlur = useCallback(async (values: InspectionFormValues) => {
    if (isDirty) {
      const isValid = await validateSection(values);
      if (!isValid) {
        showToast('Please complete all required fields', 'error');
      }
    }
  }, [isDirty, validateSection, showToast]);

  useEffect(() => {
    // Reset state when section changes
    setIsValid(false);
    setIsDirty(false);
  }, [section]);

  return {
    isValid,
    isDirty,
    validateSection,
    handleChange,
    handleBlur,
  };
}

export function useSectionNavigation() {
  const { currentSection, sections, setCurrentSection } = useFormContext();
  const { showToast } = useToast();
  const [pendingSection, setPendingSection] = useState<FormSection | null>(null);

  const currentIndex = sections.findIndex(s => s.id === currentSection);
  const canNavigateNext = currentIndex < sections.length - 1;
  const canNavigatePrevious = currentIndex > 0;

  const handleNavigate = useCallback(async (nextSection: FormSection) => {
    if (nextSection === currentSection) return;

    const currentSectionData = localStorage.getItem('inspectionFormData');
    if (!currentSectionData) {
      setCurrentSection(nextSection);
      return;
    }

    try {
      const formData = JSON.parse(currentSectionData);
      await getValidationSchema(currentSection).validate(formData[currentSection], { abortEarly: false });
      setCurrentSection(nextSection);
    } catch (error) {
      setPendingSection(nextSection);
      showToast('Please complete the current section before proceeding', 'error');
    }
  }, [currentSection, setCurrentSection, showToast]);

  const confirmNavigation = useCallback(() => {
    if (pendingSection) {
      setCurrentSection(pendingSection);
      setPendingSection(null);
    }
  }, [pendingSection, setCurrentSection]);

  const cancelNavigation = useCallback(() => {
    setPendingSection(null);
  }, []);

  return {
    canNavigateNext,
    canNavigatePrevious,
    pendingSection,
    handleNavigate,
    confirmNavigation,
    cancelNavigation,
  };
}
