import { CellValue, Digit, DIGITS, BOARD_SIZE } from "./types";
import { rowOf, colOf, blockOf, getPeers } from "./peers";
import { setBit, clearBit, hasBit, countBits, bitsToDigits } from "./bitmask";
import {
  TechniqueName,
  SolverStep,
  LogicalSolverResult,
  CandidatesGrid,
  Elimination,
} from "./solver-types";

/**
 * Inicializa candidatos para cada célula vazia
 * Retorna array de 81 bitmasks
 */
export function initializeCandidates(board: CellValue[]): CandidatesGrid {
  const candidates: number[] = Array(BOARD_SIZE).fill(0);

  for (let idx = 0; idx < BOARD_SIZE; idx++) {
    if (board[idx] !== 0) {
      candidates[idx] = 0; // célula preenchida não tem candidatos
      continue;
    }

    // Inicialmente todos os dígitos são candidatos
    let mask = 0b111111111; // bits 0-8 representam dígitos 1-9

    // Remover dígitos que aparecem nos peers
    const peers = getPeers(idx);
    for (const peerIdx of peers) {
      const peerValue = board[peerIdx];
      if (peerValue !== 0) {
        mask = clearBit(mask, peerValue - 1);
      }
    }

    candidates[idx] = mask;
  }

  return candidates;
}

/**
 * Atualiza candidatos após colocar um dígito
 */
function updateCandidatesAfterPlacement(
  candidates: CandidatesGrid,
  cellIdx: number,
  digit: Digit,
): CandidatesGrid {
  const newCandidates = [...candidates];
  newCandidates[cellIdx] = 0; // célula preenchida não tem candidatos

  // Remover o dígito dos peers
  const peers = getPeers(cellIdx);
  for (const peerIdx of peers) {
    newCandidates[peerIdx] = clearBit(newCandidates[peerIdx], digit - 1);
  }

  return newCandidates;
}

/**
 * Técnica: Naked Single
 * Célula com apenas um candidato possível
 */
function findNakedSingle(
  board: CellValue[],
  candidates: CandidatesGrid,
): SolverStep | null {
  for (let idx = 0; idx < BOARD_SIZE; idx++) {
    if (board[idx] !== 0) continue;

    const mask = candidates[idx];
    if (countBits(mask) === 1) {
      const digits = bitsToDigits(mask);
      const digit = digits[0];

      return {
        techniqueName: "naked-single",
        targetCells: [idx],
        digit,
        explanation: `A célula (${rowOf(idx) + 1}, ${colOf(idx) + 1}) tem apenas um candidato possível: ${digit}`,
        placement: { cellIdx: idx, digit },
      };
    }
  }

  return null;
}

/**
 * Técnica: Hidden Single em linha
 */
function findHiddenSingleInRow(
  board: CellValue[],
  candidates: CandidatesGrid,
): SolverStep | null {
  for (let row = 0; row < 9; row++) {
    for (const digit of DIGITS) {
      const cellsWithDigit: number[] = [];

      for (let col = 0; col < 9; col++) {
        const idx = row * 9 + col;
        if (board[idx] === 0 && hasBit(candidates[idx], digit - 1)) {
          cellsWithDigit.push(idx);
        }
      }

      if (cellsWithDigit.length === 1) {
        const idx = cellsWithDigit[0];
        return {
          techniqueName: "hidden-single-row",
          targetCells: [idx],
          digit,
          explanation: `Na linha ${row + 1}, o dígito ${digit} só pode estar na célula (${rowOf(idx) + 1}, ${colOf(idx) + 1})`,
          placement: { cellIdx: idx, digit },
        };
      }
    }
  }

  return null;
}

/**
 * Técnica: Hidden Single em coluna
 */
function findHiddenSingleInCol(
  board: CellValue[],
  candidates: CandidatesGrid,
): SolverStep | null {
  for (let col = 0; col < 9; col++) {
    for (const digit of DIGITS) {
      const cellsWithDigit: number[] = [];

      for (let row = 0; row < 9; row++) {
        const idx = row * 9 + col;
        if (board[idx] === 0 && hasBit(candidates[idx], digit - 1)) {
          cellsWithDigit.push(idx);
        }
      }

      if (cellsWithDigit.length === 1) {
        const idx = cellsWithDigit[0];
        return {
          techniqueName: "hidden-single-col",
          targetCells: [idx],
          digit,
          explanation: `Na coluna ${col + 1}, o dígito ${digit} só pode estar na célula (${rowOf(idx) + 1}, ${colOf(idx) + 1})`,
          placement: { cellIdx: idx, digit },
        };
      }
    }
  }

  return null;
}

/**
 * Técnica: Hidden Single em bloco
 */
function findHiddenSingleInBlock(
  board: CellValue[],
  candidates: CandidatesGrid,
): SolverStep | null {
  for (let block = 0; block < 9; block++) {
    const blockRow = Math.floor(block / 3) * 3;
    const blockCol = (block % 3) * 3;

    for (const digit of DIGITS) {
      const cellsWithDigit: number[] = [];

      for (let r = blockRow; r < blockRow + 3; r++) {
        for (let c = blockCol; c < blockCol + 3; c++) {
          const idx = r * 9 + c;
          if (board[idx] === 0 && hasBit(candidates[idx], digit - 1)) {
            cellsWithDigit.push(idx);
          }
        }
      }

      if (cellsWithDigit.length === 1) {
        const idx = cellsWithDigit[0];
        return {
          techniqueName: "hidden-single-block",
          targetCells: [idx],
          digit,
          explanation: `No bloco ${block + 1}, o dígito ${digit} só pode estar na célula (${rowOf(idx) + 1}, ${colOf(idx) + 1})`,
          placement: { cellIdx: idx, digit },
        };
      }
    }
  }

  return null;
}

