# Sudoku MVP - Milestone C

Jogo de Sudoku completo implementado com Next.js (App Router), TypeScript, Tailwind CSS e Zustand.

## Estrutura do Projeto

```
src/
├── engine/          # Lógica pura do Sudoku (independente de React)
│   ├── types.ts     # Tipos e constantes
│   ├── peers.ts     # Cálculo de peers (linha/coluna/bloco)
│   ├── bitmask.ts   # Gerenciamento de notas via bitmask
│   ├── solver-types.ts   # Tipos para solver (NOVO)
│   ├── solver.ts         # Solver lógico com técnicas (NOVO)
│   ├── uniqueness.ts     # Verificação de solução única (NOVO)
│   ├── generator.ts      # Geração de puzzles (NOVO)
│   ├── difficulty.ts     # Classificação de dificuldade (NOVO)
│   └── index.ts     # Barrel export
├── state/           # Estado global com Zustand
│   ├── types.ts     # Tipos do estado do jogo
│   ├── reducer.ts   # Reducer puro com toda a lógica
│   └── store.ts     # Store Zustand
├── lib/             # Utilitários
│   ├── puzzles.ts   # Puzzle hardcoded para MVP
│   ├── time.ts      # Formatação de tempo
│   └── storage.ts   # Persistência localStorage
├── components/      # Componentes React
│   ├── TopBar.tsx
│   ├── SudokuBoard.tsx
│   ├── SudokuCell.tsx
│   ├── ActionBar.tsx
│   ├── Keypad.tsx
│   ├── PauseOverlay.tsx
│   ├── Toast.tsx
│   ├── ContinueGameModal.tsx
│   ├── KeyboardController.tsx
│   ├── HintModal.tsx              # Modal de dicas (NOVO)
│   ├── ErrorExplanationModal.tsx  # Modal de explicação (NOVO)
│   └── DifficultySelector.tsx     # Seletor de dificuldade (NOVO)
└── app/             # Next.js App Router
    ├── layout.tsx
    ├── page.tsx
    └── globals.css
```

## Funcionalidades Implementadas

### Milestone A (Base)

- **Layout**: TopBar, Tabuleiro 9x9, ActionBar, Keypad
- **Interação**: Seleção, Modo Resposta, Modo Anotação, Modo Investigador
- **Visual/UX**: Cores de células, destaque de peers, same-number highlight
- **Ações**: Borracha, Desfazer, Pause/Retomar

### Milestone B (Novo) ✨

#### 1. Persistência Local e Retomar Jogo

- **Auto-save**: Estado do jogo salvo automaticamente no localStorage (debounced 500ms)
- **Schema versioning**: Validação de versão do save (schemaVersion)
- **Continuar ou Novo Jogo**: Modal ao abrir a página se existir jogo salvo
- **Dados salvos**: puzzle, values, meta, mistakes, elapsedMs
- **Fallback seguro**: Se versão incompatível, limpa save antigo

#### 2. Controles por Teclado (Desktop)

Quando uma célula estiver selecionada:

- **Dígitos 1-9**: Inserir resposta (answer mode) ou alternar nota (note mode)
- **Backspace/Delete**: Limpar célula (mantém notas)
- **Setas (↑↓←→)**: Mover seleção com wrap
- **N**: Toggle modo anotação
- **I**: Toggle modo investigador
- **U ou Ctrl+Z**: Desfazer
- **Esc**: Sair de modo especial → limpar seleção

**Regras de segurança**:

- Teclado desabilitado quando paused
- Não permite alterar células locked ou given
- Modo inspect bloqueia input de dígitos

#### 3. Limpar Célula

- **Ação CLEAR_CELL**: Apaga valor da célula selecionada
- **Mantém notas**: Notas não são removidas ao limpar
- **Botão "Limpar"**: Disponível no ActionBar (vermelho)
- **Atalho**: Backspace ou Delete
- **Undo suportado**: Pode desfazer clear

#### 4. Melhorias de UI/Clareza dos Modos

- **Badge de modo grande**: "MODO: RESPONDER / ANOTAR / INVESTIGAR" sempre visível
- **Botões com estado pressed**: Ring colorido quando modo ativo
  - Responder: azul
  - Anotar: verde
  - Investigar: amarelo
