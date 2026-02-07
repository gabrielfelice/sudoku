import { CellValue, Digit, DIGITS, BOARD_SIZE } from "./types";
import { rowOf, colOf, blockOf, getPeers } from "./peers";

/**
 * Verifica se um board é válido (sem conflitos)
 */
export function isValidBoard(board: CellValue[]): boolean {
  for (let idx = 0; idx < BOARD_SIZE; idx++) {
    const value = board[idx];
    if (value === 0) continue;

    const peers = getPeers(idx);
    for (const peerIdx of peers) {
      if (board[peerIdx] === value) {
        return false; // conflito encontrado
      }
    }
  }

  return true;
}

/**
 * Resolver usando backtracking (para contar soluções)
 * Retorna número de soluções encontradas (limitado por maxSolutions)
 */
export function countSolutions(
  board: CellValue[],
  maxSolutions: number = 2,
): number {
  const workBoard = [...board];
  let solutionCount = 0;

  function backtrack(idx: number): boolean {
    if (idx === BOARD_SIZE) {
      solutionCount++;
      return solutionCount >= maxSolutions; // parar se atingir limite
    }

    if (workBoard[idx] !== 0) {
      return backtrack(idx + 1);
    }

    const peers = getPeers(idx);
    const usedDigits = new Set<number>();
    for (const peerIdx of peers) {
      if (workBoard[peerIdx] !== 0) {
        usedDigits.add(workBoard[peerIdx]);
      }
    }

    for (const digit of DIGITS) {
      if (usedDigits.has(digit)) continue;

      workBoard[idx] = digit;
      if (backtrack(idx + 1)) {
        return true; // atingiu limite de soluções
      }
      workBoard[idx] = 0;
    }

    return false;
  }

  backtrack(0);
  return solutionCount;
}

/**
 * Resolver usando backtracking (retorna primeira solução encontrada)
 */
export function solveBacktracking(board: CellValue[]): CellValue[] | null {
  const workBoard = [...board];

  function backtrack(idx: number): boolean {
    if (idx === BOARD_SIZE) {
      return true; // resolvido
    }

    if (workBoard[idx] !== 0) {
      return backtrack(idx + 1);
    }

    const peers = getPeers(idx);
    const usedDigits = new Set<number>();
    for (const peerIdx of peers) {
      if (workBoard[peerIdx] !== 0) {
        usedDigits.add(workBoard[peerIdx]);
      }
    }

    // Tentar dígitos em ordem aleatória para gerar puzzles variados
    const digits = [...DIGITS].sort(() => Math.random() - 0.5);

    for (const digit of digits) {
      if (usedDigits.has(digit)) continue;

      workBoard[idx] = digit;
      if (backtrack(idx + 1)) {
        return true;
      }
      workBoard[idx] = 0;
    }

    return false;
  }

  if (backtrack(0)) {
    return workBoard;
  }

  return null;
}

/**
 * Verificar se o puzzle tem solução única
 */
export function hasUniqueSolution(board: CellValue[]): boolean {
  return countSolutions(board, 2) === 1;
}
