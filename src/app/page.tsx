"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/state/store";
import { CellValue } from "@/engine";
import { TopBar } from "@/components/TopBar";
import { SudokuBoard } from "@/components/SudokuBoard";
import { ActionBar } from "@/components/ActionBar";
import { Keypad } from "@/components/Keypad";
import { PauseOverlay } from "@/components/PauseOverlay";
import { Toast } from "@/components/Toast";
import { ContinueGameModal } from "@/components/ContinueGameModal";
import { KeyboardController } from "@/components/KeyboardController";
import { HintModal } from "@/components/HintModal";
import { ErrorExplanationModal } from "@/components/ErrorExplanationModal";
import { DifficultySelector } from "@/components/DifficultySelector";
import { SettingsModal } from "@/components/SettingsModal";
import { generatePuzzleWithCache } from "@/engine/generator";
import { saveGame, loadGame, clearSave } from "@/lib/storage";
import { useTheme } from "@/lib/useTheme";

export default function HomePage() {
  const dispatch = useGameStore((s) => s.dispatch);
  const paused = useGameStore((s) => s.paused);
  const toast = useGameStore((s) => s.toast);
  const difficulty = useGameStore((s) => s.difficulty);
  const seed = useGameStore((s) => s.seed);
  const gameState = useGameStore();

  const [showContinueModal, setShowContinueModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Apply theme
  useTheme();

  // Load saved config and theme on mount
  useEffect(() => {
    const { loadConfig, loadTheme } = require("@/lib/config-storage");
    const savedConfig = loadConfig();
    const savedTheme = loadTheme();

    if (savedConfig) {
      dispatch({ type: "SET_CONFIG", config: savedConfig });
    }
    if (savedTheme) {
      dispatch({ type: "SET_THEME", theme: savedTheme });
    }
  }, [dispatch]);

  // Auto-save config and theme when they change
  useEffect(() => {
    if (!isInitialized) return;

    const { saveConfig, saveTheme } = require("@/lib/config-storage");
    saveConfig(gameState.config);
    saveTheme(gameState.theme);
  }, [gameState.config, gameState.theme, isInitialized]);

  // Check for saved game on mount
  useEffect(() => {
    const saved = loadGame();
    if (saved) {
      setShowContinueModal(true);
    } else {
      // No saved game, start fresh with generated puzzle
      try {
        const puzzle = generatePuzzleWithCache("medium");
        dispatch({
          type: "INIT_PUZZLE",
          given: puzzle.given,
          solution: puzzle.solution,
          difficulty: puzzle.difficulty,
          seed: puzzle.seed,
        });
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to generate initial puzzle:", error);
      }
    }
  }, [dispatch]);

  // Auto-save game state whenever it changes (debounced)
  useEffect(() => {
    if (!isInitialized) return;

    const timeoutId = setTimeout(() => {
      saveGame(gameState);
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [gameState, isInitialized]);

  // Timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: "TICK_TIMER", now: Date.now() });
    }, 250);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleContinue = () => {
    const saved = loadGame();
    if (saved) {
      dispatch({
        type: "LOAD_SAVED_GAME",
        given: saved.puzzle.given,
        solution: saved.puzzle.solution,
        values: saved.state.values,
        meta: saved.state.meta,
        mistakes: saved.state.mistakes,
        elapsedMs: saved.state.elapsedMs,
      });
      dispatch({
        type: "SET_TOAST",
        message: "Jogo retomado!",
        toastType: "success",
      });
    }
    setShowContinueModal(false);
    setIsInitialized(true);
  };

  const handleNewGame = () => {
    clearSave();
    try {
      const puzzle = generatePuzzleWithCache(difficulty);
      dispatch({
        type: "NEW_GAME",
        given: puzzle.given,
        solution: puzzle.solution,
        difficulty: puzzle.difficulty,
        seed: puzzle.seed,
      });
      dispatch({
        type: "SET_TOAST",
        message: `Novo jogo (${puzzle.difficulty}) iniciado!`,
        toastType: "success",
      });
    } catch (error) {
      dispatch({
        type: "SET_TOAST",
        message: "Erro ao gerar puzzle",
        toastType: "error",
      });
    }
    setShowContinueModal(false);
    setIsInitialized(true);
  };

  const handleCloseToast = () => {
    dispatch({ type: "CLEAR_TOAST" });
  };

  return (
    <>
      {/* Continue game modal */}
      {showContinueModal && (
        <ContinueGameModal
          onContinue={handleContinue}
          onNewGame={handleNewGame}
        />
      )}

      {/* Settings modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      {/* Hint modal */}
      <HintModal />

      {/* Error explanation modal */}
      <ErrorExplanationModal />

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleCloseToast}
        />
      )}

      {/* Keyboard controller */}
      <KeyboardController />

      {/* Main game UI */}
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden max-w-2xl w-full">
          <TopBar />

          {/* Difficulty selector */}
          <div className="px-6 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <DifficultySelector />
            <div className="flex items-center gap-3">
              {seed && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Seed: {seed}
                </div>
              )}
              <button
                onClick={() => setShowSettingsModal(true)}
                className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                title="Configurações"
              >
                ⚙️ Configurações
              </button>
            </div>
          </div>

          <div className="p-6 flex flex-col items-center gap-6 relative">
            {paused && <PauseOverlay />}

            <SudokuBoard />
            <ActionBar />
            <Keypad />
          </div>
        </div>
      </div>
    </>
  );
}
