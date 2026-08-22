# Teste de Maturidade Comercial Raevo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir a área completa `raevo.io/teste-maturidade-comercial/`, com landing, 23 etapas em rotas próprias, identificação, cálculo, backend PHP, resultado por token e PDF personalizado.

**Architecture:** Astro gera todas as páginas públicas e partilha componentes visuais com a identidade oficial Raevo. Módulos JavaScript puros concentram conteúdo, cálculo, estado, validação e personalização; um endpoint PHP same-origin valida e recalcula a submissão, guarda o resultado fora da árvore pública e encaminha o payload ao webhook configurado. A rota de resultado é um shell estático servido para tokens arbitrários por uma regra Apache e recupera os dados pela API.

**Tech Stack:** Astro 5, TypeScript, JavaScript ESM, Node test runner, PHP 8 no alojamento, Apache `.htaccess`, `pdf-lib`, `@pdf-lib/fontkit`, CSS responsivo.

---

## Estrutura de ficheiros

### Dados e lógica

- `src/data/maturity.ts`: conteúdo da landing, cinco contextos, 18 perguntas, pilares, níveis, insights e prioridades.
- `src/lib/maturity-scoring.mjs`: validação das respostas, cálculo geral, cálculo por pilar, classificação e ordenação determinística.
- `src/lib/maturity-state.mjs`: esquema versionado de `sessionStorage`, captura de atribuição e cálculo da primeira etapa incompleta.
- `src/lib/maturity-form.mjs`: normalização, validação e construção do payload de submissão.
- `src/lib/maturity-result.mjs`: composição do Insight Raevo, prioridades e modelo público do resultado.
- `src/lib/maturity-pdf.mjs`: geração do PDF A4 em seis páginas.

### Interface

- `src/components/maturity/MaturityLayout.astro`: documento, SEO, fontes, favicon, `noindex` opcional e carregamento do CSS.
- `src/components/maturity/MaturityHeader.astro`: cabeçalho simples e variante de questionário.
- `src/components/maturity/MaturityFooter.astro`: rodapé coerente com o site oficial.
- `src/components/maturity/MaturityLanding.astro`: landing editorial completa.
- `src/components/maturity/MaturityStep.astro`: ecrã reutilizável de contexto e pergunta.
- `src/components/maturity/MaturityIdentification.astro`: formulário final e submissão.
- `src/components/maturity/MaturityResult.astro`: estado de carregamento, resultado, erro e download.
- `src/styles/maturity.css`: tokens herdados e estilos específicos da ferramenta.

### Rotas

- `src/pages/teste-maturidade-comercial/index.astro`
- `src/pages/teste-maturidade-comercial/antes-de-comecar/index.astro`
- `src/pages/teste-maturidade-comercial/contexto/[slug].astro`
- `src/pages/teste-maturidade-comercial/pergunta/[number].astro`
- `src/pages/teste-maturidade-comercial/identificacao/index.astro`
- `src/pages/teste-maturidade-comercial/resultado/index.astro`

### Backend e deploy

- `public/api/maturidade/index.php`: router, submissão, consulta de resultado, armazenamento privado e webhook.
- `public/api/maturidade/.htaccess`: encaminhamento das rotas amigáveis da API.
- `public/teste-maturidade-comercial/resultado/.htaccess`: fallback de qualquer token para o shell do resultado.
- `public/assets/fonts/Sora-SemiBold.ttf`: fonte incorporada no PDF.
- `public/assets/fonts/Inter-Regular.ttf`: fonte incorporada no PDF.
- `public/assets/fonts/OFL.txt`: licença das fontes.

### Testes

- `tests/maturity-scoring.test.mjs`
- `tests/maturity-state.test.mjs`
- `tests/maturity-form.test.mjs`
- `tests/maturity-result.test.mjs`
- `tests/maturity-routes.test.mjs`
- `tests/maturity-api-contract.test.mjs`
- `tests/maturity-pdf.test.mjs`

## Task 1: Banco de perguntas e motor de cálculo

