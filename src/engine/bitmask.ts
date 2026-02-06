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
