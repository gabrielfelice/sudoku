# Geração de Puzzles e Sistema de Solver

## Visão Geral

O sistema de geração de puzzles cria Sudokus válidos com solução única, classificados por dificuldade. O solver usa técnicas lógicas para resolver puzzles e fornecer dicas.

## Geração de Puzzles

### Localização

`src/engine/generator.ts`

### Algoritmo de Geração

```
1. Gerar solução completa válida
   ↓
2. Remover células aleatoriamente
   ↓
3. Verificar solução única
   ↓
4. Classificar dificuldade
   ↓
5. Retornar puzzle
```

### Etapas Detalhadas

#### 1. Geração de Solução Completa

```typescript
function generateSolution(seed?: number): CellValue[] {
  // Usa backtracking com randomização
  const board = Array(81).fill(0);
  const rng = seed ? seededRandom(seed) : Math.random;

  function solve(index: number): boolean {
    if (index === 81) return true;

    const digits = shuffleDigits(rng);
    for (const digit of digits) {
      if (isValid(board, index, digit)) {
        board[index] = digit;
        if (solve(index + 1)) return true;
        board[index] = 0;
      }
    }
    return false;
  }

  solve(0);
  return board;
}
```

#### 2. Remoção de Células

```typescript
function removeClues(solution: CellValue[], targetClues: number): CellValue[] {
  const board = [...solution];
  const indices = shuffle([...Array(81).keys()]);

  for (const index of indices) {
    if (countClues(board) <= targetClues) break;

    const temp = board[index];
    board[index] = 0;

    // Verificar se ainda tem solução única
    if (!hasUniqueSolution(board)) {
      board[index] = temp; // Restaurar
    }
  }

  return board;
}
```

#### 3. Verificação de Solução Única

**Localização**: `src/engine/uniqueness.ts`

```typescript
function hasUniqueSolution(board: CellValue[]): boolean {
  let solutionCount = 0;

  function solve(index: number): boolean {
    if (index === 81) {
      solutionCount++;
      return solutionCount > 1; // Parar se encontrar mais de uma
    }

    if (board[index] !== 0) {
      return solve(index + 1);
    }

    for (let digit = 1; digit <= 9; digit++) {
      if (isValid(board, index, digit)) {
        board[index] = digit;
        if (solve(index + 1)) return true;
        board[index] = 0;
      }
    }

    return false;
  }

  solve(0);
  return solutionCount === 1;
}
```

## Classificação de Dificuldade

### Localização

`src/engine/difficulty.ts`

### Critérios

```typescript
function classifyPuzzle(board: CellValue[]): Difficulty {
  const clueCount = countClues(board);
  const techniques = requiredTechniques(board);

  // Classificar por número de pistas
  if (clueCount >= 36) {
    return "easy";
  } else if (clueCount >= 28) {
    return "medium";
  } else if (clueCount >= 24) {
    return "hard";
  } else {
    return "expert";
  }
}
```

### Técnicas Necessárias

```typescript
function requiredTechniques(board: CellValue[]): TechniqueName[] {
  const techniques: TechniqueName[] = [];
  const result = solveLogical(board);

  for (const step of result.steps) {
    if (!techniques.includes(step.techniqueName)) {
      techniques.push(step.techniqueName);
    }
  }

  return techniques;
}
```

## Sistema de Solver

### Localização

`src/engine/solver.ts`

### Técnicas Implementadas

#### 1. Naked Single

Célula com apenas um candidato possível.

```typescript
function findNakedSingle(
  board: CellValue[],
  candidates: CandidatesGrid,
): SolverStep | null {
  for (let idx = 0; idx < 81; idx++) {
    if (board[idx] !== 0) continue;

    const mask = candidates[idx];
    if (countBits(mask) === 1) {
      const digit = bitsToDigits(mask)[0];
      return {
        techniqueName: "naked-single",
        targetCells: [idx],
        digit,
        explanation: `Célula tem apenas um candidato: ${digit}`,
        placement: { cellIdx: idx, digit },
      };
    }
  }
  return null;
}
```

#### 2. Hidden Single

Dígito que só pode estar em uma célula de uma casa.

```typescript
function findHiddenSingleInRow(
  board: CellValue[],
  candidates: CandidatesGrid,
): SolverStep | null {
  for (let row = 0; row < 9; row++) {
    for (const digit of DIGITS) {
      const cellsWithDigit = [];

      for (let col = 0; col < 9; col++) {
        const idx = row * 9 + col;
        if (board[idx] === 0 && hasBit(candidates[idx], digit - 1)) {
          cellsWithDigit.push(idx);
        }
      }

      if (cellsWithDigit.length === 1) {
        return {
          techniqueName: "hidden-single-row",
          targetCells: cellsWithDigit,
          digit,
          explanation: `Na linha ${row + 1}, ${digit} só pode estar aqui`,
          placement: { cellIdx: cellsWithDigit[0], digit },
        };
      }
    }
  }
  return null;
}
```

#### 3. Naked Pair

Duas células com os mesmos dois candidatos.

