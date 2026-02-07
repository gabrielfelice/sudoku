import { Digit } from "./types";

/**
 * Notes are stored as a 9-bit bitmask where bit N represents digit N+1
 * Bit 0 = digit 1, bit 1 = digit 2, ..., bit 8 = digit 9
 */

/**
 * Toggle a digit in the notes bitmask
 */
export function toggleNote(notes: number, digit: Digit): number {
  const bit = 1 << (digit - 1);
  return notes ^ bit;
}

/**
 * Check if a digit is present in the notes
 */
export function hasNote(notes: number, digit: Digit): boolean {
  const bit = 1 << (digit - 1);
  return (notes & bit) !== 0;
}

/**
 * Clear all notes
 */
export function clearNotes(): number {
  return 0;
}

/**
 * Remove a specific digit from notes
 */
export function removeNote(notes: number, digit: Digit): number {
  const bit = 1 << (digit - 1);
  return notes & ~bit;
}

/**
 * Get all digits present in notes as an array
 */
export function getNotesArray(notes: number): Digit[] {
  const result: Digit[] = [];
  for (let d = 1; d <= 9; d++) {
    if (hasNote(notes, d as Digit)) {
      result.push(d as Digit);
    }
  }
  return result;
}

/**
 * Set a bit at position (0-8)
 */
export function setBit(mask: number, position: number): number {
  return mask | (1 << position);
}

/**
 * Clear a bit at position (0-8)
 */
export function clearBit(mask: number, position: number): number {
  return mask & ~(1 << position);
}

/**
 * Check if a bit is set at position (0-8)
 */
export function hasBit(mask: number, position: number): boolean {
  return (mask & (1 << position)) !== 0;
}

/**
 * Count number of set bits
 */
export function countBits(mask: number): number {
  let count = 0;
  let n = mask;
  while (n > 0) {
    count += n & 1;
    n >>= 1;
  }
  return count;
}

/**
 * Convert bitmask to array of digits (1-9)
 */
export function bitsToDigits(mask: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (hasBit(mask, i)) {
      result.push(i + 1);
    }
  }
  return result;
}
