# Raevo Oficial PT/BR Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar o site oficial localizado da Raevo em Portugal e no Brasil, com formulários próprios, mantendo `/pt-med` intacta e disponível.

**Architecture:** A nova experiência será uma feature Astro isolada em `src/components/official`, alimentada por um dicionário tipado em `src/data/official.ts`. As rotas selecionam o locale e reutilizam os mesmos componentes; a landing médica continua servindo os arquivos `public/stitch` por wrappers próprios em `/pt-med`.

**Tech Stack:** Astro 5, TypeScript, CSS nativo, JavaScript de browser empacotado pelo Astro, Node `assert` para testes estruturais e funcionais, webhook HTTP existente.

---

## Estrutura de arquivos

### Criar

- `src/data/official.ts` — tipos, conteúdo PT/BR e metadados por locale.
- `src/lib/official-form.mjs` — validação e construção de payload em funções puras.
- `src/components/official/OfficialLayout.astro` — documento HTML, SEO e carregamento da identidade oficial.
- `src/components/official/OfficialHeader.astro` — navegação, menu móvel e seletor de país.
- `src/components/official/OfficialFooter.astro` — footer compartilhado e localizado.
- `src/components/official/CommercialSystem.astro` — diagrama responsivo da jornada comercial.
- `src/components/official/OfficialLanding.astro` — composição das seções da página.
- `src/components/official/OfficialLeadForm.astro` — formulário de três etapas e submissão.
- `src/components/official/OfficialThanks.astro` — confirmação localizada.
- `src/styles/official.css` — tokens e estilos isolados da nova experiência.
- `src/pages/pt-oficial/index.astro` — rota oficial PT.
- `src/pages/pt-oficial/forms/index.astro` — formulário PT.
- `src/pages/pt-oficial/forms/obrigado.astro` — confirmação PT.
- `src/pages/br-oficial/index.astro` — rota oficial BR.
- `src/pages/br-oficial/forms/index.astro` — formulário BR.
- `src/pages/br-oficial/forms/obrigado.astro` — confirmação BR.
- `src/pages/pt-med/index.astro` — wrapper local da landing médica existente.
- `src/pages/pt-med/forms/index.astro` — wrapper local do formulário médico existente.
- `src/pages/pt-med/obrigado/index.astro` — wrapper local da confirmação médica existente.
- `src/pages/pt-med/agendamento/index.astro` — wrapper local do agendamento médico existente.
- `tests/official-site.test.mjs` — testes de conteúdo, rotas, localização e preservação.
- `tests/official-form.test.mjs` — testes das funções puras do formulário.

### Modificar

- `src/pages/index.astro` — substituir o conteúdo médico pela composição oficial PT.
- `package.json` — executar as três suítes no comando `pnpm test`.
- `.gitignore` — ignorar `.superpowers/` e `tmp/`, sem remover arquivos do usuário.

### Não modificar

- `public/stitch/index.html`
- `public/stitch/forms.html`
- `public/stitch/obrigado.html`
- `public/stitch/agendamento.html`

Esses arquivos permanecem como fonte da landing `/pt-med`.

---

### Task 1: Contrato de rotas e preservação de `/pt-med`

**Files:**
- Create: `tests/official-site.test.mjs`
- Create: `src/pages/pt-med/index.astro`
- Create: `src/pages/pt-med/forms/index.astro`
- Create: `src/pages/pt-med/obrigado/index.astro`
- Create: `src/pages/pt-med/agendamento/index.astro`
- Modify: `package.json`

- [ ] **Step 1: Escrever o teste estrutural que falha**

Criar `tests/official-site.test.mjs` com verificações reais de arquivos e conteúdo:

```js
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");

const medicalRoutes = {
  "src/pages/pt-med/index.astro": "../../../public/stitch/index.html",
  "src/pages/pt-med/forms/index.astro": "../../../../public/stitch/forms.html",
  "src/pages/pt-med/obrigado/index.astro": "../../../../public/stitch/obrigado.html",
  "src/pages/pt-med/agendamento/index.astro": "../../../../public/stitch/agendamento.html",
};

for (const [route, source] of Object.entries(medicalRoutes)) {
  assert.ok(existsSync(join(root, route)), `${route} should exist`);
  assert.ok(read(route).includes(source), `${route} should preserve ${source}`);
}

for (const route of [
  "src/pages/pt-oficial/index.astro",
  "src/pages/pt-oficial/forms/index.astro",
  "src/pages/pt-oficial/forms/obrigado.astro",
  "src/pages/br-oficial/index.astro",
  "src/pages/br-oficial/forms/index.astro",
  "src/pages/br-oficial/forms/obrigado.astro",
]) {
  assert.ok(existsSync(join(root, route)), `${route} should exist`);
}
```

- [ ] **Step 2: Executar o teste e confirmar falha**

Run: `node tests/official-site.test.mjs`

Expected: `AssertionError` informando que `src/pages/pt-med/index.astro should exist`.

- [ ] **Step 3: Criar wrappers médicos mínimos**

Cada wrapper lê e devolve o HTML atual. Exemplo para `src/pages/pt-med/index.astro`:

```astro
---
import { readFileSync } from "node:fs";

const html = readFileSync(
  new URL("../../../public/stitch/index.html", import.meta.url),
  "utf8",
);

return new Response(html, {
  headers: { "Content-Type": "text/html; charset=utf-8" },
});
---
```

Repetir com os caminhos exatos definidos no teste para forms, obrigado e agendamento.

- [ ] **Step 4: Adicionar temporariamente as rotas oficiais mínimas**

Criar cada rota oficial com frontmatter válido e um marcador que será substituído nas tarefas seguintes:

```astro
---
const locale = "pt-PT";
---
<main data-locale={locale}>Raevo Oficial</main>
```

Usar `pt-PT` nas rotas PT e `pt-BR` nas rotas BR.

- [ ] **Step 5: Executar o teste e confirmar sucesso**

Run: `node tests/official-site.test.mjs`

Expected: exit code `0`, sem output de erro.

- [ ] **Step 6: Incluir as novas suítes no comando de teste**

Modificar `package.json`:

```json
"test": "node tests/site-structure.test.mjs && node tests/official-site.test.mjs && node tests/official-form.test.mjs"
```

