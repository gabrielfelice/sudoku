import { CellValue } from "@/engine";

export type CellStatus = "empty" | "correct" | "wrong";

export interface CellMeta {
  isGiven: boolean;
  isLocked: boolean;
  status: CellStatus;
  notes: number; // bitmask
}

export type GameMode = "answer" | "note" | "inspect";

export interface TimerState {
  elapsedMs: number;
  running: boolean;
  lastTick: number;
}

export interface HistoryEntry {
  indices: number[];
  previousValues: CellValue[];
  previousMeta: CellMeta[];
}

export interface ToastState {
  message: string;
  type: "info" | "success" | "warning" | "error";
}

export interface HintHighlight {
  primary: number[]; // células principais (target)
  secondary: number[]; // células secundárias (peers relevantes)
}

export interface HintState {
  visible: boolean;
  techniqueName: string;
  explanation: string;
  highlight: HintHighlight;
}

export interface ErrorExplanationState {
  visible: boolean;
  cellIdx: number;
  wrongDigit: number;
  explanation: string;
}

export interface GameState {
  // Board data (81 cells each)
  given: CellValue[];
  solution: CellValue[];
  values: CellValue[];
  meta: CellMeta[];

  // Puzzle metadata
  difficulty: "easy" | "medium" | "hard" | "expert";
  seed?: number;

  // UI state
  selectedIdx: number | null;
  mode: GameMode;
  mistakes: number;
  paused: boolean;
  toast: ToastState | null;

  // Hint system
  hint: HintState | null;

  // Error explanation
  errorExplanation: ErrorExplanationState | null;

  // Timer
  timer: TimerState;

  // History for undo
  history: HistoryEntry[];
}

export function createInitialMeta(): CellMeta {
  return {
    isGiven: false,
    isLocked: false,
    status: "empty",
    notes: 0,
  };
}

export function createInitialState(): GameState {
  return {
    given: Array(81).fill(0),
    solution: Array(81).fill(0),
    values: Array(81).fill(0),
    meta: Array(81)
      .fill(null)
      .map(() => createInitialMeta()),
    difficulty: "medium",
    seed: undefined,
    selectedIdx: null,
    mode: "answer",
    mistakes: 0,
    paused: false,
    toast: null,
    hint: null,
    errorExplanation: null,
    timer: {
      elapsedMs: 0,
      running: true,
      lastTick: Date.now(),
    },
    history: [],
  };
}
