import { create } from "zustand";
import { GameState, createInitialState } from "./types";
import { gameReducer, GameAction } from "./reducer";
import { loadConfig, loadTheme } from "@/lib/persistence";

interface GameStore extends GameState {
  dispatch: (action: GameAction) => void;
}

export const useGameStore = create<GameStore>((set) => {
  const initialState = createInitialState();

  // Load persisted preferences
  const persistedConfig = loadConfig();
  const persistedTheme = loadTheme();

  return {
    ...initialState,
    config: persistedConfig || initialState.config,
    theme: persistedTheme || initialState.theme,
    dispatch: (action: GameAction) =>
      set((state) => gameReducer(state, action)),
  };
});
