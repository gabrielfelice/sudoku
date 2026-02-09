"use client";

import { useGameStore } from "@/state/store";
import { explainHint } from "@/engine/explain";

export function HintModal() {
  const hint = useGameStore((state) => state.hint);
  const values = useGameStore((state) => state.values);
  const meta = useGameStore((state) => state.meta);
  const dispatch = useGameStore((state) => state.dispatch);
  const hintUsageCount = useGameStore((state) => state.hintUsageCount);
  const hintLimit = useGameStore((state) => state.config.hintLimit);

  if (!hint || !hint.visible) return null;

  const currentStep = hint.currentStep ?? 0;
  const steps = hint.steps || [];
  const hasSteps = steps.length > 0;
  const canApply = hint.canApply ?? hint.techniqueName.includes("single");

  const handleClose = () => {
    dispatch({ type: "CLOSE_HINT" });
  };

  const handleApply = () => {
    dispatch({ type: "APPLY_HINT_STEP" });
    dispatch({ type: "INCREMENT_HINT_USAGE" });
  };

  const handleNextStep = () => {
    dispatch({ type: "NEXT_HINT_STEP" });
  };

  const handlePrevStep = () => {
    dispatch({ type: "PREV_HINT_STEP" });
  };

  const formatTechniqueName = (name: string) => {
    return name.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <>
      {/* Minimal backdrop - doesn't block board */}
      <div className="fixed inset-0 z-40 bg-black/10 pointer-events-none" />

      {/* Docked panel at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-4 pointer-events-none animate-slide-up">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-auto max-h-[60vh] overflow-y-auto pointer-events-auto">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                💡 Dica
                {hintLimit !== null && (
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({hintUsageCount}/{hintLimit} usadas)
                  </span>
                )}
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 font-medium">
                {formatTechniqueName(hint.techniqueName)}
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

          {hasSteps ? (
            <>
              {/* Step Progress Indicator */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Passo {currentStep + 1} de {steps.length}
                  </span>
                  <div className="flex gap-1">
                    {steps.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-2 w-8 rounded-full transition-colors ${
                          idx <= currentStep
                            ? "bg-blue-600"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Current Step Content */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-5 mb-4">
                <h4 className="font-bold text-lg text-blue-900 dark:text-blue-100 mb-2">
                  {steps[currentStep]?.title}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {steps[currentStep]?.description}
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Anterior
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={currentStep === steps.length - 1}
                  className="flex-1 px-4 py-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Próximo Passo
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Somente Entender
                </button>
                {canApply && steps[currentStep]?.canApply && (
                  <button
                    onClick={handleApply}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Aplicar Passo
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Fallback: Simple explanation */}
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
                {canApply && (
                  <button
                    onClick={handleApply}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                  >
                    Aplicar Dica
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
