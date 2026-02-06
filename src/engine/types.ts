// Core types for Sudoku engine
export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type CellValue = Digit | 0;

export const DIGITS: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
export const BOARD_SIZE = 81;
export const GRID_SIZE = 9;
export const BLOCK_SIZE = 3;
