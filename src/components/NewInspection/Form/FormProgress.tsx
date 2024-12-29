import React, { useMemo } from 'react';
import { useFormContext } from '../../../context/FormContext';
import { useFormSection } from '../../../hooks/useFormSection';
import styles from './FormProgress.module.css';

export default function FormProgress() {
  const { sections, currentSection } = useFormContext();
  const { isValid: isSectionValid } = useFormSection({
    section: currentSection,
    onComplete: () => {}, // Progress doesn't handle completion
  });

  const { 
    completedSections, 
    progress, 
    currentIndex,
    totalSections,
    remainingSections,
    isLastSection 
  } = useMemo(() => {
    const completed = sections.filter(s => s.isComplete).length;
    return {
      completedSections: completed,
      progress: (completed / sections.length) * 100,
      currentIndex: sections.findIndex(s => s.id === currentSection),
      totalSections: sections.length,
      remainingSections: sections.length - completed,
      isLastSection: currentIndex === sections.length - 1
    };
  }, [sections, currentSection]);

  const getStatusMessage = useMemo(() => {
    if (progress === 100) {
      return {
        text: 'All sections completed! You can now submit the inspection.',
        type: 'success' as const
      };
    }
    if (!isSectionValid) {
      return {
        text: 'Please complete all required fields in this section.',
        type: 'warning' as const
      };
    }
    if (isLastSection) {
      return {
        text: 'Complete this final section to submit the inspection.',
        type: 'info' as const
      };
    }
    return {
      text: `${remainingSections} section${remainingSections !== 1 ? 's' : ''} remaining`,
      type: 'info' as const
    };
  }, [progress, isSectionValid, isLastSection, remainingSections]);

  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressInfo}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Progress</span>
            <span className={styles.statValue}>{Math.round(progress)}%</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Step</span>
            <span className={styles.statValue}>{currentIndex + 1} of {sections.length}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Completed</span>
            <span className={styles.statValue}>{completedSections}/{sections.length}</span>
          </div>
        </div>
        <div className={styles.currentSection}>
          <span className={styles.sectionIcon}>
            {sections[currentIndex].icon}
          </span>
          <span className={styles.sectionTitle}>
            {sections[currentIndex].title}
          </span>
        </div>
      </div>

      <div className={styles.progressBarContainer}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className={styles.progressSteps}>
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={`${styles.step} ${
                section.isComplete ? styles.completed : ''
              } ${section.id === currentSection ? styles.active : ''}`}
            >
              <div className={styles.stepDot} />
              <span className={styles.stepLabel}>{section.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`${styles.statusMessage} ${styles[getStatusMessage.type]}`}>
        {getStatusMessage.text}
      </div>

      {progress === 100 && (
        <div className={styles.completionMessage}>
          <span className={styles.checkmark}>✓</span>
          Ready to submit
        </div>
      )}
    </div>
  );
}
