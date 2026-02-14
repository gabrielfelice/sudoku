import { create } from "zustand";
import { PlayerConfig, ThemeConfig, CustomColorUsage } from "./types";
import { saveConfig, saveTheme } from "@/lib/persistence";
import { validateCellColors, ContrastValidationResult } from "@/lib/contrast";

interface CustomizationState {
  // Draft state (preview)
  draftConfig: PlayerConfig | null;
  draftTheme: ThemeConfig | null;
  isCustomizing: boolean;

  // Milestone M: Extended draft state
  draftAvatar: string | null;
  customColorUsage: CustomColorUsage | null;
  contrastValidation: ContrastValidationResult | null;

  // Actions
  initializeDraft: (
    config: PlayerConfig,
    theme: ThemeConfig,
    avatar: string,
    isPremium: boolean,
  ) => void;
  updateDraftConfig: (updates: Partial<PlayerConfig>) => void;
  updateDraftTheme: (updates: Partial<ThemeConfig>) => void;
  updateDraftAvatar: (avatarId: string) => void;
  validateContrast: () => void;
  addCustomColor: (color: string) => boolean; // Returns false if limit reached
  canAddCustomColor: () => boolean;
  resetDraft: () => void;
}

export const useCustomizationStore = create<CustomizationState>((set, get) => ({
  draftConfig: null,
  draftTheme: null,
  isCustomizing: false,
  draftAvatar: null,
  customColorUsage: null,
  contrastValidation: null,

  initializeDraft: (config, theme, avatar, isPremium) => {
    // Initialize color usage tracking
    const usedColors: string[] = [];
    const themeColors = Object.values(theme);
    themeColors.forEach((color) => {
      if (typeof color === "string" && color.startsWith("#")) {
        if (!usedColors.includes(color)) {
          usedColors.push(color);
        }
      }
    });

    set({
      draftConfig: { ...config },
      draftTheme: { ...theme },
      draftAvatar: avatar,
      isCustomizing: true,
      customColorUsage: {
        usedColors,
        maxFreeColors: 3,
        isPremium,
      },
      contrastValidation: null,
    });

    // Run initial validation
    get().validateContrast();
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

    // Re-validate contrast after theme changes
    get().validateContrast();
  },

  updateDraftAvatar: (avatarId) => {
    set({ draftAvatar: avatarId });
  },

  validateContrast: () => {
    const { draftTheme } = get();
    if (!draftTheme) return;

    const cellBg = draftTheme.cellBackground || "#ffffff";
    const validation = validateCellColors(cellBg, {
      givenNumberColor: draftTheme.givenNumberColor,
      correctNumberColor: draftTheme.correctNumberColor,
      wrongNumberColor: draftTheme.wrongNumberColor,
    });

    set({ contrastValidation: validation });
  },

  addCustomColor: (color) => {
    const { customColorUsage } = get();
    if (!customColorUsage) return false;

    // If premium, always allow
    if (customColorUsage.isPremium) {
      const usedColors = [...customColorUsage.usedColors];
      if (!usedColors.includes(color)) {
        usedColors.push(color);
        set({
          customColorUsage: { ...customColorUsage, usedColors },
        });
      }
      return true;
    }

    // Check free tier limit
    if (customColorUsage.usedColors.includes(color)) {
      return true; // Already using this color
    }

    if (customColorUsage.usedColors.length >= customColorUsage.maxFreeColors) {
      return false; // Limit reached
    }

    // Add color
    const usedColors = [...customColorUsage.usedColors, color];
    set({
      customColorUsage: { ...customColorUsage, usedColors },
    });
    return true;
  },

  canAddCustomColor: () => {
    const { customColorUsage } = get();
    if (!customColorUsage) return false;
    if (customColorUsage.isPremium) return true;
    return customColorUsage.usedColors.length < customColorUsage.maxFreeColors;
  },

  resetDraft: () => {
    set({
      draftConfig: null,
      draftTheme: null,
      isCustomizing: false,
      draftAvatar: null,
      customColorUsage: null,
      contrastValidation: null,
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
