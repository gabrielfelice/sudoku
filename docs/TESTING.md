# Guia de Testes - Milestone B

## Passo a Passo para Testar Todas as Funcionalidades

### 1. Teste de Persistência Básica

**Objetivo**: Verificar que o jogo salva e carrega corretamente

1. Abra http://localhost:3000 (primeira vez)
   - ✅ Jogo inicia normalmente sem modal

2. Preencha 3-4 células com números corretos
   - ✅ Números ficam azuis e células travam

3. Preencha 2 células com números errados
   - ✅ Números ficam vermelhos
   - ✅ Contador de erros incrementa

4. Faça algumas anotações (ative modo N)
   - ✅ Notas aparecem em mini-grade

5. Aguarde 1 segundo (auto-save debounce)

6. Recarregue a página (F5)
   - ✅ Modal "Jogo Salvo Encontrado" aparece
   - ✅ Botões "Continuar" e "Novo Jogo" visíveis

7. Clique "Continuar"
   - ✅ Todas as células voltam como estavam
   - ✅ Timer continua do tempo anterior
   - ✅ Contador de erros preservado
   - ✅ Toast verde "Jogo retomado!" aparece

### 2. Teste de Novo Jogo

**Objetivo**: Verificar reset completo do estado

1. Com jogo em andamento, clique "Novo Jogo" (botão laranja)
   - ✅ Tabuleiro reseta para estado inicial
   - ✅ Timer volta a 00:00
   - ✅ Erros zerados
   - ✅ Toast verde "Novo jogo iniciado!"

2. Recarregue a página
   - ✅ Modal NÃO aparece (save foi limpo)
   - ✅ Jogo inicia do zero

### 3. Teste de Controles de Teclado - Básico

**Objetivo**: Verificar input de números e navegação

1. Clique em uma célula vazia
   - ✅ Célula fica azul com ring azul grosso
   - ✅ Badge mostra "MODO: RESPONDER"

2. Pressione tecla "5"
   - ✅ Número 5 aparece (azul se correto, vermelho se errado)

3. Pressione seta → (direita)
   - ✅ Seleção move para célula à direita

4. Pressione seta ↓ (baixo)
   - ✅ Seleção move para célula abaixo

5. Navegue até borda direita e pressione →
   - ✅ Seleção faz wrap para primeira coluna

6. Navegue até última linha e pressione ↓
   - ✅ Seleção faz wrap para primeira linha

### 4. Teste de Modo Anotação com Teclado

**Objetivo**: Verificar toggle de notas via teclado

1. Selecione célula vazia

2. Pressione "N"
   - ✅ Badge muda para "MODO: ANOTAR" (verde)
   - ✅ Botão "Anotação" fica verde com ring
   - ✅ Borda da célula fica verde (ring-4 ring-green-500)

3. Pressione "1", "2", "3"
   - ✅ Notas 1, 2, 3 aparecem na mini-grade

4. Pressione "2" novamente
   - ✅ Nota 2 desaparece (toggle)

5. Pressione "N" novamente
   - ✅ Volta para "MODO: RESPONDER"
   - ✅ Borda volta azul

### 5. Teste de Modo Investigador

**Objetivo**: Verificar navegação sem alterações

1. Pressione "I"
   - ✅ Badge muda para "MODO: INVESTIGAR" (amarelo)
   - ✅ Botão "Investigador" fica amarelo com ring
   - ✅ Borda da célula fica amarela

2. Tente pressionar "5"
   - ✅ Nada acontece (input bloqueado)

3. Use setas para navegar
   - ✅ Navegação funciona normalmente

4. Pressione "I" novamente
   - ✅ Volta para modo responder

### 6. Teste de Limpar Célula

**Objetivo**: Verificar clear com Backspace/Delete e botão

1. Preencha célula com número errado
   - ✅ Número vermelho aparece

2. Pressione Backspace
   - ✅ Número desaparece
   - ✅ Célula volta vazia

3. Adicione notas (modo N, depois 1, 2, 3)

4. Volte para modo responder (N)

5. Preencha com número

6. Pressione Delete
   - ✅ Número desaparece
   - ✅ Notas permanecem (não são apagadas)

7. Clique botão "Limpar" (vermelho)
   - ✅ Botão desabilitado (célula já vazia)

8. Preencha novamente e clique "Limpar"
   - ✅ Número removido

### 7. Teste de Desfazer (Undo)

**Objetivo**: Verificar undo de todas as ações

1. Preencha célula com número correto

2. Pressione "U"
   - ✅ Número desaparece

3. Preencha com número errado
   - ✅ Erros incrementam

4. Pressione Ctrl+Z
   - ✅ Número desaparece
   - ✅ Erros decrementam

5. Adicione notas (modo N, depois 1, 2, 3)

6. Pressione "U"
   - ✅ Última nota (3) desaparece

7. Pressione "U" duas vezes
   - ✅ Notas 2 e 1 desaparecem

8. Clique "Borracha" (com notas)

9. Pressione "U"
   - ✅ Notas voltam

### 8. Teste de Esc (Escape)

**Objetivo**: Verificar comportamento de Esc

1. Selecione célula

2. Pressione "N" (modo anotação)

3. Pressione Esc
   - ✅ Volta para modo responder
   - ✅ Seleção mantida