**Files:**
- Create: `src/data/maturity.ts`
- Create: `src/lib/maturity-scoring.mjs`
- Create: `tests/maturity-scoring.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Criar o teste de cálculo em estado RED**

O teste deverá importar `calculateMaturity`, `classifyPercentage` e `rankPillars` e verificar:

```js
assert.equal(calculateMaturity(Array(18).fill(0)).percentage, 0);
assert.equal(calculateMaturity(Array(18).fill(2)).percentage, 50);
assert.equal(calculateMaturity(Array(18).fill(4)).percentage, 100);
assert.equal(classifyPercentage(20).key, "initial");
assert.equal(classifyPercentage(21).key, "reactive");
assert.equal(classifyPercentage(40).key, "reactive");
assert.equal(classifyPercentage(41).key, "structured");
assert.equal(classifyPercentage(60).key, "structured");
assert.equal(classifyPercentage(61).key, "predictable");
assert.equal(classifyPercentage(80).key, "predictable");
assert.equal(classifyPercentage(81).key, "intelligent");
assert.throws(() => calculateMaturity(Array(17).fill(2)), /18 respostas/);
assert.throws(() => calculateMaturity([...Array(17).fill(2), 5]), /entre 0 e 4/);
```

- [ ] **Step 2: Executar o teste e confirmar a falha correta**

Run: `node tests/maturity-scoring.test.mjs`

Expected: FAIL porque `src/lib/maturity-scoring.mjs` ainda não existe.

- [ ] **Step 3: Implementar o módulo mínimo de cálculo**

Definir seis pilares, cada um com três índices contíguos, validar exatamente 18 inteiros entre 0 e 4, arredondar as percentagens e devolver:

```js
{
  totalPoints,
  maxPoints: 72,
  percentage,
  level: { key, label, description },
  pillars: [{ key, label, points, percentage }],
  strongestPillar,
  weakestPillar,
  rankedAscending
}
```

Em empate, manter a ordem metodológica dos pilares.

- [ ] **Step 4: Preencher o banco completo de conteúdo**

Transcrever para `src/data/maturity.ts` as cinco perguntas de contexto, as 18 perguntas e respetivas cinco alternativas/pontuações, níveis, insights e recomendações do briefing aprovado. Exportar também `maturitySteps`, `contextSteps`, `maturityQuestions`, `pillars`, `levels` e `landingSections`.

- [ ] **Step 5: Executar o teste em GREEN**

Run: `node tests/maturity-scoring.test.mjs`

Expected: PASS com todas as asserções.

- [ ] **Step 6: Ligar o teste ao script principal**

Adicionar `node tests/maturity-scoring.test.mjs` ao fim de `npm test`, preservando os testes existentes.

- [ ] **Step 7: Commit focado**

```bash
git add package.json src/data/maturity.ts src/lib/maturity-scoring.mjs tests/maturity-scoring.test.mjs
git commit -m "feat: add maturity assessment scoring"
```

## Task 2: Estado, atribuição e progressão entre URLs

**Files:**
- Create: `src/lib/maturity-state.mjs`
- Create: `tests/maturity-state.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Escrever testes RED para o estado versionado**

Cobrir criação, hidratação, versão incompatível, atualização imutável, UTMs e primeira etapa incompleta:

```js
const fresh = createAssessmentState({ href: "https://raevo.io/teste-maturidade-comercial/?utm_source=meta", referrer: "https://instagram.com" });
assert.equal(fresh.version, 1);
assert.equal(fresh.attribution.utm_source, "meta");
assert.equal(fresh.attribution.referrer, "https://instagram.com");
assert.equal(getFirstIncompletePath(fresh), "/teste-maturidade-comercial/contexto/setor/");
assert.equal(readState({ version: 99 }), null);
```

- [ ] **Step 2: Executar e confirmar a falha**

Run: `node tests/maturity-state.test.mjs`

Expected: FAIL por módulo ausente.

- [ ] **Step 3: Implementar funções puras e adaptador de browser**

Exportar `createAssessmentState`, `readState`, `setContextAnswer`, `setMaturityAnswer`, `getFirstIncompletePath`, `getNextPath`, `getPreviousPath`, `captureAttribution`, `loadBrowserState`, `saveBrowserState` e `clearBrowserState`. Usar a chave `raevo:maturity:v1`.

- [ ] **Step 4: Executar o teste em GREEN e ligar ao script principal**

Run: `node tests/maturity-state.test.mjs`

Expected: PASS. Depois acrescentar o ficheiro ao script `npm test`.

