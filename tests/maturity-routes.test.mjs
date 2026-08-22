import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const required = [
  "src/pages/teste-maturidade-comercial/index.astro",
  "src/pages/teste-maturidade-comercial/dados-iniciais/index.astro",
  "src/pages/teste-maturidade-comercial/antes-de-comecar/index.astro",
  "src/pages/teste-maturidade-comercial/contexto/[slug].astro",
  "src/pages/teste-maturidade-comercial/pergunta/[number].astro",
  "src/pages/teste-maturidade-comercial/identificacao/index.astro",
  "src/pages/teste-maturidade-comercial/resultado/index.astro",
  "src/pages/termos.astro",
  "src/components/maturity/MaturityLanding.astro",
  "src/components/maturity/MaturityLeadGate.astro",
  "src/components/maturity/MaturityStep.astro",
  "public/assets/brand/raevo-logo-official-transparent.png",
  "public/assets/brand/raevo-symbol-cyan.png",
];
for (const file of required) assert.equal(existsSync(new URL(`../${file}`, import.meta.url)), true, `${file} must exist`);

const landing = read("src/components/maturity/MaturityLanding.astro");
const header = read("src/components/maturity/MaturityHeader.astro");
const content = read("src/data/maturity.ts");
const scoring = read("src/lib/maturity-scoring.mjs");
assert.match(landing, /Qual é o nível de maturidade comercial da sua empresa\?/);
assert.match(landing, /\/teste-maturidade-comercial\/dados-iniciais\//);
assert.match(header, /\/teste-maturidade-comercial\/dados-iniciais\//);
assert.match(landing, /Mais do que uma pontuação/);
assert.match(landing, /Seis áreas do seu sistema comercial/);
assert.match(landing, /Exemplo de resultado/);
for (const level of ["Inicial", "Reativo", "Estruturado", "Previsível", "Inteligente"]) assert.match(`${landing}\n${content}\n${scoring}`, new RegExp(level));
assert.doesNotMatch(landing, /fbq\(|gtag\(|dataLayer/);

const contextRoute = read("src/pages/teste-maturidade-comercial/contexto/[slug].astro");
for (const slug of ["oportunidades", "valor-medio", "equipa", "objetivo"]) assert.match(contextRoute, new RegExp(slug.replace("-", "[-]")));
assert.doesNotMatch(contextRoute, /"setor"/);
assert.match(contextRoute, /getStaticPaths/);

const leadGate = read("src/components/maturity/MaturityLeadGate.astro");
assert.match(leadGate, /name="name"/);
assert.match(leadGate, /name="whatsapp"/);
assert.match(leadGate, /name="sector"/);
assert.match(leadGate, /\/api\/maturidade\/leads/);
assert.match(leadGate, /\/privacidade\//);

const identification = read("src/components/maturity/MaturityIdentification.astro");
assert.doesNotMatch(identification, /name="name"/);
assert.doesNotMatch(identification, /name="whatsapp"/);

const questionRoute = read("src/pages/teste-maturidade-comercial/pergunta/[number].astro");
assert.match(questionRoute, /getStaticPaths/);
assert.match(questionRoute, /maturityQuestions/);

const step = read("src/components/maturity/MaturityStep.astro");
assert.match(step, /data-maturity-step/);
assert.match(step, /data-step-key/);
assert.match(step, /data-continue/);
assert.match(step, /data-back/);
assert.match(step, /aria-live/);
assert.match(step, /querySelector\("\.maturity-step-page\[data-maturity-step\]"\)/);
assert.doesNotMatch(step, />\s*[0-4]\s*</);

const resultPage = read("src/components/maturity/MaturityResult.astro");
assert.match(resultPage, /data-pdf-download/);
assert.match(resultPage, /downloadMaturityPdf/);
assert.match(resultPage, /maturity:result-ready/);
assert.match(resultPage, /\/teste-maturidade-comercial\/dados-iniciais\//);

const footer = read("src/components/maturity/MaturityFooter.astro");
assert.match(footer, /href="\/termos\/"/);

console.log("Maturity routes and conversion structure are present.");
