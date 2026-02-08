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

export interface PlayerConfig {
  autoLockOnCorrect: boolean;
  autoRemoveNotes: boolean;
  autoCleanInvalidNotes: boolean;
  liveConflictHighlight: boolean;
  maxErrors: number | null; // null = unlimited, 3, 5
  showSameNumberHighlight: boolean;
  showPeerHighlight: boolean;
}

export interface ThemeConfig {
  selectedCellBg: string;
  peerCellBg: string;
  sameNumberOutline: string;
  correctNumberColor: string;
  wrongNumberColor: string;
  givenNumberColor: string;
  boardBorder: string;
  hintPrimaryBg: string;
  hintSecondaryBg: string;
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

  // Player configuration
  config: PlayerConfig;

  // Theme configuration
  theme: ThemeConfig;
}

export function createInitialMeta(): CellMeta {
  return {
    isGiven: false,
    isLocked: false,
    status: "empty",
    notes: 0,
  };
}

export function createDefaultConfig(): PlayerConfig {
  return {
    autoLockOnCorrect: true,
    autoRemoveNotes: true,
    autoCleanInvalidNotes: false,
    liveConflictHighlight: true,
    maxErrors: null,
    showSameNumberHighlight: true,
    showPeerHighlight: true,
  };
}

export function createDefaultTheme(): ThemeConfig {
  return {
    selectedCellBg: "#bbdefb",
    peerCellBg: "#e3f2fd",
    sameNumberOutline: "#1976d2",
    correctNumberColor: "#1976d2",
    wrongNumberColor: "#d32f2f",
    givenNumberColor: "#000000",
    boardBorder: "#000000",
    hintPrimaryBg: "#fff9c4",
    hintSecondaryBg: "#fff59d",
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
    config: createDefaultConfig(),
    theme: createDefaultTheme(),
  };
}