- [ ] **Step 5: Commit focado**

```bash
git add package.json src/lib/maturity-state.mjs tests/maturity-state.test.mjs
git commit -m "feat: persist maturity assessment progress"
```

## Task 3: Rotas estáticas e estrutura da landing

**Files:**
- Create: `tests/maturity-routes.test.mjs`
- Create: `src/components/maturity/MaturityLayout.astro`
- Create: `src/components/maturity/MaturityHeader.astro`
- Create: `src/components/maturity/MaturityFooter.astro`
- Create: `src/components/maturity/MaturityLanding.astro`
- Create: `src/pages/teste-maturidade-comercial/index.astro`
- Create: `src/pages/teste-maturidade-comercial/antes-de-comecar/index.astro`
- Modify: `package.json`

- [ ] **Step 1: Escrever o teste estrutural RED**

Verificar que a landing contém o título aprovado, CTA para `/antes-de-comecar/`, seis pilares, escala de cinco níveis, prévia marcada como exemplo, links jurídicos e nenhuma inicialização de Pixel específica.

- [ ] **Step 2: Executar e confirmar a falha**

Run: `node tests/maturity-routes.test.mjs`

Expected: FAIL por páginas ausentes.

- [ ] **Step 3: Implementar layout, header e footer**

O layout terá canonical, OG tags, favicons existentes, Sora/Inter, skip link, `data-maturity-step` e um `robots` configurável. O header terá logótipo oficial, rótulo da ferramenta e CTA. O footer reutilizará a linha institucional e os links existentes.

- [ ] **Step 4: Implementar a landing completa**

Criar hero, escala, três descobertas, seis pilares com SVG linear, três passos, pré-visualização de relatório, CTA final e footer. Usar somente conteúdo real do briefing e identificar a prévia como “Exemplo de resultado”.

- [ ] **Step 5: Implementar a introdução**

Apresentar duração, 18 perguntas, seis áreas, resultado e PDF. O CTA deve iniciar em `/contexto/setor/`; a ação secundária volta à landing.

- [ ] **Step 6: Executar teste e build em GREEN**

Run: `node tests/maturity-routes.test.mjs && npm run build`

Expected: PASS e build com exit code 0.

- [ ] **Step 7: Ligar teste e criar commit**

```bash
git add package.json tests/maturity-routes.test.mjs src/components/maturity src/pages/teste-maturidade-comercial
git commit -m "feat: add maturity assessment landing"
```

## Task 4: Páginas de contexto e perguntas

**Files:**
- Create: `src/components/maturity/MaturityStep.astro`
- Create: `src/pages/teste-maturidade-comercial/contexto/[slug].astro`
- Create: `src/pages/teste-maturidade-comercial/pergunta/[number].astro`
- Modify: `tests/maturity-routes.test.mjs`

- [ ] **Step 1: Estender o teste RED para 23 rotas**

Verificar os cinco slugs de contexto, as perguntas `01` e `18`, o total de 18 caminhos gerados, `data-step-key`, botões voltar/continuar e ausência dos valores 0–4 no texto visível.

- [ ] **Step 2: Executar e confirmar a falha correta**

Run: `node tests/maturity-routes.test.mjs`

Expected: FAIL porque as rotas dinâmicas ainda não existem.

- [ ] **Step 3: Implementar `getStaticPaths` e o componente de etapa**

Gerar cinco páginas de contexto e 18 páginas numeradas. Renderizar uma alternativa por botão/radio, progresso acessível, erro inline, voltar e continuar.

- [ ] **Step 4: Implementar o controlador no browser**

Ao carregar, validar pré-requisitos e encaminhar para `getFirstIncompletePath` se necessário. Ao selecionar, guardar imediatamente. Ao continuar, exigir resposta e navegar para a próxima URL real. Suportar setas para percorrer alternativas, espaço/Enter para selecionar e Enter para continuar.

- [ ] **Step 5: Executar testes e build em GREEN**

Run: `node tests/maturity-state.test.mjs && node tests/maturity-routes.test.mjs && npm run build`

Expected: PASS e 23 páginas de diagnóstico no `dist/`.

- [ ] **Step 6: Commit focado**

