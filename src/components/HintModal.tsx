"use client";

import { useGameStore } from "@/state/store";

export function HintModal() {
  const hint = useGameStore((state) => state.hint);
  const dispatch = useGameStore((state) => state.dispatch);

  if (!hint || !hint.visible) return null;

  const handleClose = () => {
    dispatch({ type: "CLOSE_HINT" });
  };

  const handleApply = () => {
    dispatch({ type: "APPLY_HINT" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-scale-in">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              💡 Dica
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {hint.techniqueName
                .replace(/-/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
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

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {hint.explanation}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Entendi
          </button>
          {hint.techniqueName.includes("single") && (
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
            >
              Aplicar Dica
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
