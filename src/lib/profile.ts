import { GameState } from "@/state/types";

export interface GameSessionRecord {
  id: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  startedAt: number;
  finishedAt?: number;
  timeMs: number;
  mistakes: number;
  completed: boolean;
  seed?: number;
}

export interface DifficultyStats {
  gamesStarted: number;
  gamesCompleted: number;
  bestTimeMs: number | null;
  avgMistakes: number;
  avgTimeMs: number;
  // Learning curve tracking
  timeHistory: Array<{ date: number; avgTime: number }>;
  errorHistory: Array<{ date: number; avgErrors: number }>;
  hintHistory: Array<{ date: number; avgHints: number }>;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  earnedAt: number;
}

export interface CoinTransaction {
  id: string;
  type: "earn" | "spend";
  amount: number;
  reason: string;
  timestamp: number;
}

export interface Goal {
  id: string;
  type: "puzzles_by_difficulty" | "time_target" | "error_limit" | "streak";
  difficulty?: "easy" | "medium" | "hard" | "expert";
  target: number;
  current: number;
  completed: boolean;
  custom: boolean;
  createdAt: number;
  completedAt?: number;
}

export interface PlayerProfile {
  name: string;
  createdAt: number;
  lastPlayedAt: number;

  // Economy
  coins: number;
  coinLedger: CoinTransaction[];
  inventory: {
    helpItems: string[]; // IDs of purchased help items
    themes: string[]; // IDs of purchased themes
  };

  // Stats by game mode
  stats: {
    easy: DifficultyStats;
    medium: DifficultyStats;
    hard: DifficultyStats;
    expert: DifficultyStats;
  };
  zenStats: {
    easy: DifficultyStats;
    medium: DifficultyStats;
    hard: DifficultyStats;
    expert: DifficultyStats;
  };
  challengeStats: {
    easy: DifficultyStats;
    medium: DifficultyStats;
    hard: DifficultyStats;
    expert: DifficultyStats;
  };

  recentGames: GameSessionRecord[];
  badges: Badge[];
  goals: Goal[];
  tutorialCompleted: boolean;
  lessonsCompleted: string[];
}

export interface ProfileStorage {
  schemaVersion: number;
  profile: PlayerProfile;
}

const STORAGE_KEY = "sudoku_profile";
const CURRENT_SCHEMA_VERSION = 2; // Updated for Milestone J

export function createDefaultDifficultyStats(): DifficultyStats {
  return {
    gamesStarted: 0,
    gamesCompleted: 0,
    bestTimeMs: null,
    avgMistakes: 0,
    avgTimeMs: 0,
    timeHistory: [],
    errorHistory: [],
    hintHistory: [],
  };
}

export function createDefaultProfile(): PlayerProfile {
  return {
    name: "Player",
    createdAt: Date.now(),
    lastPlayedAt: Date.now(),
    coins: 100, // Starting balance
    coinLedger: [],
    inventory: {
      helpItems: [],
      themes: [],
    },
    stats: {
      easy: createDefaultDifficultyStats(),
      medium: createDefaultDifficultyStats(),
      hard: createDefaultDifficultyStats(),
      expert: createDefaultDifficultyStats(),
    },
    zenStats: {
      easy: createDefaultDifficultyStats(),
      medium: createDefaultDifficultyStats(),
      hard: createDefaultDifficultyStats(),
      expert: createDefaultDifficultyStats(),
    },
    challengeStats: {
      easy: createDefaultDifficultyStats(),
      medium: createDefaultDifficultyStats(),
      hard: createDefaultDifficultyStats(),
      expert: createDefaultDifficultyStats(),
    },
    recentGames: [],
    badges: [],
    goals: createDefaultGoals(),
    tutorialCompleted: false,
    lessonsCompleted: [],
  };
}

export function loadProfile(): PlayerProfile {
  if (typeof window === "undefined") return createDefaultProfile();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return createDefaultProfile();

    const data: ProfileStorage = JSON.parse(stored);

    // Migration logic
    if (data.schemaVersion !== CURRENT_SCHEMA_VERSION) {
      return migrateProfile(data);
    }

    return data.profile;
  } catch (error) {
    console.error("Failed to load profile:", error);
    return createDefaultProfile();
  }
}

export function saveProfile(profile: PlayerProfile): void {
  if (typeof window === "undefined") return;

  try {
    const data: ProfileStorage = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      profile,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save profile:", error);
  }
}

function migrateProfile(data: ProfileStorage): PlayerProfile {
  // Simple migration: if schema is old, start fresh
  console.warn(
    `Migrating profile from schema ${data.schemaVersion} to ${CURRENT_SCHEMA_VERSION}`,
  );
  return createDefaultProfile();
}

export function recordGameStart(
  profile: PlayerProfile,
  difficulty: GameState["difficulty"],
  seed?: number,
): { profile: PlayerProfile; sessionId: string } {
  const sessionId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const session: GameSessionRecord = {
    id: sessionId,
    difficulty,
    startedAt: Date.now(),
    timeMs: 0,
    mistakes: 0,
    completed: false,
    seed,
  };

  const stats = profile.stats[difficulty];
  stats.gamesStarted += 1;

  const updatedProfile: PlayerProfile = {
    ...profile,
    lastPlayedAt: Date.now(),
    stats: {
      ...profile.stats,
      [difficulty]: stats,
    },
    recentGames: [session, ...profile.recentGames].slice(0, 20),
  };

  return { profile: updatedProfile, sessionId };
}

