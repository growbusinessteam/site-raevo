# Live Semanal 01 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar uma landing page responsiva em `/live-samanal-01` que leve diretamente ao grupo de WhatsApp da live semanal.

**Architecture:** Página Astro independente para evitar navegação concorrente, com CSS dedicado e sem JavaScript de rastreamento. O conteúdo usa “vendedor de IA” como termo de entrada e delimita as funções reais da IA.

**Tech Stack:** Astro 5, CSS nativo, JavaScript do navegador, testes Node `assert`.

---

### Task 1: Contrato estrutural da rota

**Files:**
- Create: `tests/live-samanal-01.test.mjs`
- Modify: `package.json`

- [ ] Criar um teste que exija a rota, o link exato do WhatsApp, a headline com “vendedor de IA”, três CTAs, foco visível, redução de movimento e ausência de Pixel.
- [ ] Executar `node tests/live-samanal-01.test.mjs` e confirmar falha por ausência da página.

### Task 2: Página e estilos

**Files:**
- Create: `src/pages/live-samanal-01.astro`
- Create: `src/styles/live-semanal.css`

- [ ] Implementar o HTML semântico da barra, hero, sistema orbital, resultados, adequação e CTA final.
- [ ] Aplicar a paleta Raevo, tipografia Sora/Inter, layout responsivo e CTA fixo no mobile.
- [ ] Adicionar foco visível e `prefers-reduced-motion`.
- [ ] Manter os CTAs como links diretos, sem Pixel ou rastreamento externo.
- [ ] Executar o teste específico e confirmar aprovação.

### Task 3: Integração e QA

**Files:**
- Modify: `package.json`

- [ ] Incluir o teste no script principal antes dos testes de páginas institucionais.
- [ ] Executar `pnpm test` e corrigir somente regressões causadas pela nova rota.
- [ ] Executar `pnpm build` e confirmar a geração de `dist/live-samanal-01/index.html`.
- [ ] Servir a build localmente e capturar screenshots em 1440 px, 768 px e 390 px.
- [ ] Conferir visualmente hierarquia, legibilidade, CTA, ausência de overflow e destino do WhatsApp.
