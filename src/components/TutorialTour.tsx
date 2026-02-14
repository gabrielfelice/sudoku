"use client";

import { useState, useEffect } from "react";
import { useProfileStore } from "@/state/profileStore";
import styles from "./TutorialTour.module.css";
import {
  BoardSelectionDemo,
  NumberInputDemo,
  NoteModeDemo,
  UndoEraseDemo,
  HintSystemDemo,
  PauseModeDemo,
  SettingsDemo,
} from "./TutorialIllustrations";

interface TutorialStep {
  title: string;
  description: string;
  illustration?: React.ReactNode;
  target?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Bem-vindo ao Sudoku!",
    description:
      "Este tour rápido mostrará como usar o jogo. Você pode pular a qualquer momento ou voltar para revisar os passos.",
  },
  {
    title: "Selecionar uma Célula",
    description:
      "Clique em qualquer célula vazia para selecioná-la. A célula selecionada será destacada em azul.",
    illustration: <BoardSelectionDemo />,
    target: "board",
  },
  {
    title: "Inserir Números",
    description:
      "Use o teclado numérico abaixo ou as teclas 1-9 do seu teclado para preencher números.",
    illustration: <NumberInputDemo />,
    target: "keypad",
  },
  {
    title: "Modo de Notas",
    description:
      "Ative o modo de notas para adicionar pequenos números candidatos às células. Isso ajuda a rastrear possibilidades.",
    illustration: <NoteModeDemo />,
    target: "note-button",
  },
  {
    title: "Apagar e Desfazer",
    description:
      "Use a borracha para limpar uma célula, ou desfazer para reverter seu último movimento.",
    illustration: <UndoEraseDemo />,
    target: "erase-button",
  },
  {
    title: "Obter Dicas",
    description:
      "Travado? Use o botão de dica para obter uma sugestão lógica com explicação detalhada.",
    illustration: <HintSystemDemo />,
    target: "hint-button",
  },
  {
    title: "Pausar e Retomar",
    description:
      "Precisa de uma pausa? Pause o jogo para ocultar o tabuleiro e pausar o cronômetro.",
    illustration: <PauseModeDemo />,
    target: "pause-button",
  },
  {
    title: "Configurações e Temas",
    description:
      "Personalize sua experiência no menu de configurações - mude temas, ajuste regras do jogo e muito mais!",
    illustration: <SettingsDemo />,
    target: "settings-button",
  },
  {
    title: "Você está Pronto!",
    description:
      "É isso! Aproveite jogando Sudoku. Boa sorte e divirta-se resolvendo puzzles!",
  },
];

interface TutorialTourProps {
  onComplete: () => void;
  onSkip: () => void;
  isManual?: boolean; // NEW: Milestone K - hide "don't show again" when manual
}

export default function TutorialTour({
  onComplete,
  onSkip,
  isManual = false, // NEW: Default to false (auto-tutorial)
}: TutorialTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const completeTutorial = useProfileStore((s) => s.completeTutorial);

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    // Only mark as complete if user checked "don't show again" and not manual
    if (dontShowAgain && !isManual) {
      completeTutorial();
    }
    onSkip();
  };

  const handleComplete = () => {
    // Always mark as complete when finishing tutorial (unless manual)
    if (!isManual) {
      completeTutorial();
    }
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
          {step.illustration && (
            <div className={styles.illustration}>{step.illustration}</div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.progress}>
            Passo {currentStep + 1} de {TUTORIAL_STEPS.length}
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
            {/* Hide "don't show again" when manually opened */}
            {!isManual && (
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                />
                Não mostrar novamente
              </label>
            )}

            <div className={styles.buttons}>
              {!isFirstStep && (
                <button className={styles.backButton} onClick={handleBack}>
                  Voltar
                </button>
              )}
              {!isLastStep && (
                <button className={styles.skipButton} onClick={handleSkip}>
                  Pular Tutorial
                </button>
              )}
              <button className={styles.nextButton} onClick={handleNext}>
                {isLastStep ? "Começar!" : "Próximo"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