O arquivo de teste do formulário será criado na Task 2 antes de executar `pnpm test`.

- [ ] **Step 7: Commit**

```bash
git add package.json tests/official-site.test.mjs src/pages/pt-med src/pages/pt-oficial src/pages/br-oficial
git commit -m "test: define official routes and preserve pt-med"
```

---

### Task 2: Modelo de conteúdo localizado e regras do formulário

**Files:**
- Create: `src/data/official.ts`
- Create: `src/lib/official-form.mjs`
- Create: `tests/official-form.test.mjs`
- Modify: `tests/official-site.test.mjs`

- [ ] **Step 1: Escrever testes que falham para validação e payload**

Criar `tests/official-form.test.mjs`:

```js
import assert from "node:assert/strict";
import {
  buildLeadPayload,
  normalizePhone,
  validateCompanyProfile,
  validateLead,
} from "../src/lib/official-form.mjs";

assert.equal(normalizePhone("+55 (11) 99999-8888"), "+5511999998888");
assert.equal(validateCompanyProfile("@raevo"), true);
assert.equal(validateCompanyProfile("raevo.io"), true);
assert.equal(validateCompanyProfile("https://raevo.io"), true);
assert.equal(validateCompanyProfile("x"), false);

assert.deepEqual(
  validateLead({ name: "", whatsapp: "+55 11 99999-8888", companyProfile: "raevo.io" }),
  { field: "name", code: "required" },
);

const payload = buildLeadPayload(
  { name: "Ana Lima", whatsapp: "+55 (11) 99999-8888", companyProfile: "@analima" },
  {
    locale: "pt-BR",
    country: "BR",
    sourceUrl: "https://raevo.io/br-oficial/forms?utm_source=meta",
    utm: { utm_source: "meta" },
  },
);

assert.equal(payload.fullName, "Ana Lima");
assert.equal(payload.whatsapp, "+5511999998888");
assert.equal(payload.instagramOrWebsite, "@analima");
assert.equal(payload.country, "BR");
assert.deepEqual(payload.utm, { utm_source: "meta" });
```

- [ ] **Step 2: Executar e confirmar a falha por módulo inexistente**

Run: `node tests/official-form.test.mjs`

Expected: `ERR_MODULE_NOT_FOUND` para `src/lib/official-form.mjs`.

- [ ] **Step 3: Implementar as funções puras mínimas**

Criar `src/lib/official-form.mjs`:

```js
export function normalizePhone(value) {
  const trimmed = String(value ?? "").trim();
  const digits = trimmed.replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}

export function validateCompanyProfile(value) {
  const profile = String(value ?? "").trim();
  return /^@[A-Za-z0-9._]{2,}$/.test(profile)
    || /^https?:\/\/[^\s.]+\.[^\s]+$/i.test(profile)
    || /^(?:www\.)?[^\s.]+\.[A-Za-z]{2,}(?:\/[^\s]*)?$/i.test(profile);
}

export function validateLead(values) {
  if (!String(values.name ?? "").trim()) return { field: "name", code: "required" };
  if (normalizePhone(values.whatsapp).length < 11) return { field: "whatsapp", code: "invalid" };
  if (!validateCompanyProfile(values.companyProfile)) return { field: "companyProfile", code: "invalid" };
  return null;
}

export function buildLeadPayload(values, context) {
  return {
    fullName: String(values.name).trim(),
    whatsapp: normalizePhone(values.whatsapp),
    instagramOrWebsite: String(values.companyProfile).trim(),
    locale: context.locale,
    country: context.country,
    sourceUrl: context.sourceUrl,
    utm: { ...context.utm },
  };
}
```

- [ ] **Step 4: Executar os testes do formulário**

Run: `node tests/official-form.test.mjs`

Expected: exit code `0`.

- [ ] **Step 5: Definir tipos e conteúdo PT/BR**

Criar `src/data/official.ts` com o contrato e o conteúdo abaixo:

