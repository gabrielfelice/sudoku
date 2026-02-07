import { CellValue, BOARD_SIZE } from "./types";
import { solveBacktracking, hasUniqueSolution } from "./uniqueness";
import { classifyPuzzle, Difficulty } from "./difficulty";

/**
 * Puzzle gerado
 */
export interface GeneratedPuzzle {
  given: CellValue[];
  solution: CellValue[];
  difficulty: Difficulty;
  seed?: number;
}

/**
 * Gerar uma solução completa (board resolvido)
 */
function generateSolution(seed?: number): CellValue[] {
  // Se seed fornecido, usar para inicializar random
  if (seed !== undefined) {
    // Implementação simples de seeded random
    let seedValue = seed;
    Math.random = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };
  }

  const emptyBoard: CellValue[] = Array(BOARD_SIZE).fill(0);
  const solution = solveBacktracking(emptyBoard);

  if (!solution) {
    throw new Error("Failed to generate solution");
  }

  return solution;
}

/**
 * Remover números garantindo solução única (digging)
 */
function digHoles(
  solution: CellValue[],
  targetDifficulty: Difficulty,
): CellValue[] {
  const puzzle = [...solution];

  // Determinar número de células a remover baseado na dificuldade
  const removalTargets: Record<Difficulty, number> = {
    easy: 40, // ~40 células vazias
    medium: 50,
    hard: 55,
    expert: 60,
  };

  const targetRemovals = removalTargets[targetDifficulty];

  // Criar lista de índices e embaralhar
  const indices = Array.from({ length: BOARD_SIZE }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  let removedCount = 0;
  const maxAttempts = BOARD_SIZE * 2; // limite de segurança
  let attempts = 0;

  for (const idx of indices) {
    if (removedCount >= targetRemovals) break;
    if (attempts >= maxAttempts) break;
    attempts++;

    const originalValue = puzzle[idx];
    puzzle[idx] = 0;

    // Verificar se ainda tem solução única
    if (hasUniqueSolution(puzzle)) {
      removedCount++;
    } else {
      // Restaurar valor
      puzzle[idx] = originalValue;
    }
  }

  return puzzle;
}

/**
 * Gerar puzzle com dificuldade específica
 */
export function generatePuzzle(
  difficulty: Difficulty,
  seed?: number,
): GeneratedPuzzle {
  const solution = generateSolution(seed);
  let puzzle = digHoles(solution, difficulty);

  // Verificar se a dificuldade está correta
  const actualDifficulty = classifyPuzzle(puzzle);

  // Se não atingiu a dificuldade desejada, tentar ajustar
  // (implementação simples: aceitar dificuldade próxima)
  const difficultyOrder: Difficulty[] = ["easy", "medium", "hard", "expert"];
  const targetIdx = difficultyOrder.indexOf(difficulty);
  const actualIdx = difficultyOrder.indexOf(actualDifficulty);

  // Aceitar se estiver no máximo 1 nível de diferença
  if (Math.abs(targetIdx - actualIdx) > 1) {
    // Tentar novamente (máximo 3 tentativas)
    for (let retry = 0; retry < 2; retry++) {
      puzzle = digHoles(solution, difficulty);
      const retryDifficulty = classifyPuzzle(puzzle);
      const retryIdx = difficultyOrder.indexOf(retryDifficulty);

      if (Math.abs(targetIdx - retryIdx) <= 1) {
        return {
          given: puzzle,
          solution,
          difficulty: retryDifficulty,
          seed,
        };
      }
    }
  }

  return {
    given: puzzle,
    solution,
    difficulty: actualDifficulty,
    seed,
  };
}

/**
 * Cache de puzzles gerados
 */
interface PuzzleCache {
  [key: string]: GeneratedPuzzle[];
}

const puzzleCache: PuzzleCache = {
  easy: [],
  medium: [],
  hard: [],
  expert: [],
};

const CACHE_SIZE = 5; // manter 5 puzzles por dificuldade

/**
 * Gerar puzzle com cache
 */
export function generatePuzzleWithCache(
  difficulty: Difficulty,
  seed?: number,
): GeneratedPuzzle {
  // Se seed fornecido, gerar sem cache
  if (seed !== undefined) {
    return generatePuzzle(difficulty, seed);
  }

  // Verificar cache
  if (puzzleCache[difficulty].length > 0) {
    return puzzleCache[difficulty].shift()!;
  }

  // Gerar novo puzzle
  const puzzle = generatePuzzle(difficulty);

  // Pré-gerar puzzles para o cache (assíncrono)
  setTimeout(() => {
    while (puzzleCache[difficulty].length < CACHE_SIZE) {
      puzzleCache[difficulty].push(generatePuzzle(difficulty));
    }
  }, 0);

  return puzzle;
}