- **Borda da célula por modo**: Ring colorido na célula selecionada
  - Answer: ring-4 ring-blue-500
  - Note: ring-4 ring-green-500
  - Inspect: ring-4 ring-yellow-500
- **Ícone de cadeado**: Células locked (não given) mostram 🔒 discreto
- **Tooltips**: Todos os botões têm title com atalhos de teclado

#### 5. Acessibilidade e Responsividade

- **ARIA roles**: Board com role="grid", células com role="gridcell"
- **ARIA labels**: Células com aria-label descritivo
- **Foco navegável**: Indicação visual de foco
- **Toast não-intrusivo**: Substituiu alert() por componente Toast
- **Responsivo**: Layout flex-wrap para mobile
- **Semântica**: Uso de `<button>` com labels apropriados

#### 6. Sistema de Toast

- **Componente Toast**: Notificações não-intrusivas
- **Tipos**: info, success, warning, error (cores diferentes)
- **Auto-dismiss**: Desaparece após 3s com animação
- **Posição**: Fixed top-center
- **Exemplos**:
  - "Jogo retomado!" (success)
  - "Novo jogo iniciado!" (success)
  - "Dica: implementar no Milestone C" (info)

### Milestone C (Novo) ✨

#### 1. Geração de Puzzles com Solução Única

- **Gerador de solução**: Backtracking randomizado para criar board completo
- **Digging com uniqueness**: Remove números garantindo solução única
- **Cache local**: 5 puzzles pré-gerados por dificuldade para carregamento instantâneo
- **Seed opcional**: Permite reproduzir puzzles específicos
- **API**: `generatePuzzle(difficulty, seed?)` e `generatePuzzleWithCache(difficulty)`

#### 2. Níveis de Dificuldade

- **4 níveis**: Easy, Medium, Hard, Expert
- **Classificação inteligente**: Baseada em solver lógico
- **Critérios estáveis**:
  - **Easy**: Apenas naked/hidden singles, ≥36 givens, ≤30 passos
  - **Medium**: Inclui naked pairs, 30-35 givens, 30-50 passos
  - **Hard**: Técnicas avançadas, 25-29 givens, >50 passos
  - **Expert**: Muitas técnicas avançadas, <25 givens, >60 passos
- **Seletor visual**: Segmented control com cores (verde/amarelo/laranja/vermelho)

#### 3. Solver Lógico com Rastreio

- **5 técnicas implementadas**:
  1. Naked Single - Célula com apenas um candidato
  2. Hidden Single (Row) - Dígito só pode estar em uma célula da linha
  3. Hidden Single (Col) - Dígito só pode estar em uma célula da coluna
  4. Hidden Single (Block) - Dígito só pode estar em uma célula do bloco
  5. Naked Pair - Duas células com mesmos 2 candidatos (eliminação)
- **Rastreamento de passos**: Cada passo registrado com técnica, células, explicação
- **Candidatos via bitmask**: Operações bit a bit para performance
- **API**: `solveLogical(board)` retorna `{ solved, steps, finalBoard, candidates }`

#### 4. Sistema de Dicas

- **Botão "💡 Dica"**: Obtém próximo passo lógico aplicável
- **Modal de dica**: Mostra técnica, explicação em pt-BR, destaque visual
- **Considera notas do usuário**: Dica leva em conta candidatos anotados
- **Aplicar dica**: Botão para preencher automaticamente (placement)
- **Destaque roxo**: Células envolvidas destacadas em roxo
- **API**: `getNextHint(board, userNotes?)`

#### 5. Explicação de Erros

- **Botão "❌ Explicação"**: Aparece quando célula errada está selecionada
- **Animação pulse**: Chama atenção para o botão
- **Modal explicativo**: Mostra tipo de conflito (linha/coluna/bloco)
- **Não revela solução**: Apenas explica por que está errado
- **Dica adicional**: Sugere uso de notas para evitar erros

#### 6. UI de Dificuldade e Seed

