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

export interface GameState {
  // Board data (81 cells each)
  given: CellValue[];
  solution: CellValue[];
  values: CellValue[];
  meta: CellMeta[];

  // UI state
  selectedIdx: number | null;
  mode: GameMode;
  mistakes: number;
  paused: boolean;

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
    selectedIdx: null,
    mode: "answer",
    mistakes: 0,
    paused: false,
    timer: {
      elapsedMs: 0,
      running: true,
      lastTick: Date.now(),
    },
    history: [],
  };
}
