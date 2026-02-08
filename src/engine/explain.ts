import { CellValue, Digit } from "./types";
import { rowOf, colOf, blockOf, getPeers } from "./peers";
import { hasBit, bitsToDigits, countBits } from "./bitmask";
import { initializeCandidates, getNextHint } from "./solver";
import { SolverStep, TechniqueName } from "./solver-types";

/**
 * Camadas de explicação para erros
 */
export interface ExplanationLayer {
  type: "rule" | "candidates" | "technique";
  title: string;
  description: string;
  highlightCells?: number[];
  candidates?: number[];
}

/**
 * Explicação detalhada de erro
 */
export interface DetailedErrorExplanation {
  layers: ExplanationLayer[];
  wrongDigit: number;
  cellIdx: number;
  conflictingCells: number[];
}

/**
 * Passo de dica guiada
 */
export interface HintStep {
  stepNumber: number;
  title: string;
  description: string;
  highlightCells: number[];
  highlightType: "primary" | "secondary";
  canApply: boolean;
}

/**
 * Dica guiada completa
 */
export interface GuidedHint {
  techniqueName: TechniqueName;
  steps: HintStep[];
  solverStep: SolverStep;
  narrative: string; // Overall explanation
  highlight: {
    primary: number[];
    secondary: number[];
  };
  canApply: boolean; // Whether hint can be auto-applied
}

/**
 * Encontra todas as células que conflitam com um movimento inválido
 */
export function findConflictingCells(
  board: CellValue[],
  cellIdx: number,
  digit: Digit,
): number[] {
  const conflicting: number[] = [];
  const peers = getPeers(cellIdx);

  for (const peerIdx of peers) {
    if (board[peerIdx] === digit) {
      conflicting.push(peerIdx);
    }
  }

  return conflicting;
}

/**
 * Calcula candidatos válidos para uma célula
 */
export function getCandidatesForCell(
  board: CellValue[],
  cellIdx: number,
): number[] {
  if (board[cellIdx] !== 0) return [];

  const candidates = initializeCandidates(board);
  return bitsToDigits(candidates[cellIdx]);
}

/**
 * Explica por que um movimento é inválido (multi-camadas)
 */
