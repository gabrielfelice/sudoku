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
  timestamp: number; // For telemetry
}

export interface HintStep {
  stepNumber: number;
  title: string;
  description: string;
  highlightCells: number[];
  highlightType: "primary" | "secondary";
  canApply: boolean;
}

export interface ExplanationLayer {
  type: "rule" | "candidates" | "technique";
  title: string;
  description: string;
  highlightCells?: number[];
  candidates?: number[];
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
  steps?: HintStep[]; // Guided hint steps
  currentStep?: number; // Current step index
  canApply?: boolean; // Can apply current step
}

export interface ErrorExplanationState {
  visible: boolean;
  cellIdx: number;
  wrongDigit: number;
  explanation: string;
  layers?: ExplanationLayer[]; // Multi-layer explanation
  currentLayer?: number; // Current layer index
  conflictingCells?: number[]; // Cells that conflict
}

export interface PlayerConfig {
  autoLockOnCorrect: boolean;
  autoRemoveNotes: boolean;
  autoCleanInvalidNotes: boolean;
  liveConflictHighlight: boolean;
  maxErrors: number | null; // null = unlimited, 3, 5
  showSameNumberHighlight: boolean;
  showPeerHighlight: boolean;
  hintLimit: number | null; // null = unlimited, 3, 5, 10
  explanationLimit: number | null; // null = unlimited, 3, 5, 10
  soundEnabled: boolean; // NEW: Enable/disable sound effects
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
  puzzleSource: "generated" | "catalog" | "daily"; // NEW: Track puzzle origin
  puzzleId?: string; // NEW: ID if from catalog

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
  cellHistory: Map<number, HistoryEntry[]>; // NEW: Per-cell history

  // Player configuration
  config: PlayerConfig;

  // Theme configuration
  theme: ThemeConfig;

  // Session tracking
  currentSessionId: string | null;

  // Lesson mode
  lessonMode: {
    active: boolean;
    lessonId: string | null;
    allowedTechniques: string[];
  };

  // Usage tracking (NEW)
  hintUsageCount: number;
  explanationUsageCount: number;

  // Telemetry (NEW - local only)
  telemetry: {
    actionTimestamps: number[]; // Last N action timestamps
    errorCount: number;
    hintCount: number;
  };

  // Cloud profile (NEW - optional)
  cloudProfile?: {
    userId: string;
    syncStatus: "synced" | "syncing" | "error" | "local";
    lastSyncTime?: number;
  };
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
    hintLimit: null, // NEW: Unlimited by default
    explanationLimit: null, // NEW: Unlimited by default
    soundEnabled: true, // NEW: Sounds enabled by default
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
    puzzleSource: "generated", // NEW
    puzzleId: undefined, // NEW
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
    cellHistory: new Map(), // NEW
    config: createDefaultConfig(),
    theme: createDefaultTheme(),
    currentSessionId: null,
    lessonMode: {
      active: false,
      lessonId: null,
      allowedTechniques: [],
    },
    hintUsageCount: 0, // NEW
    explanationUsageCount: 0, // NEW
    telemetry: {
      // NEW
      actionTimestamps: [],
      errorCount: 0,
      hintCount: 0,
    },
    cloudProfile: undefined, // NEW
  };
}
