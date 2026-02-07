"use client";

import { useGameStore } from "@/state/store";
import { CellValue } from "@/engine";
import { getNextHint } from "@/engine/solver";
import { generatePuzzleWithCache } from "@/engine/generator";

export function ActionBar() {
  const mode = useGameStore((s) => s.mode);
  const dispatch = useGameStore((s) => s.dispatch);
  const paused = useGameStore((s) => s.paused);
  const selectedIdx = useGameStore((s) => s.selectedIdx);
  const values = useGameStore((s) => s.values);
  const meta = useGameStore((s) => s.meta);
  const difficulty = useGameStore((s) => s.difficulty);

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
    // Obter notas do usuário
    const userNotes = meta.map((m) => m.notes);

    // Obter próxima dica
    const hint = getNextHint(values, userNotes);

    if (!hint) {
      dispatch({
        type: "SET_TOAST",
        message: "Nenhuma dica disponível no momento",
        toastType: "info",
      });
      return;
    }

    // Mostrar dica
    dispatch({
      type: "SHOW_HINT",
      hint: {
        visible: true,
        techniqueName: hint.techniqueName,
        explanation: hint.explanation,
        highlight: {
          primary: hint.targetCells,
          secondary: [],
        },
      },
    });
  };

  const handleErrorExplanation = () => {
    dispatch({ type: "SHOW_ERROR_EXPLANATION" });
  };

  const handleNewGame = () => {
    try {
      const puzzle = generatePuzzleWithCache(difficulty);
      dispatch({
        type: "NEW_GAME",
        given: puzzle.given,
        solution: puzzle.solution,
        difficulty: puzzle.difficulty,
        seed: puzzle.seed,
      });
      dispatch({
        type: "SET_TOAST",
        message: `Novo jogo (${puzzle.difficulty}) iniciado!`,
        toastType: "success",
      });
    } catch (error) {
      dispatch({
        type: "SET_TOAST",
        message: "Erro ao gerar puzzle. Tente novamente.",
        toastType: "error",
      });
    }
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
          onClick={handleNewGame}
          disabled={isDisabled}
          className="px-3 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          title="Gerar novo jogo"
        >
          Novo Jogo
        </button>
      </div>
    </div>
  );
}
