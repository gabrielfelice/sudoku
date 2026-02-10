export interface ShopItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: "help" | "theme";
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

export function getItemsByCategory(category: "help" | "theme"): ShopItem[] {
  return SHOP_CATALOG.filter((item) => item.category === category);
}
