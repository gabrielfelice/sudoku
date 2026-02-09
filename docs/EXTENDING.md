# Guia de Extensão do Projeto

Este guia mostra como estender o projeto Sudoku com novas funcionalidades.

## Adicionar Nova Técnica de Solver

### 1. Definir o Tipo da Técnica

**Arquivo**: `src/engine/solver-types.ts`

```typescript
type TechniqueName =
  | "naked-single"
  | "hidden-single-row"
  // ... técnicas existentes
  | "nova-tecnica"; // Adicionar aqui
```

### 2. Implementar a Função de Detecção

**Arquivo**: `src/engine/solver.ts`

```typescript
/**
 * Nova Técnica: Descrição
 * Explicação de como a técnica funciona
 */
function findNovaTecnica(
  board: CellValue[],
  candidates: CandidatesGrid
): SolverStep | null {
  // 1. Iterar sobre células/casas relevantes
  for (let idx = 0; idx < 81; idx++) {
    // 2. Verificar condições da técnica
    if (/* condição */) {
      // 3. Retornar passo com explicação
      return {
        techniqueName: 'nova-tecnica',
        targetCells: [idx],
        digit: /* dígito */,
        explanation: 'Explicação clara em português',
        placement: { cellIdx: idx, digit: /* dígito */ },
        // OU
        eliminations: [/* eliminações */],
      };
    }
  }

  return null;
}
```

### 3. Adicionar ao Solver Lógico

**Arquivo**: `src/engine/solver.ts`

```typescript
export function solveLogical(board: CellValue[]): LogicalSolverResult {
  // ... código existente

  while (iteration < maxIterations) {
    let step: SolverStep | null = null;

    step = findNakedSingle(currentBoard, candidates);
    if (!step) step = findHiddenSingleInRow(currentBoard, candidates);
    // ... outras técnicas
    if (!step) step = findNovaTecnica(currentBoard, candidates); // Adicionar

    // ... resto do código
  }
}
```

### 4. Adicionar ao Sistema de Dicas

**Arquivo**: `src/engine/solver.ts`

```typescript
export function getNextHint(
  board: CellValue[],
  userNotes?: number[],
): SolverStep | null {
  // ... código existente

  step = findNovaTecnica(board, candidates);
  if (step) return step;

  return null;
}
```

### 5. Criar Lição de Treinamento

**Arquivo**: `src/lib/lessons.ts`

```typescript
{
  id: "lesson_nova_tecnica",
  title: "Lição X: Nova Técnica",
  description: "Aprenda a usar a nova técnica...",
  objective: "Complete o puzzle usando a nova técnica...",
  puzzle: {
    given: [/* puzzle que requer a técnica */],
    solution: [/* solução */],
  },
  allowedTechniques: [
    "naked_single",
    "hidden_single",
    "nova_tecnica", // Adicionar
  ],
  prerequisites: ["lesson_anterior"],
}
```

## Adicionar Novo Tema

### 1. Definir Cores do Tema

**Arquivo**: `src/lib/useTheme.ts`

```typescript
export interface Theme {
  name: string;
  colors: {
    background: string;
    cellBg: string;
    cellGiven: string;
    cellSelected: string;
    cellHighlight: string;
    cellError: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    accent: string;
  };
}

export const THEMES: Theme[] = [
  // ... temas existentes
  {
    name: "novo-tema",
    colors: {
      background: "#...",
      cellBg: "#...",
      cellGiven: "#...",
      cellSelected: "#...",
      cellHighlight: "#...",
      cellError: "#...",
      textPrimary: "#...",
      textSecondary: "#...",
      border: "#...",
      accent: "#...",
    },
  },
];
```

### 2. Aplicar Tema nos Componentes

Os componentes já usam variáveis CSS que são atualizadas automaticamente:

```css
.cell {
  background: var(--cell-bg);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.cell.selected {
  background: var(--cell-selected);
}
```

### 3. Testar Tema

1. Abrir Settings Modal
2. Selecionar novo tema no preview
3. Verificar todas as telas
4. Salvar configurações

## Adicionar Nova Lição de Treinamento

### 1. Criar Puzzle Apropriado

```typescript
// Gerar ou criar manualmente um puzzle que:
// - Foca na técnica ensinada
// - Tem dificuldade apropriada
// - Tem solução única
const puzzle = {
  given: [
    /* 81 valores */
  ],
  solution: [
    /* 81 valores */
  ],
};
```

### 2. Adicionar à Lista de Lições

**Arquivo**: `src/lib/lessons.ts`

```typescript
export const LESSONS: Lesson[] = [
  // ... lições existentes
  {
    id: "lesson_nova",
    title: "Lição X: Título",
    description: "Descrição breve da lição",
    objective: "Objetivo claro e específico",
    puzzle: {
      given: puzzle.given,
      solution: puzzle.solution,
    },
    allowedTechniques: [
      "naked_single",
      "hidden_single",
      // Técnicas permitidas
    ],
    prerequisites: [
      "lesson_anterior", // Lições que devem ser completadas antes
    ],
  },
];
```