```bash
git add src/components/maturity/MaturityStep.astro src/pages/teste-maturidade-comercial/contexto src/pages/teste-maturidade-comercial/pergunta tests/maturity-routes.test.mjs
git commit -m "feat: add routed maturity questionnaire"
```

## Task 5: Validação e formulário de identificação

**Files:**
- Create: `tests/maturity-form.test.mjs`
- Create: `src/lib/maturity-form.mjs`
- Create: `src/components/maturity/MaturityIdentification.astro`
- Create: `src/pages/teste-maturidade-comercial/identificacao/index.astro`
- Modify: `package.json`

- [ ] **Step 1: Escrever testes RED de validação e payload**

Cobrir nome, empresa, função, email, indicativo/WhatsApp, site opcional, prazo, privacidade e marketing separado. O payload esperado terá `person`, `company`, `answers`, `attribution`, `consent` e não terá percentagem confiada pelo browser.

- [ ] **Step 2: Executar e confirmar falha**

Run: `node tests/maturity-form.test.mjs`

Expected: FAIL por módulo ausente.

- [ ] **Step 3: Implementar normalização e validação**

Exportar `normalizePhone`, `normalizeEmail`, `validateProfessionalEmail`, `validateProfile`, `validateIdentification`, `buildSubmissionPayload` e `createIdempotencyKey`. Mensagens da UI serão específicas por campo.

- [ ] **Step 4: Implementar o formulário e submissão**

O formulário deverá validar sem apagar respostas, desativar o botão durante `fetch`, enviar a `/api/maturidade/submissions`, tratar JSON de erro, guardar apenas o URL/token devolvido, limpar dados pessoais temporários e navegar para o resultado.

- [ ] **Step 5: Executar testes e build em GREEN**

Run: `node tests/maturity-form.test.mjs && npm run build`

Expected: PASS e build com exit code 0.

- [ ] **Step 6: Ligar teste e commit**

```bash
git add package.json tests/maturity-form.test.mjs src/lib/maturity-form.mjs src/components/maturity/MaturityIdentification.astro src/pages/teste-maturidade-comercial/identificacao
git commit -m "feat: add maturity lead identification"
```

## Task 6: API PHP, token e armazenamento privado

**Files:**
- Create: `tests/maturity-api-contract.test.mjs`
- Create: `public/api/maturidade/index.php`
- Create: `public/api/maturidade/.htaccess`
- Create: `public/teste-maturidade-comercial/resultado/.htaccess`
- Modify: `public/.htaccess`
- Modify: `package.json`

- [ ] **Step 1: Escrever teste RED do contrato e segurança**

O teste deverá ler os ficheiros PHP/Apache e confirmar: métodos POST/GET, limite de corpo, `random_bytes`, `hash_equals` quando aplicável, `flock`, escrita atómica, recálculo de 18 respostas, faixas 20/21/40/41/60/61/80/81, `MATURITY_ASSESSMENT_WEBHOOK_URL`, `MATURITY_ASSESSMENT_CTA_URL`, retenção, `no-store`, ausência de segredo literal e fallback do token.

- [ ] **Step 2: Executar e confirmar falha**

Run: `node tests/maturity-api-contract.test.mjs`

Expected: FAIL por endpoint ausente.

- [ ] **Step 3: Implementar o router PHP**

Para `POST /submissions`, validar JSON, consentimento, campos e 18 respostas; recalcular total/pilares; criar `assessment_id` e token hexadecimal de 32 bytes; compor insight/prioridades; escrever JSON temporário com `LOCK_EX` e renomear atomicamente; devolver `201` com `{ token, result_url }`.

Para `GET /resultado/{token}`, aceitar somente token hexadecimal de 64 caracteres, rejeitar resultado expirado, remover respostas completas/consentimentos do payload público e devolver o modelo de apresentação. Todas as respostas terão `Content-Type: application/json`, `Cache-Control: no-store` e `X-Robots-Tag: noindex, nofollow`.

- [ ] **Step 4: Implementar webhook sem bloquear o resultado**

Depois de guardar, tentar `curl` com timeout curto para o URL de ambiente. Em falha, acrescentar um registo sem dados pessoais completos a um log privado e manter a resposta 201. Se a variável estiver ausente, guardar estado `webhook: not_configured` sem expor erro ao visitante.

- [ ] **Step 5: Implementar rewrites Apache**

