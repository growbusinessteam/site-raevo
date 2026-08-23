# Teste de Maturidade Comercial Enxuto Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduzir o funil para duas perguntas de contexto e 12 perguntas pontuadas, apresentar a entrega antes do início, calcular progresso total pelas respostas guardadas e permitir revisão segura pelo botão Voltar.

**Architecture:** O banco de perguntas, o motor de cálculo e o estado versionado continuam centralizados em módulos puros. O componente Astro de etapa recebe a posição global no funil e hidrata o progresso a partir do estado do browser. O backend PHP adota o mesmo contrato de 12 respostas e permanece a fonte de verdade do resultado.

**Tech Stack:** Astro 5, TypeScript, JavaScript ESM, CSS responsivo, Node test runner, Playwright e PHP 8/Apache na Hostinger.

---

## Estrutura de ficheiros

- `src/data/maturity.ts`: dois contextos pós-lead e 12 perguntas pontuadas, duas por pilar.
- `src/lib/maturity-scoring.mjs`: cálculo de 12 respostas, máximo 48 e máximo 8 por pilar.
- `src/lib/maturity-state.mjs`: esquema v3, 14 rotas respondíveis, progresso global e navegação anterior/seguinte.
- `src/lib/maturity-form.mjs`: serialização de exatamente 12 respostas.
- `src/components/maturity/MaturityStep.astro`: barra de progresso total, restauração e edição.
- `src/pages/teste-maturidade-comercial/antes-de-comecar/index.astro`: expectativa visual e CTA “Iniciar o teste”.
- `src/pages/teste-maturidade-comercial/contexto/[slug].astro`: geração de duas rotas de contexto com índice global.
- `src/pages/teste-maturidade-comercial/pergunta/[number].astro`: geração de 12 rotas pontuadas com índice global.
- `src/styles/maturity.css`: grelha visual da introdução e estados acessíveis da barra.
- `public/api/maturidade/index.php`: validação e recálculo de 12 respostas.
- `tests/maturity-*.test.mjs`: regressões de conteúdo, estado, progresso, payload, cálculo e contrato PHP.
- `tmp/maturity-e2e.py`: percurso local completo em desktop/mobile e revisão de resposta.

### Task 1: Reduzir perguntas e recalibrar o cálculo

**Files:**
- Modify: `tests/maturity-scoring.test.mjs`
- Modify: `tests/maturity-routes.test.mjs`
- Modify: `src/data/maturity.ts`
- Modify: `src/lib/maturity-scoring.mjs`

- [ ] **Step 1: Escrever os testes RED**

Atualizar asserções para 12 respostas, máximo geral 48, dois itens por pilar e máximo 8:

```js
assert.equal(calculateMaturity(Array(12).fill(0)).percentage, 0);
assert.equal(calculateMaturity(Array(12).fill(2)).percentage, 50);
assert.equal(calculateMaturity(Array(12).fill(4)).maxPoints, 48);
assert.ok(calculateMaturity(Array(12).fill(4)).pillars.every((pillar) => pillar.maxPoints === 8));
assert.throws(() => calculateMaturity(Array(11).fill(2)), /12 respostas/);
```

O teste estrutural deverá exigir `maturityQuestions.length === 12`, dois itens em cada `pillarKey` e apenas os contextos `sector`, `monthly_opportunities` e `main_goal` no banco, lembrando que `sector` é usado no gate inicial.

- [ ] **Step 2: Executar e confirmar RED**

Run: `node tests/maturity-scoring.test.mjs && node tests/maturity-routes.test.mjs`

Expected: FAIL por ainda existirem 18 perguntas e cálculo máximo 72.

- [ ] **Step 3: Implementar o banco de 12 perguntas**

Manter duas perguntas por pilar. Combinar rastreio e previsibilidade na primeira pergunta; incorporar padronização na qualificação, motivos de perda na rotina de gestão e IA estruturada na automação. Remover valor médio, equipa, pós-reunião, reativação e as perguntas isoladas absorvidas.

- [ ] **Step 4: Recalibrar o motor**

Usar duas respostas consecutivas por pilar:

```js
const QUESTIONS_PER_PILLAR = 2;
const PILLAR_MAX_POINTS = 8;
const TOTAL_QUESTIONS = 12;
const MAX_POINTS = 48;
```

Preservar as faixas percentuais e o desempate metodológico.

- [ ] **Step 5: Executar em GREEN**

Run: `node tests/maturity-scoring.test.mjs && node tests/maturity-routes.test.mjs`

Expected: PASS.

### Task 2: Atualizar estado, rotas e progresso total

**Files:**
- Modify: `tests/maturity-state.test.mjs`
- Modify: `src/lib/maturity-state.mjs`
- Modify: `src/components/maturity/MaturityStep.astro`
- Modify: `src/pages/teste-maturidade-comercial/contexto/[slug].astro`
- Modify: `src/pages/teste-maturidade-comercial/pergunta/[number].astro`

- [ ] **Step 1: Escrever os testes RED do funil v3**

Exigir chave `raevo:maturity:v3`, dois contextos, 12 perguntas, 14 respostas totais e funções de progresso:

```js
assert.equal(STORAGE_KEY, "raevo:maturity:v3");
assert.equal(FUNNEL_PATHS.length, 15);
assert.deepEqual(getAssessmentProgress(state), { completed: 0, total: 14, percentage: 0 });
assert.equal(getPreviousPath("/teste-maturidade-comercial/pergunta/01/"), "/teste-maturidade-comercial/contexto/objetivo/");
assert.equal(getNextPath("/teste-maturidade-comercial/pergunta/12/"), "/teste-maturidade-comercial/processando/");
```

