import { PlayerConfig, ThemeConfig } from "@/state/types";

const CONFIG_KEY = "sudoku:config";
const THEME_KEY = "sudoku:theme";

/**
 * Save player configuration to localStorage
 */
export function saveConfig(config: PlayerConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Failed to save config:", error);
  }
}

/**
 * Load player configuration from localStorage
 */
export function loadConfig(): PlayerConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as PlayerConfig;
  } catch (error) {
    console.error("Failed to load config:", error);
    return null;
  }
}

/**
 * Save theme configuration to localStorage
 */
export function saveTheme(theme: ThemeConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(THEME_KEY, JSON.stringify(theme));
  } catch (error) {
    console.error("Failed to save theme:", error);
  }
}

/**
 * Load theme configuration from localStorage
 */
export function loadTheme(): ThemeConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as ThemeConfig;
  } catch (error) {
    console.error("Failed to load theme:", error);
    return null;
  }
}