```ts
export type OfficialLocale = "pt-PT" | "pt-BR";

export interface OfficialContent {
  locale: OfficialLocale;
  country: "PT" | "BR";
  languageLabel: string;
  alternateHref: string;
  homeHref: string;
  formHref: string;
  thanksHref: string;
  phonePrefix: "+351" | "+55";
  seo: { title: string; description: string; canonicalPath: string };
  nav: { label: string; href: string }[];
  hero: { eyebrow: string; title: string; body: string; cta: string };
  sections: {
    problemsEyebrow: string;
    problemsTitle: string;
    systemEyebrow: string;
    systemTitle: string;
    solutionsEyebrow: string;
    solutionsTitle: string;
    methodEyebrow: string;
    methodTitle: string;
    portfolioEyebrow: string;
    portfolioTitle: string;
    portfolioBody: string;
    audienceTitle: string;
    finalTitle: string;
    finalBody: string;
    finalCta: string;
  };
  problems: { title: string; body: string }[];
  journey: { label: string; detail: string }[];
  solutions: { title: string; body: string; outcome: string; icon: string }[];
  method: { title: string; body: string }[];
  audience: { title: string; body: string }[];
  form: {
    title: string;
    intro: string;
    questions: { id: "name" | "whatsapp" | "companyProfile"; label: string; placeholder: string }[];
    next: string;
    back: string;
    submit: string;
    submitting: string;
    retry: string;
  };
  thanks: { eyebrow: string; title: string; body: string; back: string };
  footer: { claim: string; terms: string; privacy: string; contact: string };
}

export const officialContent: Record<OfficialLocale, OfficialContent> = {
  "pt-PT": {
    locale: "pt-PT",
    country: "PT",
    languageLabel: "Mudar para a versão do Brasil",
    alternateHref: "/br-oficial/",
    homeHref: "/pt-oficial/",
    formHref: "/pt-oficial/forms/",
    thanksHref: "/pt-oficial/forms/obrigado/",
    phonePrefix: "+351",
    seo: {
      title: "Raevo | Sistemas comerciais para empresas de serviços",
      description: "Estratégia, processos, CRM, automação e aquisição conectados para empresas de serviços com vendas consultivas.",
      canonicalPath: "/pt-oficial/",
    },
    nav: [
      { label: "Home", href: "#home" },
      { label: "O problema", href: "#problema" },
      { label: "Sistema Raevo", href: "#sistema" },
      { label: "Soluções", href: "#solucoes" },
      { label: "Método", href: "#metodo" },
    ],
    hero: {
      eyebrow: "Estratégia · Sistemas · Operação",
      title: "Transformamos operações comerciais fragmentadas em sistemas de crescimento.",
      body: "Ligamos processos, tecnologia e aquisição para a sua empresa crescer com mais clareza e controlo.",
      cta: "Conhecer o sistema",
    },
    sections: {
      problemsEyebrow: "Quando a operação cresce sem sistema",
      problemsTitle: "O problema raramente é a falta de oportunidades.",
      systemEyebrow: "Sistema Comercial Raevo",
      systemTitle: "Tudo o que move a venda, ligado.",
      solutionsEyebrow: "O que implementamos",
      solutionsTitle: "Soluções que funcionam como um único sistema.",
      methodEyebrow: "Método",
      methodTitle: "Da leitura da operação à melhoria contínua.",
      portfolioEyebrow: "Experiência aplicada",
      portfolioTitle: "Estrutura comercial para operações que precisam de clareza.",
      portfolioBody: "A Raevo trabalha entre estratégia e execução: desenha a jornada, implementa a tecnologia e acompanha a adoção do processo.",
      audienceTitle: "Para empresas prontas para crescer com controlo.",
      finalTitle: "Vamos mapear a sua operação.",
      finalBody: "Uma conversa para perceber os gargalos, as prioridades e o sistema que faz sentido construir.",
      finalCta: "Falar com a Raevo",
    },
    problems: [
      { title: "Oportunidades dispersas", body: "Os contactos chegam por vários canais, mas falta uma visão única do que precisa de atenção." },
      { title: "WhatsApp sem processo", body: "Conversas importantes ficam dependentes da memória e da rotina de cada pessoa." },
      { title: "Follow-up irregular", body: "O interesse existe, mas a oportunidade arrefece quando o acompanhamento não acontece no momento certo." },
      { title: "Decisões sem dados", body: "Sem ligar origem, custo e venda, é difícil saber onde investir e o que corrigir." },
    ],
    journey: [
      { label: "Aquisição", detail: "Canais e campanhas" },
      { label: "Atendimento", detail: "Resposta e qualificação" },
      { label: "CRM", detail: "Pipeline e responsabilidades" },
      { label: "Proposta", detail: "Criação e envio" },
      { label: "Follow-up", detail: "Cadência multicanal" },
      { label: "Venda", detail: "Decisão e passagem" },
      { label: "Análise", detail: "Custos, origem e desempenho" },
    ],
    solutions: [
      { title: "Diagnóstico comercial", body: "Mapeamos perdas, tempos de resposta, decisões e responsabilidades em toda a jornada.", outcome: "As prioridades deixam de ser perceções e passam a ter uma ordem clara.", icon: "troubleshoot" },
      { title: "CRM ligado ao WhatsApp", body: "Implementamos o CRM com pipeline, histórico, tarefas e conversas ligados ao canal onde a equipa atende.", outcome: "Cada oportunidade ganha contexto e um próximo passo visível.", icon: "hub" },
      { title: "Jornada e dashboard comercial", body: "Acompanhamos custo por lead, custo por venda, tempo médio de fecho, origem e conversão por canal.", outcome: "O investimento pode ser concentrado no que produz resultado real.", icon: "monitoring" },
      { title: "Integração entre CRM e ERP", body: "Ligamos os sistemas para transferir dados comerciais e operacionais sem repetição manual.", outcome: "A equipa poupa tempo e reduz erros de transcrição.", icon: "sync_alt" },
      { title: "Propostas automáticas", body: "Transformamos dados da oportunidade em propostas consistentes, prontas para revisão e envio.", outcome: "A resposta ao cliente torna-se mais rápida sem perder controlo.", icon: "description" },
      { title: "Follow-ups por WhatsApp e e-mail", body: "Criamos cadências automáticas com mensagens, pausas e tarefas humanas nos momentos certos.", outcome: "Mais oportunidades recebem acompanhamento sem depender da memória.", icon: "schedule_send" },
      { title: "IA de atendimento", body: "Configuramos IA com contexto, regras e encaminhamento para responder, qualificar e apoiar a equipa.", outcome: "O cliente recebe atenção mais depressa e os casos certos chegam às pessoas certas.", icon: "smart_toy" },
      { title: "Funis com media paga", body: "Criamos páginas, campanhas, segmentação e rotinas de otimização ligadas aos dados comerciais.", outcome: "A aquisição passa a ser avaliada pela qualidade e pelas vendas que gera.", icon: "campaign" },
      { title: "Operação de crescimento", body: "Acompanhamos indicadores, adoção do processo e oportunidades de melhoria depois da implementação.", outcome: "O sistema evolui com a empresa em vez de ficar parado após o setup.", icon: "moving" },
    ],
    method: [
      { title: "Diagnosticar", body: "Ler a operação, os dados e os gargalos." },
      { title: "Desenhar", body: "Definir jornada, processos e responsabilidades." },
      { title: "Implementar", body: "Configurar sistemas, integrações, automações e formação." },
      { title: "Otimizar", body: "Acompanhar indicadores e melhorar continuamente." },
    ],
    audience: [
      { title: "Venda consultiva", body: "A decisão exige conversa, contexto e acompanhamento." },
      { title: "Fluxo recorrente de oportunidades", body: "A empresa já gera procura ou está pronta para a criar com consistência." },
      { title: "Liderança envolvida", body: "Existe um decisor disposto a priorizar processo, dados e mudança." },
    ],
    form: {
      title: "Vamos mapear a sua operação",
      intro: "Três respostas para iniciarmos a conversa com contexto.",
      questions: [
        { id: "name", label: "Nome", placeholder: "Como se chama?" },
        { id: "whatsapp", label: "WhatsApp", placeholder: "963 763 408" },
        { id: "companyProfile", label: "Instagram ou site da empresa", placeholder: "@empresa ou empresa.pt" },
      ],
      next: "Continuar",
      back: "Voltar",
      submit: "Enviar respostas",
      submitting: "A enviar...",
      retry: "Não foi possível enviar agora. Verifique a ligação e tente novamente.",
    },
    thanks: {
      eyebrow: "Recebemos os seus dados",
      title: "Obrigado por partilhar o contexto da sua empresa.",
      body: "A equipa Raevo irá analisar as informações e entrar em contacto pelo WhatsApp indicado.",
      back: "Voltar ao site",
    },
    footer: {
      claim: "Visão para evoluir. Sistemas para crescer.",
      terms: "Termos de Uso",
      privacy: "Privacidade",
      contact: "Contacto",
    },
  },
  "pt-BR": {
    locale: "pt-BR",
    country: "BR",
    languageLabel: "Mudar para a versão de Portugal",
    alternateHref: "/pt-oficial/",
    homeHref: "/br-oficial/",
    formHref: "/br-oficial/forms/",
    thanksHref: "/br-oficial/forms/obrigado/",
    phonePrefix: "+55",
    seo: {
      title: "Raevo | Sistemas comerciais para empresas de serviços",
      description: "Estratégia, processos, CRM, automação e aquisição conectados para empresas de serviços com vendas consultivas.",
      canonicalPath: "/br-oficial/",
    },
    nav: [
      { label: "Home", href: "#home" },
      { label: "O problema", href: "#problema" },
      { label: "Sistema Raevo", href: "#sistema" },
      { label: "Soluções", href: "#solucoes" },
      { label: "Método", href: "#metodo" },
    ],
    hero: {
      eyebrow: "Estratégia · Sistemas · Operação",
      title: "Transformamos operações comerciais fragmentadas em sistemas de crescimento.",
      body: "Conectamos processos, tecnologia e aquisição para sua empresa crescer com mais clareza e controle.",
      cta: "Conhecer o sistema",
    },
    sections: {
      problemsEyebrow: "Quando a operação cresce sem sistema",
      problemsTitle: "O problema raramente é a falta de oportunidades.",
      systemEyebrow: "Sistema Comercial Raevo",
      systemTitle: "Tudo o que move a venda, conectado.",
      solutionsEyebrow: "O que implementamos",
      solutionsTitle: "Soluções que funcionam como um único sistema.",
      methodEyebrow: "Método",
      methodTitle: "Da leitura da operação à melhoria contínua.",
      portfolioEyebrow: "Experiência aplicada",
      portfolioTitle: "Estrutura comercial para operações que precisam de clareza.",
      portfolioBody: "A Raevo trabalha entre estratégia e execução: desenha a jornada, implementa a tecnologia e acompanha a adoção do processo.",
      audienceTitle: "Para empresas prontas para crescer com controle.",
      finalTitle: "Vamos mapear sua operação.",
      finalBody: "Uma conversa para entender os gargalos, as prioridades e o sistema que faz sentido construir.",
      finalCta: "Falar com a Raevo",
    },
    problems: [
      { title: "Oportunidades espalhadas", body: "Os contatos chegam por vários canais, mas falta uma visão única do que precisa de atenção." },
      { title: "WhatsApp sem processo", body: "Conversas importantes ficam dependentes da memória e da rotina de cada pessoa." },
      { title: "Follow-up irregular", body: "O interesse existe, mas a oportunidade esfria quando o acompanhamento não acontece no momento certo." },
      { title: "Decisões sem dados", body: "Sem conectar origem, custo e venda, é difícil saber onde investir e o que corrigir." },
    ],
    journey: [
      { label: "Aquisição", detail: "Canais e campanhas" },
      { label: "Atendimento", detail: "Resposta e qualificação" },
      { label: "CRM", detail: "Pipeline e responsabilidades" },
      { label: "Proposta", detail: "Criação e envio" },
      { label: "Follow-up", detail: "Cadência multicanal" },
      { label: "Venda", detail: "Decisão e passagem" },
      { label: "Análise", detail: "Custos, origem e desempenho" },
    ],
    solutions: [
      { title: "Diagnóstico comercial", body: "Mapeamos perdas, tempos de resposta, decisões e responsabilidades em toda a jornada.", outcome: "As prioridades deixam de ser percepções e passam a ter uma ordem clara.", icon: "troubleshoot" },
      { title: "CRM conectado ao WhatsApp", body: "Implementamos o CRM com pipeline, histórico, tarefas e conversas conectados ao canal onde a equipe atende.", outcome: "Cada oportunidade ganha contexto e um próximo passo visível.", icon: "hub" },
      { title: "Jornada e dashboard comercial", body: "Acompanhamos custo por lead, custo por venda, tempo médio de fechamento, origem e conversão por canal.", outcome: "O investimento pode ser concentrado no que produz resultado real.", icon: "monitoring" },
      { title: "Integração entre CRM e ERP", body: "Conectamos os sistemas para transferir dados comerciais e operacionais sem repetição manual.", outcome: "A equipe economiza tempo e reduz erros de transcrição.", icon: "sync_alt" },
      { title: "Propostas automáticas", body: "Transformamos dados da oportunidade em propostas consistentes, prontas para revisão e envio.", outcome: "A resposta ao cliente fica mais rápida sem perder controle.", icon: "description" },
      { title: "Follow-ups por WhatsApp e e-mail", body: "Criamos cadências automáticas com mensagens, pausas e tarefas humanas nos momentos certos.", outcome: "Mais oportunidades recebem acompanhamento sem depender da memória.", icon: "schedule_send" },
      { title: "IA de atendimento", body: "Configuramos IA com contexto, regras e encaminhamento para responder, qualificar e apoiar a equipe.", outcome: "O cliente recebe atenção mais rápido e os casos certos chegam às pessoas certas.", icon: "smart_toy" },
      { title: "Funis com mídia paga", body: "Criamos páginas, campanhas, segmentação e rotinas de otimização conectadas aos dados comerciais.", outcome: "A aquisição passa a ser avaliada pela qualidade e pelas vendas que gera.", icon: "campaign" },
      { title: "Operação de crescimento", body: "Acompanhamos indicadores, adoção do processo e oportunidades de melhoria depois da implementação.", outcome: "O sistema evolui com a empresa em vez de parar depois do setup.", icon: "moving" },
    ],
    method: [
      { title: "Diagnosticar", body: "Ler a operação, os dados e os gargalos." },
      { title: "Desenhar", body: "Definir jornada, processos e responsabilidades." },
      { title: "Implementar", body: "Configurar sistemas, integrações, automações e treinamento." },
      { title: "Otimizar", body: "Acompanhar indicadores e melhorar continuamente." },
    ],
    audience: [
      { title: "Venda consultiva", body: "A decisão exige conversa, contexto e acompanhamento." },
      { title: "Fluxo recorrente de oportunidades", body: "A empresa já gera demanda ou está pronta para criá-la com consistência." },
      { title: "Liderança envolvida", body: "Existe um decisor disposto a priorizar processo, dados e mudança." },
    ],
    form: {
      title: "Vamos mapear sua operação",
      intro: "Três respostas para começarmos a conversa com contexto.",
      questions: [
        { id: "name", label: "Nome", placeholder: "Como você se chama?" },
        { id: "whatsapp", label: "WhatsApp", placeholder: "11 99999-8888" },
        { id: "companyProfile", label: "Instagram ou site da empresa", placeholder: "@empresa ou empresa.com.br" },
      ],
      next: "Continuar",
      back: "Voltar",
      submit: "Enviar respostas",
      submitting: "Enviando...",
      retry: "Não foi possível enviar agora. Verifique sua conexão e tente novamente.",
    },
    thanks: {
      eyebrow: "Recebemos seus dados",
      title: "Obrigado por compartilhar o contexto da sua empresa.",
      body: "A equipe Raevo vai analisar as informações e entrar em contato pelo WhatsApp informado.",
      back: "Voltar ao site",
    },
    footer: {
      claim: "Visão para evoluir. Sistemas para crescer.",
      terms: "Termos de Uso",
      privacy: "Privacidade",
      contact: "Contato",
    },
  },
};
```

