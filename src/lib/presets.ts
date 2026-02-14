import { PlayerConfig, ThemeConfig } from "@/state/types";

export interface SavedPreset {
  id: string;
  name: string;
  timestamp: number;
  config: PlayerConfig;
  theme: ThemeConfig;
}

const PRESETS_KEY = "sudoku:presets";
const MAX_PRESETS = 10;

/**
 * Load all saved presets from localStorage
 */
export function loadPresets(): SavedPreset[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(PRESETS_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as SavedPreset[];
  } catch (error) {
    console.error("Failed to load presets:", error);
    return [];
  }
}

/**
 * Save presets to localStorage
 */
function savePresetsToStorage(presets: SavedPreset[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  } catch (error) {
    console.error("Failed to save presets:", error);
  }
}

/**
 * Save a new preset
 * If max presets reached, delete oldest
 */
export function savePreset(
  name: string,
  config: PlayerConfig,
  theme: ThemeConfig,
): SavedPreset {
  const presets = loadPresets();

  const newPreset: SavedPreset = {
    id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    timestamp: Date.now(),
    config: { ...config },
    theme: { ...theme },
  };

  // Add new preset
  presets.push(newPreset);

  // If exceeded limit, remove oldest
  if (presets.length > MAX_PRESETS) {
    presets.sort((a, b) => a.timestamp - b.timestamp);
    presets.shift(); // Remove oldest
  }

  savePresetsToStorage(presets);
  return newPreset;
}

/**
 * Delete a preset by ID
 */
export function deletePreset(id: string): void {
  const presets = loadPresets();
  const filtered = presets.filter((p) => p.id !== id);
  savePresetsToStorage(filtered);
}

/**
 * Get a preset by ID
 */
export function getPresetById(id: string): SavedPreset | undefined {
  const presets = loadPresets();
  return presets.find((p) => p.id === id);
}

/**
 * Get preset count
 */
export function getPresetCount(): number {
  return loadPresets().length;
}

/**
 * Check if can save more presets
 */
export function canSaveMorePresets(): boolean {
  return loadPresets().length < MAX_PRESETS;
}