- **Seletor de dificuldade**: Segmented control acima do tabuleiro
- **Display de seed**: Mostra seed do puzzle atual (quando disponível)
- **Novo jogo**: Gera puzzle na dificuldade selecionada
- **Persistência**: Preferência de dificuldade salva no estado

## Como Executar

### Desenvolvimento

```bash
npm run dev
```

Acesse http://localhost:3000

### Build de Produção

```bash
npm run build
npm start
```

### Formatação de Código

```bash
npm run lint:check  # Verificar formatação
npm run lint:fix    # Corrigir formatação
```

## Fluxo de Teste Manual - Milestone B

### 1. Persistência e Retomar

1. **Primeiro acesso**: Abra http://localhost:3000
   - Deve iniciar jogo normalmente (sem modal)

2. **Jogar um pouco**: Preencha algumas células, faça anotações
   - Estado é salvo automaticamente (debounced 500ms)

3. **Recarregar página**: F5 ou fechar e reabrir
   - Modal "Jogo Salvo Encontrado" aparece
   - Opções: "Continuar" ou "Novo Jogo"

4. **Continuar**: Clique "Continuar"
   - Estado volta exatamente como estava
   - Timer continua do ponto anterior
   - Erros preservados
   - Toast "Jogo retomado!" aparece

5. **Novo Jogo**: Clique "Novo Jogo"
   - Tabuleiro reseta
   - Timer volta a 00:00
   - Erros zerados
   - Toast "Novo jogo iniciado!" aparece

### 2. Controles de Teclado

1. **Selecionar célula**: Clique em uma célula vazia

2. **Digitar número**: Pressione tecla 1-9
   - Número inserido como resposta (modo answer)

3. **Modo anotação**: Pressione N
   - Badge muda para "MODO: ANOTAR"
   - Borda da célula fica verde
   - Pressione 1-9 para alternar notas

4. **Navegar com setas**: Use ↑↓←→
   - Seleção move entre células com wrap

5. **Limpar célula**: Pressione Backspace ou Delete
   - Valor apagado, notas mantidas

6. **Desfazer**: Pressione U ou Ctrl+Z
   - Última ação revertida

7. **Modo investigador**: Pressione I
   - Badge muda para "MODO: INVESTIGAR"
   - Borda amarela
   - Dígitos não funcionam

8. **Sair de modo**: Pressione Esc
   - Volta para modo answer
   - Pressione Esc novamente para limpar seleção

### 3. Botão Limpar

1. **Selecionar célula preenchida**: Clique em célula com número errado

2. **Limpar**: Clique botão "Limpar" (vermelho)
   - Número removido
   - Notas preservadas

3. **Desfazer**: Clique "Desfazer"
   - Número volta

### 4. Clareza Visual dos Modos

1. **Badge de modo**: Sempre visível acima dos botões
   - Azul: MODO: RESPONDER
   - Verde: MODO: ANOTAR
   - Amarelo: MODO: INVESTIGAR

2. **Botões com ring**: Modo ativo tem ring colorido

3. **Borda da célula**: Cor muda conforme modo

4. **Ícone de cadeado**: Células corretas mostram 🔒 no canto

### 5. Botão Novo Jogo

1. **Durante o jogo**: Clique "Novo Jogo" (laranja)
   - Tabuleiro reseta
   - Toast "Novo jogo iniciado!"
   - Save anterior é limpo

### 6. Toast Notifications

1. **Dica**: Clique "Dica"
   - Toast azul: "Dica: implementar no Milestone C"
   - Desaparece após 3s

2. **Novo jogo**: Clique "Novo Jogo"
   - Toast verde: "Novo jogo iniciado!"

## Tecnologias

- **Next.js 13** (App Router)
- **TypeScript** (tipagem forte)
- **Tailwind CSS** (estilização)
- **Zustand** (gerenciamento de estado)
- **React 18**
- **localStorage** (persistência)

## Arquitetura de Estado

### Ações Novas (Milestone B)

```typescript
| { type: "CLEAR_CELL" }
| { type: "NEW_GAME"; given: CellValue[]; solution: CellValue[] }
| { type: "LOAD_SAVED_GAME"; given; solution; values; meta; mistakes; elapsedMs }
| { type: "SET_TOAST"; message: string; toastType: "info" | "success" | "warning" | "error" }
| { type: "CLEAR_TOAST" }
```