4. Pressione Esc novamente
   - ✅ Seleção removida (selectedIdx = null)
   - ✅ Badge continua "MODO: RESPONDER"

### 9. Teste de Segurança do Teclado

**Objetivo**: Verificar que teclado respeita restrições

1. Preencha célula com número correto
   - ✅ Célula trava (ícone 🔒 aparece)

2. Tente pressionar outro número
   - ✅ Nada acontece (locked)

3. Tente Backspace
   - ✅ Nada acontece (locked)

4. Selecione célula given (preta, negrito)

5. Tente pressionar número
   - ✅ Nada acontece (given)

6. Clique "Pausar"

7. Tente pressionar qualquer tecla
   - ✅ Nada acontece (paused)

### 10. Teste de Toast Notifications

**Objetivo**: Verificar sistema de notificações

1. Clique "Dica"
   - ✅ Toast azul aparece no topo
   - ✅ Mensagem: "Dica: implementar no Milestone C"
   - ✅ Desaparece após ~3 segundos

2. Clique "Novo Jogo"
   - ✅ Toast verde aparece
   - ✅ Mensagem: "Novo jogo iniciado!"

3. Recarregue e clique "Continuar"
   - ✅ Toast verde: "Jogo retomado!"

### 11. Teste de Clareza Visual dos Modos

**Objetivo**: Verificar indicadores visuais

1. Modo Responder (padrão)
   - ✅ Badge azul: "MODO: RESPONDER"
   - ✅ Célula selecionada com ring azul grosso
   - ✅ Botão "Anotação" cinza
   - ✅ Botão "Investigador" cinza

2. Pressione "N" (modo anotação)
   - ✅ Badge verde: "MODO: ANOTAR"
   - ✅ Célula selecionada com ring verde grosso
   - ✅ Botão "Anotação" verde com ring

3. Pressione "I" (modo investigador)
   - ✅ Badge amarelo: "MODO: INVESTIGAR"
   - ✅ Célula selecionada com ring amarelo grosso
   - ✅ Botão "Investigador" amarelo com ring

### 12. Teste de Ícone de Cadeado

**Objetivo**: Verificar indicador de células locked

1. Preencha célula vazia com número correto
   - ✅ Número fica azul
   - ✅ Ícone 🔒 aparece no canto superior direito
   - ✅ Ícone é discreto (opacity-60)

2. Hover sobre o ícone
   - ✅ Tooltip: "Célula travada (resposta correta)"

3. Células given (pretas)
   - ✅ NÃO mostram ícone de cadeado

### 13. Teste de Acessibilidade (ARIA)

**Objetivo**: Verificar atributos de acessibilidade

1. Inspecione o tabuleiro no DevTools
   - ✅ Container tem role="grid"
   - ✅ Container tem aria-label="Sudoku board"

2. Inspecione uma célula
   - ✅ Tem role="gridcell"
   - ✅ Tem aria-label descritivo (ex: "Cell 1, value 5" ou "Cell 2, empty")

3. Inspecione botões
   - ✅ Todos têm title com descrição/atalho

### 14. Teste de Responsividade Mobile

**Objetivo**: Verificar layout em tela pequena

1. Abra DevTools e mude para modo mobile (375px)

2. Verifique ActionBar
   - ✅ Botões fazem wrap (flex-wrap)
   - ✅ Badge de modo visível

3. Verifique tabuleiro
   - ✅ Mantém proporções
   - ✅ Células clicáveis

4. Verifique keypad
   - ✅ Números visíveis e clicáveis

### 15. Teste de Integração Completo

**Objetivo**: Fluxo completo de jogo

1. Inicie jogo novo
2. Preencha 10 células com teclado (mix de correto/errado)
3. Faça anotações em 5 células
4. Use setas para navegar
5. Desfaça 3 ações
6. Pause e retome
7. Recarregue página
8. Continue jogo
9. Verifique que tudo voltou
10. Clique "Novo Jogo"
11. Verifique reset completo

---

## Checklist Rápido ✅

- [ ] Persistência: save/load funciona
- [ ] Modal: continuar/novo jogo aparece
- [ ] Teclado: dígitos 1-9 funcionam
- [ ] Teclado: setas navegam
- [ ] Teclado: N toggle anotação
- [ ] Teclado: I toggle investigador
- [ ] Teclado: U/Ctrl+Z desfaz
- [ ] Teclado: Backspace/Delete limpa
- [ ] Teclado: Esc sai de modo/limpa seleção
- [ ] Botão Limpar funciona
- [ ] Botão Novo Jogo funciona
- [ ] Badge de modo sempre visível
- [ ] Borda colorida por modo
- [ ] Ícone de cadeado em locked
- [ ] Toast substitui alert
- [ ] ARIA roles presentes
- [ ] Responsivo mobile OK
- [ ] Sem regressões Milestone A

## Bugs Conhecidos

Nenhum no momento. Reporte qualquer problema encontrado!

## Performance

- Auto-save debounced (500ms): Evita writes excessivos
- Timer tick (250ms): Suave sem overhead
- Toast auto-dismiss (3s): UX não-intrusiva

---

**Teste completo! Se todos os itens passarem, Milestone B está 100% funcional.** ✅
