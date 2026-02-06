import { GRID_SIZE, BLOCK_SIZE } from "./types";

/**
 * Get row index (0-8) from cell index (0-80)
 */
export function rowOf(idx: number): number {
  return Math.floor(idx / GRID_SIZE);
}

/**
 * Get column index (0-8) from cell index (0-80)
 */
export function colOf(idx: number): number {
  return idx % GRID_SIZE;
}

/**
 * Get block index (0-8) from cell index (0-80)
 */
export function blockOf(idx: number): number {
  const row = rowOf(idx);
  const col = colOf(idx);
  return (
    Math.floor(row / BLOCK_SIZE) * BLOCK_SIZE + Math.floor(col / BLOCK_SIZE)
  );
}

/**
 * Get all peer indices (same row, column, or block) for a given cell
 * Returns unique indices excluding the cell itself
 */
export function getPeers(idx: number): number[] {
  const peers = new Set<number>();
  const row = rowOf(idx);
  const col = colOf(idx);
  const block = blockOf(idx);

  // Add all cells in the same row
  for (let c = 0; c < GRID_SIZE; c++) {
    const peerIdx = row * GRID_SIZE + c;
    if (peerIdx !== idx) peers.add(peerIdx);
  }

  // Add all cells in the same column
  for (let r = 0; r < GRID_SIZE; r++) {
    const peerIdx = r * GRID_SIZE + col;
    if (peerIdx !== idx) peers.add(peerIdx);
  }

  // Add all cells in the same block
  const blockRow = Math.floor(row / BLOCK_SIZE) * BLOCK_SIZE;
  const blockCol = Math.floor(col / BLOCK_SIZE) * BLOCK_SIZE;
  for (let r = blockRow; r < blockRow + BLOCK_SIZE; r++) {
    for (let c = blockCol; c < blockCol + BLOCK_SIZE; c++) {
      const peerIdx = r * GRID_SIZE + c;
      if (peerIdx !== idx) peers.add(peerIdx);
    }
  }

  return Array.from(peers);
}