export function explainInvalidMove(
  board: CellValue[],
  cellIdx: number,
  wrongDigit: Digit,
  solution: CellValue[],
): DetailedErrorExplanation {
  const layers: ExplanationLayer[] = [];
  const conflictingCells = findConflictingCells(board, cellIdx, wrongDigit);
  const validCandidates = getCandidatesForCell(board, cellIdx);
  const correctDigit = solution[cellIdx];

  // Camada A: Regra básica violada
  if (conflictingCells.length > 0) {
    const firstConflict = conflictingCells[0];
    const cellRow = rowOf(cellIdx) + 1;
    const cellCol = colOf(cellIdx) + 1;
    const conflictRow = rowOf(firstConflict) + 1;
    const conflictCol = colOf(firstConflict) + 1;

    let ruleDescription = "";

    if (rowOf(cellIdx) === rowOf(firstConflict)) {
      ruleDescription = `O número ${wrongDigit} não pode estar na célula (${cellRow}, ${cellCol}) porque já existe na mesma linha, na célula (${conflictRow}, ${conflictCol}). Cada número de 1 a 9 deve aparecer exatamente uma vez em cada linha.`;
    } else if (colOf(cellIdx) === colOf(firstConflict)) {
      ruleDescription = `O número ${wrongDigit} não pode estar na célula (${cellRow}, ${cellCol}) porque já existe na mesma coluna, na célula (${conflictRow}, ${conflictCol}). Cada número de 1 a 9 deve aparecer exatamente uma vez em cada coluna.`;
    } else {
      const blockNum = blockOf(cellIdx) + 1;
      ruleDescription = `O número ${wrongDigit} não pode estar na célula (${cellRow}, ${cellCol}) porque já existe no mesmo bloco 3×3 (bloco ${blockNum}), na célula (${conflictRow}, ${conflictCol}). Cada número de 1 a 9 deve aparecer exatamente uma vez em cada bloco.`;
    }

    layers.push({
      type: "rule",
      title: "Regra Violada",
      description: ruleDescription,
      highlightCells: [cellIdx, ...conflictingCells],
    });
  }

  // Camada B: Candidatos válidos
  if (validCandidates.length > 0) {
    const candidatesText = validCandidates.join(", ");
    const cellRow = rowOf(cellIdx) + 1;
    const cellCol = colOf(cellIdx) + 1;

    let candidatesDescription = `Para a célula (${cellRow}, ${cellCol}), os candidatos válidos são: ${candidatesText}. `;

    if (validCandidates.length === 1) {
      candidatesDescription += `Na verdade, apenas o número ${validCandidates[0]} é possível nesta célula! Isso é chamado de "Naked Single" - quando uma célula tem apenas um candidato possível.`;
    } else {
      candidatesDescription += `O número ${wrongDigit} foi eliminado porque já aparece na linha, coluna ou bloco desta célula.`;
    }

    layers.push({
      type: "candidates",
      title: "Candidatos Válidos",
      description: candidatesDescription,
      candidates: validCandidates,
      highlightCells: [cellIdx],
    });
  }

  // Camada C: Técnica aplicável
  const hint = getNextHint(board);
  if (hint && hint.targetCells.includes(cellIdx)) {
    let techniqueDescription = "";

    switch (hint.techniqueName) {
      case "naked-single":
        techniqueDescription = `Esta célula pode ser resolvida usando a técnica "Naked Single": quando uma célula tem apenas um candidato possível, esse deve ser o número correto. Neste caso, o número ${correctDigit} é o único candidato válido.`;
        break;
      case "hidden-single-row":
        techniqueDescription = `Esta célula pode ser resolvida usando a técnica "Hidden Single na Linha": quando um número só pode aparecer em uma célula de uma linha, ele deve estar lá. O número ${correctDigit} só pode estar nesta célula na linha ${rowOf(cellIdx) + 1}.`;
        break;
      case "hidden-single-col":
        techniqueDescription = `Esta célula pode ser resolvida usando a técnica "Hidden Single na Coluna": quando um número só pode aparecer em uma célula de uma coluna, ele deve estar lá. O número ${correctDigit} só pode estar nesta célula na coluna ${colOf(cellIdx) + 1}.`;
        break;
      case "hidden-single-block":
        techniqueDescription = `Esta célula pode ser resolvida usando a técnica "Hidden Single no Bloco": quando um número só pode aparecer em uma célula de um bloco 3×3, ele deve estar lá. O número ${correctDigit} só pode estar nesta célula no bloco ${blockOf(cellIdx) + 1}.`;
        break;
      default:
        techniqueDescription = `Esta célula faz parte de um padrão mais complexo que pode ser resolvido com a técnica "${hint.techniqueName}". Use o botão "Dica" para ver uma explicação passo a passo.`;
    }

    layers.push({
      type: "technique",
      title: "Técnica de Resolução",
      description: techniqueDescription,
      highlightCells: hint.targetCells,
    });
  }

  return {
    layers,
    wrongDigit,
    cellIdx,
    conflictingCells,
  };
}

/**
 * Cria explicação guiada passo a passo para uma dica
 */