```typescript
function findNakedPair(
  board: CellValue[],
  candidates: CandidatesGrid,
): SolverStep | null {
  for (let row = 0; row < 9; row++) {
    const cells = [];

    for (let col = 0; col < 9; col++) {
      const idx = row * 9 + col;
      if (board[idx] === 0 && countBits(candidates[idx]) === 2) {
        cells.push(idx);
      }
    }

    for (let i = 0; i < cells.length - 1; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        if (candidates[cells[i]] === candidates[cells[j]]) {
          const digits = bitsToDigits(candidates[cells[i]]);
          const eliminations = findEliminationsInRow(
            row,
            cells[i],
            cells[j],
            digits,
            candidates,
          );

          if (eliminations.length > 0) {
            return {
              techniqueName: "naked-pair",
              targetCells: [cells[i], cells[j]],
              digits,
              explanation: `Par ${digits.join(",")} elimina candidatos`,
              eliminations,
            };
          }
        }
      }
    }
  }
  return null;
}
```

#### 4. Pointing Pair

Candidato em bloco restrito a uma linha/coluna.

```typescript
function findPointingPair(
  board: CellValue[],
  candidates: CandidatesGrid,
): SolverStep | null {
  for (let block = 0; block < 9; block++) {
    for (const digit of DIGITS) {
      const cellsWithDigit = getCellsInBlockWithDigit(
        block,
        digit,
        board,
        candidates,
      );

      if (cellsWithDigit.length === 0) continue;

      // Verificar se todos na mesma linha
      const rows = new Set(cellsWithDigit.map(rowOf));
      if (rows.size === 1) {
        const eliminations = findEliminationsInRowOutsideBlock(
          Array.from(rows)[0],
          block,
          digit,
          candidates,
        );

        if (eliminations.length > 0) {
          return {
            techniqueName: "pointing-pair",
            targetCells: cellsWithDigit,
            digits: [digit],
            explanation: `${digit} no bloco aponta para linha`,
            eliminations,
          };
        }
      }
    }
  }
  return null;
}
```

### Solver Lógico

```typescript
export function solveLogical(board: CellValue[]): LogicalSolverResult {
  let currentBoard = [...board];
  let candidates = initializeCandidates(currentBoard);
  const steps: SolverStep[] = [];

  let maxIterations = 200;
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
    if (!step) step = findPointingPair(currentBoard, candidates);
    if (!step) step = findBoxLineReduction(currentBoard, candidates);

    if (!step) break; // Não encontrou mais passos

    steps.push(step);

    // Aplicar passo
    if (step.placement) {
      currentBoard[step.placement.cellIdx] = step.placement.digit;
      candidates = updateCandidatesAfterPlacement(
        candidates,
        step.placement.cellIdx,
        step.placement.digit,
      );
    } else if (step.eliminations) {
      for (const elim of step.eliminations) {
        for (const digit of elim.digits) {
          candidates[elim.cellIdx] = clearBit(
            candidates[elim.cellIdx],
            digit - 1,
          );
        }
      }
    }

    if (currentBoard.every((v) => v !== 0)) {
      return { solved: true, steps, finalBoard: currentBoard, candidates };
    }
  }

  return {
    solved: currentBoard.every((v) => v !== 0),
    steps,
    finalBoard: currentBoard,
    candidates,
  };
}
```

## Sistema de Dicas

### Obter Próxima Dica

```typescript
export function getNextHint(
  board: CellValue[],
  userNotes?: number[],
): SolverStep | null {
  const candidates = initializeCandidates(board);

  // Combinar com notas do usuário
  if (userNotes) {
    for (let idx = 0; idx < 81; idx++) {
      if (board[idx] === 0 && userNotes[idx] !== 0) {
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

  // ... outras técnicas

  return null;
}
```

## Explicação de Erros

### Localização

`src/engine/explain.ts`

```typescript
export function explainError(
  board: CellValue[],
  cellIndex: number,
  digit: Digit,
): string {
  const row = rowOf(cellIndex);
  const col = colOf(cellIndex);
  const block = blockOf(cellIndex);

  // Verificar conflitos
  const conflicts = [];

  // Linha
  for (let c = 0; c < 9; c++) {
    const idx = row * 9 + c;
    if (idx !== cellIndex && board[idx] === digit) {
      conflicts.push(`linha ${row + 1}`);
      break;
    }
  }

  // Coluna
  for (let r = 0; r < 9; r++) {
    const idx = r * 9 + col;
    if (idx !== cellIndex && board[idx] === digit) {
      conflicts.push(`coluna ${col + 1}`);
      break;
    }
  }

  // Bloco
  const blockRow = Math.floor(block / 3) * 3;
  const blockCol = (block % 3) * 3;
  for (let r = blockRow; r < blockRow + 3; r++) {
    for (let c = blockCol; c < blockCol + 3; c++) {
      const idx = r * 9 + c;
      if (idx !== cellIndex && board[idx] === digit) {
        conflicts.push(`bloco ${block + 1}`);
        break;
      }
    }
  }

  if (conflicts.length > 0) {
    return `O dígito ${digit} já existe na ${conflicts.join(" e ")}.`;
  }

  return `O dígito ${digit} não é a solução correta para esta célula.`;
}
```

## Performance

### Otimizações

1. **Bitmasks**: Operações rápidas com candidatos
2. **Early Exit**: Parar quando solução encontrada
3. **Caching**: Memoizar cálculos de peers
4. **Ordem de Técnicas**: Tentar técnicas simples primeiro

### Complexidade

- **Geração**: O(n²) com backtracking
- **Verificação de Unicidade**: O(9^n) onde n = células vazias
- **Solver Lógico**: O(n \* t) onde t = número de técnicas
