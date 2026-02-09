# Arquitetura do Projeto Sudoku

## Visão Geral

Este projeto Sudoku é construído com Next.js (App Router), TypeScript e Zustand para gerenciamento de estado. A arquitetura é dividida em camadas distintas para separar preocupações e facilitar a manutenção.

## Estrutura de Diretórios

```
src/
├── app/              # Next.js App Router (páginas e layouts)
├── components/       # Componentes React da UI
├── engine/           # Lógica pura do Sudoku (sem dependências React)
├── lib/              # Utilitários e helpers
└── state/            # Gerenciamento de estado (Zustand stores)
```

## Camadas da Arquitetura

### 1. Engine Layer (Lógica Pura)

**Localização**: `src/engine/`

A camada engine contém toda a lógica do jogo Sudoku em TypeScript puro, sem dependências de React ou Next.js. Isso permite:

- Testabilidade independente
- Reutilização em diferentes contextos
- Separação clara de responsabilidades

**Módulos principais**:

- `types.ts` - Tipos fundamentais (`CellValue`, `Digit`, `Board`)
- `peers.ts` - Cálculo de peers (células relacionadas)
- `bitmask.ts` - Operações com bitmasks para candidatos/notas
- `solver.ts` - Algoritmos de resolução lógica
- `generator.ts` - Geração de puzzles
- `difficulty.ts` - Classificação de dificuldade
- `uniqueness.ts` - Verificação de solução única
- `explain.ts` - Explicações de erros e dicas

### 2. State Layer (Gerenciamento de Estado)

**Localização**: `src/state/`

Usa Zustand para gerenciamento de estado global e local:

- **`store.ts`** - Store principal do jogo
  - Estado do tabuleiro atual
  - Histórico de ações (undo/redo)
  - Configurações do jogo
  - Modo de jogo (normal, investigador, pausa)

- **`profileStore.ts`** - Store do perfil do jogador
  - Estatísticas por dificuldade
  - Histórico de jogos
  - Badges e conquistas
  - Progresso em lições

- **`customizationStore.ts`** - Store de customização
  - Preview de temas
  - Configurações temporárias
  - Estado de edição

- **`reducer.ts`** - Reducer puro para ações do jogo
  - Processa ações do usuário
  - Atualiza estado de forma imutável
  - Mantém histórico para undo/redo

### 3. UI Layer (Componentes React)

**Localização**: `src/components/`

Componentes React responsáveis pela interface do usuário:

**Componentes principais**:

- `SudokuBoard.tsx` - Grid 9x9 do Sudoku
- `SudokuCell.tsx` - Célula individual com notas
- `Keypad.tsx` - Teclado numérico
- `ActionBar.tsx` - Botões de ação (desfazer, apagar, dica)
- `TopBar.tsx` - Barra superior (timer, pause, settings)

**Modais e overlays**:

- `NewGameModal.tsx` - Seleção de dificuldade
- `VictoryModal.tsx` - Tela de vitória com estatísticas
- `HintModal.tsx` - Painel de dicas
- `SettingsModal.tsx` - Configurações do jogo
- `PauseOverlay.tsx` - Tela de pausa

**Sistema educacional**:

- `TutorialTour.tsx` - Tour guiado para novos jogadores
- `TutorialIllustrations.tsx` - Componentes visuais do tutorial
- `TrainingHub.tsx` - Hub de lições de treinamento
- `LessonRunner.tsx` - Executor de lições

**Perfil e histórico**:

- `ProfilePage.tsx` - Página de perfil com estatísticas
- `GameFilters.tsx` - Filtros e ordenação de jogos

### 4. Library Layer (Utilitários)

**Localização**: `src/lib/`

Funções utilitárias e helpers:

- `persistence.ts` - Salvar/carregar estado do jogo
- `profile.ts` - Gerenciamento de perfil do jogador
- `lessons.ts` - Definição e gerenciamento de lições
- `puzzles.ts` - Catálogo de puzzles pré-definidos
- `storage.ts` - Abstração de localStorage
- `time.ts` - Utilitários de tempo/cronômetro
- `sounds.ts` - Sistema de sons do jogo
- `useTheme.ts` - Hook de temas
- `config-storage.ts` - Persistência de configurações

## Fluxo de Dados

```
Usuário Interage
    ↓
Componente React dispara ação
    ↓
Store Zustand recebe ação
    ↓
Reducer processa ação (lógica pura)
    ↓
Engine valida/calcula (se necessário)
    ↓
Estado atualizado
    ↓
Componentes re-renderizam
```

## Princípios de Design

### 1. Separação de Preocupações

- Engine não conhece React
- Componentes não contêm lógica de negócio
- Estado gerenciado centralmente

### 2. Imutabilidade

- Todas as atualizações de estado são imutáveis
- Histórico de ações mantido para undo/redo

### 3. Type Safety

- TypeScript estrito em todo o projeto
- Tipos compartilhados entre camadas

### 4. Performance

- Memoização com `useMemo` e `useCallback`
- Atualizações granulares de estado
- Renderização otimizada de células

## Persistência

### LocalStorage

- Estado do jogo atual
- Perfil do jogador
- Configurações
- Histórico de jogos

### Schema Versioning

- Versionamento de dados para migrações
- Fallback para valores padrão em caso de erro

## Temas e Customização

O sistema de temas permite personalização completa:

- Cores do tabuleiro
- Estilos de célula
- Efeitos visuais
- Preview em tempo real antes de salvar

## Próximos Passos

Para entender melhor o projeto, consulte:

- [CORE_TYPES.md](./CORE_TYPES.md) - Tipos fundamentais
- [GAME_FLOW.md](./GAME_FLOW.md) - Fluxo detalhado do jogo
- [PUZZLE_GENERATION.md](./PUZZLE_GENERATION.md) - Geração e solver
- [EXTENDING.md](./EXTENDING.md) - Como estender o projeto
