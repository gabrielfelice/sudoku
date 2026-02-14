"use client";

import { useGameStore } from "@/state/store";

interface ErrorLimitModalProps {
  isOpen: boolean;
}

export function ErrorLimitModal({ isOpen }: ErrorLimitModalProps) {
  const dispatch = useGameStore((s) => s.dispatch);
  const mistakes = useGameStore((s) => s.mistakes);
  const maxErrors = useGameStore((s) => s.config.maxErrors);

  if (!isOpen || maxErrors === null) return null;

  const handleContinue = () => {
    dispatch({ type: "SET_ERROR_LIMIT_BEHAVIOR", behavior: "continue" });
  };

  const handleRestart = () => {
    dispatch({ type: "SET_ERROR_LIMIT_BEHAVIOR", behavior: "restart" });
  };

  const handleNewGame = () => {
    // Set behavior first, then component will handle NEW_GAME
    dispatch({ type: "SET_ERROR_LIMIT_BEHAVIOR", behavior: "new-game" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl p-6">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Limit Reached
          </h2>
          <p className="text-gray-600 mb-4">
            You've reached the maximum number of errors allowed for this puzzle.
          </p>
          <div className="inline-block px-4 py-2 bg-red-100 border border-red-300 rounded-lg">
            <span className="text-2xl font-bold text-red-700">
              {mistakes}/{maxErrors}
            </span>
            <span className="text-sm text-red-600 ml-2">errors</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleContinue}
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
          >
            Continue Playing
            <span className="block text-xs opacity-90">
              Keep playing without restrictions
            </span>
          </button>

          <button
            onClick={handleRestart}
            className="w-full px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium transition-colors"
          >
            Restart Puzzle
            <span className="block text-xs opacity-90">
              Same puzzle, fresh start
            </span>
          </button>

          <button
            onClick={handleNewGame}
            className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors"
          >
            New Game
            <span className="block text-xs opacity-90">
              Generate a new puzzle
            </span>
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          You can change the error limit in Settings
        </p>
      </div>
    </div>
  );
}
