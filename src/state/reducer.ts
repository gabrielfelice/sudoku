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
  | {
      type: "INIT_PUZZLE";
      given: CellValue[];
      solution: CellValue[];
      difficulty?: "easy" | "medium" | "hard" | "expert";
      seed?: number;
    }
  | { type: "SELECT_CELL"; idx: number | null }
  | { type: "SET_MODE"; mode: GameMode }
  | { type: "INPUT_DIGIT"; digit: Digit }
  | { type: "ERASE_NOTES" }
  | { type: "CLEAR_CELL" }
  | { type: "UNDO" }
  | { type: "TOGGLE_PAUSE" }
  | { type: "TICK_TIMER"; now: number }
  | { type: "REQUEST_HINT" }
  | { type: "SHOW_HINT"; hint: import("./types").HintState }
  | { type: "CLOSE_HINT" }
  | { type: "APPLY_HINT" }
  | { type: "SHOW_ERROR_EXPLANATION" }
  | { type: "CLOSE_ERROR_EXPLANATION" }
  | {
      type: "SET_DIFFICULTY";
      difficulty: "easy" | "medium" | "hard" | "expert";
    }
  | {
      type: "NEW_GAME";
      given: CellValue[];
      solution: CellValue[];
      difficulty?: "easy" | "medium" | "hard" | "expert";
      seed?: number;
    }
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
      const { given, solution, difficulty, seed } = action;
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
        difficulty: difficulty || state.difficulty,
        seed,
        selectedIdx: null,
        mistakes: 0,
        paused: false,
        hint: null,
        errorExplanation: null,
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
            hint: null, // fechar dica ao errar
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

    case "REQUEST_HINT": {
      // Implementado no componente via getNextHint
      return state;
    }

    case "SHOW_HINT": {
      return {
        ...state,
        hint: action.hint,
      };
    }

    case "CLOSE_HINT": {
      return {
        ...state,
        hint: null,
      };
    }

    case "APPLY_HINT": {
      if (!state.hint) return state;

      const { hint } = state;
      const newValues = [...state.values];
      const newMeta = state.meta.map((m) => ({ ...m }));

      // Se a dica tem placement, aplicar
      if (hint.techniqueName.includes("single")) {
        const targetCell = hint.highlight.primary[0];
        if (targetCell !== undefined) {
          // Extrair dígito da explicação (simplificado)
          const match = hint.explanation.match(/: (\d)/);
          if (match) {
            const digit = parseInt(match[1]) as CellValue;
            newValues[targetCell] = digit;
            newMeta[targetCell].status = "correct";
            newMeta[targetCell].isLocked = true;
            newMeta[targetCell].notes = 0;
          }
        }
      }

      return {
        ...state,
        values: newValues,
        meta: newMeta,
        hint: null,
      };
    }

    case "SHOW_ERROR_EXPLANATION": {
      const { selectedIdx, values, solution } = state;
      if (selectedIdx === null) return state;
      if (state.meta[selectedIdx].status !== "wrong") return state;

      const wrongDigit = values[selectedIdx];
      const correctDigit = solution[selectedIdx];

      // Encontrar conflito
      const peers = getPeers(selectedIdx);
      let explanation = "";

      for (const peerIdx of peers) {
        if (
          state.values[peerIdx] === wrongDigit ||
          state.given[peerIdx] === wrongDigit
        ) {
          const peerRow = Math.floor(peerIdx / 9) + 1;
          const peerCol = (peerIdx % 9) + 1;
          const cellRow = Math.floor(selectedIdx / 9) + 1;
          const cellCol = (selectedIdx % 9) + 1;

          // Determinar tipo de conflito
          if (Math.floor(peerIdx / 9) === Math.floor(selectedIdx / 9)) {
            explanation = `Na linha ${cellRow}, já existe o número ${wrongDigit} na coluna ${peerCol}. Este número não pode aparecer duas vezes na mesma linha.`;
          } else if (peerIdx % 9 === selectedIdx % 9) {
            explanation = `Na coluna ${cellCol}, já existe o número ${wrongDigit} na linha ${peerRow}. Este número não pode aparecer duas vezes na mesma coluna.`;
          } else {
            const blockRow = Math.floor(Math.floor(selectedIdx / 9) / 3);
            const blockCol = Math.floor((selectedIdx % 9) / 3);
            const blockNum = blockRow * 3 + blockCol + 1;
            explanation = `No bloco ${blockNum}, já existe o número ${wrongDigit} na célula (${peerRow}, ${peerCol}). Este número não pode aparecer duas vezes no mesmo bloco.`;
          }
          break;
        }
      }

      if (!explanation) {
        explanation = `O número ${wrongDigit} não pode estar nesta célula. Verifique os candidatos possíveis baseado nos números já preenchidos na linha, coluna e bloco.`;
      }

      return {
        ...state,
        errorExplanation: {
          visible: true,
          cellIdx: selectedIdx,
          wrongDigit,
          explanation,
        },
      };
    }

    case "CLOSE_ERROR_EXPLANATION": {
      return {
        ...state,
        errorExplanation: null,
      };
    }

    case "SET_DIFFICULTY": {
      return {
        ...state,
        difficulty: action.difficulty,
      };
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
      const { given, solution, difficulty, seed } = action;
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
        difficulty: difficulty || state.difficulty,
        seed,
        selectedIdx: null,
        mode: "answer",
        mistakes: 0,
        paused: false,
        toast: null,
        hint: null,
        errorExplanation: null,
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
