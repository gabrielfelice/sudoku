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
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  earnedAt: number;
}

export interface PlayerProfile {
  name: string;
  createdAt: number;
  lastPlayedAt: number;
  stats: {
    easy: DifficultyStats;
    medium: DifficultyStats;
    hard: DifficultyStats;
    expert: DifficultyStats;
  };
  recentGames: GameSessionRecord[];
  badges: Badge[];
  tutorialCompleted: boolean;
  lessonsCompleted: string[];
}

export interface ProfileStorage {
  schemaVersion: number;
  profile: PlayerProfile;
}

const STORAGE_KEY = "sudoku_profile";
const CURRENT_SCHEMA_VERSION = 1;

export function createDefaultDifficultyStats(): DifficultyStats {
  return {
    gamesStarted: 0,
    gamesCompleted: 0,
    bestTimeMs: null,
    avgMistakes: 0,
    avgTimeMs: 0,
  };
}

export function createDefaultProfile(): PlayerProfile {
  return {
    name: "Player",
    createdAt: Date.now(),
    lastPlayedAt: Date.now(),
    stats: {
      easy: createDefaultDifficultyStats(),
      medium: createDefaultDifficultyStats(),
      hard: createDefaultDifficultyStats(),
      expert: createDefaultDifficultyStats(),
    },
    recentGames: [],
    badges: [],
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
