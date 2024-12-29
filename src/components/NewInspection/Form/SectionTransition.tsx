import React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styles from './FormContainer.module.css';

interface SectionTransitionProps {
  children: React.ReactNode;
  currentSection: string;
}

export default function SectionTransition({ children, currentSection }: SectionTransitionProps) {
  return (
    <TransitionGroup>
      <CSSTransition
        key={currentSection}
        timeout={300}
        classNames={{
          enter: styles.sectionEnter,
          enterActive: styles.sectionEnterActive,
          exit: styles.sectionExit,
          exitActive: styles.sectionExitActive,
        }}
        unmountOnExit
      >
        <div className={styles.sectionWrapper}>
          {children}
        </div>
      </CSSTransition>
    </TransitionGroup>
  );
}
