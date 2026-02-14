export interface Avatar {
  id: string;
  emoji: string;
  category: "free" | "animals" | "food" | "sports" | "nature";
  isPremium: boolean;
}

export interface AvatarPack {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "animals" | "food" | "sports" | "nature";
  avatars: Avatar[];
}

// Free avatars (always available)
const FREE_AVATARS: Avatar[] = [
  { id: "smile", emoji: "😀", category: "free", isPremium: false },
  { id: "cool", emoji: "😎", category: "free", isPremium: false },
  { id: "nerd", emoji: "🤓", category: "free", isPremium: false },
  { id: "star", emoji: "⭐", category: "free", isPremium: false },
  { id: "fire", emoji: "🔥", category: "free", isPremium: false },
  { id: "lightning", emoji: "⚡", category: "free", isPremium: false },
  { id: "sparkles", emoji: "✨", category: "free", isPremium: false },
  { id: "trophy", emoji: "🏆", category: "free", isPremium: false },
  { id: "target", emoji: "🎯", category: "free", isPremium: false },
  { id: "puzzle", emoji: "🧩", category: "free", isPremium: false },
  { id: "game", emoji: "🎮", category: "free", isPremium: false },
  { id: "dice", emoji: "🎲", category: "free", isPremium: false },
  { id: "art", emoji: "🎨", category: "free", isPremium: false },
  { id: "music", emoji: "🎵", category: "free", isPremium: false },
  { id: "rocket", emoji: "🚀", category: "free", isPremium: false },
  { id: "brain", emoji: "🧠", category: "free", isPremium: false },
  { id: "crown", emoji: "👑", category: "free", isPremium: false },
  { id: "gem", emoji: "💎", category: "free", isPremium: false },
  { id: "magic", emoji: "🪄", category: "free", isPremium: false },
  { id: "robot", emoji: "🤖", category: "free", isPremium: false },
];

// Premium avatar packs
export const AVATAR_PACKS: AvatarPack[] = [
  {
    id: "pack_animals",
    name: "Animal Pack",
    description: "12 cute animal avatars",
    price: 10,
    category: "animals",
    avatars: [
      { id: "dog", emoji: "🐶", category: "animals", isPremium: true },
      { id: "cat", emoji: "🐱", category: "animals", isPremium: true },
      { id: "fox", emoji: "🦊", category: "animals", isPremium: true },
      { id: "panda", emoji: "🐼", category: "animals", isPremium: true },
      { id: "koala", emoji: "🐨", category: "animals", isPremium: true },
      { id: "lion", emoji: "🦁", category: "animals", isPremium: true },
      { id: "tiger", emoji: "🐯", category: "animals", isPremium: true },
      { id: "bear", emoji: "🐻", category: "animals", isPremium: true },
      { id: "penguin", emoji: "🐧", category: "animals", isPremium: true },
      { id: "owl", emoji: "🦉", category: "animals", isPremium: true },
      { id: "unicorn", emoji: "🦄", category: "animals", isPremium: true },
      { id: "dragon", emoji: "🐉", category: "animals", isPremium: true },
    ],
  },
  {
    id: "pack_food",
    name: "Food Pack",
    description: "10 delicious food avatars",
    price: 10,
    category: "food",
    avatars: [
      { id: "pizza", emoji: "🍕", category: "food", isPremium: true },
      { id: "burger", emoji: "🍔", category: "food", isPremium: true },
      { id: "sushi", emoji: "🍣", category: "food", isPremium: true },
      { id: "taco", emoji: "🌮", category: "food", isPremium: true },
      { id: "donut", emoji: "🍩", category: "food", isPremium: true },
      { id: "cake", emoji: "🍰", category: "food", isPremium: true },
      { id: "icecream", emoji: "🍦", category: "food", isPremium: true },
      { id: "coffee", emoji: "☕", category: "food", isPremium: true },
      { id: "cookie", emoji: "🍪", category: "food", isPremium: true },
      { id: "apple", emoji: "🍎", category: "food", isPremium: true },
    ],
  },
  {
    id: "pack_sports",
    name: "Sports Pack",
    description: "10 sports and activity avatars",
    price: 10,
    category: "sports",
    avatars: [
      { id: "soccer", emoji: "⚽", category: "sports", isPremium: true },
      { id: "basketball", emoji: "🏀", category: "sports", isPremium: true },
      { id: "football", emoji: "🏈", category: "sports", isPremium: true },
      { id: "tennis", emoji: "🎾", category: "sports", isPremium: true },
      { id: "volleyball", emoji: "🏐", category: "sports", isPremium: true },
      { id: "baseball", emoji: "⚾", category: "sports", isPremium: true },
      { id: "golf", emoji: "⛳", category: "sports", isPremium: true },
      { id: "medal", emoji: "🏅", category: "sports", isPremium: true },
      { id: "bike", emoji: "🚴", category: "sports", isPremium: true },
      { id: "swim", emoji: "🏊", category: "sports", isPremium: true },
    ],
  },
  {
    id: "pack_nature",
    name: "Nature Pack",
    description: "10 nature and weather avatars",
    price: 10,
    category: "nature",
    avatars: [
      { id: "sun", emoji: "☀️", category: "nature", isPremium: true },
      { id: "moon", emoji: "🌙", category: "nature", isPremium: true },
      { id: "cloud", emoji: "☁️", category: "nature", isPremium: true },
      { id: "rainbow", emoji: "🌈", category: "nature", isPremium: true },
      { id: "flower", emoji: "🌸", category: "nature", isPremium: true },
      { id: "tree", emoji: "🌳", category: "nature", isPremium: true },
      { id: "leaf", emoji: "🍃", category: "nature", isPremium: true },
      { id: "mountain", emoji: "⛰️", category: "nature", isPremium: true },
      { id: "ocean", emoji: "🌊", category: "nature", isPremium: true },
      { id: "earth", emoji: "🌍", category: "nature", isPremium: true },
    ],
  },
];

/**
 * Get all avatars (free + owned premium)
 */
export function getAvailableAvatars(ownedPacks: string[]): Avatar[] {
  const premiumAvatars = AVATAR_PACKS.filter((pack) =>
    ownedPacks.includes(pack.id),
  ).flatMap((pack) => pack.avatars);

  return [...FREE_AVATARS, ...premiumAvatars];
}

/**
 * Get avatar by ID
 */
export function getAvatarById(id: string): Avatar | undefined {
  const allAvatars = [
    ...FREE_AVATARS,
    ...AVATAR_PACKS.flatMap((pack) => pack.avatars),
  ];
  return allAvatars.find((a) => a.id === id);
}

/**
 * Get pack by ID
 */
export function getPackById(id: string): AvatarPack | undefined {
  return AVATAR_PACKS.find((p) => p.id === id);
}

/**
 * Check if user owns a pack
 */
export function ownsPack(packId: string, ownedPacks: string[]): boolean {
  return ownedPacks.includes(packId);
}

/**
 * Get default avatar
 */
export function getDefaultAvatar(): Avatar {
  return FREE_AVATARS[0]; // 😀
}
