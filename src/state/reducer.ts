import {
  CellValue,
  Digit,
  getPeers,
  toggleNote,
  clearNotes,
  removeNote,
} from "@/engine";
import { GameState, CellMeta, GameMode, HistoryEntry } from "./types";

export type GameAction =
  | { type: "INIT_PUZZLE"; given: CellValue[]; solution: CellValue[] }
  | { type: "SELECT_CELL"; idx: number | null }
  | { type: "SET_MODE"; mode: GameMode }
  | { type: "INPUT_DIGIT"; digit: Digit }
  | { type: "ERASE_NOTES" }
  | { type: "CLEAR_CELL" }
  | { type: "UNDO" }
  | { type: "TOGGLE_PAUSE" }
  | { type: "TICK_TIMER"; now: number }
  | { type: "HINT" }
  | { type: "NEW_GAME"; given: CellValue[]; solution: CellValue[] }
  | {
      type: "LOAD_SAVED_GAME";
      given: CellValue[];
      solution: CellValue[];
      values: CellValue[];
      meta: CellMeta[];
      mistakes: number;
      elapsedMs: number;
    }
  | {
      type: "SET_TOAST";
      message: string;
      toastType: "info" | "success" | "warning" | "error";
    }
  | { type: "CLEAR_TOAST" };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "INIT_PUZZLE": {
      const { given, solution } = action;
      const values = [...given];
      const meta: CellMeta[] = given.map((val, idx) => ({
        isGiven: val !== 0,
        isLocked: val !== 0,
        status: val !== 0 ? "correct" : "empty",
        notes: 0,
      }));

      return {
        ...state,
        given,
        solution,
        values,
        meta,
        selectedIdx: null,
        mistakes: 0,
        paused: false,
        history: [],
        timer: {
          elapsedMs: 0,
          running: true,
          lastTick: Date.now(),
        },
      };
    }

    case "SELECT_CELL": {
      return { ...state, selectedIdx: action.idx };
    }

    case "SET_MODE": {
      return { ...state, mode: action.mode };
    }

    case "INPUT_DIGIT": {
      const { digit } = action;
      const { selectedIdx, mode, values, meta, solution } = state;

      if (selectedIdx === null || mode === "inspect") return state;
      if (meta[selectedIdx].isLocked || meta[selectedIdx].isGiven) return state;

      const newValues = [...values];
      const newMeta = meta.map((m) => ({ ...m }));
      const previousValues = [values[selectedIdx]];
      const previousMeta = [{ ...meta[selectedIdx] }];

      if (mode === "answer") {
        // Insert answer
        newValues[selectedIdx] = digit;
        const isCorrect = digit === solution[selectedIdx];

        if (isCorrect) {
          // Correct answer: lock cell and auto-remove notes from peers
          newMeta[selectedIdx].status = "correct";
          newMeta[selectedIdx].isLocked = true;
          newMeta[selectedIdx].notes = 0;

          // Auto-remove this digit from peers' notes
          const peers = getPeers(selectedIdx);
          peers.forEach((peerIdx) => {
            if (values[peerIdx] === 0 && newMeta[peerIdx].notes !== 0) {
              newMeta[peerIdx].notes = removeNote(
                newMeta[peerIdx].notes,
                digit,
              );
            }
          });
        } else {
          // Wrong answer: mark as wrong and increment mistakes
          newMeta[selectedIdx].status = "wrong";
          return {
            ...state,
            values: newValues,
            meta: newMeta,
            mistakes: state.mistakes + 1,
            history: [
              ...state.history,
              { indices: [selectedIdx], previousValues, previousMeta },
            ],
          };
        }

        return {
          ...state,
          values: newValues,
          meta: newMeta,
          history: [
            ...state.history,
            { indices: [selectedIdx], previousValues, previousMeta },
          ],
        };
      } else if (mode === "note") {
        // Toggle note
        newMeta[selectedIdx].notes = toggleNote(
          newMeta[selectedIdx].notes,
          digit,
        );

        return {
          ...state,
          meta: newMeta,
          history: [
            ...state.history,
            { indices: [selectedIdx], previousValues, previousMeta },
          ],
        };
      }

      return state;
    }

    case "ERASE_NOTES": {
      const { selectedIdx, meta } = state;
      if (selectedIdx === null) return state;
      if (meta[selectedIdx].isLocked || meta[selectedIdx].isGiven) return state;

      const newMeta = meta.map((m) => ({ ...m }));
      const previousMeta = [{ ...meta[selectedIdx] }];
      newMeta[selectedIdx].notes = clearNotes();

      return {
        ...state,
        meta: newMeta,
        history: [
          ...state.history,
          {
            indices: [selectedIdx],
            previousValues: [state.values[selectedIdx]],
            previousMeta,
          },
        ],
      };
    }

    case "UNDO": {
      if (state.history.length === 0) return state;

      const lastEntry = state.history[state.history.length - 1];
      const newValues = [...state.values];
      const newMeta = state.meta.map((m) => ({ ...m }));

      lastEntry.indices.forEach((idx, i) => {
        newValues[idx] = lastEntry.previousValues[i];
        newMeta[idx] = { ...lastEntry.previousMeta[i] };
      });

      // Adjust mistakes if we're undoing a wrong answer
      let mistakesAdjustment = 0;
      lastEntry.indices.forEach((idx, i) => {
        if (
          lastEntry.previousMeta[i].status !== "wrong" &&
          state.meta[idx].status === "wrong"
        ) {
          mistakesAdjustment--;
        }
      });

      return {
        ...state,
        values: newValues,
        meta: newMeta,
        mistakes: state.mistakes + mistakesAdjustment,
        history: state.history.slice(0, -1),
      };
    }

    case "TOGGLE_PAUSE": {
      const newPaused = !state.paused;
      return {
        ...state,
        paused: newPaused,
        timer: {
          ...state.timer,
          running: !newPaused,
          lastTick: newPaused ? state.timer.lastTick : Date.now(),
        },
      };
    }

    case "TICK_TIMER": {
      if (!state.timer.running || state.paused) return state;

      const delta = action.now - state.timer.lastTick;
      return {
        ...state,
        timer: {
          ...state.timer,
          elapsedMs: state.timer.elapsedMs + delta,
          lastTick: action.now,
        },
      };
    }

    case "HINT": {
      // Placeholder for MVP
      return state;
    }

    case "CLEAR_CELL": {
      const { selectedIdx, values, meta } = state;
      if (selectedIdx === null) return state;
      if (meta[selectedIdx].isLocked || meta[selectedIdx].isGiven) return state;

      const newValues = [...values];
      const newMeta = meta.map((m) => ({ ...m }));
      const previousValues = [values[selectedIdx]];
      const previousMeta = [{ ...meta[selectedIdx] }];

      // Clear the value but keep notes
      newValues[selectedIdx] = 0;
      newMeta[selectedIdx].status = "empty";

      return {
        ...state,
        values: newValues,
        meta: newMeta,
        history: [
          ...state.history,
          { indices: [selectedIdx], previousValues, previousMeta },
        ],
      };
    }

    case "NEW_GAME": {
      const { given, solution } = action;
      const values = [...given];
      const meta: CellMeta[] = given.map((val) => ({
        isGiven: val !== 0,
        isLocked: val !== 0,
        status: val !== 0 ? "correct" : "empty",
        notes: 0,
      }));

      return {
        ...state,
        given,
        solution,
        values,
        meta,
        selectedIdx: null,
        mode: "answer",
        mistakes: 0,
        paused: false,
        toast: null,
        history: [],
        timer: {
          elapsedMs: 0,
          running: true,
          lastTick: Date.now(),
        },
      };
    }

    case "LOAD_SAVED_GAME": {
      const { given, solution, values, meta, mistakes, elapsedMs } = action;

      return {
        ...state,
        given,
        solution,
        values,
        meta,
        selectedIdx: null,
        mode: "answer",
        mistakes,
        paused: false,
        toast: null,
        history: [],
        timer: {
          elapsedMs,
          running: true,
          lastTick: Date.now(),
        },
      };
    }

    case "SET_TOAST": {
      return {
        ...state,
        toast: {
          message: action.message,
          type: action.toastType,
        },
      };
    }

    case "CLEAR_TOAST": {
      return {
        ...state,
        toast: null,
      };
    }

    default:
      return state;
  }
}