Os nove itens de `solutions` devem corresponder exatamente às entregas aprovadas na especificação; `journey` deve conter Aquisição, Atendimento, CRM, Proposta, Follow-up, Venda e Análise.

- [ ] **Step 6: Ampliar o teste estrutural para o conteúdo**

Adicionar em `tests/official-site.test.mjs`:

```js
const content = read("src/data/official.ts");
for (const phrase of [
  '"pt-PT"',
  '"pt-BR"',
  "CRM",
  "WhatsApp",
  "ERP",
  "propostas",
  "follow-ups",
  "IA de atendimento",
  "mídia paga",
]) {
  assert.ok(content.includes(phrase), `official content should include ${phrase}`);
}
assert.ok(!/R\$|€|mensalidade|preço por mês/i.test(content), "official content should not expose prices");
```

- [ ] **Step 7: Executar os dois testes novos**

Run: `node tests/official-form.test.mjs && node tests/official-site.test.mjs`

Expected: exit code `0`.

- [ ] **Step 8: Commit**

```bash
git add src/data/official.ts src/lib/official-form.mjs tests/official-form.test.mjs tests/official-site.test.mjs
git commit -m "feat: add localized official content model"
```

---

### Task 3: Shell visual, header e footer fiéis à landing existente

**Files:**
- Create: `src/components/official/OfficialLayout.astro`
- Create: `src/components/official/OfficialHeader.astro`
- Create: `src/components/official/OfficialFooter.astro`
- Create: `src/styles/official.css`
- Modify: `tests/official-site.test.mjs`

