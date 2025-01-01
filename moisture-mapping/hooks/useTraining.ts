import { useState, useEffect, useCallback } from 'react';
import { TrainingModule, TrainingProgress, UserTraining } from '../types/training';
import { trainingModules } from '../data/trainingModules';

const STORAGE_KEY = 'moisture-mapping-training-progress';

const defaultUserTraining: UserTraining = {
  userId: '',
  progress: {},
  certifications: {
    basic: false,
    advanced: false,
    expert: false,
    lastUpdated: new Date().toISOString()
  }
};

export function useTraining(userId: string) {
  const [userTraining, setUserTraining] = useState<UserTraining>({
    ...defaultUserTraining,
    userId
  });

  // Load training progress from storage
  useEffect(() => {
    const loadProgress = () => {
      try {
        const stored = localStorage.getItem(`${STORAGE_KEY}-${userId}`);
        if (stored) {
          setUserTraining(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load training progress:', error);
      }
    };

    loadProgress();
  }, [userId]);

  // Save progress whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(
        `${STORAGE_KEY}-${userId}`,
        JSON.stringify(userTraining)
      );
    } catch (error) {
      console.error('Failed to save training progress:', error);
    }
  }, [userTraining, userId]);

  // Get module progress
  const getModuleProgress = useCallback((moduleId: string): TrainingProgress => {
    return (
      userTraining.progress[moduleId] || {
        moduleId,
        completedSteps: [],
        quizScores: {},
        lastAccessed: new Date().toISOString(),
        completed: false
      }
    );
  }, [userTraining.progress]);

  // Complete a step
  const completeStep = useCallback((moduleId: string, stepId: string) => {
    setUserTraining(prev => {
      const progress = getModuleProgress(moduleId);
      const module = trainingModules.find(m => m.id === moduleId);
      
      if (!progress.completedSteps.includes(stepId)) {
        progress.completedSteps.push(stepId);
      }

      // Check if module is completed
      if (module) {
        progress.completed = 
          progress.completedSteps.length === module.steps.length &&
          module.steps.every(step => 
            !step.quiz || (progress.quizScores[step.id] || 0) >= 0.7
          );
      }

      progress.lastAccessed = new Date().toISOString();

      return {
        ...prev,
        progress: {
          ...prev.progress,
          [moduleId]: progress
        }
      };
    });
  }, [getModuleProgress]);

  // Submit quiz answer
  const submitQuizAnswer = useCallback((
    moduleId: string,
    stepId: string,
    answerIndex: number
  ): boolean => {
    const module = trainingModules.find(m => m.id === moduleId);
    const step = module?.steps.find(s => s.id === stepId);
    
    if (!step?.quiz) return false;

    const isCorrect = answerIndex === step.quiz.correctIndex;
    
    setUserTraining(prev => {
      const progress = getModuleProgress(moduleId);
      progress.quizScores[stepId] = isCorrect ? 1 : 0;
      progress.lastAccessed = new Date().toISOString();

      return {
        ...prev,
        progress: {
          ...prev.progress,
          [moduleId]: progress
        }
      };
    });

    return isCorrect;
  }, [getModuleProgress]);

  // Check certification eligibility
  const checkCertificationEligibility = useCallback(() => {
    const requiredModules = trainingModules.filter(m => m.requiredForCertification);
    const completedRequired = requiredModules.every(
      m => getModuleProgress(m.id).completed
    );

    if (completedRequired) {
      setUserTraining(prev => ({
        ...prev,
        certifications: {
          ...prev.certifications,
          basic: true,
          lastUpdated: new Date().toISOString()
        }
      }));
    }
  }, [getModuleProgress]);

  // Get next recommended module
  const getNextModule = useCallback((): TrainingModule | null => {
    // First incomplete required module
    const nextRequired = trainingModules
      .filter(m => m.requiredForCertification)
      .find(m => !getModuleProgress(m.id).completed);

    if (nextRequired) return nextRequired;

    // Then any incomplete module
    return trainingModules.find(m => !getModuleProgress(m.id).completed) || null;
  }, [getModuleProgress]);

  return {
    userTraining,
    getModuleProgress,
    completeStep,
    submitQuizAnswer,
    checkCertificationEligibility,
    getNextModule
  };
}
