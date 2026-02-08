"use client";

import { useState, useEffect } from "react";
import { useProfileStore } from "@/state/profileStore";
import styles from "./TutorialTour.module.css";

interface TutorialStep {
  title: string;
  description: string;
  target?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Welcome to Sudoku!",
    description:
      "This quick tour will show you how to use the game. You can skip it anytime.",
  },
  {
    title: "Select a Cell",
    description:
      "Click on any empty cell to select it. The selected cell will be highlighted.",
    target: "board",
  },
  {
    title: "Enter Numbers",
    description:
      "Use the keypad below or your keyboard (1-9) to fill in numbers.",
    target: "keypad",
  },
  {
    title: "Note Mode",
    description:
      "Toggle note mode to add small candidate numbers to cells. This helps you track possibilities.",
    target: "note-button",
  },
  {
    title: "Erase & Undo",
    description:
      "Use the eraser to clear a cell, or undo to revert your last move.",
    target: "erase-button",
  },
  {
    title: "Get Hints",
    description:
      "Stuck? Use the hint button to get a logical suggestion with explanation.",
    target: "hint-button",
  },
  {
    title: "Pause & Resume",
    description: "Need a break? Pause the game to hide the board and timer.",
    target: "pause-button",
  },
  {
    title: "Settings & Themes",
    description:
      "Customize your experience in the settings menu - change themes, adjust game rules, and more!",
    target: "settings-button",
  },
  {
    title: "You're Ready!",
    description: "That's all! Enjoy playing Sudoku. Good luck!",
  },
];

interface TutorialTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function TutorialTour({
  onComplete,
  onSkip,
}: TutorialTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const completeTutorial = useProfileStore((s) => s.completeTutorial);

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    if (dontShowAgain) {
      completeTutorial();
    }
    onSkip();
  };

  const handleComplete = () => {
    completeTutorial();
    onComplete();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{step.title}</h2>
          <button
            className={styles.closeButton}
            onClick={handleSkip}
            aria-label="Close tutorial"
          >
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <p>{step.description}</p>
        </div>

        <div className={styles.footer}>
          <div className={styles.progress}>
            Step {currentStep + 1} of {TUTORIAL_STEPS.length}
          </div>

          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%`,
              }}
            />
          </div>

          <div className={styles.actions}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              />
              Don't show again
            </label>

            <div className={styles.buttons}>
              {!isLastStep && (
                <button className={styles.skipButton} onClick={handleSkip}>
                  Skip Tutorial
                </button>
              )}
              <button className={styles.nextButton} onClick={handleNext}>
                {isLastStep ? "Get Started!" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
