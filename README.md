# Sudoku MVP - Milestone B

Jogo de Sudoku completo implementado com Next.js (App Router), TypeScript, Tailwind CSS e Zustand.

## Estrutura do Projeto

```
src/
├── engine/          # Lógica pura do Sudoku (independente de React)
│   ├── types.ts     # Tipos e constantes
│   ├── peers.ts     # Cálculo de peers (linha/coluna/bloco)
│   ├── bitmask.ts   # Gerenciamento de notas via bitmask
│   └── index.ts     # Barrel export
├── state/           # Estado global com Zustand
│   ├── types.ts     # Tipos do estado do jogo
│   ├── reducer.ts   # Reducer puro com toda a lógica
│   └── store.ts     # Store Zustand
├── lib/             # Utilitários
│   ├── puzzles.ts   # Puzzle hardcoded para MVP
│   ├── time.ts      # Formatação de tempo
│   └── storage.ts   # Persistência localStorage (NOVO)
├── components/      # Componentes React
│   ├── TopBar.tsx
│   ├── SudokuBoard.tsx
│   ├── SudokuCell.tsx
│   ├── ActionBar.tsx
│   ├── Keypad.tsx
│   ├── PauseOverlay.tsx
│   ├── Toast.tsx              # Toast notifications (NOVO)
│   ├── ContinueGameModal.tsx  # Modal continuar/novo jogo (NOVO)
│   └── KeyboardController.tsx # Controles de teclado (NOVO)
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

## Próximos Passos (Milestone C)

- Geração de puzzles
- Dificuldades (easy/medium/hard)
- Dica real (revelar célula)
- Estatísticas e perfil
- Live conflict highlight
- Temas visuais

## Critérios de Aceitação ✅

- [x] Recarregar página oferece continuar e estado volta idêntico
- [x] Teclado funciona com segurança (respeita locked/given/paused/inspect)
- [x] Undo cobre: answer, note toggle, erase notes, clear cell
- [x] UI mais clara com badge de modo sempre visível
- [x] Sem regressões do Milestone A
- [x] Toast substitui alert()
- [x] ARIA roles e labels para acessibilidade
- [x] Responsivo mobile
- [x] Ícone de cadeado em células locked

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
