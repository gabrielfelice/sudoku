/**
 * Hardcoded puzzle for MVP
 * Format: 81 characters, 0 = empty cell
 */

export interface Puzzle {
  given: string;
  solution: string;
}

// Easy puzzle for testing
export const EASY_PUZZLE: Puzzle = {
  // Given puzzle (0 = empty)
  given:
    "530070000" +
    "600195000" +
    "098000060" +
    "800060003" +
    "400803001" +
    "700020006" +
    "060000280" +
    "000419005" +
    "000080079",

  // Complete solution
  solution:
    "534678912" +
    "672195348" +
    "198342567" +
    "859761423" +
    "426853791" +
    "713924856" +
    "961537284" +
    "287419635" +
    "345286179",
};

/**
 * Convert puzzle string to number array
 */
export function parsePuzzle(puzzleStr: string): number[] {
  return puzzleStr.split("").map((ch) => parseInt(ch, 10));
}