- [ ] **Step 1: Escrever teste estrutural que falha para identidade e SEO**

Adicionar em `tests/official-site.test.mjs`:

```js
for (const file of [
  "src/components/official/OfficialLayout.astro",
  "src/components/official/OfficialHeader.astro",
  "src/components/official/OfficialFooter.astro",
  "src/styles/official.css",
]) {
  assert.ok(existsSync(join(root, file)), `${file} should exist`);
}

const styles = read("src/styles/official.css");
for (const token of ["#E9E4DA", "#DCCFBE", "#B8AB98", "#1F1F1F", "#C7A97A", "#00B8C6", "Sora", "Inter"]) {
  assert.ok(styles.includes(token), `official styles should preserve ${token}`);
}

const layout = read("src/components/official/OfficialLayout.astro");
for (const phrase of ["hreflang", "canonical", "pt-PT", "pt-BR", "/favicon.ico?v=20260702"]) {
  assert.ok(layout.includes(phrase), `official layout should include ${phrase}`);
}
```

- [ ] **Step 2: Executar e confirmar falha por arquivos inexistentes**

Run: `node tests/official-site.test.mjs`

Expected: `AssertionError` para `OfficialLayout.astro should exist`.

- [ ] **Step 3: Implementar `OfficialLayout.astro`**

O layout deve receber `content`, definir `lang`, title, description, canonical e alternates, carregar Sora/Inter, ícones, favicons e `official.css`:

```astro
---
import type { OfficialContent } from "../../data/official";
import "../../styles/official.css";
const { content } = Astro.props as { content: OfficialContent };
const canonical = new URL(content.seo.canonicalPath, Astro.site);
---
<!doctype html>
<html lang={content.locale}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{content.seo.title}</title>
    <meta name="description" content={content.seo.description} />
    <link rel="canonical" href={canonical} />
    <link rel="alternate" hreflang="pt-PT" href={new URL("/pt-oficial/", Astro.site)} />
    <link rel="alternate" hreflang="pt-BR" href={new URL("/br-oficial/", Astro.site)} />
    <link rel="icon" href="/favicon.ico?v=20260702" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@600;700&display=swap" rel="stylesheet" />
  </head>
  <body><slot /></body>
</html>
```

- [ ] **Step 4: Implementar header e footer compartilhados**

Usar `public/assets/brand/raevo-logo-official-transparent.png` e reproduzir a estrutura visual do header/footer existente. O header recebe `content`, usa `content.nav`, `content.formHref` e `content.alternateHref`. O seletor precisa ter:

```astro
<a class="country-switch" href={content.alternateHref} data-country-switch>
  <span aria-hidden="true">{content.country === "PT" ? "🇵🇹" : "🇧🇷"}</span>
  <span>{content.country}</span>
  <span class="sr-only">{content.languageLabel}</span>
</a>
```

