"use client";

import { useGameStore } from "@/state/store";
import { CellValue } from "@/engine";
import { explainHint } from "@/engine/explain";
import { UndoMenu } from "@/components/UndoMenu";
import { useState } from "react";
import { Eraser, Pencil, Search } from "lucide-react";

export function ActionBar() {
  const mode = useGameStore((s) => s.mode);
  const dispatch = useGameStore((s) => s.dispatch);
  const paused = useGameStore((s) => s.paused);
  const selectedIdx = useGameStore((s) => s.selectedIdx);
  const values = useGameStore((s) => s.values);
  const meta = useGameStore((s) => s.meta);
  const difficulty = useGameStore((s) => s.difficulty);

  const handleErase = () => {
    dispatch({ type: "ERASE_NOTES" });
  };

  const handleUndo = () => {
    dispatch({ type: "UNDO" });
  };

  const handleToggleNote = () => {
    dispatch({ type: "SET_MODE", mode: mode === "note" ? "answer" : "note" });
  };

  const handleToggleInspect = (enabled: boolean) => {
    dispatch({
      type: "SET_MODE",
      mode: enabled ? "inspect" : "answer",
    });
  };

  const handleHint = () => {
    // Obter notas do usuário
    const userNotes = meta.map((m) => m.notes);

    // Obter dica guiada usando novo engine
    const guidedHint = explainHint(values, userNotes);

    if (!guidedHint) {
      dispatch({
        type: "SET_TOAST",
        message: "Nenhuma dica disponível no momento",
        toastType: "info",
      });
      return;
    }

    // Mostrar dica com passos
    dispatch({
      type: "SHOW_HINT",
      hint: {
        visible: true,
        techniqueName: guidedHint.techniqueName,
        explanation: guidedHint.narrative,
        highlight: guidedHint.highlight,
        canApply: guidedHint.canApply,
        steps: guidedHint.steps,
        currentStep: 0,
      },
    });
    dispatch({ type: "INCREMENT_HINT_USAGE" });
  };

  const handleErrorExplanation = () => {
    dispatch({ type: "SHOW_ERROR_EXPLANATION" });
    dispatch({ type: "INCREMENT_EXPLANATION_USAGE" });
  };

  const isDisabled = paused;

  // Verificar se há célula errada selecionada
  const hasWrongCell =
    selectedIdx !== null && meta[selectedIdx]?.status === "wrong";

  return (
    <div className="w-full space-y-4">
      {/* Mode indicator badge */}
      <div className="flex justify-center">
        <div
          className={`
            px-4 py-1.5 rounded-full font-semibold text-xs tracking-wide
            ${mode === "answer" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" : ""}
            ${mode === "note" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}
            ${mode === "inspect" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" : ""}
          `}
        >
          {mode === "answer" && "MODO: RESPONDER"}
          {mode === "note" && "MODO: ANOTAR"}
          {mode === "inspect" && "MODO: INVESTIGAR"}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {/* Borracha - Eraser icon button */}
        <button
          onClick={handleErase}
          disabled={isDisabled}
          className="p-3 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Borracha - Apagar notas (Backspace/Delete)"
          aria-label="Borracha - Apagar notas"
        >
          <Eraser className="h-5 w-5" />
        </button>

        <UndoMenu />

        {/* Anotação - Pencil icon button */}
        <button
          onClick={handleToggleNote}
          disabled={isDisabled}
          className={`
            p-3 font-semibold rounded-lg transition-colors
            ${
              mode === "note"
                ? "bg-green-600 text-white hover:bg-green-700 ring-2 ring-green-400"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title="Modo anotação (N)"
          aria-label="Modo anotação"
        >
          <Pencil className="h-5 w-5" />
        </button>

        {/* Investigar - Magnifying glass icon button */}
        <button
          onClick={() => handleToggleInspect(mode !== "inspect")}
          disabled={isDisabled}
          className={`
            p-3 font-semibold rounded-lg transition-colors
            ${
              mode === "inspect"
                ? "bg-yellow-600 text-white hover:bg-yellow-700 ring-2 ring-yellow-400"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title="Modo investigar"
          aria-label="Modo investigar"
        >
          <Search className="h-5 w-5" />
        </button>

        <button
          onClick={handleHint}
          disabled={isDisabled}
          className="px-3 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm shadow-lg shadow-purple-500/30"
          title="Obter dica"
        >
          💡 Dica
        </button>
        {hasWrongCell && (
          <button
            onClick={handleErrorExplanation}
            disabled={isDisabled}
            className="px-3 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm shadow-lg shadow-red-500/30 animate-pulse"
            title="Por que está errado?"
          >
            ❌ Explicação
          </button>
        )}
      </div>
    </div>
  );
}
