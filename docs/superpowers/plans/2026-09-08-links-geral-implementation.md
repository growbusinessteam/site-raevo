# Raevo Links Geral Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar, validar e publicar em `https://raevo.io/links-geral` a página premium de links aprovada para a Raevo.

**Architecture:** Uma rota Astro standalone concentra o HTML sem importar o cabeçalho e o rodapé institucionais. Um stylesheet isolado implementa a composição sobre o vídeo oficial, a grelha responsiva e as interações; um PNG próprio guarda a logo stone + ciano com transparência real. Um teste estrutural cobre conteúdo, ordem, destinos e requisitos de acessibilidade antes do deploy da pasta `dist/` na branch `hostinger-dist`.

**Tech Stack:** Astro 5, HTML semântico, CSS responsivo, JavaScript mínimo, Node `assert`, pnpm, Git worktree e Hostinger Git deploy.

---

## Estrutura de ficheiros

- `tests/links-geral.test.mjs`: contrato estrutural exclusivo da nova rota.
- `src/pages/links-geral.astro`: documento, conteúdo, destinos, ícones SVG e comportamento de movimento reduzido.
- `src/styles/links-geral.css`: identidade visual, vídeo, cartões, interação, responsividade e acessibilidade.
- `public/assets/brand/raevo-logo-stone-cyan-transparent.png`: lettering aprovado com fundo alfa real.
- `package.json`: inclui o novo contrato na suíte principal.

### Task 1: Criar o contrato estrutural em RED

**Files:**
- Create: `tests/links-geral.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Escrever o teste da rota**

```js
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const pagePath = join(root, "src/pages/links-geral.astro");
const stylePath = join(root, "src/styles/links-geral.css");
const logoPath = join(root, "public/assets/brand/raevo-logo-stone-cyan-transparent.png");

assert.ok(existsSync(pagePath), "the links geral route should exist");
assert.ok(existsSync(stylePath), "the links geral route should have isolated styles");
assert.ok(existsSync(logoPath), "the transparent stone and cyan logo should exist");

const page = readFileSync(pagePath, "utf8");
const styles = readFileSync(stylePath, "utf8");

const live = 'href="/live-samanal-01"';
const site = 'href="/"';
const portugal = 'href="https://wa.me/351963763408"';
const brasil = 'href="https://wa.me/5562982727476"';

for (const phrase of [
  "Escolha o seu",
  "próximo movimento.",
  "Estratégia, tecnologia e execução para transformar operações e acelerar o crescimento.",
  "Live semanal Raevo",
  "Conheça a Raevo",
  "Portugal",
  "Brasil",
  "WhatsApp direto",
]) {
  assert.ok(page.includes(phrase), `links page should include ${phrase}`);
}

for (const href of [live, site, portugal, brasil]) {
  assert.ok(page.includes(href), `links page should include ${href}`);
}

