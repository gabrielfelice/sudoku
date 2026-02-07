"use client";

import { useGameStore } from "@/state/store";

export function ErrorExplanationModal() {
  const errorExplanation = useGameStore((state) => state.errorExplanation);
  const dispatch = useGameStore((state) => state.dispatch);

  if (!errorExplanation || !errorExplanation.visible) return null;

  const handleClose = () => {
    dispatch({ type: "CLOSE_ERROR_EXPLANATION" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-scale-in">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400">
              ❌ Por que está errado?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Número {errorExplanation.wrongDigit} não pode estar aqui
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {errorExplanation.explanation}
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">💡 Dica:</span> Use o modo de notas
            para marcar os candidatos possíveis antes de preencher uma célula.
          </p>
        </div>

        <button
          onClick={handleClose}
          className="w-full mt-4 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
