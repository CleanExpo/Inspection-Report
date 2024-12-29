import React from 'react';
import { useFormContext } from '../../../context/FormContext';
import SectionTransition from './SectionTransition';
import styles from './FormContainer.module.css';

interface FormSectionWrapperProps {
  children: React.ReactNode;
}

export default function FormSectionWrapper({ children }: FormSectionWrapperProps) {
  const { currentSection } = useFormContext();

  return (
    <div className={styles.sectionContainer}>
      <SectionTransition currentSection={currentSection}>
        <div className={styles.sectionContent}>
          {children}
        </div>
      </SectionTransition>
    </div>
  );
}