Encaminhar `/api/maturidade/submissions` e `/api/maturidade/resultado/{token}` para `index.php`, e qualquer `/teste-maturidade-comercial/resultado/{token}/` para o shell `resultado/index.html` sem alterar o URL do browser.

- [ ] **Step 6: Executar teste em GREEN e build**

Run: `node tests/maturity-api-contract.test.mjs && npm run build`

Expected: PASS, PHP copiado para `dist/api/maturidade/index.php` e regras Apache presentes.

- [ ] **Step 7: Ligar teste e commit**

```bash
git add package.json tests/maturity-api-contract.test.mjs public/api public/teste-maturidade-comercial/resultado/.htaccess public/.htaccess
git commit -m "feat: add maturity assessment backend"
```

## Task 7: Personalização e página de resultado

**Files:**
- Create: `tests/maturity-result.test.mjs`
- Create: `src/lib/maturity-result.mjs`
- Create: `src/components/maturity/MaturityResult.astro`
- Create: `src/pages/teste-maturidade-comercial/resultado/index.astro`
- Modify: `package.json`

- [ ] **Step 1: Escrever testes RED para insights e prioridades**

Verificar que o modelo combina nível, pilar forte, pilar frágil, recomendação e três prioridades. Confirmar que prioridades 1 e 2 usam os dois pilares mais baixos e prioridade 3 usa o nível; confirmar linguagem “principal oportunidade de evolução”, nunca “pior área”.

- [ ] **Step 2: Executar e confirmar falha**

Run: `node tests/maturity-result.test.mjs`

Expected: FAIL por módulo ausente.

- [ ] **Step 3: Implementar personalização pura**

Exportar `composeInsight`, `buildPriorities`, `buildPublicResult`, `getCommercialMessage` e `sanitizeCompanySlug`. Usar apenas a biblioteca editorial aprovada, sem IA em runtime.

- [ ] **Step 4: Implementar o shell de resultado**

Ler o token do pathname, mostrar loading finito, chamar a API, renderizar erro seguro para 404/410/5xx e renderizar arco SVG, escala textual, seis barras, Insight Raevo, prioridades e CTAs quando houver sucesso. Marcar a página como `noindex, nofollow`. Durante `import.meta.env.DEV`, aceitar `?preview=result-50` para renderizar um fixture local de 50%; o ramo deverá ser eliminado do bundle de produção.

- [ ] **Step 5: Executar teste e build em GREEN**

Run: `node tests/maturity-result.test.mjs && npm run build`

Expected: PASS e shell gerado em `dist/teste-maturidade-comercial/resultado/index.html`.

- [ ] **Step 6: Ligar teste e commit**

```bash
git add package.json tests/maturity-result.test.mjs src/lib/maturity-result.mjs src/components/maturity/MaturityResult.astro src/pages/teste-maturidade-comercial/resultado
git commit -m "feat: add personalized maturity result"
```

## Task 8: PDF A4 em seis páginas

**Files:**
- Create: `tests/maturity-pdf.test.mjs`
- Create: `src/lib/maturity-pdf.mjs`
- Create: `public/assets/fonts/Sora-SemiBold.ttf`
- Create: `public/assets/fonts/Inter-Regular.ttf`
- Create: `public/assets/fonts/OFL.txt`
- Modify: `src/components/maturity/MaturityResult.astro`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Instalar dependências declaradas**

Run: `pnpm add pdf-lib @pdf-lib/fontkit`

Expected: dependências adicionadas sem remover pacotes existentes.

- [ ] **Step 2: Escrever teste RED do modelo de PDF**

Separar `buildPdfPages(result)` da renderização binária e verificar seis páginas com títulos, empresa, responsável, percentagem, seis pilares, insight, três prioridades e contacto. Verificar `sanitizePdfFilename("Clínica São João") === "relatorio-maturidade-comercial-clinica-sao-joao.pdf"`.

- [ ] **Step 3: Executar e confirmar falha**

Run: `node tests/maturity-pdf.test.mjs`

Expected: FAIL por módulo ausente.

- [ ] **Step 4: Adicionar fontes OFL e implementar o PDF**

