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
import { EASY_PUZZLE, parsePuzzle } from "@/lib/puzzles";
import { saveGame, loadGame, clearSave } from "@/lib/storage";

export default function HomePage() {
  const dispatch = useGameStore((s) => s.dispatch);
  const paused = useGameStore((s) => s.paused);
  const toast = useGameStore((s) => s.toast);
  const gameState = useGameStore();

  const [showContinueModal, setShowContinueModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check for saved game on mount
  useEffect(() => {
    const saved = loadGame();
    if (saved) {
      setShowContinueModal(true);
    } else {
      // No saved game, start fresh
      const given = parsePuzzle(EASY_PUZZLE.given) as CellValue[];
      const solution = parsePuzzle(EASY_PUZZLE.solution) as CellValue[];
      dispatch({ type: "INIT_PUZZLE", given, solution });
      setIsInitialized(true);
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
    const given = parsePuzzle(EASY_PUZZLE.given) as CellValue[];
    const solution = parsePuzzle(EASY_PUZZLE.solution) as CellValue[];
    dispatch({ type: "NEW_GAME", given, solution });
    dispatch({
      type: "SET_TOAST",
      message: "Novo jogo iniciado!",
      toastType: "success",
    });
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-2xl w-full">
          <TopBar />

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
