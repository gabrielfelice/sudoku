"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/state/store";
import { useProfileStore } from "@/state/profileStore";
import { getLessonById } from "@/lib/lessons";
import { SudokuBoard } from "./SudokuBoard";
import { Keypad } from "./Keypad";
import { ActionBar } from "./ActionBar";
import styles from "./LessonRunner.module.css";

interface LessonRunnerProps {
  lessonId: string;
  onComplete: () => void;
  onExit: () => void;
}

export default function LessonRunner({
  lessonId,
  onComplete,
  onExit,
}: LessonRunnerProps) {
  const dispatch = useGameStore((s) => s.dispatch);
  const values = useGameStore((s) => s.values);
  const solution = useGameStore((s) => s.solution);
  const mistakes = useGameStore((s) => s.mistakes);
  const timer = useGameStore((s) => s.timer);
  const completeLesson = useProfileStore((s) => s.completeLesson);

  const [lesson] = useState(() => getLessonById(lessonId));
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!lesson) return;

    // Initialize lesson puzzle
    dispatch({
      type: "NEW_GAME",
      payload: {
        given: lesson.puzzle.given,
        solution: lesson.puzzle.solution,
        difficulty: "medium",
      },
    });

    // Set lesson mode
    dispatch({
      type: "SET_LESSON_MODE",
      payload: {
        active: true,
        lessonId: lesson.id,
        allowedTechniques: lesson.allowedTechniques,
      },
    });

    return () => {
      // Clear lesson mode on unmount
      dispatch({
        type: "SET_LESSON_MODE",
        payload: {
          active: false,
          lessonId: null,
          allowedTechniques: [],
        },
      });
    };
  }, [lesson, dispatch]);

  useEffect(() => {
    // Check if puzzle is solved
    const isSolved = values.every((val, idx) => val === solution[idx]);
    if (isSolved && !completed) {
      setCompleted(true);
      completeLesson(lessonId);
      dispatch({ type: "PAUSE" });
    }
  }, [values, solution, completed, lessonId, completeLesson, dispatch]);

  if (!lesson) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Lesson not found</div>
        <button onClick={onExit} className={styles.exitButton}>
          Back to Training
        </button>
      </div>
    );
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={onExit} className={styles.backButton}>
          ← Back
        </button>
        <div className={styles.lessonInfo}>
          <h2>{lesson.title}</h2>
          <p>{lesson.objective}</p>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Time:</span>
          <span className={styles.statValue}>
            {formatTime(timer.elapsedMs)}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Mistakes:</span>
          <span className={styles.statValue}>{mistakes}</span>
        </div>
      </div>

      <div className={styles.gameArea}>
        <SudokuBoard />
        <Keypad />
        <ActionBar />
      </div>

      {completed && (
        <div className={styles.completionOverlay}>
          <div className={styles.completionModal}>
            <div className={styles.completionIcon}>🎉</div>
            <h2>Lesson Complete!</h2>
            <p>Great job! You've mastered this technique.</p>
            <div className={styles.completionStats}>
              <div>Time: {formatTime(timer.elapsedMs)}</div>
              <div>Mistakes: {mistakes}</div>
            </div>
            <div className={styles.completionActions}>
              <button onClick={onComplete} className={styles.continueButton}>
                Continue Training
              </button>
              <button onClick={onExit} className={styles.exitButton}>
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