Incorporar Sora SemiBold e Inter Regular, desenhar seis páginas A4 com margens seguras, cabeçalhos/rodapés, arco/percentagem, barras de pilares e quebra de texto calculada. Exportar `buildPdfPages`, `generateMaturityPdf`, `downloadMaturityPdf` e `sanitizePdfFilename`.

- [ ] **Step 5: Ligar o botão com estados de erro**

O botão mostrará “A preparar o relatório…”, bloqueará cliques duplicados, descarregará o Blob e voltará ao estado normal. Em falha, mostrará mensagem acessível e permitirá repetir.

- [ ] **Step 6: Executar teste e build em GREEN**

Run: `node tests/maturity-pdf.test.mjs && npm run build`

Expected: PASS e bundle do PDF carregado apenas na página de resultado.

- [ ] **Step 7: Ligar teste e commit**

```bash
git add package.json pnpm-lock.yaml tests/maturity-pdf.test.mjs src/lib/maturity-pdf.mjs src/components/maturity/MaturityResult.astro public/assets/fonts
git commit -m "feat: generate maturity assessment PDF"
```

## Task 9: Acabamento visual responsivo

**Files:**
- Create: `src/styles/maturity.css`
- Modify: `src/components/maturity/*.astro`

- [ ] **Step 1: Implementar os tokens e a composição desktop**

Reutilizar os valores de `official.css`; manter raio máximo de 4 px; criar ritmo editorial de 112–128 px nas secções da landing; desenhar escala, arco e barras sem gradientes decorativos; manter largura máxima próxima de 1280 px.

- [ ] **Step 2: Implementar os ecrãs focados do questionário**

Usar carvão, progresso ciano, rótulo champagne, alternativas com contraste forte, seleção com contorno/marcador, e navegação sempre clara. Evitar cartões excessivos.

- [ ] **Step 3: Implementar breakpoints mobile**

Em 768 px e 480 px: header compacto, hero em coluna, escala vertical ou rolável sem overflow do viewport, corpo mínimo 16 px, botões 48 px, formulário de coluna única, resultado e barras legíveis, CTA móvel sem cobrir a última alternativa.

- [ ] **Step 4: Implementar estados e movimento**

Adicionar hover, focus-visible, disabled, selected, loading, error e success. Usar uma única sequência de reveal na landing; desativar transições não essenciais com `prefers-reduced-motion`.

- [ ] **Step 5: Executar testes e build**

Run: `npm test && npm run build`

Expected: todos os testes PASS e build exit code 0.

- [ ] **Step 6: Commit focado**

```bash
git add src/styles/maturity.css src/components/maturity
git commit -m "style: polish maturity assessment experience"
```

## Task 10: Verificação funcional e visual final

**Files:**
- Modify only if validation finds an issue: files introduced above

- [ ] **Step 1: Executar a suite completa**

Run: `npm test`

Expected: exit code 0 e zero falhas.

- [ ] **Step 2: Executar build de produção**

Run: `npm run build`

Expected: exit code 0, todas as rotas no `dist/`, PHP e `.htaccess` copiados.

- [ ] **Step 3: Iniciar preview local e percorrer o funil**

Run: `npm run dev -- --host 127.0.0.1`

Validar landing, introdução, cinco contextos, perguntas 01/18, voltar, atualizar e identificação. Para o resultado, abrir `/teste-maturidade-comercial/resultado/preview/?preview=result-50` no servidor de desenvolvimento e confirmar que o build de produção não contém a string `result-50`.

- [ ] **Step 4: Inspecionar desktop e mobile**

Capturar e rever 1440×900, 768×1024 e 390×844. Corrigir alinhamento, overflow, foco, legibilidade, conteúdo comprimido e CTAs sobrepostos.

- [ ] **Step 5: Validar o PDF**

Gerar um resultado de 50%, abrir o PDF, confirmar seis páginas, A4, caracteres `ç`, `ã`, `é`, barras, margens, nome do ficheiro e ausência de cortes.

- [ ] **Step 6: Reexecutar verificações depois de correções**

Run: `npm test && npm run build`

Expected: exit code 0 para ambos.

- [ ] **Step 7: Rever o diff e o estado do repositório**

Run: `git diff --check && git status --short`

Confirmar que alterações preexistentes do utilizador permanecem intactas e que nenhum segredo, resultado privado ou ficheiro temporário foi incluído.
