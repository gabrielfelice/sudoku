import { CellValue } from "./types";

/**
 * Técnicas de resolução lógica do Sudoku
 */
export type TechniqueName =
  | "naked-single"
  | "hidden-single-row"
  | "hidden-single-col"
  | "hidden-single-block"
  | "naked-pair"
  | "pointing-pair"
  | "box-line-reduction";

/**
 * Eliminação de candidatos
 */
export interface Elimination {
  cellIdx: number;
  digits: number[]; // dígitos removidos dos candidatos
}

/**
 * Passo de resolução lógica
 */
export interface SolverStep {
  techniqueName: TechniqueName;
  targetCells: number[]; // células principais envolvidas
  digit?: number; // dígito colocado (se for placement)
  digits?: number[]; // dígitos envolvidos (se for eliminação)
  explanation: string; // explicação em pt-BR
  eliminations?: Elimination[]; // eliminações de candidatos
  placement?: {
    cellIdx: number;
    digit: number;
  };
}

/**
 * Resultado do solver lógico
 */
export interface LogicalSolverResult {
  solved: boolean;
  steps: SolverStep[];
  finalBoard: CellValue[];
  candidates: number[]; // candidatos finais para cada célula (bitmask)
}

/**
 * Candidatos para cada célula (array de 81 bitmasks)
 */
export type CandidatesGrid = number[];
