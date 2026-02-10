import { create } from "zustand";
import {
  PlayerProfile,
  loadProfile,
  saveProfile,
  recordGameStart,
  recordGameFinish,
  checkAndAwardBadges,
  Badge,
  awardCoins,
  spendCoins,
  getCoinsForDifficulty,
  updateGoalProgress,
  addCustomGoal,
  Goal,
  createCustomGoal,
  recordLearningData,
} from "@/lib/profile";
import { GameState } from "./types";

interface ProfileStore {
  profile: PlayerProfile;
  setName: (name: string) => void;
  startGame: (difficulty: GameState["difficulty"], seed?: number) => string; // returns sessionId
  finishGame: (
    sessionId: string,
    timeMs: number,
    mistakes: number,
    completed: boolean,
    hintsUsed: number,
  ) => { newBadges: Badge[]; coinsEarned: number; completedGoals: Goal[] };
  completeTutorial: () => void;
  completeLesson: (lessonId: string) => void;
  purchaseItem: (
    itemId: string,
    price: number,
    category: "helpItems" | "themes",
  ) => boolean;
  addGoal: (
    type: Goal["type"],
    target: number,
    difficulty?: "easy" | "medium" | "hard" | "expert",
  ) => void;
  refresh: () => void;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: loadProfile(),

  setName: (name: string) => {
    set((state) => {
      const updated = { ...state.profile, name };
      saveProfile(updated);
      return { profile: updated };
    });
  },

  startGame: (difficulty, seed) => {
    const { profile, sessionId } = recordGameStart(
      get().profile,
      difficulty,
      seed,
    );
    saveProfile(profile);
    set({ profile });
    return sessionId;
  },

  finishGame: (sessionId, timeMs, mistakes, completed, hintsUsed) => {
    let profile = recordGameFinish(
      get().profile,
      sessionId,
      timeMs,
      mistakes,
      completed,
    );

    // Check for new badges
    const session = profile.recentGames.find((g) => g.id === sessionId);
    let newBadges: Badge[] = [];
    let coinsEarned = 0;
    let completedGoals: Goal[] = [];

    if (session) {
      const result = checkAndAwardBadges(profile, session);
      profile = result.profile;
      newBadges = result.newBadges;

      // Award coins on completion
      if (completed) {
        const coins = getCoinsForDifficulty(session.difficulty);
        profile = awardCoins(
          profile,
          coins,
          `Completed ${session.difficulty} puzzle`,
        );
        coinsEarned = coins;
      }

      // Update goals
      const beforeGoals = profile.goals;
      profile = updateGoalProgress(profile, session);
      completedGoals = profile.goals.filter(
        (g, i) => g.completed && !beforeGoals[i].completed,
      );

      // Record learning data
      profile = recordLearningData(profile, session, hintsUsed);
    }

    saveProfile(profile);
    set({ profile });
    return { newBadges, coinsEarned, completedGoals };
  },

  completeTutorial: () => {
    set((state) => {
      const updated = { ...state.profile, tutorialCompleted: true };
      saveProfile(updated);
      return { profile: updated };
    });
  },

  completeLesson: (lessonId: string) => {
    set((state) => {
      if (state.profile.lessonsCompleted.includes(lessonId)) {
        return state;
      }
      const updated = {
        ...state.profile,
        lessonsCompleted: [...state.profile.lessonsCompleted, lessonId],
      };
      saveProfile(updated);
      return { profile: updated };
    });
  },

  purchaseItem: (itemId, price, category) => {
    const result = spendCoins(get().profile, price, `Purchased ${itemId}`);

    if (!result.success) {
      return false;
    }

    const updated = {
      ...result.profile,
      inventory: {
        ...result.profile.inventory,
        [category]: [...result.profile.inventory[category], itemId],
      },
    };

    saveProfile(updated);
    set({ profile: updated });
    return true;
  },

  addGoal: (type, target, difficulty) => {
    const goal = createCustomGoal(type, target, difficulty);
    const updated = addCustomGoal(get().profile, goal);
    saveProfile(updated);
    set({ profile: updated });
  },

  refresh: () => {
    set({ profile: loadProfile() });
  },
}));
