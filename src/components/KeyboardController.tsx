"use client";

import { useEffect } from "react";
import { useGameStore } from "@/state/store";
import { Digit } from "@/engine";

/**
 * KeyboardController handles keyboard input for the Sudoku game
 * - Digits 1-9: Insert answer or toggle note
 * - Backspace/Delete: Clear cell
 * - Arrow keys: Move selection
 * - N: Toggle note mode
 * - I: Toggle inspect mode
 * - U or Ctrl+Z: Undo
 * - Esc: Clear selection or exit note/inspect mode
 */
export function KeyboardController() {
  const dispatch = useGameStore((s) => s.dispatch);
  const mode = useGameStore((s) => s.mode);
  const paused = useGameStore((s) => s.paused);
  const selectedIdx = useGameStore((s) => s.selectedIdx);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keyboard if paused or in inspect mode (except mode toggles)
      if (paused) return;

      // Digit keys 1-9
      if (e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        if (mode !== "inspect") {
          dispatch({ type: "INPUT_DIGIT", digit: parseInt(e.key) as Digit });
        }
        return;
      }

      // Backspace or Delete: Clear cell
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        if (mode !== "inspect" && selectedIdx !== null) {
          dispatch({ type: "CLEAR_CELL" });
        }
        return;
      }

      // Arrow keys: Move selection
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        if (selectedIdx !== null) {
          const row = Math.floor(selectedIdx / 9);
          const col = selectedIdx % 9;
          let newRow = row;
          let newCol = col;

          if (e.key === "ArrowUp") newRow = (row - 1 + 9) % 9;
          if (e.key === "ArrowDown") newRow = (row + 1) % 9;
          if (e.key === "ArrowLeft") newCol = (col - 1 + 9) % 9;
          if (e.key === "ArrowRight") newCol = (col + 1) % 9;

          const newIdx = newRow * 9 + newCol;
          dispatch({ type: "SELECT_CELL", idx: newIdx });
        }
        return;
      }

      // N: Toggle note mode
      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        dispatch({
          type: "SET_MODE",
          mode: mode === "note" ? "answer" : "note",
        });
        return;
      }

      // I: Toggle inspect mode
      if (e.key.toLowerCase() === "i") {
        e.preventDefault();
        dispatch({
          type: "SET_MODE",
          mode: mode === "inspect" ? "answer" : "inspect",
        });
        return;
      }

      // U or Ctrl+Z: Undo
      if (e.key.toLowerCase() === "u" || (e.ctrlKey && e.key === "z")) {
        e.preventDefault();
        dispatch({ type: "UNDO" });
        return;
      }

      // Esc: Clear selection or exit mode
      if (e.key === "Escape") {
        e.preventDefault();
        if (mode !== "answer") {
          // Exit note/inspect mode first
          dispatch({ type: "SET_MODE", mode: "answer" });
        } else if (selectedIdx !== null) {
          // Clear selection
          dispatch({ type: "SELECT_CELL", idx: null });
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, mode, paused, selectedIdx]);

  return null; // This component doesn't render anything
}