O script do header deve alternar `aria-expanded`, abrir/fechar o menu móvel e anexar `window.location.search` ao link de país para preservar UTMs.

- [ ] **Step 5: Implementar tokens e estilos base**

Em `src/styles/official.css`, definir os tokens aprovados:

```css
:root {
  --raevo-pedra: #E9E4DA;
  --raevo-areia: #DCCFBE;
  --raevo-taupe: #B8AB98;
  --raevo-carvao: #1F1F1F;
  --raevo-champagne: #C7A97A;
  --raevo-caian: #00B8C6;
  --raevo-surface: #FEF9EE;
  --raevo-display: "Sora", sans-serif;
  --raevo-body: "Inter", sans-serif;
}
```

Adicionar reset isolado, container máximo de `1280px`, espaçamento de seções coerente com `120px`, foco visível, header fixo, menu mobile, botões, footer e media query para `prefers-reduced-motion`.

- [ ] **Step 6: Executar teste estrutural**

Run: `node tests/official-site.test.mjs`

Expected: exit code `0`.

- [ ] **Step 7: Commit**

```bash
git add src/components/official/OfficialLayout.astro src/components/official/OfficialHeader.astro src/components/official/OfficialFooter.astro src/styles/official.css tests/official-site.test.mjs
git commit -m "feat: add Raevo official visual shell"
```

---

### Task 4: Landing oficial e diagrama do sistema comercial

**Files:**
- Create: `src/components/official/CommercialSystem.astro`
- Create: `src/components/official/OfficialLanding.astro`
- Modify: `src/styles/official.css`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/pt-oficial/index.astro`
- Modify: `src/pages/br-oficial/index.astro`
- Modify: `tests/official-site.test.mjs`

- [ ] **Step 1: Escrever teste que falha para composição das rotas**

Adicionar em `tests/official-site.test.mjs`:

```js
const landing = read("src/components/official/OfficialLanding.astro");
for (const id of ["problema", "sistema", "solucoes", "metodo", "portfolio", "contato"]) {
  assert.ok(landing.includes(`id="${id}"`), `landing should include #${id}`);
}
assert.ok(landing.includes("CommercialSystem"), "landing should render commercial system diagram");

for (const [route, locale] of [
  ["src/pages/index.astro", 'officialContent["pt-PT"]'],
  ["src/pages/pt-oficial/index.astro", 'officialContent["pt-PT"]'],
  ["src/pages/br-oficial/index.astro", 'officialContent["pt-BR"]'],
]) {
  const source = read(route);
  assert.ok(source.includes("OfficialLanding"), `${route} should render OfficialLanding`);
  assert.ok(source.includes(locale), `${route} should use ${locale}`);
}
```

- [ ] **Step 2: Executar e confirmar falha**

Run: `node tests/official-site.test.mjs`

Expected: falha porque `OfficialLanding.astro` ainda não existe.

- [ ] **Step 3: Implementar o diagrama**

`CommercialSystem.astro` recebe `content.journey` e renderiza uma lista semântica:

```astro
---
import type { OfficialContent } from "../../data/official";
const { steps } = Astro.props as { steps: OfficialContent["journey"] };
---
<ol class="commercial-system" aria-label="Sistema Comercial Raevo">
  {steps.map((step, index) => (
    <li class="commercial-system__step">
      <span class="commercial-system__index">{String(index + 1).padStart(2, "0")}</span>
      <strong>{step.label}</strong>
      <span>{step.detail}</span>
    </li>
  ))}