### Estado Novo

```typescript
interface GameState {
  // ... campos existentes
  toast: ToastState | null; // NOVO
}

interface ToastState {
  message: string;
  type: "info" | "success" | "warning" | "error";
}
```

### Storage

```typescript
interface SavedGame {
  schemaVersion: number;
  timestamp: number;
  puzzle: { given; solution };
  state: { values; meta; mistakes; elapsedMs };
}
```

## Decisões de Design

### 1. Limpar vs Borracha

- **Limpar (Backspace/Delete)**: Remove valor, mantém notas
- **Borracha**: Remove todas as notas, mantém valor

### 2. Persistência

- **Debounce 500ms**: Evita writes excessivos
- **Schema versioning**: Permite migração futura
- **Validação**: Estrutura validada ao carregar

### 3. Keyboard UX

- **Wrap nas setas**: Facilita navegação
- **Esc duplo**: Primeiro sai de modo, depois limpa seleção
- **Segurança**: Respeita locked/given/paused

### 4. Toast vs Alert

- **Toast**: Não bloqueia UI, melhor UX
- **Auto-dismiss**: Usuário não precisa fechar
- **Tipos visuais**: Cor indica severidade

## Próximos Passos (Milestone D - Sugestão)

- Mais técnicas de solver (X-Wing, Swordfish, XY-Wing)
- Compartilhamento de puzzles via URL/seed
- Estatísticas e histórico de jogos
- Tutorial interativo
- Achievements e gamificação
- Temas visuais customizáveis

## Critérios de Aceitação ✅

### Milestone A & B

- [x] Recarregar página oferece continuar e estado volta idêntico
- [x] Teclado funciona com segurança (respeita locked/given/paused/inspect)
- [x] Undo cobre: answer, note toggle, erase notes, clear cell
- [x] UI mais clara com badge de modo sempre visível
- [x] Sem regressões do Milestone A
- [x] Toast substitui alert()
- [x] ARIA roles e labels para acessibilidade
- [x] Responsivo mobile
- [x] Ícone de cadeado em células locked

### Milestone C

- [x] Usuário pode escolher dificuldade e gerar novo puzzle
- [x] Puzzle gerado tem solução única
- [x] Puzzle é solucionável
- [x] Botão "Dica" produz explicação em português
- [x] Células são destacadas durante dica
- [x] Botão "Explicação" aparece ao selecionar célula errada
- [x] Explicação de erro não revela solução
- [x] Sem regressões dos milestones anteriores
- [x] Performance aceitável (geração <2s, dica <100ms)

## Arquivos Criados/Modificados

### Criados

- `src/lib/storage.ts` - Persistência localStorage
- `src/components/Toast.tsx` - Notificações toast
- `src/components/ContinueGameModal.tsx` - Modal continuar/novo
- `src/components/KeyboardController.tsx` - Controles de teclado

### Modificados

- `src/state/types.ts` - Adicionado ToastState
- `src/state/reducer.ts` - Novas ações (CLEAR_CELL, NEW_GAME, etc)
- `src/components/ActionBar.tsx` - Botões Limpar e Novo Jogo, badge de modo
- `src/components/SudokuCell.tsx` - Ícone de cadeado, borda por modo, ARIA
- `src/components/SudokuBoard.tsx` - ARIA role="grid"
- `src/app/page.tsx` - Integração de persistência e keyboard
- `src/app/globals.css` - Animação fadeIn

## Atalhos de Teclado (Resumo)

| Tecla            | Ação                           |
| ---------------- | ------------------------------ |
| 1-9              | Inserir número / Alternar nota |
| Backspace/Delete | Limpar célula                  |
| ↑↓←→             | Mover seleção                  |
| N                | Toggle modo anotação           |
| I                | Toggle modo investigador       |
| U ou Ctrl+Z      | Desfazer                       |
| Esc              | Sair de modo / Limpar seleção  |

---

**Milestone B Completo!** 🎉

Jogo agora tem persistência, controles de teclado completos, UX melhorada e acessibilidade básica.
