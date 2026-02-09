# Tipos Fundamentais e Invariantes

## Tipos Básicos

### CellValue

```typescript
type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
```

Representa o valor de uma célula no tabuleiro:

- `0` = célula vazia
- `1-9` = dígitos válidos do Sudoku

**Invariante**: Sempre um número inteiro entre 0 e 9 (inclusive).

### Digit

```typescript
type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
```

Representa um dígito válido do Sudoku (excluindo 0).

**Invariante**: Sempre um número inteiro entre 1 e 9 (inclusive).

### Board

```typescript
type Board = CellValue[]; // Array de 81 elementos
```

Representa o tabuleiro completo do Sudoku como array unidimensional.

**Invariantes**:

- Sempre contém exatamente 81 elementos
- Índice `i` corresponde à célula na linha `Math.floor(i / 9)` e coluna `i % 9`
- Cada elemento é um `CellValue` válido

## Representação de Notas/Candidatos (Bitmask)

### Conceito

As notas (candidatos possíveis) de uma célula são representadas como um **bitmask de 9 bits**, onde cada bit representa um dígito de 1 a 9.

```
Bit:    8 7 6 5 4 3 2 1 0
Dígito: 9 8 7 6 5 4 3 2 1
```

### Exemplo

Se uma célula pode conter os dígitos 2, 5 e 7:

```
Binário:  0 0 1 0 1 0 0 1 0
Decimal:  82
```

### Operações de Bitmask

**Definidas em** `src/engine/bitmask.ts`:

```typescript
// Definir um bit (adicionar candidato)
function setBit(mask: number, bitIndex: number): number;

// Limpar um bit (remover candidato)
function clearBit(mask: number, bitIndex: number): number;

// Verificar se um bit está definido
function hasBit(mask: number, bitIndex: number): boolean;

// Contar bits definidos
function countBits(mask: number): number;

// Converter bitmask para array de dígitos
function bitsToDigits(mask: number): Digit[];

// Converter array de dígitos para bitmask
function digitsToBitmask(digits: Digit[]): number;
```

**Invariantes**:

- `bitIndex` sempre entre 0-8 (correspondendo aos dígitos 1-9)
- Bitmask sempre um inteiro não-negativo
- Apenas os 9 bits menos significativos são usados

## Estado do Jogo

### GameState

```typescript
interface GameState {
  board: CellValue[]; // Tabuleiro atual (81 células)
  given: boolean[]; // Células iniciais (fixas)
  notes: number[]; // Notas por célula (bitmasks)
  selected: number | null; // Índice da célula selecionada
  mode: "normal" | "note" | "investigator";
  difficulty: "easy" | "medium" | "hard" | "expert";
  mistakes: number; // Contador de erros
  hintsUsed: number; // Contador de dicas usadas
  startTime: number; // Timestamp de início
  elapsedTime: number; // Tempo decorrido (ms)
  isPaused: boolean; // Estado de pausa
  isComplete: boolean; // Jogo completo?
  solution: CellValue[]; // Solução do puzzle
  seed?: number; // Seed para geração
}
```

**Invariantes**:

- `board`, `given`, `notes` e `solution` têm exatamente 81 elementos
- `selected` é `null` ou um índice válido (0-80)
- `given[i] === true` implica `board[i] !== 0`
- `notes[i] === 0` se `board[i] !== 0`
- `mistakes >= 0`
- `hintsUsed >= 0`
- `startTime` e `elapsedTime` são timestamps/durações válidos

## Peers (Células Relacionadas)

Cada célula tem 20 peers (células relacionadas):

- 8 na mesma linha
- 8 na mesma coluna
- 4 no mesmo bloco 3x3 (excluindo linha e coluna)

**Definido em** `src/engine/peers.ts`:

```typescript
function getPeers(cellIndex: number): number[];
function rowOf(cellIndex: number): number;
function colOf(cellIndex: number): number;
function blockOf(cellIndex: number): number;
```

**Invariantes**:

- `getPeers(i)` sempre retorna array de 20 índices únicos
- Todos os índices retornados estão entre 0-80
- Nenhum peer é igual ao próprio `cellIndex`

## Técnicas de Solver

### TechniqueName

```typescript
type TechniqueName =
  | "naked-single"
  | "hidden-single-row"
  | "hidden-single-col"
  | "hidden-single-block"
  | "naked-pair"
  | "hidden-pair"
  | "pointing-pair"
  | "box-line-reduction"
  | "naked-triple"
  | "x-wing"
  | "swordfish";
```

### SolverStep

```typescript
interface SolverStep {
  techniqueName: TechniqueName;
  targetCells: number[]; // Células envolvidas
  digit?: Digit; // Dígito principal (se aplicável)
  digits?: Digit[]; // Múltiplos dígitos (pares, triplas)
  explanation: string; // Explicação em português
  placement?: {
    // Colocação de dígito
    cellIdx: number;
    digit: Digit;
  };
  eliminations?: Elimination[]; // Eliminações de candidatos
}
```

## Dificuldade

### Difficulty

```typescript
type Difficulty = "easy" | "medium" | "hard" | "expert";
```

A classificação de dificuldade é baseada em:

- Número de células dadas
- Técnicas necessárias para resolver
- Complexidade das técnicas

**Critérios** (definidos em `src/engine/difficulty.ts`):

- **Easy**: 36-45 células dadas, apenas singles
- **Medium**: 28-35 células dadas, singles + pairs
- **Hard**: 24-27 células dadas, técnicas intermediárias
- **Expert**: 17-23 células dadas, técnicas avançadas

## Validação

### Regras do Sudoku

1. Cada linha deve conter os dígitos 1-9 exatamente uma vez
2. Cada coluna deve conter os dígitos 1-9 exatamente uma vez
3. Cada bloco 3x3 deve conter os dígitos 1-9 exatamente uma vez

### Validação de Movimento

Um movimento é válido se:

- A célula não é uma célula dada (`given[i] === false`)
- O dígito não viola as regras do Sudoku
- O dígito está na solução (`board[i] === solution[i]`)

## Type Safety

O projeto usa TypeScript estrito para garantir:

- Tipos corretos em todas as operações
- Prevenção de erros em tempo de compilação
- Autocompletar e IntelliSense

### Exemplo de Type Safety

```typescript
// ✅ Correto
const digit: Digit = 5;
const cell: CellValue = 0;

// ❌ Erro de compilação
const digit: Digit = 0; // 0 não é um Digit
const cell: CellValue = 10; // 10 não é um CellValue
```

## Conversões Comuns

### Índice ↔ Linha/Coluna

```typescript
// Índice para linha e coluna
const row = Math.floor(index / 9);
const col = index % 9;

// Linha e coluna para índice
const index = row * 9 + col;
```

### Índice ↔ Bloco

```typescript
// Índice para bloco (0-8)
const block = Math.floor(row / 3) * 3 + Math.floor(col / 3);

// Bloco para linha/coluna inicial
const blockRow = Math.floor(block / 3) * 3;
const blockCol = (block % 3) * 3;
```