/**
 * Técnica: Naked Pair
 * Duas células na mesma unidade com exatamente os mesmos 2 candidatos
 */
function findNakedPair(
  board: CellValue[],
  candidates: CandidatesGrid,
): SolverStep | null {
  // Procurar em linhas
  for (let row = 0; row < 9; row++) {
    const cells: number[] = [];
    for (let col = 0; col < 9; col++) {
      const idx = row * 9 + col;
      if (board[idx] === 0 && countBits(candidates[idx]) === 2) {
        cells.push(idx);
      }
    }

    for (let i = 0; i < cells.length - 1; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        if (candidates[cells[i]] === candidates[cells[j]]) {
          const mask = candidates[cells[i]];
          const digits = bitsToDigits(mask);

          // Verificar se há eliminações possíveis
          const eliminations: Elimination[] = [];
          for (let col = 0; col < 9; col++) {
            const idx = row * 9 + col;
            if (idx === cells[i] || idx === cells[j]) continue;
            if (board[idx] !== 0) continue;

            const toRemove: number[] = [];
            for (const digit of digits) {
              if (hasBit(candidates[idx], digit - 1)) {
                toRemove.push(digit);
              }
            }

            if (toRemove.length > 0) {
              eliminations.push({ cellIdx: idx, digits: toRemove });
            }
          }

          if (eliminations.length > 0) {
            return {
              techniqueName: "naked-pair",
              targetCells: [cells[i], cells[j]],
              digits,
              explanation: `Na linha ${row + 1}, as células (${rowOf(cells[i]) + 1}, ${colOf(cells[i]) + 1}) e (${rowOf(cells[j]) + 1}, ${colOf(cells[j]) + 1}) formam um par com candidatos ${digits.join(", ")}. Esses dígitos podem ser eliminados das outras células da linha.`,
              eliminations,
            };
          }
        }
      }
    }
  }

  return null;
}

/**
 * Resolver puzzle usando apenas lógica (sem backtracking)
 */
export function solveLogical(board: CellValue[]): LogicalSolverResult {
  let currentBoard = [...board];
  let candidates = initializeCandidates(currentBoard);
  const steps: SolverStep[] = [];

  let maxIterations = 200; // limite de segurança
  let iteration = 0;

  while (iteration < maxIterations) {
    iteration++;

    // Tentar técnicas em ordem de simplicidade
    let step: SolverStep | null = null;

    step = findNakedSingle(currentBoard, candidates);
    if (!step) step = findHiddenSingleInRow(currentBoard, candidates);
    if (!step) step = findHiddenSingleInCol(currentBoard, candidates);
    if (!step) step = findHiddenSingleInBlock(currentBoard, candidates);
    if (!step) step = findNakedPair(currentBoard, candidates);

    if (!step) {
      // Não encontrou mais passos lógicos
      break;
    }

    steps.push(step);

    // Aplicar o passo
    if (step.placement) {
      const { cellIdx, digit } = step.placement;
      currentBoard[cellIdx] = digit as CellValue;
      candidates = updateCandidatesAfterPlacement(
        candidates,
        cellIdx,
        digit as Digit,
      );
    } else if (step.eliminations) {
      // Aplicar eliminações
      for (const elim of step.eliminations) {
        for (const digit of elim.digits) {
          candidates[elim.cellIdx] = clearBit(
            candidates[elim.cellIdx],
            digit - 1,
          );
        }
      }
    }

    // Verificar se resolveu
    if (currentBoard.every((v) => v !== 0)) {
      return {
        solved: true,
        steps,
        finalBoard: currentBoard,
        candidates,
      };
    }
  }

  // Não conseguiu resolver completamente
  return {
    solved: currentBoard.every((v) => v !== 0),
    steps,
    finalBoard: currentBoard,
    candidates,
  };
}

/**
 * Obter próximo passo aplicável ao estado atual
 * Considera valores preenchidos E notas do usuário
 */
export function getNextHint(
  board: CellValue[],
  userNotes?: number[],
): SolverStep | null {
  const candidates = initializeCandidates(board);

  // Se o usuário tem notas, usar elas como candidatos adicionais
  if (userNotes) {
    for (let idx = 0; idx < BOARD_SIZE; idx++) {
      if (board[idx] === 0 && userNotes[idx] !== 0) {
        // Combinar candidatos calculados com notas do usuário
        candidates[idx] = candidates[idx] & userNotes[idx];
      }
    }
  }

  // Tentar técnicas em ordem
  let step: SolverStep | null = null;

  step = findNakedSingle(board, candidates);
  if (step) return step;

  step = findHiddenSingleInRow(board, candidates);
  if (step) return step;

  step = findHiddenSingleInCol(board, candidates);
  if (step) return step;

  step = findHiddenSingleInBlock(board, candidates);
  if (step) return step;

  step = findNakedPair(board, candidates);
  if (step) return step;

  return null;
}
