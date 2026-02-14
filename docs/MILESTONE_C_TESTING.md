# MILESTONE C - TESTING GUIDE

## Implementação Completa

Este documento descreve como testar todas as funcionalidades do Milestone C.

## Funcionalidades Implementadas

### 1. Geração de Puzzles com Solução Única

- ✅ Gerador de solução completa com backtracking randomizado
- ✅ Remoção de números (digging) com garantia de solução única
- ✅ Cache local de puzzles (5 por dificuldade)
- ✅ Suporte a seed para reprodução de puzzles

### 2. Níveis de Dificuldade

- ✅ 4 níveis: Easy, Medium, Hard, Expert
- ✅ Classificação baseada em solver lógico
- ✅ Critérios estáveis:
  - **Easy**: Apenas naked singles e hidden singles, muitos givens (≥36)
  - **Medium**: Inclui naked pairs, givens moderados (30-35)
  - **Hard**: Técnicas avançadas ou muitos passos, poucos givens (25-29)
  - **Expert**: Muitas técnicas avançadas ou muito poucos givens (<25)

### 3. Solver Lógico com Rastreio

- ✅ Técnicas implementadas:
  - Naked Single
  - Hidden Single (row, col, block)
  - Naked Pair
- ✅ Rastreamento de passos com explicações em pt-BR
- ✅ Suporte a candidatos (bitmask)

### 4. Sistema de Dicas

- ✅ Botão "Dica" que obtém próximo passo lógico
- ✅ Modal com explicação da técnica
- ✅ Destaque visual nas células envolvidas
- ✅ Opção "Aplicar Dica" para técnicas de placement

### 5. Explicação de Erros

- ✅ Botão "Explicação" aparece quando célula errada está selecionada
- ✅ Modal explicando o conflito (linha/coluna/bloco)
- ✅ Não revela a solução diretamente

### 6. UI para Seleção de Dificuldade

- ✅ Seletor de dificuldade (segmented control)
- ✅ Botão "Novo Jogo" gera puzzle na dificuldade selecionada
- ✅ Display do seed (quando disponível)

## Testes Manuais

### Teste 1: Geração de Puzzles

#### 1.1 Gerar 10 puzzles por dificuldade

**Easy:**

```
1. Selecionar dificuldade "Fácil"
2. Clicar "Novo Jogo" 10 vezes
3. Verificar que cada puzzle:
   - Tem solução única
   - É solucionável
   - Tem muitos números preenchidos (≥36)
```

**Medium:**

```
1. Selecionar dificuldade "Médio"
2. Clicar "Novo Jogo" 10 vezes
3. Verificar que cada puzzle:
   - Tem solução única
   - É solucionável
   - Tem quantidade moderada de números (30-35)
```

**Hard:**

```
1. Selecionar dificuldade "Difícil"
2. Clicar "Novo Jogo" 10 vezes
3. Verificar que cada puzzle:
   - Tem solução única
   - É solucionável
   - Tem poucos números (25-29)
```

**Expert:**

```
1. Selecionar dificuldade "Expert"
2. Clicar "Novo Jogo" 10 vezes
3. Verificar que cada puzzle:
   - Tem solução única
   - É solucionável
   - Tem muito poucos números (<25)
```

#### 1.2 Verificar Cache

```
1. Gerar um puzzle
2. Observar que o próximo puzzle carrega instantaneamente (do cache)
3. Gerar vários puzzles rapidamente
4. Verificar que não há travamentos
```

### Teste 2: Sistema de Dicas

#### 2.1 Obter Dica Básica

```
1. Iniciar novo jogo (Easy)
2. Clicar no botão "💡 Dica"
3. Verificar que:
   - Modal de dica aparece
   - Explicação está em português
   - Células são destacadas em roxo
   - Nome da técnica é exibido
```

#### 2.2 Aplicar Dica

```
1. Obter uma dica (naked single ou hidden single)
2. Clicar "Aplicar Dica"
3. Verificar que:
   - Número é preenchido corretamente
   - Célula fica travada
   - Modal fecha automaticamente
```

#### 2.3 Dica com Notas do Usuário

```
1. Iniciar novo jogo
2. Adicionar algumas notas em células vazias
3. Clicar "💡 Dica"
4. Verificar que a dica considera as notas do usuário
```

#### 2.4 Sem Dicas Disponíveis

```
1. Resolver quase todo o puzzle
2. Preencher células de forma que não haja passos lógicos óbvios
3. Clicar "💡 Dica"
4. Verificar toast: "Nenhuma dica disponível no momento"
```

### Teste 3: Explicação de Erros

#### 3.1 Erro na Linha