</ol>
```

No CSS, usar grid horizontal no desktop e uma linha vertical no mobile, com o CRM destacado em ciano e sem overflow horizontal.

- [ ] **Step 4: Implementar `OfficialLanding.astro`**

Compor `OfficialLayout`, `OfficialHeader`, `CommercialSystem` e `OfficialFooter`. Renderizar:

- hero com vídeo atual em `/assets/video/raevo-hero-video-01.mp4`;
- faixa de logos de clientes já existentes;
- cards do problema;
- diagrama do sistema;
- grid com as nove soluções;
- método em quatro passos;
- bloco de portfólio usando apenas ativos e afirmações verificáveis;
- público ideal;
- CTA final para `content.formHref`.

Todos os links CTA devem usar a mesma classe visual e nenhum bloco deve incluir preço.

- [ ] **Step 5: Trocar as três rotas pela composição compartilhada**

Exemplo de `src/pages/br-oficial/index.astro`:

```astro
---
import OfficialLanding from "../../components/official/OfficialLanding.astro";
import { officialContent } from "../../data/official";
const content = officialContent["pt-BR"];
---
<OfficialLanding {content} />
```

Usar o caminho relativo correto na raiz e em `/pt-oficial`.

- [ ] **Step 6: Executar testes estruturais**

Run: `node tests/official-site.test.mjs`

Expected: exit code `0`.

- [ ] **Step 7: Commit**

```bash
git add src/components/official/CommercialSystem.astro src/components/official/OfficialLanding.astro src/styles/official.css src/pages/index.astro src/pages/pt-oficial/index.astro src/pages/br-oficial/index.astro tests/official-site.test.mjs
git commit -m "feat: build localized Raevo official landing"
```

---

### Task 5: Formulário em etapas e páginas de obrigado

**Files:**
- Create: `src/components/official/OfficialLeadForm.astro`
- Create: `src/components/official/OfficialThanks.astro`
- Modify: `src/styles/official.css`
- Modify: `src/pages/pt-oficial/forms/index.astro`
- Modify: `src/pages/pt-oficial/forms/obrigado.astro`
- Modify: `src/pages/br-oficial/forms/index.astro`
- Modify: `src/pages/br-oficial/forms/obrigado.astro`
- Modify: `tests/official-site.test.mjs`

- [ ] **Step 1: Escrever teste que falha para o formulário e redirects**

Adicionar em `tests/official-site.test.mjs`:

```js
const leadForm = read("src/components/official/OfficialLeadForm.astro");
assert.ok(leadForm.includes("content.form.questions.map"), "lead form should render localized questions");
assert.equal(
  (content.match(/\{ id: "(?:name|whatsapp|companyProfile)"/g) ?? []).length,
  6,
  "each locale should define exactly the three requested questions",
);
assert.ok(leadForm.includes("https://hook.growautomacao.com.br/webhook/raevo-site-kommo"));
assert.ok(leadForm.includes("validateLead"));
assert.ok(leadForm.includes("buildLeadPayload"));
assert.ok(leadForm.includes("response.ok"));

for (const [route, redirect] of [
  ["src/pages/pt-oficial/forms/index.astro", "/pt-oficial/forms/obrigado"],
  ["src/pages/br-oficial/forms/index.astro", "/br-oficial/forms/obrigado"],
]) {
  assert.ok(read(route).includes(redirect), `${route} should redirect to ${redirect}`);
}
```

- [ ] **Step 2: Executar e confirmar falha**

Run: `node tests/official-site.test.mjs`

Expected: falha porque `OfficialLeadForm.astro` ainda não existe.

- [ ] **Step 3: Implementar o formulário**

`OfficialLeadForm.astro` recebe `content` e `redirectTo`. Renderizar `<form novalidate>` com barra de progresso, uma pergunta visível por vez, botões voltar/continuar e submit.

O `<form>` deve expor `data-locale`, `data-country`, `data-redirect` e `data-retry-message`. O script deve usar essas propriedades com as funções puras:

```js
import {
  buildLeadPayload,
  normalizePhone,
  validateCompanyProfile,
  validateLead,
} from "../../lib/official-form.mjs";

const WEBHOOK = "https://hook.growautomacao.com.br/webhook/raevo-site-kommo";
const form = document.querySelector("[data-official-lead-form]");
const steps = Array.from(form.querySelectorAll("[data-form-step]"));
let currentStep = 0;

function utmValues() {
  const search = new URLSearchParams(window.location.search);
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  return Object.fromEntries(keys.flatMap((key) => search.get(key) ? [[key, search.get(key)]] : []));
}

function pageContext() {
  return {
    locale: form.dataset.locale,
    country: form.dataset.country,
    sourceUrl: window.location.href,
    utm: utmValues(),
  };
}

function values() {
  const data = new FormData(form);
  return {
    name: data.get("name"),
    whatsapp: `${data.get("phonePrefix")}${data.get("whatsapp")}`,
    companyProfile: data.get("companyProfile"),
  };
}

function setSubmitting(isSubmitting) {
  const submit = form.querySelector('[type="submit"]');
  submit.disabled = isSubmitting;
  submit.setAttribute("aria-busy", String(isSubmitting));
  submit.textContent = isSubmitting ? form.dataset.submittingLabel : form.dataset.submitLabel;
}

function clearErrors() {
  form.querySelectorAll("[data-field-error], [data-submit-error]").forEach((element) => {
    element.textContent = "";
    element.hidden = true;
  });
}

function showFieldError(error) {
  const target = form.querySelector(`[data-field-error="${error.field}"]`);
  target.textContent = error.code === "required" ? "Preencha este campo." : "Confira o formato informado.";
  target.hidden = false;
  form.elements[error.field]?.focus();
}

function showSubmitError(message) {
  const target = form.querySelector("[data-submit-error]");
  target.textContent = message;
  target.hidden = false;
}

function showStep(index) {
  currentStep = Math.max(0, Math.min(index, steps.length - 1));
  steps.forEach((step, stepIndex) => { step.hidden = stepIndex !== currentStep; });
  form.querySelector("[data-progress]").style.width = `${((currentStep + 1) / steps.length) * 100}%`;
  steps[currentStep].querySelector("input")?.focus();
}

function currentStepIsValid() {
  const field = ["name", "whatsapp", "companyProfile"][currentStep];
  const current = values();
  if (field === "name" && !String(current.name ?? "").trim()) return { field, code: "required" };
  if (field === "whatsapp" && normalizePhone(current.whatsapp).length < 11) return { field, code: "invalid" };
  if (field === "companyProfile" && !validateCompanyProfile(current.companyProfile)) return { field, code: "invalid" };
  return null;
}

form.querySelectorAll("[data-next]").forEach((button) => button.addEventListener("click", () => {
  clearErrors();
  const error = currentStepIsValid();
  if (error) return showFieldError(error);
  showStep(currentStep + 1);
}));

form.querySelectorAll("[data-back]").forEach((button) => button.addEventListener("click", () => {
  clearErrors();
  showStep(currentStep - 1);
}));

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const error = validateLead(values());
  if (error) return showFieldError(error);
  setSubmitting(true);
  try {
    const response = await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildLeadPayload(values(), pageContext())),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    window.location.assign(form.dataset.redirect);
  } catch {
    showSubmitError(form.dataset.retryMessage);
    setSubmitting(false);
  }
});

