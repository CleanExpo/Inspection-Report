import React, { createContext, useContext, useState, useCallback } from 'react';
import { FormSection, FormSectionConfig } from '../types/form';
import { getValidationSchema } from '../validation/formSchemas';

interface FormContextType {
  currentSection: FormSection;
  sections: FormSectionConfig[];
  isCurrentSectionValid: boolean;
  canNavigateNext: boolean;
  canNavigatePrevious: boolean;
  setCurrentSection: (section: FormSection) => void;
  setSectionValidity: (sectionId: FormSection, isValid: boolean) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  handleSectionComplete: (sectionId: FormSection, isComplete: boolean) => void;
  validateBeforeNavigation: (nextSection: FormSection) => Promise<boolean>;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

const defaultSections: FormSectionConfig[] = [
  {
    id: 'clientInfo',
    title: 'Client Information',
    icon: '👤',
    isComplete: false,
  },
  {
    id: 'propertyDetails',
    title: 'Property Details',
    icon: '🏠',
    isComplete: false,
  },
  {
    id: 'damageAssessment',
    title: 'Damage Assessment',
    icon: '🔍',
    isComplete: false,
  },
  {
    id: 'photos',
    title: 'Photos',
    icon: '📸',
    isComplete: false,
  },
];

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [sections, setSections] = useState<FormSectionConfig[]>(defaultSections);
  const [currentSection, setCurrentSection] = useState<FormSection>('clientInfo');
  const [isCurrentSectionValid, setIsCurrentSectionValid] = useState(false);

  const currentIndex = sections.findIndex(s => s.id === currentSection);
  const canNavigateNext = currentIndex < sections.length - 1;
  const canNavigatePrevious = currentIndex > 0;

  const validateBeforeNavigation = useCallback(async (nextSection: FormSection): Promise<boolean> => {
    const currentSectionData = localStorage.getItem('inspectionFormData');
    if (!currentSectionData) return true;

    try {
      const formData = JSON.parse(currentSectionData);
      await getValidationSchema(currentSection).validate(formData[currentSection], { abortEarly: false });
      return true;
    } catch (error) {
      return false;
    }
  }, [currentSection]);

  const handleNext = useCallback(async () => {
    if (canNavigateNext) {
      const nextSection = sections[currentIndex + 1].id;
      const isValid = await validateBeforeNavigation(nextSection);
      
      if (isValid) {
        setCurrentSection(nextSection);
      } else {
        // Handle invalid section (could show a toast notification)
        console.warn('Please complete the current section before proceeding');
      }
    }
  }, [canNavigateNext, currentIndex, sections, validateBeforeNavigation]);

  const handlePrevious = useCallback(async () => {
    if (canNavigatePrevious) {
      const prevSection = sections[currentIndex - 1].id;
      setCurrentSection(prevSection);
    }
  }, [canNavigatePrevious, currentIndex, sections]);

  const setSectionValidity = useCallback((sectionId: FormSection, isValid: boolean) => {
    if (sectionId === currentSection) {
      setIsCurrentSectionValid(isValid);
    }
  }, [currentSection]);

  const handleSectionComplete = useCallback((sectionId: FormSection, isComplete: boolean) => {
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId
          ? { ...section, isComplete }
          : section
      )
    );
  }, []);

  const value = {
    currentSection,
    sections,
    isCurrentSectionValid,
    canNavigateNext,
    canNavigatePrevious,
    setCurrentSection,
    setSectionValidity,
    handleNext,
    handlePrevious,
    handleSectionComplete,
    validateBeforeNavigation,
  };

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}