export function recordGameFinish(
  profile: PlayerProfile,
  sessionId: string,
  timeMs: number,
  mistakes: number,
  completed: boolean,
): PlayerProfile {
  const sessionIndex = profile.recentGames.findIndex((g) => g.id === sessionId);
  if (sessionIndex === -1) {
    console.warn("Session not found:", sessionId);
    return profile;
  }

  const session = profile.recentGames[sessionIndex];
  const updatedSession: GameSessionRecord = {
    ...session,
    finishedAt: Date.now(),
    timeMs,
    mistakes,
    completed,
  };

  const stats = profile.stats[session.difficulty];

  if (completed) {
    stats.gamesCompleted += 1;

    // Update best time
    if (stats.bestTimeMs === null || timeMs < stats.bestTimeMs) {
      stats.bestTimeMs = timeMs;
    }

    // Update averages
    const totalGames = stats.gamesCompleted;
    stats.avgTimeMs =
      (stats.avgTimeMs * (totalGames - 1) + timeMs) / totalGames;
    stats.avgMistakes =
      (stats.avgMistakes * (totalGames - 1) + mistakes) / totalGames;
  }

  const updatedGames = [...profile.recentGames];
  updatedGames[sessionIndex] = updatedSession;

  return {
    ...profile,
    stats: {
      ...profile.stats,
      [session.difficulty]: stats,
    },
    recentGames: updatedGames,
  };
}

export function checkAndAwardBadges(
  profile: PlayerProfile,
  session: GameSessionRecord,
): { profile: PlayerProfile; newBadges: Badge[] } {
  const newBadges: Badge[] = [];

  // Badge: Perfect Game (0 errors)
  if (
    session.completed &&
    session.mistakes === 0 &&
    !profile.badges.some((b) => b.id === "perfect_game")
  ) {
    newBadges.push({
      id: "perfect_game",
      name: "Perfect Game",
      description: "Complete a game with 0 errors",
      earnedAt: Date.now(),
    });
  }

  // Badge: Speed Demon (< 5 min on easy)
  if (
    session.completed &&
    session.difficulty === "easy" &&
    session.timeMs < 5 * 60 * 1000 &&
    !profile.badges.some((b) => b.id === "speed_demon")
  ) {
    newBadges.push({
      id: "speed_demon",
      name: "Speed Demon",
      description: "Complete an easy puzzle in under 5 minutes",
      earnedAt: Date.now(),
    });
  }

  // Badge: Expert Solver (complete an expert puzzle)
  if (
    session.completed &&
    session.difficulty === "expert" &&
    !profile.badges.some((b) => b.id === "expert_solver")
  ) {
    newBadges.push({
      id: "expert_solver",
      name: "Expert Solver",
      description: "Complete an expert difficulty puzzle",
      earnedAt: Date.now(),
    });
  }

  // Badge: Streak Master (3 consecutive completed games)
  const recentCompleted = profile.recentGames
    .slice(0, 3)
    .every((g) => g.completed);
  if (
    recentCompleted &&
    profile.recentGames.length >= 3 &&
    !profile.badges.some((b) => b.id === "streak_master")
  ) {
    newBadges.push({
      id: "streak_master",
      name: "Streak Master",
      description: "Complete 3 games in a row",
      earnedAt: Date.now(),
    });
  }

  if (newBadges.length === 0) {
    return { profile, newBadges: [] };
  }

  return {
    profile: {
      ...profile,
      badges: [...profile.badges, ...newBadges],
    },
    newBadges,
  };
}

// ============================================================================
// ECONOMY SYSTEM
// ============================================================================

const COIN_REWARDS: Record<"easy" | "medium" | "hard" | "expert", number> = {
  easy: 10,
  medium: 20,
  hard: 35,
  expert: 50,
};

export function awardCoins(
  profile: PlayerProfile,
  amount: number,
  reason: string,
): PlayerProfile {
  const transaction: CoinTransaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: "earn",
    amount,
    reason,
    timestamp: Date.now(),
  };

  return {
    ...profile,
    coins: profile.coins + amount,
    coinLedger: [...profile.coinLedger, transaction].slice(-100), // Keep last 100 transactions
  };
}

export function spendCoins(
  profile: PlayerProfile,
  amount: number,
  reason: string,
): { success: boolean; profile: PlayerProfile } {
  if (profile.coins < amount) {
    return { success: false, profile };
  }

  const transaction: CoinTransaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: "spend",
    amount,
    reason,
    timestamp: Date.now(),
  };

  return {
    success: true,
    profile: {
      ...profile,
      coins: profile.coins - amount,
      coinLedger: [...profile.coinLedger, transaction].slice(-100),
    },
  };
}

