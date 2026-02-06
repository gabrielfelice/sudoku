import { CellValue } from "@/engine";
import { GameState, CellMeta } from "@/state/types";

const STORAGE_KEY = "sudoku_save";
const SCHEMA_VERSION = 1;

export interface SavedGame {
  schemaVersion: number;
  timestamp: number;
  puzzle: {
    given: CellValue[];
    solution: CellValue[];
  };
  state: {
    values: CellValue[];
    meta: CellMeta[];
    mistakes: number;
    elapsedMs: number;
  };
}

/**
 * Save current game state to localStorage
 */
export function saveGame(state: GameState): void {
  try {
    const savedGame: SavedGame = {
      schemaVersion: SCHEMA_VERSION,
      timestamp: Date.now(),
      puzzle: {
        given: state.given,
        solution: state.solution,
      },
      state: {
        values: state.values,
        meta: state.meta,
        mistakes: state.mistakes,
        elapsedMs: state.timer.elapsedMs,
      },
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedGame));
  } catch (error) {
    console.error("Failed to save game:", error);
  }
}

/**
 * Load saved game from localStorage
 * Returns null if no valid save exists
 */
export function loadGame(): SavedGame | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved) as SavedGame;

    // Validate schema version
    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      console.warn("Save schema version mismatch, clearing old save");
      clearSave();
      return null;
    }

    // Basic validation
    if (
      !parsed.puzzle?.given ||
      !parsed.puzzle?.solution ||
      !parsed.state?.values ||
      !parsed.state?.meta ||
      parsed.puzzle.given.length !== 81 ||
      parsed.puzzle.solution.length !== 81 ||
      parsed.state.values.length !== 81 ||
      parsed.state.meta.length !== 81
    ) {
      console.warn("Invalid save data structure, clearing");
      clearSave();
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Failed to load game:", error);
    clearSave();
    return null;
  }
}

/**
 * Clear saved game from localStorage
 */
export function clearSave(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear save:", error);
  }
}

/**
 * Check if a valid saved game exists
 */
export function hasSavedGame(): boolean {
  return loadGame() !== null;
}
