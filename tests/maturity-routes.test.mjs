import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const required = [
  "src/pages/teste-maturidade-comercial/index.astro",
  "src/pages/teste-maturidade-comercial/antes-de-comecar/index.astro",
  "src/pages/teste-maturidade-comercial/contexto/[slug].astro",
  "src/pages/teste-maturidade-comercial/pergunta/[number].astro",
  "src/pages/teste-maturidade-comercial/identificacao/index.astro",
  "src/pages/teste-maturidade-comercial/resultado/index.astro",
  "src/components/maturity/MaturityLanding.astro",
  "src/components/maturity/MaturityStep.astro",
];
for (const file of required) assert.equal(existsSync(new URL(`../${file}`, import.meta.url)), true, `${file} must exist`);

const landing = read("src/components/maturity/MaturityLanding.astro");
const content = read("src/data/maturity.ts");
const scoring = read("src/lib/maturity-scoring.mjs");
assert.match(landing, /Qual é o nível de maturidade comercial da sua empresa\?/);
assert.match(landing, /\/teste-maturidade-comercial\/antes-de-comecar\//);
assert.match(landing, /Mais do que uma pontuação/);
assert.match(landing, /Seis áreas do seu sistema comercial/);
assert.match(landing, /Exemplo de resultado/);
for (const level of ["Inicial", "Reativo", "Estruturado", "Previsível", "Inteligente"]) assert.match(`${landing}\n${content}\n${scoring}`, new RegExp(level));
assert.doesNotMatch(landing, /fbq\(|gtag\(|dataLayer/);

const contextRoute = read("src/pages/teste-maturidade-comercial/contexto/[slug].astro");
for (const slug of ["setor", "oportunidades", "valor-medio", "equipa", "objetivo"]) assert.match(contextRoute, new RegExp(slug.replace("-", "[-]")));
assert.match(contextRoute, /getStaticPaths/);

const questionRoute = read("src/pages/teste-maturidade-comercial/pergunta/[number].astro");
assert.match(questionRoute, /getStaticPaths/);
assert.match(questionRoute, /maturityQuestions/);

const step = read("src/components/maturity/MaturityStep.astro");
assert.match(step, /data-maturity-step/);
assert.match(step, /data-step-key/);
assert.match(step, /data-continue/);
assert.match(step, /data-back/);
assert.match(step, /aria-live/);
assert.doesNotMatch(step, />\s*[0-4]\s*</);

const resultPage = read("src/components/maturity/MaturityResult.astro");
assert.match(resultPage, /data-pdf-download/);
assert.match(resultPage, /downloadMaturityPdf/);
assert.match(resultPage, /maturity:result-ready/);

console.log("Maturity routes and conversion structure are present.");
