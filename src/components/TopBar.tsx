"use client";

import { useGameStore } from "@/state/store";
import { formatTime } from "@/lib/time";

export function TopBar() {
  const mistakes = useGameStore((s) => s.mistakes);
  const timer = useGameStore((s) => s.timer);
  const paused = useGameStore((s) => s.paused);
  const difficulty = useGameStore((s) => s.difficulty);
  const maxErrors = useGameStore((s) => s.config.maxErrors);
  const hintsUsedThisPuzzle = useGameStore((s) => s.hintsUsedThisPuzzle);
  const hintLimit = useGameStore((s) => s.config.hintLimit);
  const expertHintLimit = useGameStore((s) => s.config.expertHintLimit);
  const dispatch = useGameStore((s) => s.dispatch);

  const handlePause = () => {
    dispatch({ type: "TOGGLE_PAUSE" });
  };

  // Determine effective hint limit based on difficulty
  const effectiveHintLimit =
    difficulty === "expert" ? expertHintLimit : hintLimit;

  // Format difficulty for display
  const difficultyLabels = {
    easy: "Fácil",
    medium: "Médio",
    hard: "Difícil",
    expert: "Expert",
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      {/* Left section: Timer and Errors */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-600">⏱️ Tempo:</span>
          <span className="text-lg font-bold text-gray-900 font-mono">
            {formatTime(timer.elapsedMs)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-600">❌ Erros:</span>
          <span className="text-lg font-bold text-red-600">
            {maxErrors !== null ? `${mistakes}/${maxErrors}` : mistakes}
          </span>
        </div>
      </div>

      {/* Center section: Difficulty and Hints */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-600">
            🎯 Dificuldade:
          </span>
          <span className="text-lg font-bold text-blue-600">
            {difficultyLabels[difficulty]}
          </span>
        </div>

        {effectiveHintLimit !== null && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-600">
              💡 Dicas:
            </span>
            <span className="text-lg font-bold text-purple-600">
              {hintsUsedThisPuzzle}/{effectiveHintLimit}
            </span>
          </div>
        )}
      </div>

      {/* Right section: Pause button */}
      <button
        onClick={handlePause}
        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
      >
        {paused ? "Retomar" : "Pausar"}
      </button>
    </div>
  );
}
