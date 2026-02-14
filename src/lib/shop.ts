export interface ShopItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: "help" | "theme" | "avatar"; // Milestone M: Added avatar
  tier?: "basic" | "premium";
}

export const SHOP_CATALOG: ShopItem[] = [
  // Help Items
  {
    id: "candidate_filter",
    name: "Candidate Filter",
    description:
      "Highlight all cells where a selected number is a valid candidate",
    basePrice: 15,
    category: "help",
    tier: "basic",
  },
  {
    id: "clean_notes",
    name: "Clean Invalid Notes",
    description: "Remove all notes that are no longer valid candidates",
    basePrice: 20,
    category: "help",
    tier: "basic",
  },
  {
    id: "candidate_filter_premium",
    name: "Candidate Filter Pro",
    description: "Advanced candidate highlighting with visual annotations",
    basePrice: 30,
    category: "help",
    tier: "premium",
  },
  {
    id: "clean_notes_premium",
    name: "Smart Note Cleanup",
    description: "Intelligent note cleanup with undo support",
    basePrice: 35,
    category: "help",
    tier: "premium",
  },

  // Themes
  {
    id: "theme_ocean",
    name: "Ocean Theme",
    description: "Cool blue tones for a calming experience",
    basePrice: 25,
    category: "theme",
  },
  {
    id: "theme_sunset",
    name: "Sunset Theme",
    description: "Warm orange and pink gradients",
    basePrice: 25,
    category: "theme",
  },
  {
    id: "theme_forest",
    name: "Forest Theme",
    description: "Natural green tones",
    basePrice: 25,
    category: "theme",
  },
  {
    id: "theme_midnight",
    name: "Midnight Theme",
    description: "Dark mode with purple accents",
    basePrice: 30,
    category: "theme",
  },

  // Milestone M: Avatar Packs
  {
    id: "pack_animals",
    name: "Animal Pack",
    description: "12 cute animal avatars",
    basePrice: 10,
    category: "avatar",
  },
  {
    id: "pack_food",
    name: "Food Pack",
    description: "10 delicious food avatars",
    basePrice: 10,
    category: "avatar",
  },
  {
    id: "pack_sports",
    name: "Sports Pack",
    description: "10 sports and activity avatars",
    basePrice: 10,
    category: "avatar",
  },
  {
    id: "pack_nature",
    name: "Nature Pack",
    description: "10 nature and weather avatars",
    basePrice: 10,
    category: "avatar",
  },
];

// Difficulty multipliers for help items
const DIFFICULTY_MULTIPLIERS: Record<
  "easy" | "medium" | "hard" | "expert",
  number
> = {
  easy: 1.0,
  medium: 1.2,
  hard: 1.5,
  expert: 2.0, // Expert items cost double
};

export function getItemPrice(
  item: ShopItem,
  difficulty: "easy" | "medium" | "hard" | "expert",
): number {
  if (item.category === "help") {
    return Math.floor(item.basePrice * DIFFICULTY_MULTIPLIERS[difficulty]);
  }
  return item.basePrice;
}

export function canPurchase(
  item: ShopItem,
  coins: number,
  difficulty: "easy" | "medium" | "hard" | "expert",
  inventory: string[],
): { canPurchase: boolean; reason?: string } {
  if (inventory.includes(item.id)) {
    return { canPurchase: false, reason: "Already owned" };
  }

  const price = getItemPrice(item, difficulty);
  if (coins < price) {
    return { canPurchase: false, reason: "Insufficient coins" };
  }

  return { canPurchase: true };
}

export function getItemById(id: string): ShopItem | undefined {
  return SHOP_CATALOG.find((item) => item.id === id);
}

export function getItemsByCategory(
  category: "help" | "theme" | "avatar",
): ShopItem[] {
  return SHOP_CATALOG.filter((item) => item.category === category);
}

// Theme configurations for shop themes
import { ThemeConfig } from "@/state/types";

export const SHOP_THEME_CONFIGS: Record<string, ThemeConfig> = {
  theme_ocean: {
    selectedCellBg: "#4dd0e1",
    peerCellBg: "#b2ebf2",
    sameNumberOutline: "#0097a7",
    correctNumberColor: "#00838f",
    wrongNumberColor: "#e53935",
    givenNumberColor: "#263238",
    boardBorder: "#006064",
    hintPrimaryBg: "#80deea",
    hintSecondaryBg: "#b2ebf2",
  },
  theme_sunset: {
    selectedCellBg: "#ffab91",
    peerCellBg: "#ffe0b2",
    sameNumberOutline: "#ff6f00",
    correctNumberColor: "#e65100",
    wrongNumberColor: "#c62828",
    givenNumberColor: "#3e2723",
    boardBorder: "#bf360c",
    hintPrimaryBg: "#ffccbc",
    hintSecondaryBg: "#ffe0b2",
  },
  theme_forest: {
    selectedCellBg: "#81c784",
    peerCellBg: "#c8e6c9",
    sameNumberOutline: "#388e3c",
    correctNumberColor: "#2e7d32",
    wrongNumberColor: "#d32f2f",
    givenNumberColor: "#1b5e20",
    boardBorder: "#1b5e20",
    hintPrimaryBg: "#a5d6a7",
    hintSecondaryBg: "#c8e6c9",
  },
  theme_midnight: {
    selectedCellBg: "#9575cd",
    peerCellBg: "#311b92",
    sameNumberOutline: "#7e57c2",
    correctNumberColor: "#b39ddb",
    wrongNumberColor: "#ef5350",
    givenNumberColor: "#e1bee7",
    boardBorder: "#4a148c",
    hintPrimaryBg: "#673ab7",
    hintSecondaryBg: "#512da8",
  },
};

export function getThemeConfig(themeId: string): ThemeConfig | undefined {
  return SHOP_THEME_CONFIGS[themeId];
}
