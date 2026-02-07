import { CellValue } from "./types";
import { solveLogical } from "./solver";
import { TechniqueName } from "./solver-types";

/**
 * Níveis de dificuldade
 */
export type Difficulty = "easy" | "medium" | "hard" | "expert";

/**
 * Classificar puzzle baseado em técnicas necessárias
 */
export function classifyPuzzle(puzzle: CellValue[]): Difficulty {
  const result = solveLogical(puzzle);

  // Contar givens (células preenchidas)
  const givens = puzzle.filter((v) => v !== 0).length;

  // Contar técnicas usadas
  const techniqueCounts: Record<TechniqueName, number> = {
    "naked-single": 0,
    "hidden-single-row": 0,
    "hidden-single-col": 0,
    "hidden-single-block": 0,
    "naked-pair": 0,
    "pointing-pair": 0,
    "box-line-reduction": 0,
  };

  for (const step of result.steps) {
    techniqueCounts[step.techniqueName]++;
  }

  const totalSteps = result.steps.length;

  // Técnicas básicas
  const basicTechniques =
    techniqueCounts["naked-single"] +
    techniqueCounts["hidden-single-row"] +
    techniqueCounts["hidden-single-col"] +
    techniqueCounts["hidden-single-block"];

  // Técnicas intermediárias
  const intermediateTechniques = techniqueCounts["naked-pair"];

  // Técnicas avançadas
  const advancedTechniques =
    techniqueCounts["pointing-pair"] + techniqueCounts["box-line-reduction"];

  /**
   * Critérios de classificação:
   *
   * EASY:
   * - Somente naked singles e hidden singles
   * - Muitos givens (>= 36)
   * - Poucos passos (<= 30)
   *
   * MEDIUM:
   * - Inclui naked pairs mas não técnicas avançadas
   * - Givens moderados (30-35)
   * - Passos moderados (30-50)
   *
   * HARD:
   * - Inclui técnicas avançadas OU
   * - Muitos passos com técnicas intermediárias
   * - Poucos givens (25-29)
   *
   * EXPERT:
   * - Muitas técnicas avançadas OU
   * - Muito poucos givens (< 25) OU
   * - Muitos passos (> 60)
   */

  // EXPERT: muito difícil
  if (
    advancedTechniques > 5 ||
    givens < 25 ||
    totalSteps > 60 ||
    !result.solved
  ) {
    return "expert";
  }

  // HARD: difícil
  if (
    advancedTechniques > 0 ||
    (intermediateTechniques > 3 && totalSteps > 50) ||
    givens < 30
  ) {
    return "hard";
  }

  // MEDIUM: médio
  if (intermediateTechniques > 0 || totalSteps > 30 || givens < 36) {
    return "medium";
  }

  // EASY: fácil
  return "easy";
}

/**
 * Obter descrição da dificuldade
 */
export function getDifficultyDescription(difficulty: Difficulty): string {
  const descriptions: Record<Difficulty, string> = {
    easy: "Fácil - Apenas técnicas básicas necessárias",
    medium: "Médio - Requer naked pairs e eliminações simples",
    hard: "Difícil - Requer técnicas intermediárias",
    expert: "Expert - Requer técnicas avançadas ou muita dedução",
  };

  return descriptions[difficulty];
}