assert.ok(page.indexOf(live) < page.indexOf(site), "live should appear before the institutional site");
assert.ok(page.indexOf(site) < page.indexOf(portugal), "site should appear before Portugal");
assert.ok(page.indexOf(portugal) < page.indexOf(brasil), "Portugal should appear before Brasil");
assert.ok(!page.includes("Alysson"), "the page should not expose a person name");
assert.ok(!page.includes("Equipe Raevo"), "the WhatsApp cards should show only country names");
assert.ok(page.includes("/assets/video/raevo-oficial-hero.mp4"), "the official hero video should be reused");
assert.ok(page.includes("/assets/video/raevo-oficial-hero-poster.jpg"), "the official poster should be reused");
assert.ok(page.includes("/assets/brand/raevo-logo-stone-cyan-transparent.png"), "the transparent approved logo should be used");
assert.ok((page.match(/<svg/g) ?? []).length >= 4, "every destination should have an inline icon");
assert.ok((page.match(/target="_blank"/g) ?? []).length === 2, "only WhatsApp links should open a new tab");
assert.ok((page.match(/rel="noopener noreferrer"/g) ?? []).length === 2, "external WhatsApp links should be isolated");
assert.ok(page.includes("data-links-video"), "the decorative video should be addressable for reduced motion");
assert.ok(page.includes("video.pause()"), "the decorative video should pause for reduced motion");
assert.match(styles, /--carvao:\s*#1f1f1f/i, "the page should use Raevo charcoal");
assert.match(styles, /--pedra:\s*#e9e4da/i, "the page should use Raevo stone");
assert.match(styles, /--champagne:\s*#c7a97a/i, "the page should use Raevo champagne");
assert.match(styles, /--ciano:\s*#00b8c6/i, "the page should use Raevo cyan");
assert.match(styles, /--whatsapp:\s*#25d366/i, "WhatsApp icons should use the official green");
assert.match(styles, /:focus-visible/, "keyboard focus should be visible");
assert.match(styles, /prefers-reduced-motion/, "motion should respect the user preference");
assert.match(styles, /@media\s*\(max-width:\s*640px\)/, "the page should have a mobile layout");

console.log("Links geral route, destinations, branding, and accessibility are present.");
```

- [ ] **Step 2: Executar o teste e observar a falha esperada**

Run: `node tests/links-geral.test.mjs`

Expected: `AssertionError: the links geral route should exist`.

- [ ] **Step 3: Adicionar o teste à suíte principal**

Alterar o início de `scripts.test` em `package.json` para:

```json
"test": "node tests/links-geral.test.mjs && node tests/live-samanal-01.test.mjs && node tests/site-structure.test.mjs"
```

Manter na sequência todos os restantes testes já existentes depois de `tests/site-structure.test.mjs`.

### Task 2: Implementar a experiência visual em GREEN

**Files:**
- Create: `src/pages/links-geral.astro`
- Create: `src/styles/links-geral.css`
- Create: `public/assets/brand/raevo-logo-stone-cyan-transparent.png`
- Test: `tests/links-geral.test.mjs`

- [ ] **Step 1: Copiar o ativo transparente validado**

```bash
cp /Users/thiagoviana/.codex/generated_images/01a08307-1e26-7d12-93ca-d702b67acac9/exec-f7521ce8-85ea-4fb2-9e7a-574161eeeaeb.png public/assets/brand/raevo-logo-stone-cyan-transparent.png
```

- [ ] **Step 2: Criar a rota standalone**

Criar `src/pages/links-geral.astro` com metadados canónicos, o vídeo oficial decorativo, um único `h1`, a ordem Live → Site → Portugal → Brasil, quatro SVGs inline e o script de movimento reduzido. Os destinos são exatamente:

```astro
---
import "../styles/links-geral.css";
const title = "Links Raevo | O seu próximo movimento";
const description = "Estratégia, tecnologia e execução para transformar operações e acelerar o crescimento.";
---
```

```html
<a class="link-card live" href="/live-samanal-01">Live semanal Raevo</a>
<a class="link-card site" href="/">Conheça a Raevo</a>
<a class="link-card whatsapp" href="https://wa.me/351963763408" target="_blank" rel="noopener noreferrer">Portugal</a>
<a class="link-card whatsapp" href="https://wa.me/5562982727476" target="_blank" rel="noopener noreferrer">Brasil</a>
```

O script final deve conter:

```js
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const video = document.querySelector("[data-links-video]");
if (reducedMotion.matches && video instanceof HTMLVideoElement) video.pause();
```

- [ ] **Step 3: Criar o stylesheet isolado**

Criar `src/styles/links-geral.css` com os tokens exatos:

```css
:root {
  --pedra: #e9e4da;
  --carvao: #1f1f1f;
  --champagne: #c7a97a;
  --ciano: #00b8c6;
  --whatsapp: #25d366;
  --display: "Sora", sans-serif;
  --body: "Inter", sans-serif;
}
```

O canvas ocupa `min-height: 100svh`; o vídeo usa `position: fixed`, `object-fit: cover` e `opacity: .5`. O overlay replica os dois gradientes do hero oficial. A coluna usa `width: min(100% - 36px, 760px)`. A logo usa `width: 162px`, fundo ausente e apenas `drop-shadow`; no mobile usa `140px`.

Os cartões usam três colunas internas (`ícone`, texto, seta), fundo translúcido, `backdrop-filter`, borda fina e altura mínima de `88px`. O hover eleva o cartão; `:focus-visible` recebe outline ciano. Live usa champagne, Site usa ciano e WhatsApp usa apenas `--whatsapp`. Em até `640px`, Portugal e Brasil passam de duas para uma coluna. Em `prefers-reduced-motion`, transições e animações ficam desativadas.

- [ ] **Step 4: Executar o contrato e observar GREEN**

Run: `node tests/links-geral.test.mjs`

Expected: `Links geral route, destinations, branding, and accessibility are present.`

- [ ] **Step 5: Executar a suíte completa**

Run: `pnpm test`

Expected: exit code `0`, incluindo o novo teste e todos os testes anteriores.

- [ ] **Step 6: Criar o commit da funcionalidade**

```bash
git add tests/links-geral.test.mjs package.json src/pages/links-geral.astro src/styles/links-geral.css public/assets/brand/raevo-logo-stone-cyan-transparent.png
git commit -m "feat: add premium Raevo links page"
```

### Task 3: Build, QA visual e publicação Hostinger

**Files:**
- Verify: `dist/links-geral/index.html`
- Publish: `/private/tmp/raevo-hostinger-dist`

- [ ] **Step 1: Gerar o build de produção**

Run: `pnpm build`

Expected: exit code `0` e rota `/links-geral/index.html` no output do Astro.

- [ ] **Step 2: Confirmar as rotas protegidas no `dist/`**

```bash
test -f dist/index.html
test -f dist/links-geral/index.html
test -f dist/pt-oficial/index.html
test -f dist/pt-oficial/forms/index.html
test -f dist/pt-oficial/forms/obrigado/index.html
test -f dist/br-oficial/index.html
test -f dist/br-oficial/forms/index.html
test -f dist/br-oficial/forms/obrigado/index.html
test -f dist/pt-med/index.html
```

Expected: todos os comandos retornam exit code `0`.

- [ ] **Step 3: Fazer QA visual local**

Servir `dist/`, abrir `/links-geral/` em 1440px, 768px e 390px e confirmar: logo transparente e reduzida, vídeo oficial, ordem correta, ícones, hover/foco, contactos empilhados no mobile e ausência de overflow horizontal. Não enviar formulários nem leads.

- [ ] **Step 4: Localizar e validar o worktree de produção**

Run: `git worktree list --porcelain`

Confirmar `/private/tmp/raevo-hostinger-dist`, branch `hostinger-dist` e árvore limpa com:

```bash
git -C /private/tmp/raevo-hostinger-dist branch --show-current
git -C /private/tmp/raevo-hostinger-dist status --short
```

Expected: `hostinger-dist` e nenhuma linha de status.

- [ ] **Step 5: Sincronizar o build somente para o worktree validado**

```bash
rsync -a --delete --exclude='.git' dist/ /private/tmp/raevo-hostinger-dist/
```

Antes de continuar, conferir o diff e a preservação de `pt-med/index.html`.

- [ ] **Step 6: Versionar e publicar a branch de produção**

```bash
git -C /private/tmp/raevo-hostinger-dist add -A
git -C /private/tmp/raevo-hostinger-dist commit -m "Publish Raevo links page"
git -C /private/tmp/raevo-hostinger-dist push origin hostinger-dist
```

Guardar o hash do commit publicado.

- [ ] **Step 7: Confirmar a implantação na Hostinger**

No site `raevo.io`, verificar em **Última implantação**: estado `Concluído`, branch `hostinger-dist`, commit igual ao push e raiz `public_html`. Se houver 2FA, CAPTCHA ou confirmação de conta, pedir ação ao utilizador.

- [ ] **Step 8: Validar produção sem mutações**

Confirmar resposta HTTP e conteúdo em:

```text
https://raevo.io/
https://raevo.io/links-geral/
https://raevo.io/pt-oficial/
https://raevo.io/br-oficial/
https://raevo.io/pt-oficial/forms/
https://raevo.io/br-oficial/forms/
https://raevo.io/pt-med/
```

Expected: HTTP `200`; `/links-geral/` contém a copy aprovada, os quatro destinos e o novo ativo de logo.