export function getCoinsForDifficulty(
  difficulty: "easy" | "medium" | "hard" | "expert",
): number {
  return COIN_REWARDS[difficulty];
}

// ============================================================================
// GOALS SYSTEM
// ============================================================================

export function createDefaultGoals(): Goal[] {
  return [
    {
      id: "goal_easy_5",
      type: "puzzles_by_difficulty",
      difficulty: "easy",
      target: 5,
      current: 0,
      completed: false,
      custom: false,
      createdAt: Date.now(),
    },
    {
      id: "goal_expert_1",
      type: "puzzles_by_difficulty",
      difficulty: "expert",
      target: 1,
      current: 0,
      completed: false,
      custom: false,
      createdAt: Date.now(),
    },
    {
      id: "goal_perfect_game",
      type: "error_limit",
      target: 0,
      current: 999, // Will be set per game
      completed: false,
      custom: false,
      createdAt: Date.now(),
    },
    {
      id: "goal_streak_3",
      type: "streak",
      target: 3,
      current: 0,
      completed: false,
      custom: false,
      createdAt: Date.now(),
    },
  ];
}

export function createCustomGoal(
  type: Goal["type"],
  target: number,
  difficulty?: "easy" | "medium" | "hard" | "expert",
): Goal {
  return {
    id: `goal_custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    difficulty,
    target,
    current: 0,
    completed: false,
    custom: true,
    createdAt: Date.now(),
  };
}

export function updateGoalProgress(
  profile: PlayerProfile,
  session: GameSessionRecord,
): PlayerProfile {
  const updatedGoals = profile.goals.map((goal) => {
    if (goal.completed) return goal;

    let newCurrent = goal.current;
    let completed = false;

    switch (goal.type) {
      case "puzzles_by_difficulty":
        if (
          session.completed &&
          goal.difficulty &&
          session.difficulty === goal.difficulty
        ) {
          newCurrent += 1;
          completed = newCurrent >= goal.target;
        }
        break;

      case "error_limit":
        if (session.completed && session.mistakes <= goal.target) {
          completed = true;
        }
        break;

      case "streak":
        // Check recent games for streak
        const recentCompleted = profile.recentGames
          .slice(0, goal.target)
          .every((g) => g.completed);
        if (recentCompleted && profile.recentGames.length >= goal.target) {
          newCurrent = goal.target;
          completed = true;
        }
        break;
    }

    return {
      ...goal,
      current: newCurrent,
      completed,
      completedAt: completed ? Date.now() : goal.completedAt,
    };
  });

  return {
    ...profile,
    goals: updatedGoals,
  };
}

export function addCustomGoal(
  profile: PlayerProfile,
  goal: Goal,
): PlayerProfile {
  return {
    ...profile,
    goals: [...profile.goals, goal],
  };
}

// ============================================================================
// LEARNING CURVE TRACKING
// ============================================================================

export function recordLearningData(
  profile: PlayerProfile,
  session: GameSessionRecord,
  hintsUsed: number,
): PlayerProfile {
  if (!session.completed) return profile;

  const stats = profile.stats[session.difficulty];
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  // Update time history
  const timeHistory = [...stats.timeHistory];
  const lastTimeEntry = timeHistory[timeHistory.length - 1];

  if (!lastTimeEntry || now - lastTimeEntry.date > oneDayMs) {
    // New day, add new entry
    timeHistory.push({ date: now, avgTime: session.timeMs });
  } else {
    // Same day, update average
    const count = stats.gamesCompleted;
    const newAvg =
      (lastTimeEntry.avgTime * (count - 1) + session.timeMs) / count;
    timeHistory[timeHistory.length - 1] = { date: now, avgTime: newAvg };
  }

  // Update error history
  const errorHistory = [...stats.errorHistory];
  const lastErrorEntry = errorHistory[errorHistory.length - 1];

  if (!lastErrorEntry || now - lastErrorEntry.date > oneDayMs) {
    errorHistory.push({ date: now, avgErrors: session.mistakes });
  } else {
    const count = stats.gamesCompleted;
    const newAvg =
      (lastErrorEntry.avgErrors * (count - 1) + session.mistakes) / count;
    errorHistory[errorHistory.length - 1] = { date: now, avgErrors: newAvg };
  }

  // Update hint history
  const hintHistory = [...stats.hintHistory];
  const lastHintEntry = hintHistory[hintHistory.length - 1];

  if (!lastHintEntry || now - lastHintEntry.date > oneDayMs) {
    hintHistory.push({ date: now, avgHints: hintsUsed });
  } else {
    const count = stats.gamesCompleted;
    const newAvg = (lastHintEntry.avgHints * (count - 1) + hintsUsed) / count;
    hintHistory[hintHistory.length - 1] = { date: now, avgHints: newAvg };
  }

  // Keep last 30 entries
  const updatedStats = {
    ...stats,
    timeHistory: timeHistory.slice(-30),
    errorHistory: errorHistory.slice(-30),
    hintHistory: hintHistory.slice(-30),
  };

  return {
    ...profile,
    stats: {
      ...profile.stats,
      [session.difficulty]: updatedStats,
    },
  };
}