- [ ] **Step 2: Executar e confirmar RED**

Run: `node tests/maturity-state.test.mjs`

Expected: FAIL por esquema v2, quatro contextos e 18 perguntas.

- [ ] **Step 3: Implementar estado v3 e progresso**

Criar `getAssessmentProgress(state)` contando somente os dois contextos pós-lead e as 12 respostas pontuadas. Não contar o setor do gate inicial. Renovar `MATURITY_RELEASE` para `20260823-short1`.

- [ ] **Step 4: Renderizar o progresso total**

O componente deverá receber o índice global, mas hidratar a barra pelo estado:

```html
<div class="maturity-step-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
  <i style="width:0%"></i>
</div>
<div class="maturity-step-progress__label"><span data-progress-label>0% concluído</span><span data-progress-count>0 de 14 respostas</span></div>
```

Na seleção, guardar primeiro, atualizar a barra e só depois navegar. Na hidratação, marcar a resposta sem chamar `advance()`.

- [ ] **Step 5: Executar em GREEN**

Run: `node tests/maturity-state.test.mjs && node tests/maturity-routes.test.mjs`

Expected: PASS.

### Task 3: Criar a expectativa visual antes do início

**Files:**
- Modify: `tests/maturity-routes.test.mjs`
- Modify: `src/pages/teste-maturidade-comercial/antes-de-comecar/index.astro`
- Modify: `src/styles/maturity.css`

- [ ] **Step 1: Escrever as asserções RED de conteúdo**

Exigir “12 perguntas”, “≈ 5 min”, “Resultado imediato”, “Relatório visual”, “seis pilares” e o CTA exato “Iniciar o teste”. Exigir que a rota inicial seja `/contexto/oportunidades/` com versão de release.

- [ ] **Step 2: Executar e confirmar RED**

Run: `node tests/maturity-routes.test.mjs`

Expected: FAIL porque a introdução ainda comunica 18 perguntas e usa “Começar”.

- [ ] **Step 3: Implementar a composição visual**

Adicionar grelha de quatro indicadores e faixa de entregáveis com semântica de lista. Manter as superfícies e tokens atuais; no mobile, mudar a grelha para uma coluna. O CTA terá exatamente:

```astro
<a class="maturity-button maturity-button--gold" href={startHref}>Iniciar o teste <span aria-hidden="true">→</span></a>
```

- [ ] **Step 4: Executar teste e build**

Run: `node tests/maturity-routes.test.mjs && pnpm build`

Expected: PASS e 12 rotas de pergunta no `dist/`.

### Task 4: Alinhar payload e backend PHP

**Files:**
- Modify: `tests/maturity-form.test.mjs`
- Modify: `tests/maturity-api-contract.test.mjs`
- Modify: `src/lib/maturity-form.mjs`
- Modify: `public/api/maturidade/index.php`

- [ ] **Step 1: Escrever testes RED de contrato**

Exigir payload com 12 itens, erro para conjunto incompleto, `MAX_POINTS = 48`, `count($answers) !== 12` e máximo 8 por pilar no PHP.

- [ ] **Step 2: Executar e confirmar RED**

Run: `node tests/maturity-form.test.mjs && node tests/maturity-api-contract.test.mjs`

Expected: FAIL porque frontend e servidor ainda exigem 18 respostas.

- [ ] **Step 3: Implementar frontend e servidor**

Serializar perguntas 1–12. No PHP, validar ordenação exata, somar dois itens por pilar, dividir por 8 e calcular a percentagem geral sobre 48.

- [ ] **Step 4: Executar em GREEN**

Run: `node tests/maturity-form.test.mjs && node tests/maturity-api-contract.test.mjs && pnpm test`

Expected: todos os testes PASS.

### Task 5: Validar a experiência completa

**Files:**
- Modify: `tmp/maturity-e2e.py`

- [ ] **Step 1: Atualizar o percurso automatizado**

Percorrer dois contextos e 12 perguntas, confirmar percentagens 0%, 7%, 14%, 21% e 100%, voltar da pergunta 02 para a 01, alterar a resposta, verificar que a seleção foi substituída e concluir no relatório sem enviar lead real.

- [ ] **Step 2: Executar desktop e mobile**

Run: `pnpm preview --host 127.0.0.1` e `python3 tmp/maturity-e2e.py`.

Expected: fluxo completo, retorno, restauração, alteração, resultado e layouts passam sem erro de console ou overflow.

- [ ] **Step 3: Executar verificação final local**

Run: `pnpm test && pnpm build && git diff --check`

Expected: exit code 0 em todos.

### Task 6: Publicar e verificar produção

**Files:**
- Deploy: `dist/teste-maturidade-comercial/`
- Deploy: `dist/api/maturidade/`
- Deploy: assets referenciados em `dist/_astro/`

- [ ] **Step 1: Sincronizar apenas a área do teste**

Confirmar o worktree limpo em `/private/tmp/raevo-hostinger-dist`, sincronizar as duas subárvores e copiar somente o fecho de assets Astro referenciados. Verificar que `/`, `/pt-oficial/`, `/br-oficial/` e `/pt-med/` não entram no diff.

- [ ] **Step 2: Versionar e publicar**

Commitar no branch `hostinger-dist`, fazer push e aguardar a implantação automática da Hostinger.

- [ ] **Step 3: Verificar no domínio público**

Abrir a URL com `?release=20260823-short1`, executar o clique real, voltar, alterar a resposta e concluir o funil sintético. Confirmar HTTP 200 nas páginas institucionais preservadas.

- [ ] **Step 4: Entrega**

Informar os commits de origem e produção, o link publicado, a redução 22→14 e a evidência de avanço, retorno e resultado.
