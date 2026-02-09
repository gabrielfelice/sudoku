# Fluxo do Jogo: Input → Reducer → Render

## Visão Geral

O fluxo de dados no jogo Sudoku segue um padrão unidirecional:

```
Entrada do Usuário → Ação → Reducer → Novo Estado → Re-renderização
```

## 1. Entrada do Usuário

### Tipos de Entrada

#### Seleção de Célula

- **Origem**: Clique em `SudokuCell` ou navegação por teclado
- **Ação**: `SELECT_CELL`
- **Payload**: `{ cellIndex: number }`

#### Inserção de Dígito

- **Origem**: Clique em `Keypad` ou tecla numérica (1-9)
- **Ação**: `SET_DIGIT` ou `TOGGLE_NOTE`
- **Payload**: `{ digit: Digit }`
- **Comportamento**: Depende do modo atual (normal/note)

#### Apagar

- **Origem**: Botão de apagar ou tecla Delete/Backspace
- **Ação**: `CLEAR_CELL`
- **Payload**: `{}`

#### Desfazer/Refazer

- **Origem**: Botões de undo/redo ou Ctrl+Z/Ctrl+Y
- **Ação**: `UNDO` ou `REDO`
- **Payload**: `{}`

#### Dica

- **Origem**: Botão de dica
- **Ação**: `REQUEST_HINT`
- **Payload**: `{}`

## 2. Processamento de Ações (Reducer)

### Localização

`src/state/reducer.ts`

### Estrutura do Reducer

```typescript
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SELECT_CELL":
      return handleSelectCell(state, action.payload);
    case "SET_DIGIT":
      return handleSetDigit(state, action.payload);
    case "TOGGLE_NOTE":
      return handleToggleNote(state, action.payload);
    case "CLEAR_CELL":
      return handleClearCell(state);
    case "UNDO":
      return handleUndo(state);
    case "REDO":
      return handleRedo(state);
    // ... outros casos
  }
}
```

### Exemplo: SET_DIGIT

```typescript
function handleSetDigit(
  state: GameState,
  payload: { digit: Digit },
): GameState {
  const { selected, board, given, solution } = state;

  // 1. Validar
  if (selected === null) return state;
  if (given[selected]) return state;

  // 2. Criar novo estado
  const newBoard = [...board];
  newBoard[selected] = payload.digit;

  // 3. Verificar erro
  const isCorrect = payload.digit === solution[selected];
  const newMistakes = isCorrect ? state.mistakes : state.mistakes + 1;

  // 4. Limpar notas
  const newNotes = [...state.notes];
  newNotes[selected] = 0;

  // 5. Verificar conclusão
  const isComplete = newBoard.every((v, i) => v === solution[i]);

  // 6. Retornar novo estado
  return {
    ...state,
    board: newBoard,
    notes: newNotes,
    mistakes: newMistakes,
    isComplete,
  };
}
```

### Princípios do Reducer

1. **Imutabilidade**: Nunca modifica o estado diretamente
2. **Pureza**: Sem efeitos colaterais
3. **Previsibilidade**: Mesma entrada → mesma saída

## 3. Histórico (Undo/Redo)

### Estrutura

```typescript
interface HistoryState {
  past: GameState[];
  present: GameState;
  future: GameState[];
}
```

### Fluxo de Undo/Redo

```
Ação Normal:
  past ← [...past, present]
  present ← newState
  future ← []

Undo:
  past ← past.slice(0, -1)
  present ← past[past.length - 1]
  future ← [present, ...future]

Redo:
  past ← [...past, present]
  present ← future[0]
  future ← future.slice(1)
```

## 4. Atualização de Estado (Zustand)

### Store Principal

`src/state/store.ts`

```typescript
interface GameStore {
  state: GameState;
  history: HistoryState;
  dispatch: (action: GameAction) => void;
  // ... outros métodos
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: initialState,
  history: { past: [], present: initialState, future: [] },

  dispatch: (action) => {
    const currentState = get().state;
    const newState = gameReducer(currentState, action);

    // Atualizar histórico
    const { past, present } = get().history;
    const newHistory = {
      past: [...past, present],
      present: newState,
      future: [],
    };

    set({ state: newState, history: newHistory });
  },
}));
```

