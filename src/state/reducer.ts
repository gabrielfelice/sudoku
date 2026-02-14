import {
  CellValue,
  Digit,
  getPeers,
  toggleNote,
  clearNotes,
  removeNote,
  cleanInvalidNotes,
  removeDigitFromPeers,
  initializeCandidates,
} from "@/engine";
import { GameState, CellMeta, GameMode, HistoryEntry, PlayMode } from "./types";

export type GameAction =
  | {
      type: "INIT_PUZZLE";
      given: CellValue[];
      solution: CellValue[];
      difficulty?: "easy" | "medium" | "hard" | "expert";
      seed?: number;
      puzzleSource?: "generated" | "catalog" | "daily";
      puzzleId?: string;
      playMode?: PlayMode; // NEW
    }
  | { type: "SELECT_CELL"; idx: number | null }
  | { type: "SET_MODE"; mode: GameMode }
  | { type: "SET_PLAY_MODE"; playMode: PlayMode } // NEW
  | { type: "INPUT_DIGIT"; digit: Digit }
  | { type: "ERASE_NOTES" }
  | { type: "CLEAR_CELL" }
  | { type: "UNDO" }
  | { type: "UNDO_CELL" }
  | { type: "TOGGLE_PAUSE" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "TICK_TIMER"; now: number }
  | { type: "REQUEST_HINT" }
  | { type: "SHOW_HINT"; hint: import("./types").HintState }
  | { type: "CLOSE_HINT" }
  | { type: "APPLY_HINT" }
  | { type: "NEXT_HINT_STEP" }
  | { type: "PREV_HINT_STEP" }
  | { type: "APPLY_HINT_STEP" }
  | { type: "APPLY_CANDIDATE_FILTER"; digit: Digit } // NEW: Visual overlay
  | { type: "CLEAN_INVALID_NOTES" } // NEW: Remove invalid notes
  | { type: "SHOW_ERROR_EXPLANATION" }
  | { type: "SHOW_ADVANCED_ERROR_EXPLANATION" }
  | { type: "NEXT_EXPLANATION_LAYER" }
  | { type: "PREV_EXPLANATION_LAYER" }
  | { type: "CLOSE_ERROR_EXPLANATION" }
  | {
      type: "SET_DIFFICULTY";
      difficulty: "easy" | "medium" | "hard" | "expert";
    }
  | {
      type: "NEW_GAME";
      payload?: {
        given: CellValue[];
        solution: CellValue[];
        difficulty?: "easy" | "medium" | "hard" | "expert";
        seed?: number;
        puzzleSource?: "generated" | "catalog" | "daily";
        puzzleId?: string;
        playMode?: PlayMode; // NEW
      };
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
  | { type: "CLEAR_TOAST" }
  | {
      type: "SET_CONFIG";
      config: Partial<import("./types").PlayerConfig>;
    }
  | {
      type: "SET_THEME";
      theme: Partial<import("./types").ThemeConfig>;
    }
  | {
      type: "SET_SESSION_ID";
      sessionId: string | null;
    }
  | {
      type: "SET_LESSON_MODE";
      payload: {
        active: boolean;
        lessonId: string | null;
        allowedTechniques: string[];
      };
    }
  | { type: "INCREMENT_HINT_USAGE" }
  | { type: "INCREMENT_EXPLANATION_USAGE" }
  | { type: "RECORD_TELEMETRY"; actionType: string }
  | {
      type: "SET_CLOUD_PROFILE";
      userId: string;
      syncStatus: "synced" | "syncing" | "error" | "local";
    };

/**
 * Helper function to add history entry with timestamp and per-cell tracking
 */
function addToHistory(
  state: GameState,
  indices: number[],
  previousValues: CellValue[],
  previousMeta: CellMeta[],
): { history: HistoryEntry[]; cellHistory: Map<number, HistoryEntry[]> } {
  const entry: HistoryEntry = {
    indices,
    previousValues,
    previousMeta,
    timestamp: Date.now(),
  };

  const newHistory = [...state.history, entry];
  const newCellHistory = new Map(state.cellHistory);

  // Add to per-cell history
  indices.forEach((idx) => {
    const cellEntries = newCellHistory.get(idx) || [];
    newCellHistory.set(idx, [...cellEntries, entry]);
  });

  return { history: newHistory, cellHistory: newCellHistory };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "INIT_PUZZLE": {
      const {
        given,
        solution,
        difficulty,
        seed,
        puzzleSource,
        puzzleId,
        playMode,
      } = action;
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
        puzzleSource: puzzleSource || "generated",
        puzzleId,
        playMode: playMode || "normal", // NEW
        selectedIdx: null,
        mistakes: 0,
        paused: false,
        hint: null,
        hintsUsedThisPuzzle: 0, // NEW
        errorExplanation: null,
        history: [],
        cellHistory: new Map(),
        hintUsageCount: 0,
        explanationUsageCount: 0,
        timer: {
          elapsedMs: 0,
          running: true,
          lastTick: Date.now(),
        },
      };
    }

    case "SELECT_CELL": {
      // Play selection sound
      if (typeof window !== "undefined" && state.config.soundEnabled) {
        import("@/lib/sounds").then(({ playSound }) => playSound("select"));
      }
      return { ...state, selectedIdx: action.idx };
    }

    case "SET_MODE": {
      return { ...state, mode: action.mode };
    }

    case "INPUT_DIGIT": {
      const { digit } = action;
      const { selectedIdx, mode, values, meta, solution, config } = state;

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
          // Correct answer
          newMeta[selectedIdx].status = "correct";
          newMeta[selectedIdx].notes = 0;

          // Play correct sound
          if (typeof window !== "undefined" && config.soundEnabled) {
            import("@/lib/sounds").then(({ playSound }) =>
              playSound("correct"),
            );
          }

          // Auto-lock if enabled
          if (config.autoLockOnCorrect) {
            newMeta[selectedIdx].isLocked = true;
          }

          // Auto-remove this digit from peers' notes if enabled
          if (config.autoRemoveNotes) {
            const peers = getPeers(selectedIdx);
            peers.forEach((peerIdx) => {
              if (values[peerIdx] === 0 && newMeta[peerIdx].notes !== 0) {
                newMeta[peerIdx].notes = removeNote(
                  newMeta[peerIdx].notes,
                  digit,
                );
              }
            });
          }

          // Auto-clean invalid notes if enabled
          if (config.autoCleanInvalidNotes) {
            const currentNotes = newMeta.map((m) => m.notes);
            const cleanedNotes = cleanInvalidNotes(newValues, currentNotes);
            cleanedNotes.forEach((notes, idx) => {
              newMeta[idx].notes = notes;
            });
          }
        } else {
          // Wrong answer: mark as wrong and increment mistakes
          newMeta[selectedIdx].status = "wrong";

          // Play error sound
          if (typeof window !== "undefined" && config.soundEnabled) {
            import("@/lib/sounds").then(({ playSound }) => playSound("error"));
          }
          const { history, cellHistory } = addToHistory(
            state,
            [selectedIdx],
            previousValues,
            previousMeta,
          );

          // Zen mode: don't count mistakes
          const mistakeIncrement = state.playMode === "zen" ? 0 : 1;

          return {
            ...state,
            values: newValues,
            meta: newMeta,
            mistakes: state.mistakes + mistakeIncrement,
            hint: null, // fechar dica ao errar
            history,
            cellHistory,
            telemetry: {
              ...state.telemetry,
              errorCount: state.telemetry.errorCount + 1,
              actionTimestamps: [
                ...state.telemetry.actionTimestamps.slice(-99),
                Date.now(),
              ],
            },
          };
        }

        const { history, cellHistory } = addToHistory(
          state,
          [selectedIdx],
          previousValues,
          previousMeta,
        );

        return {
          ...state,
          values: newValues,
          meta: newMeta,
          history,
          cellHistory,
          telemetry: {
            ...state.telemetry,
            actionTimestamps: [
              ...state.telemetry.actionTimestamps.slice(-99),
              Date.now(),
            ],
          },
        };
      } else if (mode === "note") {
        // Toggle note
        newMeta[selectedIdx].notes = toggleNote(
          newMeta[selectedIdx].notes,
          digit,
        );

        const { history, cellHistory } = addToHistory(
          state,
          [selectedIdx],
          previousValues,
          previousMeta,
        );

        return {
          ...state,
          meta: newMeta,
          history,
          cellHistory,
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

      const { history, cellHistory } = addToHistory(
        state,
        [selectedIdx],
        [state.values[selectedIdx]],
        previousMeta,
      );

      return {
        ...state,
        meta: newMeta,
        history,
        cellHistory,
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

      // Update per-cell history
      const newCellHistory = new Map(state.cellHistory);
      lastEntry.indices.forEach((idx) => {
        const cellEntries = newCellHistory.get(idx) || [];
        const updatedEntries = cellEntries.filter((e) => e !== lastEntry);
        if (updatedEntries.length > 0) {
          newCellHistory.set(idx, updatedEntries);
        } else {
          newCellHistory.delete(idx);
        }
      });

      return {
        ...state,
        values: newValues,
        meta: newMeta,
        mistakes: state.mistakes + mistakesAdjustment,
        history: state.history.slice(0, -1),
        cellHistory: newCellHistory,
      };
    }

    case "UNDO_CELL": {
      const { selectedIdx } = state;
      if (selectedIdx === null) return state;

      const cellEntries = state.cellHistory.get(selectedIdx);
      if (!cellEntries || cellEntries.length === 0) return state;

      const lastCellEntry = cellEntries[cellEntries.length - 1];
      const newValues = [...state.values];
      const newMeta = state.meta.map((m) => ({ ...m }));

      // Restore values for this entry
      lastCellEntry.indices.forEach((idx, i) => {
        newValues[idx] = lastCellEntry.previousValues[i];
        newMeta[idx] = { ...lastCellEntry.previousMeta[i] };
      });

      // Adjust mistakes if needed
      let mistakesAdjustment = 0;
      lastCellEntry.indices.forEach((idx, i) => {
        if (
          lastCellEntry.previousMeta[i].status !== "wrong" &&
          state.meta[idx].status === "wrong"
        ) {
          mistakesAdjustment--;
        }
      });

      // Remove from global history
      const newHistory = state.history.filter((e) => e !== lastCellEntry);

      // Update per-cell history
      const newCellHistory = new Map(state.cellHistory);
      lastCellEntry.indices.forEach((idx) => {
        const entries = newCellHistory.get(idx) || [];
        const updated = entries.filter((e) => e !== lastCellEntry);
        if (updated.length > 0) {
          newCellHistory.set(idx, updated);
        } else {
          newCellHistory.delete(idx);
        }
      });

      return {
        ...state,
        values: newValues,
        meta: newMeta,
        mistakes: state.mistakes + mistakesAdjustment,
        history: newHistory,
        cellHistory: newCellHistory,
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
      // Zen mode: timer doesn't run
      if (state.playMode === "zen") return state;
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
      // Check hint limits
      const { difficulty, config, hintsUsedThisPuzzle } = state;

      // Expert difficulty has special limit
      if (difficulty === "expert") {
        if (hintsUsedThisPuzzle >= config.expertHintLimit) {
          return {
            ...state,
            toast: {
              message: `Hint limit reached (${hintsUsedThisPuzzle}/${config.expertHintLimit})`,
              type: "warning",
            },
          };
        }
      }

      return {
        ...state,
        hint: action.hint,
        hintsUsedThisPuzzle: hintsUsedThisPuzzle + 1,
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

      const { hint, values, meta } = state;
      const newValues = [...values];
      const newMeta = meta.map((m) => ({ ...m }));
      const affectedIndices: number[] = [];
      const previousValues: CellValue[] = [];
      const previousMeta: CellMeta[] = [];

      // Se a dica tem placement, aplicar
      if (hint.techniqueName.includes("single")) {
        const targetCell = hint.highlight.primary[0];
        if (targetCell !== undefined) {
          // Extrair dígito da explicação (simplificado)
          const match = hint.explanation.match(/: (\d)/);
          if (match) {
            const digit = parseInt(match[1]) as CellValue;
            affectedIndices.push(targetCell);
            previousValues.push(values[targetCell]);
            previousMeta.push({ ...meta[targetCell] });

            newValues[targetCell] = digit;
            newMeta[targetCell].status = "correct";
            newMeta[targetCell].isLocked = true;
            newMeta[targetCell].notes = 0;

            // Auto-remove from peers if enabled
            if (state.config.autoRemoveNotes) {
              const peers = getPeers(targetCell);
              peers.forEach((peerIdx) => {
                if (values[peerIdx] === 0 && newMeta[peerIdx].notes !== 0) {
                  const oldNotes = newMeta[peerIdx].notes;
                  newMeta[peerIdx].notes = removeNote(oldNotes, digit as Digit);
                  if (oldNotes !== newMeta[peerIdx].notes) {
                    if (!affectedIndices.includes(peerIdx)) {
                      affectedIndices.push(peerIdx);
                      previousValues.push(values[peerIdx]);
                      previousMeta.push({ ...meta[peerIdx] });
                    }
                  }
                }
              });
            }
          }
        }
      } else if (
        hint.techniqueName === "naked-pair" ||
        hint.techniqueName === "pointing-pair" ||
        hint.techniqueName === "box-line-reduction"
      ) {
        // Aplicar eliminações
        return {
          ...state,
          hint: null,
        };
      }

      if (affectedIndices.length > 0) {
        const { history, cellHistory } = addToHistory(
          state,
          affectedIndices,
          previousValues,
          previousMeta,
        );

        return {
          ...state,
          values: newValues,
          meta: newMeta,
          hint: null,
          history,
          cellHistory,
          telemetry: {
            ...state.telemetry,
            hintCount: state.telemetry.hintCount + 1,
          },
        };
      }

      return {
        ...state,
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

      const { history, cellHistory } = addToHistory(
        state,
        [selectedIdx],
        previousValues,
        previousMeta,
      );

      return {
        ...state,
        values: newValues,
        meta: newMeta,
        history,
        cellHistory,
      };
    }

    case "NEW_GAME": {
      if (!action.payload) return state;
      const {
        given,
        solution,
        difficulty,
        seed,
        puzzleSource,
        puzzleId,
        playMode,
      } = action.payload;
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
        puzzleSource: puzzleSource || "generated",
        puzzleId,
        playMode: playMode || "normal", // NEW
        selectedIdx: null,
        mode: "answer",
        mistakes: 0,
        paused: false,
        toast: null,
        hint: null,
        hintsUsedThisPuzzle: 0, // NEW
        errorExplanation: null,
        history: [],
        cellHistory: new Map(),
        hintUsageCount: 0,
        explanationUsageCount: 0,
        timer: {
          elapsedMs: 0,
          running: true,
          lastTick: Date.now(),
        },
        currentSessionId: null,
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

    case "SET_CONFIG": {
      return {
        ...state,
        config: {
          ...state.config,
          ...action.config,
        },
      };
    }

    case "SET_THEME": {
      return {
        ...state,
        theme: {
          ...state.theme,
          ...action.theme,
        },
      };
    }

    case "PAUSE": {
      return {
        ...state,
        paused: true,
        timer: {
          ...state.timer,
          running: false,
        },
      };
    }

    case "RESUME": {
      return {
        ...state,
        paused: false,
        timer: {
          ...state.timer,
          running: true,
          lastTick: Date.now(),
        },
      };
    }

    case "SET_SESSION_ID": {
      return {
        ...state,
        currentSessionId: action.sessionId,
      };
    }

    case "SET_LESSON_MODE": {
      return {
        ...state,
        lessonMode: action.payload,
      };
    }

    case "NEXT_HINT_STEP": {
      if (!state.hint || !state.hint.steps) return state;
      const currentStep = state.hint.currentStep ?? 0;
      const nextStep = Math.min(currentStep + 1, state.hint.steps.length - 1);

      return {
        ...state,
        hint: {
          ...state.hint,
          currentStep: nextStep,
          canApply: state.hint.steps[nextStep]?.canApply ?? false,
        },
      };
    }

    case "PREV_HINT_STEP": {
      if (!state.hint || !state.hint.steps) return state;
      const currentStep = state.hint.currentStep ?? 0;
      const prevStep = Math.max(currentStep - 1, 0);

      return {
        ...state,
        hint: {
          ...state.hint,
          currentStep: prevStep,
          canApply: state.hint.steps[prevStep]?.canApply ?? false,
        },
      };
    }

    case "APPLY_HINT_STEP": {
      // Similar to APPLY_HINT but uses current step
      return gameReducer(state, { type: "APPLY_HINT" });
    }

    case "SHOW_ADVANCED_ERROR_EXPLANATION": {
      // This will be called from components with full explanation data
      return state;
    }

    case "NEXT_EXPLANATION_LAYER": {
      if (!state.errorExplanation || !state.errorExplanation.layers)
        return state;
      const currentLayer = state.errorExplanation.currentLayer ?? 0;
      const nextLayer = Math.min(
        currentLayer + 1,
        state.errorExplanation.layers.length - 1,
      );

      return {
        ...state,
        errorExplanation: {
          ...state.errorExplanation,
          currentLayer: nextLayer,
        },
      };
    }

    case "PREV_EXPLANATION_LAYER": {
      if (!state.errorExplanation || !state.errorExplanation.layers)
        return state;
      const currentLayer = state.errorExplanation.currentLayer ?? 0;
      const prevLayer = Math.max(currentLayer - 1, 0);

      return {
        ...state,
        errorExplanation: {
          ...state.errorExplanation,
          currentLayer: prevLayer,
        },
      };
    }

    case "INCREMENT_HINT_USAGE": {
      return {
        ...state,
        hintUsageCount: state.hintUsageCount + 1,
      };
    }

    case "INCREMENT_EXPLANATION_USAGE": {
      return {
        ...state,
        explanationUsageCount: state.explanationUsageCount + 1,
      };
    }

    case "RECORD_TELEMETRY": {
      return {
        ...state,
        telemetry: {
          ...state.telemetry,
          actionTimestamps: [
            ...state.telemetry.actionTimestamps.slice(-99),
            Date.now(),
          ],
        },
      };
    }

    case "SET_CLOUD_PROFILE": {
      return {
        ...state,
        cloudProfile: {
          userId: action.userId,
          syncStatus: action.syncStatus,
          lastSyncTime: Date.now(),
        },
      };
    }

    case "SET_PLAY_MODE": {
      return {
        ...state,
        playMode: action.playMode,
      };
    }

    case "APPLY_CANDIDATE_FILTER": {
      // Visual overlay showing where a digit is a valid candidate
      // This doesn't modify the board, just creates a visual hint
      const { digit } = action;
      const { values, config } = state;

      if (!config.helpEnabled) {
        return {
          ...state,
          toast: {
            message: "Help items are disabled in settings",
            type: "warning",
          },
        };
      }

      // Get valid candidates for all cells
      const validCandidates = initializeCandidates(values);
      const highlightCells: number[] = [];

      for (let idx = 0; idx < 81; idx++) {
        if (values[idx] === 0) {
          // Check if this digit is a valid candidate
          const bit = 1 << (digit - 1);
          if ((validCandidates[idx] & bit) !== 0) {
            highlightCells.push(idx);
          }
        }
      }

      // Show as a hint overlay
      return {
        ...state,
        hint: {
          visible: true,
          techniqueName: "candidate-filter",
          explanation: `Cells where ${digit} is a valid candidate are highlighted.`,
          highlight: {
            primary: highlightCells,
            secondary: [],
          },
        },
        hintsUsedThisPuzzle: state.hintsUsedThisPuzzle + 1,
      };
    }

    case "CLEAN_INVALID_NOTES": {
      const { meta, values, config } = state;

      if (!config.helpEnabled) {
        return {
          ...state,
          toast: {
            message: "Help items are disabled in settings",
            type: "warning",
          },
        };
      }

      const currentNotes = meta.map((m) => m.notes);
      const cleanedNotes = cleanInvalidNotes(values, currentNotes);

      // Find which cells were affected
      const affectedIndices: number[] = [];
      const previousMeta: CellMeta[] = [];

      cleanedNotes.forEach((notes, idx) => {
        if (notes !== currentNotes[idx]) {
          affectedIndices.push(idx);
          previousMeta.push({ ...meta[idx] });
        }
      });

      if (affectedIndices.length === 0) {
        return {
          ...state,
          toast: {
            message: "No invalid notes found",
            type: "info",
          },
        };
      }

      const newMeta = meta.map((m, idx) => ({
        ...m,
        notes: cleanedNotes[idx],
      }));

      const { history, cellHistory } = addToHistory(
        state,
        affectedIndices,
        affectedIndices.map((idx) => values[idx]),
        previousMeta,
      );

      return {
        ...state,
        meta: newMeta,
        history,
        cellHistory,
        toast: {
          message: `Cleaned ${affectedIndices.length} cell(s)`,
          type: "success",
        },
      };
    }

    default:
      return state;
  }
}
