export interface ShopItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: "help" | "theme" | "avatar"; // Milestone M: Added avatar
  tier?: "basic" | "premium";
  isConsumable?: boolean; // Milestone O: Single-use items
}

// Milestone O: Package bundles
export interface ShopPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  items: Array<{ itemId: string; quantity: number }>;
  savings: number; // Percentage saved
}

export const SHOP_CATALOG: ShopItem[] = [
  // Help Items (Milestone O: Consumable with balanced pricing)
  {
    id: "candidate_filter",
    name: "Candidate Filter",
    description:
      "Highlight all cells where a selected number is a valid candidate",
    basePrice: 3, // Per use
    category: "help",
    tier: "basic",
    isConsumable: true,
  },
  {
    id: "clean_notes",
    name: "Clean Invalid Notes",
    description: "Remove all notes that are no longer valid candidates",
    basePrice: 4, // Per use
    category: "help",
    tier: "basic",
    isConsumable: true,
  },
  {
    id: "candidate_filter_premium",
    name: "Candidate Filter Pro",
    description: "Advanced candidate highlighting with visual annotations",
    basePrice: 5, // Per use
    category: "help",
    tier: "premium",
    isConsumable: true,
  },
  {
    id: "clean_notes_premium",
    name: "Smart Note Cleanup",
    description: "Intelligent note cleanup with undo support",
    basePrice: 6, // Per use
    category: "help",
    tier: "premium",
    isConsumable: true,
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

// Milestone O: Package Bundles
export const SHOP_PACKAGES: ShopPackage[] = [
  {
    id: "starter_pack",
    name: "Starter Pack",
    description:
      "Perfect for beginners - get started with essential help items",
    price: 25,
    items: [
      { itemId: "candidate_filter", quantity: 3 },
      { itemId: "clean_notes", quantity: 2 },
    ],
    savings: 30, // 35 coins value for 25 coins
  },
  {
    id: "power_pack",
    name: "Power Pack",
    description: "Boost your solving with a mix of basic and premium items",
    price: 60,
    items: [
      { itemId: "candidate_filter", quantity: 5 },
      { itemId: "clean_notes", quantity: 5 },
      { itemId: "candidate_filter_premium", quantity: 3 },
    ],
    savings: 25, // 80 coins value for 60 coins
  },
  {
    id: "expert_bundle",
    name: "Expert Bundle",
    description: "Premium items for expert solvers",
    price: 100,
    items: [
      { itemId: "candidate_filter_premium", quantity: 5 },
      { itemId: "clean_notes_premium", quantity: 5 },
    ],
    savings: 33, // 150 coins value for 100 coins
  },
  {
    id: "mega_pack",
    name: "Mega Pack",
    description: "Ultimate value - 10x of every help item!",
    price: 200,
    items: [
      { itemId: "candidate_filter", quantity: 10 },
      { itemId: "clean_notes", quantity: 10 },
      { itemId: "candidate_filter_premium", quantity: 10 },
      { itemId: "clean_notes_premium", quantity: 10 },
    ],
    savings: 40, // 340 coins value for 200 coins
  },
];

// Milestone O: Difficulty multipliers for consumable help items
const DIFFICULTY_MULTIPLIERS: Record<
  "easy" | "medium" | "hard" | "expert",
  number
> = {
  easy: 1.0, // 3-6 coins
  medium: 1.33, // 4-8 coins
  hard: 1.67, // 5-10 coins
  expert: 2.33, // 7-14 coins (rounded)
};

export function getItemPrice(
  item: ShopItem,
  difficulty: "easy" | "medium" | "hard" | "expert",
): number {
  if (item.category === "help" && item.isConsumable) {
    return Math.round(item.basePrice * DIFFICULTY_MULTIPLIERS[difficulty]);
  }
  return item.basePrice;
}

export function canPurchase(
  item: ShopItem,
  coins: number,
  difficulty: "easy" | "medium" | "hard" | "expert",
  inventory: Record<string, number>, // Milestone O: Changed from string[]
): { canPurchase: boolean; reason?: string } {
  const price = getItemPrice(item, difficulty);

  // Milestone O: For consumables, check quantity limit
  if (item.isConsumable && item.category === "help") {
    const currentQuantity = inventory[item.id] || 0;
    if (currentQuantity >= 99) {
      return { canPurchase: false, reason: "Max quantity (99)" };
    }
  }

  // For non-consumables, check if already owned
  if (!item.isConsumable && inventory[item.id] && inventory[item.id] > 0) {
    return { canPurchase: false, reason: "Already owned" };
  }

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

// Milestone O: Package helper functions
export function canPurchasePackage(
  pkg: ShopPackage,
  coins: number,
  inventory: Record<string, number>,
): { canPurchase: boolean; reason?: string } {
  if (coins < pkg.price) {
    return { canPurchase: false, reason: "Insufficient coins" };
  }

  // Check if any item would exceed max quantity (99)
  for (const item of pkg.items) {
    const currentQuantity = inventory[item.itemId] || 0;
    if (currentQuantity + item.quantity > 99) {
      return {
        canPurchase: false,
        reason: `Would exceed max quantity`,
      };
    }
  }

  return { canPurchase: true };
}

export function getPackageById(id: string): ShopPackage | undefined {
  return SHOP_PACKAGES.find((pkg) => pkg.id === id);
}

export function calculatePackageValue(
  pkg: ShopPackage,
  difficulty: "easy" | "medium" | "hard" | "expert",
): number {
  let totalValue = 0;
  for (const item of pkg.items) {
    const shopItem = getItemById(item.itemId);
    if (shopItem) {
      const itemPrice = getItemPrice(shopItem, difficulty);
      totalValue += itemPrice * item.quantity;
    }
  }
  return totalValue;
}