### 3. Testar Lição

1. Navegar para Training Hub
2. Verificar que a lição aparece bloqueada (se tem pré-requisitos)
3. Completar pré-requisitos
4. Iniciar lição
5. Verificar que dicas estão restritas às técnicas permitidas
6. Completar lição
7. Verificar que progresso é salvo

## Adicionar Nova Estatística ao Perfil

### 1. Estender Interface do Perfil

**Arquivo**: `src/lib/profile.ts`

```typescript
export interface PlayerProfile {
  // ... campos existentes
  novaEstatistica: number; // Adicionar
}

export function createDefaultProfile(): PlayerProfile {
  return {
    // ... valores padrão existentes
    novaEstatistica: 0, // Valor padrão
  };
}
```

### 2. Atualizar Lógica de Tracking

**Arquivo**: `src/lib/profile.ts`

```typescript
export function recordGameFinish(
  profile: PlayerProfile,
  sessionId: string,
  timeMs: number,
  mistakes: number,
  completed: boolean,
): PlayerProfile {
  // ... código existente

  // Calcular nova estatística
  const novaEstatistica = calcularNovaEstatistica(/* params */);

  return {
    ...profile,
    // ... outros campos
    novaEstatistica,
  };
}
```

### 3. Exibir na UI

**Arquivo**: `src/components/ProfilePage.tsx`

```typescript
<div className={styles.statRow}>
  <span className={styles.statLabel}>Nova Estatística:</span>
  <span className={styles.statValue}>
    {profile.novaEstatistica}
  </span>
</div>
```

## Adicionar Novo Modo de Jogo

### 1. Definir Tipo do Modo

**Arquivo**: `src/state/types.ts`

```typescript
type GameMode = "normal" | "note" | "investigator" | "novo-modo";
```

### 2. Adicionar Lógica no Reducer

**Arquivo**: `src/state/reducer.ts`

```typescript
case 'SET_MODE':
  return {
    ...state,
    mode: action.payload.mode,
    // Lógica específica do novo modo
  };

case 'SET_DIGIT':
  if (state.mode === 'novo-modo') {
    // Comportamento específico do novo modo
    return handleNovoModo(state, action.payload);
  }
  // ... comportamento padrão
```

### 3. Adicionar Toggle na UI

**Arquivo**: `src/components/ActionBar.tsx`

```typescript
<button
  onClick={() => dispatch({ type: 'SET_MODE', payload: { mode: 'novo-modo' } })}
  className={mode === 'novo-modo' ? styles.active : ''}
>
  Novo Modo
</button>
```

## Adicionar Nova Badge/Conquista

### 1. Definir Badge

**Arquivo**: `src/lib/profile.ts`

```typescript
export function checkAndAwardBadges(
  profile: PlayerProfile,
  session: GameSessionRecord
): { profile: PlayerProfile; newBadges: Badge[] } {
  const newBadges: Badge[] = [];

  // ... badges existentes

  // Nova badge
  if (/* condição */) {
    if (!profile.badges.some((b) => b.id === 'nova-badge')) {
      newBadges.push({
        id: 'nova-badge',
        name: 'Nome da Badge',
        description: 'Descrição da conquista',
        earnedAt: Date.now(),
      });
    }
  }

  // ... resto do código
}
```

### 2. Testar Badge

1. Criar condições para ganhar a badge
2. Verificar que badge aparece em VictoryModal
3. Verificar que badge aparece em ProfilePage
4. Verificar que badge não é concedida novamente

## Boas Práticas

### Type Safety

- Sempre use TypeScript estrito
- Defina tipos para novos dados
- Evite `any`

### Imutabilidade

- Nunca modifique estado diretamente
- Use spread operator ou métodos imutáveis
- Mantenha histórico para undo/redo

### Performance

- Use `useMemo` para cálculos pesados
- Use `useCallback` para funções passadas como props
- Evite re-renderizações desnecessárias

### Testes

- Teste lógica pura (engine) independentemente
- Teste componentes com casos extremos
- Verifique persistência de dados

### Documentação

- Comente código complexo
- Atualize documentação ao adicionar features
- Mantenha README atualizado

## Debugging

### Zustand DevTools

```typescript
import { devtools } from "zustand/middleware";

export const useGameStore = create(
  devtools(
    (set) => ({
      // ... store
    }),
    { name: "GameStore" },
  ),
);
```

### Console Logging

```typescript
// Adicionar logs temporários
console.log("Estado atual:", state);
console.log("Ação:", action);
```

### React DevTools

- Inspecionar componentes
- Ver props e state
- Identificar re-renderizações

## Recursos Adicionais

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Next.js Documentation](https://nextjs.org/docs)
