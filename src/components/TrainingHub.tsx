"use client";

import { useProfileStore } from "@/state/profileStore";
import { LESSONS, isLessonCompleted, isLessonLocked } from "@/lib/lessons";
import styles from "./TrainingHub.module.css";

interface TrainingHubProps {
  onStartLesson: (lessonId: string) => void;
}

export default function TrainingHub({ onStartLesson }: TrainingHubProps) {
  const profile = useProfileStore((s) => s.profile);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Training</h1>
        <p>Master Sudoku techniques through progressive lessons</p>
      </div>

      <div className={styles.lessonList}>
        {LESSONS.map((lesson) => {
          const completed = isLessonCompleted(
            lesson.id,
            profile.lessonsCompleted,
          );
          const locked = isLessonLocked(lesson.id, profile.lessonsCompleted);

          return (
            <div
              key={lesson.id}
              className={`${styles.lessonCard} ${completed ? styles.completed : ""} ${locked ? styles.locked : ""}`}
            >
              <div className={styles.lessonIcon}>
                {locked ? "🔒" : completed ? "✓" : "📚"}
              </div>

              <div className={styles.lessonContent}>
                <h3>{lesson.title}</h3>
                <p className={styles.lessonDesc}>{lesson.description}</p>
                <p className={styles.lessonObjective}>
                  <strong>Objective:</strong> {lesson.objective}
                </p>

                {lesson.prerequisites.length > 0 && locked && (
                  <p className={styles.prerequisites}>
                    <strong>Prerequisites:</strong> Complete previous lessons
                    first
                  </p>
                )}

                <div className={styles.techniques}>
                  <strong>Techniques:</strong>{" "}
                  {lesson.allowedTechniques
                    .map((t) => t.replace(/_/g, " "))
                    .join(", ")}
                </div>
              </div>

              <div className={styles.lessonActions}>
                {completed && (
                  <div className={styles.completedBadge}>Completed ✓</div>
                )}
                <button
                  className={styles.startButton}
                  onClick={() => onStartLesson(lesson.id)}
                  disabled={locked}
                >
                  {completed ? "Practice Again" : locked ? "Locked" : "Start"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.progress}>
        <h2>Your Progress</h2>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${(profile.lessonsCompleted.length / LESSONS.length) * 100}%`,
            }}
          />
        </div>
        <p className={styles.progressText}>
          {profile.lessonsCompleted.length} of {LESSONS.length} lessons
          completed
        </p>
      </div>
    </div>
  );
}