## 5. Re-renderização

### Seletores Otimizados

```typescript
// ✅ Bom: Seletor específico
const selected = useGameStore((s) => s.state.selected);

// ❌ Ruim: Seleciona todo o estado
const state = useGameStore((s) => s.state);
```

### Memoização

```typescript
// Componente SudokuBoard
const SudokuBoard = () => {
  const board = useGameStore((s) => s.state.board);
  const selected = useGameStore((s) => s.state.selected);

  // Memoizar células para evitar re-renderização desnecessária
  const cells = useMemo(() => {
    return board.map((value, index) => (
      <SudokuCell
        key={index}
        index={index}
        value={value}
        isSelected={selected === index}
      />
    ));
  }, [board, selected]);

  return <div className="board">{cells}</div>;
};
```

## 6. Efeitos Colaterais

### Persistência

```typescript
// Salvar estado após cada ação
useEffect(() => {
  saveGameState(state);
}, [state]);
```

### Timer

```typescript
// Atualizar tempo decorrido
useEffect(() => {
  if (isPaused || isComplete) return;

  const interval = setInterval(() => {
    setElapsedTime((prev) => prev + 1000);
  }, 1000);

  return () => clearInterval(interval);
}, [isPaused, isComplete]);
```

### Sons

```typescript
// Tocar som após ação
useEffect(() => {
  if (lastAction === "SET_DIGIT") {
    playSound("place");
  } else if (lastAction === "CLEAR_CELL") {
    playSound("erase");
  }
}, [lastAction]);
```

## 7. Fluxo Completo (Exemplo)

### Usuário insere dígito 5

```
1. Usuário clica no botão "5" do Keypad
   ↓
2. Keypad dispara: dispatch({ type: 'SET_DIGIT', payload: { digit: 5 } })
   ↓
3. Reducer processa ação:
   - Valida célula selecionada
   - Cria novo board com dígito 5
   - Verifica se está correto
   - Atualiza contador de erros (se necessário)
   - Limpa notas da célula
   - Verifica se o jogo está completo
   ↓
4. Zustand atualiza estado:
   - Adiciona estado anterior ao histórico
   - Define novo estado como presente
   - Limpa future (histórico de redo)
   ↓
5. Componentes re-renderizam:
   - SudokuBoard detecta mudança em board
   - SudokuCell[selected] re-renderiza com novo valor
   - ActionBar atualiza contador de erros
   ↓
6. Efeitos colaterais:
   - saveGameState() persiste no localStorage
   - playSound('place') toca som
   - Se completo, dispara VictoryModal
```

## 8. Otimizações

### Evitar Re-renderizações Desnecessárias

```typescript
// Usar React.memo para componentes puros
const SudokuCell = React.memo(
  ({ index, value, isSelected }) => {
    // ...
  },
  (prevProps, nextProps) => {
    return (
      prevProps.value === nextProps.value &&
      prevProps.isSelected === nextProps.isSelected
    );
  },
);
```

### Batch Updates

Zustand automaticamente agrupa atualizações de estado, mas você pode forçar:

```typescript
// Múltiplas ações em uma única atualização
set((state) => ({
  ...state,
  board: newBoard,
  notes: newNotes,
  mistakes: newMistakes,
}));
```

## 9. Debugging

### Zustand DevTools

```typescript
import { devtools } from "zustand/middleware";

export const useGameStore = create(
  devtools(
    (set, get) => ({
      // ... store implementation
    }),
    { name: "GameStore" },
  ),
);
```

### Logging de Ações

```typescript
dispatch: (action) => {
  console.log('Action:', action.type, action.payload);
  const newState = gameReducer(get().state, action);
  console.log('New State:', newState);
  set({ state: newState });
},
```
