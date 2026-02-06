# Sudoku MVP - Milestone A

Jogo de Sudoku jogável implementado com Next.js (App Router), TypeScript, Tailwind CSS e Zustand.

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
│   └── time.ts      # Formatação de tempo
├── components/      # Componentes React
│   ├── TopBar.tsx
│   ├── SudokuBoard.tsx
│   ├── SudokuCell.tsx
│   ├── ActionBar.tsx
│   ├── Keypad.tsx
│   └── PauseOverlay.tsx
└── app/             # Next.js App Router
    ├── layout.tsx
    ├── page.tsx
    └── globals.css
```

## Funcionalidades Implementadas

### Layout

- **TopBar**: Contador de erros, cronômetro (mm:ss), botão Pause/Retomar
- **Tabuleiro**: Grid 9x9 com bordas mais grossas nas divisões de blocos 3x3
- **ActionBar**: Borracha, Desfazer, Anotação (toggle), Investigador (toggle), Dica (placeholder)
- **Keypad**: Números 1-9 (oculta números que aparecem 9 vezes no tabuleiro)

### Interação

- **Seleção**: Clique na célula para selecionar
- **Modo Resposta**: Clique no número do keypad para inserir resposta
- **Modo Anotação**: Toggle ativo + clique no número para alternar nota
- **Modo Investigador**: Navegação sem alterações (keypad desabilitado)
- **Células Given**: Imutáveis (pré-preenchidas)
- **Auto-lock**: Respostas corretas travam a célula
- **Validação**: Respostas erradas incrementam contador de erros
- **Auto-remove notas**: Quando acerta, remove o dígito das notas dos peers

### Visual/UX

- **Cores de células**:
  - Selecionada: azul escuro (bg-blue-200)
  - Peers: azul claro (bg-blue-50)
  - Demais: branco
- **Cores de números**:
  - Given: preto negrito
  - Correto: azul (text-blue-600)
  - Errado: vermelho (text-red-600)
- **Notas**: Mini-grade 3x3 dentro da célula vazia
- **Destaque same-number**: Ring roxo em células com mesmo número
- **Notas destacadas**: Negrito roxo em notas que correspondem ao número selecionado
- **Pause**: Overlay escuro cobrindo o tabuleiro

### Ações

- **Borracha**: Apaga todas as notas da célula selecionada
- **Desfazer**: Reverte última ação (com patches, não snapshot completo)
- **Anotação**: Toggle com badge "ANOTAR" quando ativo
- **Investigador**: Toggle com badge "INVESTIGAR" quando ativo
- **Dica**: Placeholder (alert) para Milestone C

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

## Fluxo de Teste Manual

1. **Iniciar o jogo**: Abra http://localhost:3000
   - Deve aparecer um tabuleiro com números pré-preenchidos (pretos)
   - Cronômetro deve estar rodando
   - Contador de erros em 0

2. **Selecionar célula vazia**: Clique em uma célula vazia
   - Célula fica azul escuro
   - Células da mesma linha/coluna/bloco ficam azul claro

3. **Inserir resposta correta**: Com célula selecionada, clique em um número correto no keypad
   - Número aparece em azul
   - Célula trava (não pode mais alterar)
   - Notas dos peers são removidas automaticamente

4. **Inserir resposta errada**: Clique em um número incorreto
   - Número aparece em vermelho
   - Contador de erros incrementa

5. **Modo Anotação**: Clique no botão "Anotação"
   - Botão fica verde com badge "ANOTAR"
   - Clique em números para alternar notas na célula selecionada
   - Notas aparecem em mini-grade 3x3

6. **Modo Investigador**: Clique no botão "Investigador"
   - Botão fica amarelo com badge "INVESTIGAR"
   - Keypad e ações ficam desabilitados
   - Pode navegar e selecionar células sem alterar

7. **Destaque same-number**: Selecione uma célula preenchida
   - Todas as células com o mesmo número ganham ring roxo
   - Notas com esse número ficam em negrito roxo

8. **Borracha**: Selecione célula com notas e clique "Borracha"
   - Todas as notas da célula são apagadas

9. **Desfazer**: Faça algumas ações e clique "Desfazer"
   - Última ação é revertida
   - Contador de erros ajusta se necessário

10. **Pausar**: Clique "Pausar"
    - Cronômetro para
    - Overlay escuro cobre o tabuleiro
    - Clique "Retomar" para continuar

11. **Keypad dinâmico**: Preencha 9 células com o mesmo número
    - Esse número desaparece do keypad

12. **Dica**: Clique "Dica"
    - Alert com mensagem placeholder

## Tecnologias

- **Next.js 13** (App Router)
- **TypeScript** (tipagem forte)
- **Tailwind CSS** (estilização)
- **Zustand** (gerenciamento de estado)
- **React 18**

## Próximos Passos (Milestone B/C)

- Geração de puzzles
- Dificuldades (easy/medium/hard)
- Dica real (revelar célula)
- Persistência local
- Treinamento/perfil
- Live conflict highlight (opcional)
