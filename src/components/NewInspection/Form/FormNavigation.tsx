import React, { useCallback } from 'react';
import { useFormContext } from '../../../context/FormContext';
import { useToast } from '../../../context/ToastContext';
import { useFormSection, useSectionNavigation } from '../../../hooks/useFormSection';
import styles from './FormNavigation.module.css';

import { FormSection, FormSectionConfig } from '../../../types/form';

export default function FormNavigation() {
  const { sections, currentSection } = useFormContext();
  const { showToast } = useToast();
  const { handleNavigate } = useSectionNavigation();
  const { isValid: isSectionValid } = useFormSection({
    section: currentSection,
    onComplete: () => {}, // Navigation doesn't handle completion
  });

  const handleSectionClick = useCallback(async (sectionId: FormSection) => {
    if (sectionId === currentSection) return;

    if (!isSectionValid && sectionId !== sections[0].id) {
      showToast('Please complete the current section before proceeding', 'error');
      return;
    }

    handleNavigate(sectionId);
  }, [currentSection, sections, isSectionValid, handleNavigate, showToast]);

  const getSectionStatus = useCallback((section: FormSectionConfig) => {
    if (section.isComplete) return 'completed';
    if (section.id === currentSection) return 'active';
    const currentIndex = sections.findIndex(s => s.id === currentSection);
    const sectionIndex = sections.findIndex(s => s.id === section.id);
    return sectionIndex < currentIndex ? 'available' : 'locked';
  }, [sections, currentSection]);
  return (
    <nav className={styles.navigation}>
      <div className={styles.progressBar}>
        <div
          className={styles.progress}
          style={{
            width: `${(sections.filter(s => s.isComplete).length / sections.length) * 100}%`,
          }}
        />
      </div>
      
      <div className={styles.sections}>
        {sections.map((section, index) => (
          <button
            key={section.id}
            className={`${styles.section} ${styles[getSectionStatus(section)]}`}
            onClick={() => handleSectionClick(section.id)}
            disabled={getSectionStatus(section) === 'locked'}
          >
            <div className={styles.sectionIcon}>
              <span className={styles.icon}>{section.icon}</span>
              {section.isComplete && (
                <span className={styles.checkmark}>✓</span>
              )}
            </div>
            <span className={styles.sectionTitle}>{section.title}</span>
            <span className={styles.stepNumber}>{index + 1}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
