export interface LessonMetrics {
  lessonId: string;
  attempts: number;
  completions: number;
  bestTimeMs: number | null;
  avgTimeMs: number;
  avgErrors: number;
  lastAttemptAt: number;
}

export interface LessonAttempt {
  lessonId: string;
  timeMs: number;
  errors: number;
  completed: boolean;
  timestamp: number;
}
