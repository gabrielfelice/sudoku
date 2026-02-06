import { create } from "zustand";
import { GameState, createInitialState } from "./types";
import { gameReducer, GameAction } from "./reducer";

interface GameStore extends GameState {
  dispatch: (action: GameAction) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  ...createInitialState(),
  dispatch: (action: GameAction) => set((state) => gameReducer(state, action)),
}));