```
1. Iniciar novo jogo
2. Preencher uma célula com número errado que conflita na linha
3. Selecionar a célula errada (vermelha)
4. Clicar "❌ Explicação"
5. Verificar que:
   - Modal aparece
   - Explicação menciona "linha" e o número conflitante
   - Não revela a solução correta
```

#### 3.2 Erro na Coluna

```
1. Preencher célula com número que conflita na coluna
2. Selecionar célula errada
3. Clicar "❌ Explicação"
4. Verificar explicação sobre conflito na coluna
```

#### 3.3 Erro no Bloco

```
1. Preencher célula com número que conflita no bloco
2. Selecionar célula errada
3. Clicar "❌ Explicação"
4. Verificar explicação sobre conflito no bloco
```

#### 3.4 Botão Só Aparece com Erro

```
1. Verificar que botão "❌ Explicação" NÃO aparece normalmente
2. Preencher célula errada
3. Selecionar a célula
4. Verificar que botão aparece e pulsa (animate-pulse)
```

### Teste 4: Seleção de Dificuldade

#### 4.1 Trocar Dificuldade

```
1. Selecionar "Fácil"
2. Clicar "Novo Jogo"
3. Verificar puzzle fácil gerado
4. Selecionar "Expert"
5. Clicar "Novo Jogo"
6. Verificar puzzle expert gerado (muito mais difícil)
```

#### 4.2 Persistência de Preferência

```
1. Selecionar "Hard"
2. Clicar "Novo Jogo"
3. Recarregar página
4. Verificar que dificuldade "Hard" ainda está selecionada
```

### Teste 5: Display de Seed

#### 5.1 Verificar Seed

```
1. Gerar novo jogo
2. Verificar que seed aparece no canto superior direito
3. Anotar o seed
```

#### 5.2 Reproduzir Puzzle (Futuro)

```
Nota: Atualmente o seed é gerado mas não há UI para inserir seed customizado.
Esta funcionalidade pode ser adicionada no futuro.
```

### Teste 6: Integração com Funcionalidades Existentes

#### 6.1 Dica Não Interfere com Undo

```
1. Fazer algumas jogadas
2. Obter dica
3. Aplicar dica
4. Clicar "Desfazer"
5. Verificar que funciona normalmente
```

#### 6.2 Erro Fecha Dica

```
1. Obter uma dica (modal aberto)
2. Preencher célula errada
3. Verificar que modal de dica fecha automaticamente
```

#### 6.3 Pausar Durante Dica

```
1. Obter dica
2. Pausar jogo
3. Verificar que modal permanece visível
4. Despausar
5. Fechar dica normalmente
```

### Teste 7: Performance

#### 7.1 Geração Não Trava UI

```
1. Clicar "Novo Jogo" várias vezes rapidamente
2. Verificar que:
   - UI permanece responsiva
   - Não há travamentos
   - Cache funciona após primeiras gerações
```

#### 7.2 Solver Lógico é Rápido

```
1. Clicar "💡 Dica" em puzzle complexo
2. Verificar que resposta é instantânea (<100ms)
```

## Testes de Regressão

### Milestone A e B

```
1. Verificar que todas as funcionalidades anteriores ainda funcionam:
   - Seleção de células
   - Preenchimento de números
   - Modo de notas
   - Modo investigador
   - Desfazer
   - Timer
   - Contador de erros
   - Salvar/carregar jogo
   - Pausar
```

## Critérios de Aceitação

- [ ] Usuário pode escolher dificuldade e gerar novo puzzle
- [ ] Puzzle gerado tem solução única
- [ ] Puzzle é solucionável
- [ ] Botão "Dica" produz explicação em português
- [ ] Células são destacadas durante dica
- [ ] Botão "Explicação" aparece ao selecionar célula errada
- [ ] Explicação de erro não revela solução
- [ ] Sem regressões dos milestones anteriores
- [ ] Performance aceitável (geração <2s, dica <100ms)

## Problemas Conhecidos e Limitações

1. **Geração pode ser lenta na primeira vez**: A primeira geração de cada dificuldade pode levar 1-2 segundos. Gerações subsequentes usam cache.

2. **Técnicas limitadas**: O solver implementa apenas 5 técnicas básicas/intermediárias. Puzzles muito difíceis podem não ter dicas disponíveis.

3. **Seed não é inserível**: Atualmente não há UI para inserir um seed customizado, apenas visualização.

4. **Classificação pode variar**: A classificação de dificuldade é baseada em heurísticas e pode ocasionalmente classificar um puzzle em nível adjacente.

## Próximos Passos (Futuro)

1. Adicionar mais técnicas ao solver (X-Wing, Swordfish, etc.)
2. UI para inserir seed customizado
3. Compartilhar puzzle via URL
4. Estatísticas de dificuldade (tempo médio, taxa de conclusão)
5. Hints progressivos (dica mais simples primeiro)
