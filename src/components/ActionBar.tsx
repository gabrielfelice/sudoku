"use client";

import { useGameStore } from "@/state/store";

export function ActionBar() {
  const mode = useGameStore((s) => s.mode);
  const dispatch = useGameStore((s) => s.dispatch);
  const paused = useGameStore((s) => s.paused);

  const handleErase = () => {
    dispatch({ type: "ERASE_NOTES" });
  };

  const handleUndo = () => {
    dispatch({ type: "UNDO" });
  };

  const handleToggleNote = () => {
    dispatch({ type: "SET_MODE", mode: mode === "note" ? "answer" : "note" });
  };

  const handleToggleInspect = () => {
    dispatch({
      type: "SET_MODE",
      mode: mode === "inspect" ? "answer" : "inspect",
    });
  };

  const handleHint = () => {
    alert("Dica: implementar no Milestone C");
  };

  const isDisabled = paused;

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <button
        onClick={handleErase}
        disabled={isDisabled}
        className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Borracha
      </button>

      <button
        onClick={handleUndo}
        disabled={isDisabled}
        className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Desfazer
      </button>

      <button
        onClick={handleToggleNote}
        disabled={isDisabled}
        className={`
          px-4 py-2 font-semibold rounded-lg transition-colors relative
          ${
            mode === "note"
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        Anotação
        {mode === "note" && (
          <span className="absolute -top-2 -right-2 bg-green-800 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            ANOTAR
          </span>
        )}
      </button>

      <button
        onClick={handleToggleInspect}
        disabled={isDisabled}
        className={`
          px-4 py-2 font-semibold rounded-lg transition-colors relative
          ${
            mode === "inspect"
              ? "bg-yellow-600 text-white hover:bg-yellow-700"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        Investigador
        {mode === "inspect" && (
          <span className="absolute -top-2 -right-2 bg-yellow-800 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            INVESTIGAR
          </span>
        )}
      </button>

      <button
        onClick={handleHint}
        disabled={isDisabled}
        className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Dica
      </button>
    </div>
  );
}