showStep(0);
```

Adicionar um listener de `keydown` que transforma Enter em avanço apenas nos dois primeiros passos. O erro mantém todos os valores no DOM. Quando parâmetros UTM já tiverem sido persistidos pelo script Raevo atual, `utmValues` deve combinar os valores da URL com os equivalentes presentes em `sessionStorage`, dando prioridade à URL atual.

- [ ] **Step 4: Implementar páginas de obrigado**

`OfficialThanks.astro` usa `OfficialLayout`, logo e conteúdo localizado, mostra confirmação e link de volta para `content.homeHref`. Não exibir termos internos como Kommo, pipeline ou agendamento.

- [ ] **Step 5: Conectar as quatro rotas**

Exemplo BR:

```astro
---
import OfficialLeadForm from "../../../components/official/OfficialLeadForm.astro";
import { officialContent } from "../../../data/official";
const content = officialContent["pt-BR"];
---
<OfficialLeadForm {content} redirectTo="/br-oficial/forms/obrigado" />
```

A página de obrigado deve importar `OfficialThanks` com o mesmo locale.

- [ ] **Step 6: Executar testes de formulário e estrutura**

Run: `node tests/official-form.test.mjs && node tests/official-site.test.mjs`

Expected: exit code `0`.

- [ ] **Step 7: Commit**

```bash
git add src/components/official/OfficialLeadForm.astro src/components/official/OfficialThanks.astro src/styles/official.css src/pages/pt-oficial/forms src/pages/br-oficial/forms tests/official-site.test.mjs
git commit -m "feat: add localized official lead forms"
```

---

### Task 6: Integração, regressão e build

**Files:**
- Modify: `tests/site-structure.test.mjs`
- Modify: `tests/official-site.test.mjs`
- Modify: `.gitignore`

- [ ] **Step 1: Atualizar expectativas antigas da home com teste vermelho**

Em `tests/site-structure.test.mjs`, substituir apenas a expectativa de que `src/pages/index.astro` serve `public/stitch/index.html`. A nova expectativa deve ser:

```js
const homeRoute = read("src/pages/index.astro");
assert.ok(homeRoute.includes("OfficialLanding"), "home route should serve the PT official landing");
assert.ok(homeRoute.includes('officialContent["pt-PT"]'), "home should default to Portugal");
```

Manter os testes de `public/stitch/index.html`, pois eles protegem `/pt-med`.

- [ ] **Step 2: Executar suíte completa e registrar falhas reais**

Run: `pnpm test`

Expected: a asserção antiga `home route should serve the Stitch landing as the official page` falha porque a raiz agora renderiza `OfficialLanding`.

- [ ] **Step 3: Ajustar apenas asserts incompatíveis com a nova topologia**

Onde o teste antigo espera redirect da raiz para `/pt-med`, substituir por asserts que confirmem:

- a raiz oficial contém PT;
- o diretório `/pt-med` ainda contém a landing médica;
- formulários médicos ainda apontam para seus próprios caminhos;
- rotas oficiais usam seus próprios formulários.

Não editar os HTMLs `public/stitch` para satisfazer esses testes.

- [ ] **Step 4: Ignorar artefatos de trabalho**

Adicionar ao final de `.gitignore`:

```gitignore
.superpowers/
tmp/
```

- [ ] **Step 5: Executar suíte completa**

Run: `pnpm test`

Expected: exit code `0`, todas as suítes sem falhas.

- [ ] **Step 6: Executar build de produção**

Run: `pnpm build`

Expected: exit code `0`; output contém páginas para `/`, `/pt-oficial`, `/br-oficial`, os formulários, páginas de obrigado e `/pt-med`.

- [ ] **Step 7: Verificar rotas geradas**

Run:

```bash
for page in \
  dist/index.html \
  dist/pt-oficial/index.html \
  dist/pt-oficial/forms/index.html \
  dist/pt-oficial/forms/obrigado/index.html \
  dist/br-oficial/index.html \
  dist/br-oficial/forms/index.html \
  dist/br-oficial/forms/obrigado/index.html \
  dist/pt-med/index.html; do test -f "$page" || exit 1; done
```

Expected: exit code `0`.

- [ ] **Step 8: Commit**

```bash
git add .gitignore tests/site-structure.test.mjs tests/official-site.test.mjs package.json
git commit -m "test: verify official site integration"
```

---

### Task 7: Validação visual desktop e mobile

**Files:**
- Modify: `src/styles/official.css` — corrigir defeitos visuais observados.
- Modify: `src/components/official/OfficialHeader.astro` — corrigir menu ou seletor se a inspeção revelar defeito.
- Modify: `src/components/official/CommercialSystem.astro` — corrigir o diagrama se a inspeção revelar defeito.
- Modify: `src/components/official/OfficialLanding.astro` — corrigir composição ou conteúdo se a inspeção revelar defeito.
- Modify: `src/components/official/OfficialLeadForm.astro` — corrigir interação do formulário se a inspeção revelar defeito.
- Test: local pages in browser

- [ ] **Step 1: Iniciar servidor local**

Run: `pnpm dev --host 127.0.0.1`

Expected: Astro informa uma URL local disponível.

- [ ] **Step 2: Inspecionar desktop**

Abrir e capturar em aproximadamente `1440x1000`:

- `/`
- `/pt-oficial/`
- `/br-oficial/`
- `/pt-oficial/forms/`
- `/br-oficial/forms/`
- `/pt-med/`

Verificar alinhamento, tipografia, identidade, header fixo, seletor de país, diagrama, soluções, logos, footer e ausência de overflow.

- [ ] **Step 3: Inspecionar mobile**

Repetir em aproximadamente `390x844`, verificando menu móvel, áreas de toque, quebras de linha, diagrama vertical, formulário e ausência de rolagem horizontal.

- [ ] **Step 4: Corrigir qualquer defeito encontrado**

Para cada defeito comportamental, escrever primeiro uma asserção de regressão quando possível. Ajustar apenas os arquivos oficiais e repetir as capturas afetadas.

- [ ] **Step 5: Testar formulário sem criar lead externo**

Validar navegação, mensagens e preservação de campos localmente. Para não enviar dados reais ao webhook durante QA, interceptar `fetch` no navegador ou usar a função pura `buildLeadPayload` nos testes. Não submeter um lead real.

- [ ] **Step 6: Verificação final fresca**

Run: `pnpm test && pnpm build`

Expected: exit code `0`, sem falhas.

- [ ] **Step 7: Revisar diff e preservação**

Run:

```bash
git diff --check
git diff -- public/stitch/index.html public/stitch/forms.html public/stitch/obrigado.html public/stitch/agendamento.html
```

Expected: `git diff --check` sem output; o segundo comando sem diff.

- [ ] **Step 8: Commit de ajustes visuais, se houver**

```bash
git add src/styles/official.css src/components/official tests/official-site.test.mjs
git commit -m "fix: polish official site responsiveness"
```

---

## Checklist final de cobertura

- Rotas PT, BR, forms e obrigado: Tasks 1, 4 e 5.
- Raiz em português de Portugal: Tasks 2 e 4.
- Bandeira com alternância e UTMs: Task 3.
- Identidade igual à landing existente: Tasks 3, 4 e 7.
- Todas as soluções solicitadas: Tasks 2 e 4.
- Benefícios indiretos e posicionamento de portfólio: Tasks 2 e 4.
- Sem preços: Tasks 2, 4 e 6.
- Formulário com três campos e webhook: Tasks 2 e 5.
- Erro, retry e redirects corretos: Tasks 2 e 5.
- `/pt-med` preservada: Tasks 1, 6 e 7.
- Testes, build e revisão visual: Tasks 6 e 7.
