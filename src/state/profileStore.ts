import { create } from "zustand";
import {
  PlayerProfile,
  loadProfile,
  saveProfile,
  recordGameStart,
  recordGameFinish,
  checkAndAwardBadges,
  Badge,
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
  ) => Badge[];
  completeTutorial: () => void;
  completeLesson: (lessonId: string) => void;
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

  finishGame: (sessionId, timeMs, mistakes, completed) => {
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

    if (session) {
      const result = checkAndAwardBadges(profile, session);
      profile = result.profile;
      newBadges = result.newBadges;
    }

    saveProfile(profile);
    set({ profile });
    return newBadges;
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

  refresh: () => {
    set({ profile: loadProfile() });
  },
}));