export function explainHint(
  board: CellValue[],
  userNotes?: number[],
): GuidedHint | null {
  const solverStep = getNextHint(board, userNotes);
  if (!solverStep) return null;

  const steps: HintStep[] = [];

  switch (solverStep.techniqueName) {
    case "naked-single": {
      const cellIdx = solverStep.targetCells[0];
      const digit = solverStep.digit!;
      const row = rowOf(cellIdx) + 1;
      const col = colOf(cellIdx) + 1;

      steps.push({
        stepNumber: 1,
        title: "Identificando a Célula",
        description: `Vamos analisar a célula na posição (${row}, ${col}). Esta célula está vazia e precisamos descobrir qual número pode estar aqui.`,
        highlightCells: [cellIdx],
        highlightType: "primary",
        canApply: false,
      });

      steps.push({
        stepNumber: 2,
        title: "Eliminando Candidatos",
        description: `Olhando para a linha ${row}, coluna ${col} e o bloco desta célula, podemos eliminar todos os números que já aparecem nessas áreas. Veja as células destacadas - elas eliminam vários candidatos.`,
        highlightCells: getPeers(cellIdx).filter((idx) => board[idx] !== 0),
        highlightType: "secondary",
        canApply: false,
      });

      steps.push({
        stepNumber: 3,
        title: "Único Candidato Restante",
        description: `Após eliminar todos os números impossíveis, resta apenas o número ${digit}! Esta é a técnica "Naked Single" - quando uma célula tem apenas um candidato possível, esse deve ser o número correto.`,
        highlightCells: [cellIdx],
        highlightType: "primary",
        canApply: true,
      });
      break;
    }

    case "hidden-single-row": {
      const cellIdx = solverStep.targetCells[0];
      const digit = solverStep.digit!;
      const row = rowOf(cellIdx) + 1;
      const col = colOf(cellIdx) + 1;

      steps.push({
        stepNumber: 1,
        title: "Focando no Número",
        description: `Vamos procurar onde o número ${digit} pode estar na linha ${row}. Este número precisa aparecer exatamente uma vez nesta linha.`,
        highlightCells: Array.from(
          { length: 9 },
          (_, i) => rowOf(cellIdx) * 9 + i,
        ),
        highlightType: "secondary",
        canApply: false,
      });

      steps.push({
        stepNumber: 2,
        title: "Eliminando Posições",
        description: `Analisando cada célula da linha ${row}, verificamos onde o ${digit} NÃO pode estar (por já aparecer na coluna ou bloco dessas células). As células destacadas são impossíveis para o ${digit}.`,
        highlightCells: Array.from(
          { length: 9 },
          (_, i) => rowOf(cellIdx) * 9 + i,
        ).filter(
          (idx) =>
            idx !== cellIdx &&
            (board[idx] !== 0 ||
              !hasBit(initializeCandidates(board)[idx], digit - 1)),
        ),
        highlightType: "secondary",
        canApply: false,
      });

      steps.push({
        stepNumber: 3,
        title: "Única Posição Possível",
        description: `Após eliminar todas as posições impossíveis, descobrimos que o número ${digit} só pode estar na célula (${row}, ${col})! Esta é a técnica "Hidden Single na Linha" - quando um número só tem uma posição possível em uma linha.`,
        highlightCells: [cellIdx],
        highlightType: "primary",
        canApply: true,
      });
      break;
    }

    case "hidden-single-col": {
      const cellIdx = solverStep.targetCells[0];
      const digit = solverStep.digit!;
      const row = rowOf(cellIdx) + 1;
      const col = colOf(cellIdx) + 1;

      steps.push({
        stepNumber: 1,
        title: "Focando no Número",
        description: `Vamos procurar onde o número ${digit} pode estar na coluna ${col}. Este número precisa aparecer exatamente uma vez nesta coluna.`,
        highlightCells: Array.from(
          { length: 9 },
          (_, i) => i * 9 + colOf(cellIdx),
        ),
        highlightType: "secondary",
        canApply: false,
      });

      steps.push({
        stepNumber: 2,
        title: "Eliminando Posições",
        description: `Analisando cada célula da coluna ${col}, verificamos onde o ${digit} NÃO pode estar. As células destacadas são impossíveis para o ${digit}.`,
        highlightCells: Array.from(
          { length: 9 },
          (_, i) => i * 9 + colOf(cellIdx),
        ).filter(
          (idx) =>
            idx !== cellIdx &&
            (board[idx] !== 0 ||
              !hasBit(initializeCandidates(board)[idx], digit - 1)),
        ),
        highlightType: "secondary",
        canApply: false,
      });

      steps.push({
        stepNumber: 3,
        title: "Única Posição Possível",
        description: `O número ${digit} só pode estar na célula (${row}, ${col})! Esta é a técnica "Hidden Single na Coluna".`,
        highlightCells: [cellIdx],
        highlightType: "primary",
        canApply: true,
      });
      break;
    }

    case "hidden-single-block": {
      const cellIdx = solverStep.targetCells[0];
      const digit = solverStep.digit!;
      const row = rowOf(cellIdx) + 1;
      const col = colOf(cellIdx) + 1;
      const block = blockOf(cellIdx) + 1;
      const blockRow = Math.floor(blockOf(cellIdx) / 3) * 3;
      const blockCol = (blockOf(cellIdx) % 3) * 3;

      const blockCells: number[] = [];
      for (let r = blockRow; r < blockRow + 3; r++) {
        for (let c = blockCol; c < blockCol + 3; c++) {
          blockCells.push(r * 9 + c);
        }
      }

      steps.push({
        stepNumber: 1,
        title: "Focando no Bloco",
        description: `Vamos procurar onde o número ${digit} pode estar no bloco ${block}. Este número precisa aparecer exatamente uma vez neste bloco 3×3.`,
        highlightCells: blockCells,
        highlightType: "secondary",
        canApply: false,
      });

      steps.push({
        stepNumber: 2,
        title: "Eliminando Posições",
        description: `Analisando cada célula do bloco ${block}, verificamos onde o ${digit} NÃO pode estar. As células destacadas são impossíveis para o ${digit}.`,
        highlightCells: blockCells.filter(
          (idx) =>
            idx !== cellIdx &&
            (board[idx] !== 0 ||
              !hasBit(initializeCandidates(board)[idx], digit - 1)),
        ),
        highlightType: "secondary",
        canApply: false,
      });

      steps.push({
        stepNumber: 3,
        title: "Única Posição Possível",
        description: `O número ${digit} só pode estar na célula (${row}, ${col})! Esta é a técnica "Hidden Single no Bloco".`,
        highlightCells: [cellIdx],
        highlightType: "primary",
        canApply: true,
      });
      break;
    }

    case "naked-pair": {
      const [cell1, cell2] = solverStep.targetCells;
      const digits = solverStep.digits!;
      const row1 = rowOf(cell1) + 1;
      const col1 = colOf(cell1) + 1;
      const row2 = rowOf(cell2) + 1;
      const col2 = colOf(cell2) + 1;

      steps.push({
        stepNumber: 1,
        title: "Identificando o Par",
        description: `As células (${row1}, ${col1}) e (${row2}, ${col2}) formam um "Naked Pair" - ambas têm exatamente os mesmos dois candidatos: ${digits.join(" e ")}.`,
        highlightCells: [cell1, cell2],
        highlightType: "primary",
        canApply: false,
      });

      steps.push({
        stepNumber: 2,
        title: "Entendendo a Lógica",
        description: `Como essas duas células só podem conter ${digits.join(" ou ")}, sabemos que esses dois números DEVEM estar nessas duas células (em alguma ordem). Isso significa que nenhuma outra célula na mesma linha/coluna/bloco pode ter esses números.`,
        highlightCells: [cell1, cell2],
        highlightType: "primary",
        canApply: false,
      });

      const eliminationCells =
        solverStep.eliminations?.map((e) => e.cellIdx) || [];
      steps.push({
        stepNumber: 3,
        title: "Eliminando Candidatos",
        description: `Podemos eliminar os números ${digits.join(" e ")} das células destacadas, pois eles já estão "reservados" para o par. Isso pode revelar novos candidatos únicos em outras células!`,
        highlightCells: eliminationCells,
        highlightType: "secondary",
        canApply: true,
      });
      break;
    }

    case "pointing-pair":
    case "box-line-reduction": {
      const targetCells = solverStep.targetCells;
      const digit = solverStep.digits![0];

      steps.push({
        stepNumber: 1,
        title: "Identificando o Padrão",
        description: `O número ${digit} tem um padrão especial nas células destacadas. Vamos analisar onde ele pode estar.`,
        highlightCells: targetCells,
        highlightType: "primary",
        canApply: false,
      });

      steps.push({
        stepNumber: 2,
        title: "Aplicando a Técnica",
        description: solverStep.explanation,
        highlightCells: targetCells,
        highlightType: "primary",
        canApply: false,
      });

      const eliminationCells =
        solverStep.eliminations?.map((e) => e.cellIdx) || [];
      steps.push({
        stepNumber: 3,
        title: "Eliminando Candidatos",
        description: `Com base neste padrão, podemos eliminar o número ${digit} das células destacadas.`,
        highlightCells: eliminationCells,
        highlightType: "secondary",
        canApply: true,
      });
      break;
    }
  }

  return {
    techniqueName: solverStep.techniqueName,
    steps,
    solverStep,
    narrative: solverStep.explanation,
    highlight: {
      primary: solverStep.targetCells,
      secondary: [],
    },
    canApply: solverStep.techniqueName.includes("single"),
  };
}
