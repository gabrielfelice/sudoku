"use client";

import { useGameStore } from "@/state/store";
import { CellValue } from "@/engine";
import { parsePuzzle, EASY_PUZZLE } from "@/lib/puzzles";

export function ActionBar() {
  const mode = useGameStore((s) => s.mode);
  const dispatch = useGameStore((s) => s.dispatch);
  const paused = useGameStore((s) => s.paused);
  const selectedIdx = useGameStore((s) => s.selectedIdx);

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

  const handleToggleInspect = () => {
    dispatch({
      type: "SET_MODE",
      mode: mode === "inspect" ? "answer" : "inspect",
    });
  };

  const handleHint = () => {
    dispatch({
      type: "SET_TOAST",
      message: "Dica: implementar no Milestone C",
      toastType: "info",
    });
  };

  const handleNewGame = () => {
    const given = parsePuzzle(EASY_PUZZLE.given) as CellValue[];
    const solution = parsePuzzle(EASY_PUZZLE.solution) as CellValue[];
    dispatch({ type: "NEW_GAME", given, solution });
    dispatch({
      type: "SET_TOAST",
      message: "Novo jogo iniciado!",
      toastType: "success",
    });
  };

  const isDisabled = paused;
  const isClearDisabled = isDisabled || selectedIdx === null;

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

        <button
          onClick={handleUndo}
          disabled={isDisabled}
          className="px-3 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          title="Desfazer (U ou Ctrl+Z)"
        >
          Desfazer
        </button>

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

        <button
          onClick={handleToggleInspect}
          disabled={isDisabled}
          className={`
            px-3 py-2 font-semibold rounded-lg transition-colors text-sm
            ${
              mode === "inspect"
                ? "bg-yellow-600 text-white hover:bg-yellow-700 ring-2 ring-yellow-400"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title="Modo investigador (I)"
        >
          Investigador
        </button>

        <button
          onClick={handleHint}
          disabled={isDisabled}
          className="px-3 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Dica
        </button>

        <button
          onClick={handleNewGame}
          disabled={isDisabled}
          className="px-3 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          title="Reiniciar jogo"
        >
          Novo Jogo
        </button>
      </div>
    </div>
  );
}
