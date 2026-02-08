import { CellValue, Digit } from "./types";
import { getPeers } from "./peers";
import { initializeCandidates } from "./solver";
import { hasBit, clearBit } from "./bitmask";

/**
 * Limpa notas inválidas baseado nos candidatos válidos
 * Retorna novo array de notas (bitmasks)
 */
export function cleanInvalidNotes(
  board: CellValue[],
  currentNotes: number[],
): number[] {
  const validCandidates = initializeCandidates(board);
  const cleanedNotes = [...currentNotes];

  for (let idx = 0; idx < 81; idx++) {
    if (board[idx] !== 0) {
      cleanedNotes[idx] = 0; // célula preenchida não tem notas
      continue;
    }

    // Remover notas que não são candidatos válidos
    cleanedNotes[idx] = currentNotes[idx] & validCandidates[idx];
  }

  return cleanedNotes;
}

/**
 * Remove um dígito das notas de todos os peers de uma célula
 */
export function removeDigitFromPeers(
  cellIdx: number,
  digit: Digit,
  currentNotes: number[],
  values: CellValue[],
): number[] {
  const newNotes = [...currentNotes];
  const peers = getPeers(cellIdx);

  peers.forEach((peerIdx) => {
    if (values[peerIdx] === 0 && hasBit(newNotes[peerIdx], digit - 1)) {
      newNotes[peerIdx] = clearBit(newNotes[peerIdx], digit - 1);
    }
  });

  return newNotes;
}
