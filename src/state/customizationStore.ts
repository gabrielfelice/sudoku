import { create } from "zustand";
import { PlayerConfig, ThemeConfig } from "./types";
import { saveConfig, saveTheme } from "@/lib/persistence";

interface CustomizationState {
  // Draft state (preview)
  draftConfig: PlayerConfig | null;
  draftTheme: ThemeConfig | null;
  isCustomizing: boolean;

  // Actions
  initializeDraft: (config: PlayerConfig, theme: ThemeConfig) => void;
  updateDraftConfig: (updates: Partial<PlayerConfig>) => void;
  updateDraftTheme: (updates: Partial<ThemeConfig>) => void;
  resetDraft: () => void;
}

export const useCustomizationStore = create<CustomizationState>((set, get) => ({
  draftConfig: null,
  draftTheme: null,
  isCustomizing: false,

  initializeDraft: (config, theme) => {
    set({
      draftConfig: { ...config },
      draftTheme: { ...theme },
      isCustomizing: true,
    });
  },

  updateDraftConfig: (updates) => {
    const current = get().draftConfig;
    if (!current) return;
    set({
      draftConfig: { ...current, ...updates },
    });
  },

  updateDraftTheme: (updates) => {
    const current = get().draftTheme;
    if (!current) return;
    set({
      draftTheme: { ...current, ...updates },
    });
  },

  resetDraft: () => {
    set({
      draftConfig: null,
      draftTheme: null,
      isCustomizing: false,
    });
  },
}));

/**
 * Commit draft changes to game store and persist
 * This function is called from the SettingsModal when user clicks "Save"
 */
export function commitCustomization(
  draftConfig: PlayerConfig,
  draftTheme: ThemeConfig,
  gameDispatch: (action: any) => void,
): void {
  // Apply to game store
  gameDispatch({
    type: "SET_CONFIG",
    config: draftConfig,
  });

  gameDispatch({
    type: "SET_THEME",
    theme: draftTheme,
  });

  // Persist to localStorage
  saveConfig(draftConfig);
  saveTheme(draftTheme);
}
