"use client";

import { useGameStore } from "@/state/store";
import { CellValue } from "@/engine";
import { explainHint } from "@/engine/explain";
import { UndoMenu } from "@/components/UndoMenu";
import { Switch } from "@/components/Switch";
import { useState } from "react";

export function ActionBar() {
  const mode = useGameStore((s) => s.mode);
  const dispatch = useGameStore((s) => s.dispatch);
  const paused = useGameStore((s) => s.paused);
  const selectedIdx = useGameStore((s) => s.selectedIdx);
  const values = useGameStore((s) => s.values);
  const meta = useGameStore((s) => s.meta);
  const difficulty = useGameStore((s) => s.difficulty);

  const [showNewGameModal, setShowNewGameModal] = useState(false);

  const handleClear = () => {
    dispatch({ type: "CLEAR_CELL" });
  };

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
  const isClearDisabled = isDisabled || selectedIdx === null;

  // Verificar se há célula errada selecionada
  const hasWrongCell =
    selectedIdx !== null && meta[selectedIdx]?.status === "wrong";

  return (
    <div className="w-full space-y-4">
      {/* Mode indicator badge */}
      <div className="flex justify-center">
        <div
          className={`
            px-6 py-2 rounded-full font-bold text-sm tracking-wide
            ${mode === "answer" ? "bg-blue-100 text-blue-800" : ""}
            ${mode === "note" ? "bg-green-100 text-green-800" : ""}
            ${mode === "inspect" ? "bg-yellow-100 text-yellow-800" : ""}
          `}
        >
          {mode === "answer" && "MODO: RESPONDER"}
          {mode === "note" && "MODO: ANOTAR"}
          {mode === "inspect" && "MODO: INVESTIGAR"}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          onClick={handleClear}
          disabled={isClearDisabled}
          className="px-3 py-2 bg-red-100 text-red-800 font-semibold rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          title="Limpar célula (Backspace/Delete)"
        >
          Limpar
        </button>

        <button
          onClick={handleErase}
          disabled={isDisabled}
          className="px-3 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          title="Apagar notas"
        >
          Borracha
        </button>

        <UndoMenu />

        <button
          onClick={handleToggleNote}
          disabled={isDisabled}
          className={`
            px-3 py-2 font-semibold rounded-lg transition-colors text-sm
            ${
              mode === "note"
                ? "bg-green-600 text-white hover:bg-green-700 ring-2 ring-green-400"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title="Modo anotação (N)"
        >
          Anotação
        </button>

        <Switch
          checked={mode === "inspect"}
          onChange={handleToggleInspect}
          label="Investigador"
          disabled={isDisabled}
          className="text-sm"
        />

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

        <button
          onClick={() => setShowNewGameModal(true)}
          disabled={isDisabled}
          className="px-3 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          title="Escolher novo jogo"
        >
          🎲 Novo Jogo
        </button>
      </div>

      {/* Import NewGameModal at component level */}
      {showNewGameModal && (
        <div className="fixed inset-0 z-50">
          {/* Use dynamic import to avoid circular dependencies */}
          {(() => {
            const { NewGameModal } = require("@/components/NewGameModal");
            return (
              <NewGameModal
                isOpen={showNewGameModal}
                onClose={() => setShowNewGameModal(false)}
              />
            );
          })()}
        </div>
      )}
    </div>
  );
}
