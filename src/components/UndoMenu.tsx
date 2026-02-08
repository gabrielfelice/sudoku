"use client";

import { useState, useRef, useEffect } from "react";
import { useGameStore } from "@/state/store";

export function UndoMenu() {
  const dispatch = useGameStore((state) => state.dispatch);
  const history = useGameStore((state) => state.history);
  const cellHistory = useGameStore((state) => state.cellHistory);
  const selectedIdx = useGameStore((state) => state.selectedIdx);

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const canUndoGlobal = history.length > 0;
  const canUndoCell =
    selectedIdx !== null &&
    cellHistory.has(selectedIdx) &&
    (cellHistory.get(selectedIdx)?.length ?? 0) > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleUndoGlobal = () => {
    dispatch({ type: "UNDO" });
    setIsOpen(false);
  };

  const handleUndoCell = () => {
    dispatch({ type: "UNDO_CELL" });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!canUndoGlobal && !canUndoCell}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        title="Desfazer"
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
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <div className="p-2">
            <button
              onClick={handleUndoGlobal}
              disabled={!canUndoGlobal}
              className="w-full px-4 py-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-start gap-3"
            >
              <svg
                className="w-5 h-5 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  Desfazer Última Ação
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {canUndoGlobal
                    ? `Desfazer a última ação realizada (${history.length} ${history.length === 1 ? "ação" : "ações"} no histórico)`
                    : "Nenhuma ação para desfazer"}
                </div>
              </div>
            </button>

            <div className="my-1 border-t border-gray-200 dark:border-gray-700" />

            <button
              onClick={handleUndoCell}
              disabled={!canUndoCell}
              className="w-full px-4 py-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-start gap-3"
            >
              <svg
                className="w-5 h-5 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  Desfazer Nesta Célula
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {canUndoCell
                    ? `Desfazer a última ação na célula selecionada (${cellHistory.get(selectedIdx!)?.length ?? 0} ${(cellHistory.get(selectedIdx!)?.length ?? 0) === 1 ? "ação" : "ações"})`
                    : selectedIdx === null
                      ? "Selecione uma célula primeiro"
                      : "Nenhuma ação nesta célula"}
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
