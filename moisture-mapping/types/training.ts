export type TrainingCategory = 
  | 'basics' 
  | 'equipment' 
  | 'safety' 
  | 'bestPractices';

export interface TrainingStep {
  id: string;
  title: string;
  content: string;
  image?: string;
  video?: string;
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface TrainingModule {
  id: string;
  category: TrainingCategory;
  title: string;
  description: string;
  steps: TrainingStep[];
  estimatedMinutes: number;
  requiredForCertification: boolean;
}

export interface TrainingProgress {
  moduleId: string;
  completedSteps: string[];
  quizScores: Record<string, number>;
  lastAccessed: string;
  completed: boolean;
}

export interface UserTraining {
  userId: string;
  progress: Record<string, TrainingProgress>;
  certifications: {
    basic: boolean;
    advanced: boolean;
    expert: boolean;
    lastUpdated: string;
  };
}
