"use client";

import { useGameStore } from "@/state/store";
import { useEffect, useState } from "react";
import { explainInvalidMove } from "@/engine/explain";

export function ErrorExplanationModal() {
  const errorExplanation = useGameStore((state) => state.errorExplanation);
  const values = useGameStore((state) => state.values);
  const solution = useGameStore((state) => state.solution);
  const dispatch = useGameStore((state) => state.dispatch);
  const explanationUsageCount = useGameStore(
    (state) => state.explanationUsageCount,
  );
  const explanationLimit = useGameStore(
    (state) => state.config.explanationLimit,
  );

  const [detailedExplanation, setDetailedExplanation] = useState<any>(null);

  useEffect(() => {
    if (
      errorExplanation &&
      errorExplanation.visible &&
      errorExplanation.cellIdx !== null
    ) {
      // Generate detailed explanation if not already present
      if (!errorExplanation.layers) {
        const detailed = explainInvalidMove(
          values,
          errorExplanation.cellIdx,
          errorExplanation.wrongDigit as any,
          solution,
        );
        setDetailedExplanation(detailed);
      } else {
        setDetailedExplanation(null);
      }
    }
  }, [errorExplanation, values, solution]);

  if (!errorExplanation || !errorExplanation.visible) return null;

  const layers = errorExplanation.layers || detailedExplanation?.layers || [];
  const currentLayer = errorExplanation.currentLayer ?? 0;
  const hasLayers = layers.length > 0;

  const handleClose = () => {
    dispatch({ type: "CLOSE_ERROR_EXPLANATION" });
  };

  const handleNextLayer = () => {
    dispatch({ type: "NEXT_EXPLANATION_LAYER" });
  };

  const handlePrevLayer = () => {
    dispatch({ type: "PREV_EXPLANATION_LAYER" });
  };

  const getLayerIcon = (type: string) => {
    switch (type) {
      case "rule":
        return "⚠️";
      case "candidates":
        return "🔢";
      case "technique":
        return "🎯";
      default:
        return "ℹ️";
    }
  };

  const getLayerColor = (type: string) => {
    switch (type) {
      case "rule":
        return "red";
      case "candidates":
        return "yellow";
      case "technique":
        return "green";
      default:
        return "blue";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4 animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              ❌ Por que está errado?
              {explanationLimit !== null && (
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({explanationUsageCount}/{explanationLimit} explicações)
                </span>
              )}
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

        {hasLayers ? (
          <>
            {/* Layer Navigation Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {layers.map((layer: any, idx: number) => {
                const color = getLayerColor(layer.type);
                const isActive = idx === currentLayer;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (idx > currentLayer) {
                        for (let i = currentLayer; i < idx; i++) {
                          handleNextLayer();
                        }
                      } else if (idx < currentLayer) {
                        for (let i = currentLayer; i > idx; i--) {
                          handlePrevLayer();
                        }
                      }
                    }}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? `bg-${color}-100 dark:bg-${color}-900/30 text-${color}-700 dark:text-${color}-300 border-2 border-${color}-500`
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-2 border-transparent hover:border-gray-300"
                    }`}
                  >
                    {getLayerIcon(layer.type)} {layer.title}
                  </button>
                );
              })}
            </div>

            {/* Current Layer Content */}
            {layers[currentLayer] && (
              <div
                className={`bg-${getLayerColor(layers[currentLayer].type)}-50 dark:bg-${getLayerColor(layers[currentLayer].type)}-900/20 border-2 border-${getLayerColor(layers[currentLayer].type)}-200 dark:border-${getLayerColor(layers[currentLayer].type)}-800 rounded-lg p-5 mb-4`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">
                    {getLayerIcon(layers[currentLayer].type)}
                  </span>
                  <div className="flex-1">
                    <h4
                      className={`font-bold text-lg text-${getLayerColor(layers[currentLayer].type)}-900 dark:text-${getLayerColor(layers[currentLayer].type)}-100 mb-2`}
                    >
                      {layers[currentLayer].title}
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {layers[currentLayer].description}
                    </p>

                    {/* Show candidates if available */}
                    {layers[currentLayer].candidates &&
                      layers[currentLayer].candidates.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Candidatos válidos:
                          </span>
                          {layers[currentLayer].candidates.map(
                            (num: number) => (
                              <span
                                key={num}
                                className="inline-flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-bold text-sm border-2 border-green-500"
                              >
                                {num}
                              </span>
                            ),
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={handlePrevLayer}
                disabled={currentLayer === 0}
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
                Camada Anterior
              </button>
              <button
                onClick={handleNextLayer}
                disabled={currentLayer === layers.length - 1}
                className="flex-1 px-4 py-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Próxima Camada
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
          </>
        ) : (
          <>
            {/* Fallback: Simple explanation */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {errorExplanation.explanation}
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold">💡 Dica:</span> Use o modo de
                notas para marcar os candidatos possíveis antes de preencher uma
                célula.
              </p>
            </div>
          </>
        )}

        <button
          onClick={handleClose}
          className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
